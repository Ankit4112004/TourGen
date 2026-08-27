const express = require('express');
const router = express.Router();
const { buildWorkflow } = require('../graph/workflow');
const { buildLocalItinerary } = require('../planners/localPlanner');
const redis = require('../cache/redis');


const AI_WORKFLOW_TIMEOUT_MS = Number(process.env.AI_WORKFLOW_TIMEOUT_MS) || 15000;
const REDIS_TIMEOUT_MS = Number(process.env.REDIS_TIMEOUT_MS) || 2000;

function withTimeout(task, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    Promise.resolve()
      .then(task)
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

router.post('/plan-trip', async (req, res) => {
  try {
    const { start_date, end_date, budget_per_night, vibe, travelers, activity_budget } = req.body;
    
    if (!start_date || !end_date || !budget_per_night || !vibe || !travelers) {
      return res.status(400).json({ error: 'Missing required fields: start_date, end_date, budget_per_night, vibe, travelers' });
    }


    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ error: 'Invalid date range. end_date must be after start_date.' });
    }

    const numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const tripInput = {
      start_date, end_date, num_days: numDays,
      budget_per_night, vibe, travelers,
      activity_budget: activity_budget || budget_per_night * numDays * 0.3
    };
    
    const cacheKey = `trip:v9:${Buffer.from(JSON.stringify(tripInput)).toString('base64')}`;
    const cached = await withTimeout(() => redis.get(cacheKey), REDIS_TIMEOUT_MS, 'Redis cache read').catch((err) => {
      console.warn('Redis cache read skipped:', err.message);
      return null;
    });
    if (cached) return res.json(JSON.parse(cached));
    
    let itinerary;
    if (process.env.USE_AI_WORKFLOW === 'true') {
      try {
        const workflow = buildWorkflow();
        const result = await withTimeout(
          () => workflow.invoke({ trip_input: tripInput, status: 'started' }),
          AI_WORKFLOW_TIMEOUT_MS,
          'AI itinerary workflow'
        );
        itinerary = result.final_itinerary;
        if (!itinerary) throw new Error('AI workflow returned no itinerary');
      } catch (err) {
        console.error('AI workflow failed; using local planner:', err.message);
        itinerary = buildLocalItinerary(tripInput, 'AI workflow unavailable');
      }
    } else {
      itinerary = buildLocalItinerary(tripInput);
    }
    
    await withTimeout(
      () => redis.setex(cacheKey, 1800, JSON.stringify(itinerary)),
      REDIS_TIMEOUT_MS,
      'Redis cache write'
    ).catch((err) => {
      console.warn('Redis cache write skipped:', err.message);
    });
    res.json(itinerary);
  } catch (err) {
    console.error('Trip planning failed:', err);
    res.status(500).json({ error: err.message || 'Failed to plan trip. Please try again.' });
  }
});

module.exports = router;
