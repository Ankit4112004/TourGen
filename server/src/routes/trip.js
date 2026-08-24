const express = require('express');
const router = express.Router();
const { buildWorkflow } = require('../graph/workflow');
const redis = require('../cache/redis');
const { buildLocalItinerary } = require('../planners/localPlanner');

router.post('/plan-trip', async (req, res) => {
  try {
    const { start_date, end_date, budget_per_night, vibe, travelers, activity_budget } = req.body;
    
    if (!start_date || !end_date || !budget_per_night || !vibe || !travelers) {
      return res.status(400).json({ error: 'Missing required fields: start_date, end_date, budget_per_night, vibe, travelers' });
    }

    const ip = req.ip;
    const rateKey = `rate_limit:${ip}`;
    const current = await redis.incr(rateKey).catch((err) => {
      console.warn('Redis rate limit skipped:', err.message);
      return 0;
    });
    if (current === 1) {
      await redis.expire(rateKey, 3600).catch((err) => {
        console.warn('Redis rate limit expiry skipped:', err.message);
      });
    }
    if (current > 500) return res.status(429).json({ error: 'Too many requests. Try again in an hour.' });
    
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
    
    const cacheKey = `trip:v8:${Buffer.from(JSON.stringify(tripInput)).toString('base64')}`;
    const cached = await redis.get(cacheKey).catch((err) => {
      console.warn('Redis cache read skipped:', err.message);
      return null;
    });
    if (cached) return res.json(JSON.parse(cached));
    
    let itinerary;
    if (process.env.USE_AI_WORKFLOW === 'true') {
      try {
        const workflow = buildWorkflow();
        const result = await workflow.invoke({ trip_input: tripInput, status: 'started' });
        itinerary = result.final_itinerary;
      } catch (err) {
        console.error('AI workflow failed, using local planner:', err.message);
        itinerary = buildLocalItinerary(tripInput);
      }
    } else {
      itinerary = buildLocalItinerary(tripInput);
    }
    
    await redis.setex(cacheKey, 1800, JSON.stringify(itinerary)).catch((err) => {
      console.warn('Redis cache write skipped:', err.message);
    });
    res.json(itinerary);
  } catch (err) {
    console.error('Trip planning failed:', err);
    res.status(500).json({ error: err.message || 'Failed to plan trip. Please try again.' });
  }
});

module.exports = router;
