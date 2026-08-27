const assert = require('node:assert/strict');
const { buildLocalItinerary } = require('../src/planners/localPlanner');

const itinerary = buildLocalItinerary({
  start_date: '2026-08-28',
  end_date: '2026-08-30',
  num_days: 3,
  budget_per_night: 5000,
  activity_budget: 5000,
  vibe: 'Relaxed',
  travelers: 'Couple',
});

assert.equal(itinerary.daily_breakdown.length, 3);
assert.equal(itinerary.nights, 2);
assert.ok(itinerary.base_stay.stay_name);
assert.equal(typeof itinerary.total_estimated_cost_inr, 'number');
assert.ok(itinerary.daily_breakdown.every((day, index) => day.day === index + 1));

console.log('local planner regression tests passed');
