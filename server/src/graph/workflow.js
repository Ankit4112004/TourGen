const { StateGraph, Annotation } = require('@langchain/langgraph');
const { stayAgent } = require('../agents/stayAgent');
const { activityAgent } = require('../agents/activityAgent');
const { retrieveStays, retrieveActivities, getEmbedding } = require('../rag/retrieval');
const { haversineDistance } = require('../utils/distance');
const pool = require('../db/index');

function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function regroupActivitiesByDistance(stay, activities, numDays) {
  const maxSameDayDistance = 45;
  const normalized = activities
    .filter((activity) => typeof activity.activity_latitude === 'number' && typeof activity.activity_longitude === 'number')
    .map((activity, index) => ({
      ...activity,
      _original_index: index,
      _distance_from_base: haversineDistance(
        stay.stay_latitude,
        stay.stay_longitude,
        activity.activity_latitude,
        activity.activity_longitude
      ),
    }))
    .sort((a, b) => a._distance_from_base - b._distance_from_base);

  const dayBuckets = Array.from({ length: numDays }, () => []);
  const unassigned = [...normalized];

  for (let day = 0; day < numDays && unassigned.length > 0; day += 1) {
    dayBuckets[day].push(unassigned.shift());
  }

  while (unassigned.length > 0) {
    const activity = unassigned.shift();
    let bestDay = -1;
    let bestScore = Infinity;

    for (let day = 0; day < dayBuckets.length; day += 1) {
      if (dayBuckets[day].length >= 2) continue;
      const dayDistance = dayBuckets[day].reduce((sum, item) => {
        return sum + haversineDistance(
          item.activity_latitude,
          item.activity_longitude,
          activity.activity_latitude,
          activity.activity_longitude
        );
      }, 0);

      if (dayDistance < bestScore) {
        bestScore = dayDistance;
        bestDay = day;
      }
    }

    if (bestDay >= 0 && bestScore <= maxSameDayDistance) {
      dayBuckets[bestDay].push(activity);
    }
  }

  return dayBuckets.flatMap((bucket, index) => (
    bucket
      .sort((a, b) => a._distance_from_base - b._distance_from_base)
      .map((activity, activityIndex) => ({
        ...activity,
        day: index + 1,
        time_slot: activityIndex === 0 ? activity.time_slot : activity.time_slot === 'evening' ? 'evening' : 'afternoon',
      }))
  ));
}

// Define the graph state using LangGraph's Annotation API
const GraphState = Annotation.Root({
  trip_input: Annotation({
    reducer: (_, x) => x,
    default: () => null,
  }),
  stay_suggestion: Annotation({
    reducer: (_, x) => x,
    default: () => null,
  }),
  activity_plan: Annotation({
    reducer: (_, x) => x,
    default: () => null,
  }),
  conflict_detected: Annotation({
    reducer: (_, x) => x,
    default: () => false,
  }),
  conflict_details: Annotation({
    reducer: (_, x) => x,
    default: () => null,
  }),
  final_itinerary: Annotation({
    reducer: (_, x) => x,
    default: () => null,
  }),
  status: Annotation({
    reducer: (_, x) => x,
    default: () => 'started',
  }),
});

async function stayNode(state) {
  const stays = await retrieveStays(state.trip_input.vibe, state.trip_input.budget_per_night, 5);
  const suggestion = await stayAgent(state.trip_input, stays);
  return { stay_suggestion: suggestion, status: 'stay_selected' };
}

async function activityNode(state) {
  const stayCity = state.stay_suggestion.stay_city;
  let activities = await retrieveActivities(state.trip_input.vibe, stayCity, 15);
  if (activities.length < 8) {
    const allActivities = await retrieveActivities(state.trip_input.vibe, null, 20);
    activities = [...activities, ...allActivities].slice(0, 20);
  }
  const plan = await activityAgent(state.trip_input, activities, state.trip_input.num_days);
  return { activity_plan: plan, status: 'activities_planned' };
}

async function synthesizerNode(state) {
  const stay = state.stay_suggestion;
  const activities = state.activity_plan.daily_activities;
  const conflicts = [];
  
  for (const act of activities) {
    const dist = haversineDistance(stay.stay_latitude, stay.stay_longitude, act.activity_latitude, act.activity_longitude);
    if (dist > 50) {
      conflicts.push({ activity: act.activity_name, activity_city: act.activity_city, distance_km: Math.round(dist), issue: `Activity is ${Math.round(dist)}km from stay` });
    }
  }

  if (conflicts.length > 0) {
    return { conflict_detected: true, conflict_details: conflicts, status: 'conflict_detected' };
  }
  return { conflict_detected: false, status: 'synthesized' };
}

async function repickStayNode(state) {
  const activityCities = [...new Set(state.activity_plan.daily_activities.map(a => a.activity_city))];
  const embedding = await getEmbedding(`${state.trip_input.vibe} stay near ${activityCities.join(' or ')}`);
  
  const query = `SELECT id, name, location, city, latitude, longitude, price_per_night_inr, vibe_tags, type, description, amenities, best_for, 1 - (embedding <=> $1) as similarity FROM stays WHERE price_per_night_inr <= $2 AND city = ANY($3) ORDER BY embedding <=> $1 LIMIT 5;`;
  const result = await pool.query(query, [JSON.stringify(embedding), state.trip_input.budget_per_night, activityCities]);
  
  if (result.rows.length === 0) {
    const fallback = await retrieveStays(state.trip_input.vibe, state.trip_input.budget_per_night, 5);
    const suggestion = await stayAgent(state.trip_input, fallback);
    return { stay_suggestion: suggestion, status: 'stay_repicked' };
  }
  
  const suggestion = await stayAgent(state.trip_input, result.rows);
  return { stay_suggestion: suggestion, status: 'stay_repicked' };
}

async function finalItineraryNode(state) {
  const stay = state.stay_suggestion;
  const numDays = state.trip_input.num_days;
  const activities = regroupActivitiesByDistance(stay, state.activity_plan.daily_activities, numDays);
  const nights = Math.max(0, numDays - 1);
  const activityBudget = Number(state.trip_input.activity_budget) || 0;
  const dailyBreakdown = [];
  
  for (let day = 1; day <= numDays; day++) {
    const dayActivities = activities.filter(a => a.day === day);
    dailyBreakdown.push({
      day,
      stay: { name: stay.stay_name, location: stay.stay_city, price_per_night: stay.price_per_night },
      activities: dayActivities.map(a => {
        const distance = Math.round(haversineDistance(stay.stay_latitude, stay.stay_longitude, a.activity_latitude, a.activity_longitude));
        const location = a.activity_city === 'All' ? stay.stay_city : a.activity_city;
        return {
          name: a.activity_name,
          location,
          time: a.time_slot,
          duration: a.duration_hours,
          price: a.price_per_person,
          distance_from_base_km: distance,
          map_url: mapsSearchUrl(`${a.activity_name} ${location} Bihar`),
          reasoning: a.reasoning
        };
      }),
      day_summary: `Day ${day}: ${dayActivities.map(a => a.activity_name).join(' + ')}`
    });
  }
  
  const total_estimated_cost = (Number(state.trip_input.budget_per_night) * nights) + activityBudget;
  
  return {
    final_itinerary: {
      trip_summary: `${numDays}-day ${state.trip_input.vibe} trip to Bihar`,
      base_stay: {
        ...stay,
        map_url: mapsSearchUrl(`${stay.stay_name} ${stay.stay_city} Bihar`)
      },
      daily_breakdown: dailyBreakdown,
      nights,
      stay_budget_total_inr: Number(state.trip_input.budget_per_night) * nights,
      activity_budget_total_inr: activityBudget,
      planned_activity_cost_inr: activities.reduce((sum, a) => sum + a.price_per_person, 0),
      total_estimated_cost_inr: total_estimated_cost,
      conflict_resolution: state.conflict_detected ? 'Stay was repicked to match activity locations' : 'No conflicts detected'
    },
    status: 'complete'
  };
}

function buildWorkflow() {
  const workflow = new StateGraph(GraphState)
    .addNode('stay_node', stayNode)
    .addNode('activity_node', activityNode)
    .addNode('synthesizer', synthesizerNode)
    .addNode('repick_stay', repickStayNode)
    .addNode('generate_itinerary', finalItineraryNode)
    .addEdge('__start__', 'stay_node')
    .addEdge('stay_node', 'activity_node')
    .addEdge('activity_node', 'synthesizer')
    .addConditionalEdges('synthesizer', (state) => state.conflict_detected ? 'repick_stay' : 'generate_itinerary')
    .addEdge('repick_stay', 'generate_itinerary')
    .addEdge('generate_itinerary', '__end__');
  
  return workflow.compile();
}

module.exports = { buildWorkflow };
