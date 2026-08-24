const stays = require('../../seed_data/stays.json');
const activities = require('../../seed_data/activities.json');
const { haversineDistance } = require('../utils/distance');

function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function includesTag(item, tag) {
  return (item.vibe_tags || []).some((value) => value.toLowerCase() === tag.toLowerCase());
}

function travelerFits(stay, travelers) {
  const travelerMap = {
    couple: 'couples',
    group: 'group',
    family: 'family',
    solo: 'solo',
  };
  const normalized = travelerMap[travelers] || travelers;
  return (stay.best_for || []).some((value) => value.toLowerCase() === normalized.toLowerCase());
}

function stayToDto(stay) {
  return {
    selected_stay_id: stays.findIndex((item) => item.name === stay.name) + 1,
    stay_name: stay.name,
    stay_city: stay.city,
    stay_latitude: stay.latitude,
    stay_longitude: stay.longitude,
    map_url: mapsSearchUrl(`${stay.name} ${stay.city} Kerala`),
    price_per_night: stay.price_per_night_inr,
    reasoning: `${stay.name} keeps this part of the route based in ${stay.city}.`,
    why_this_fits: `${stay.type} with ${(stay.amenities || []).slice(0, 3).join(', ')}.`,
  };
}

function activityValue(activity, tripInput) {
  const price = activity.price_per_person_inr || 0;
  const vibeScore = includesTag(activity, tripInput.vibe) ? 8 : 2;
  const affordability = price === 0 ? 8 : Math.max(0, 8 - price / 350);
  return vibeScore + affordability + Math.min(2, Number(activity.duration_hours) || 0);
}

function selectActivities(tripInput) {
  const activityBudget = Number(tripInput.activity_budget) || 0;
  const maxActivities = Math.min(tripInput.num_days * 2, activities.length);
  let runningCost = 0;

  return activities
    .map((activity) => ({ ...activity, _value: activityValue(activity, tripInput) }))
    .sort((a, b) => b._value - a._value || (a.price_per_person_inr || 0) - (b.price_per_person_inr || 0))
    .filter((activity) => {
      if (activityBudget <= 0) return true;
      const price = activity.price_per_person_inr || 0;
      if (runningCost + price > activityBudget) return false;
      runningCost += price;
      return true;
    })
    .slice(0, maxActivities);
}

function activityDistance(a, b) {
  return haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
}

function groupActivitiesIntoDays(selectedActivities, numDays) {
  const maxSameDayDistance = 45;
  const fixed = selectedActivities
    .filter((activity) => activity.city !== 'All')
    .sort((a, b) => a.latitude - b.latitude || a.longitude - b.longitude);
  const flexible = selectedActivities.filter((activity) => activity.city === 'All');
  const buckets = [];

  for (const activity of fixed) {
    let bestBucket = -1;
    let bestDistance = Infinity;

    for (let index = 0; index < buckets.length; index += 1) {
      if (buckets[index].length >= 2) continue;
      const distance = Math.min(...buckets[index].map((item) => activityDistance(item, activity)));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestBucket = index;
      }
    }

    if (bestBucket >= 0 && bestDistance <= maxSameDayDistance) {
      buckets[bestBucket].push(activity);
    } else {
      buckets.push([activity]);
    }
  }

  for (const activity of flexible) {
    const bucketWithSpace = buckets.find((bucket) => bucket.length < 2);
    if (bucketWithSpace) {
      bucketWithSpace.unshift(activity);
    } else {
      buckets.unshift([activity]);
    }
  }

  return buckets
    .sort((a, b) => {
      const aLat = a.find((activity) => activity.city !== 'All')?.latitude ?? 0;
      const bLat = b.find((activity) => activity.city !== 'All')?.latitude ?? 0;
      return aLat - bLat;
    })
    .slice(0, numDays);
}

function bucketCenter(bucket) {
  const fixed = bucket.filter((activity) => activity.city !== 'All');
  if (fixed.length === 0) return null;

  return {
    latitude: fixed.reduce((sum, activity) => sum + activity.latitude, 0) / fixed.length,
    longitude: fixed.reduce((sum, activity) => sum + activity.longitude, 0) / fixed.length,
  };
}

function pickStayForBucket(bucket, tripInput) {
  const center = bucketCenter(bucket);
  const budget = Number(tripInput.budget_per_night) || 0;

  return stays
    .map((stay) => {
      const distance = center ? haversineDistance(stay.latitude, stay.longitude, center.latitude, center.longitude) : 0;
      const overBudget = budget > 0 ? Math.max(0, stay.price_per_night_inr - budget) / 50 : 0;
      const vibeBonus = includesTag(stay, tripInput.vibe) ? -18 : 0;
      const travelerBonus = travelerFits(stay, tripInput.travelers) ? -10 : 0;
      const budgetBonus = stay.price_per_night_inr <= budget ? -8 : 0;
      return { stay, score: distance + overBudget + vibeBonus + travelerBonus + budgetBonus };
    })
    .sort((a, b) => a.score - b.score || a.stay.price_per_night_inr - b.stay.price_per_night_inr)[0].stay;
}

function activityLocation(activity, stay) {
  if (activity.city && activity.city !== 'All') return activity.city;
  return stay.city;
}

function normalizeActivity(activity, stay, index, tripInput) {
  const location = activityLocation(activity, stay);
  const latitude = activity.city === 'All' ? stay.latitude : activity.latitude;
  const longitude = activity.city === 'All' ? stay.longitude : activity.longitude;

  return {
    name: activity.name,
    location,
    time: activity.best_time || (index === 0 ? 'morning' : 'afternoon'),
    duration: activity.duration_hours,
    price: activity.price_per_person_inr || 0,
    distance_from_stay_km: Math.round(haversineDistance(stay.latitude, stay.longitude, latitude, longitude)),
    distance_from_base_km: Math.round(haversineDistance(stay.latitude, stay.longitude, latitude, longitude)),
    map_url: mapsSearchUrl(`${activity.name} ${location} Kerala`),
    reasoning: includesTag(activity, tripInput.vibe)
      ? `Matches your ${tripInput.vibe} trip style.`
      : 'Adds variety while staying close to this base.',
  };
}

function compressStaySegments(dailyBreakdown, nights) {
  const nightDays = dailyBreakdown.slice(0, nights);
  const segments = [];

  for (const day of nightDays) {
    const last = segments[segments.length - 1];
    if (last && last.stay.stay_name === day.stay.name) {
      last.end_day = day.day;
      last.nights += 1;
    } else {
      segments.push({
        start_day: day.day,
        end_day: day.day,
        nights: 1,
        area: day.stay.location,
        stay: {
          stay_name: day.stay.name,
          stay_city: day.stay.location,
          price_per_night: day.stay.price_per_night,
          map_url: day.stay.map_url,
        },
      });
    }
  }

  return segments;
}

function buildStayPlan(dayBuckets, tripInput, nights) {
  if (nights <= 0) {
    const stay = pickStayForBucket(dayBuckets[0] || [], tripInput);
    return [{ startDay: 1, endDay: tripInput.num_days, stay }];
  }

  const segmentCount = Math.min(nights, Math.max(1, Math.ceil(nights / 3)));
  const segmentLength = Math.ceil(nights / segmentCount);
  const segments = [];

  for (let start = 1; start <= nights; start += segmentLength) {
    const end = Math.min(nights, start + segmentLength - 1);
    const segmentBuckets = dayBuckets.slice(start - 1, end);
    const segmentActivities = segmentBuckets.flat();
    const stay = pickStayForBucket(segmentActivities, tripInput);
    segments.push({ startDay: start, endDay: end, stay });
  }

  if (tripInput.num_days > nights && segments.length > 0) {
    segments[segments.length - 1].endDay = tripInput.num_days;
  }

  return segments;
}

function stayForDay(stayPlan, day) {
  return (stayPlan.find((segment) => day >= segment.startDay && day <= segment.endDay) || stayPlan[stayPlan.length - 1]).stay;
}

function buildLocalItinerary(tripInput, reason = 'Generated as a multi-place Kerala route') {
  const selectedActivities = selectActivities(tripInput);
  const dayBuckets = groupActivitiesIntoDays(selectedActivities, tripInput.num_days);
  const nights = Math.max(0, tripInput.num_days - 1);
  const activityBudget = Number(tripInput.activity_budget) || 0;
  const budgetPerNight = Number(tripInput.budget_per_night) || 0;
  const stayPlan = buildStayPlan(dayBuckets, tripInput, nights);
  const dailyBreakdown = [];

  for (let index = 0; index < tripInput.num_days; index += 1) {
    const bucket = dayBuckets[index] || [];
    const stay = stayForDay(stayPlan, index + 1);
    const stayDto = stayToDto(stay);
    const dayActivities = bucket.map((activity, activityIndex) => normalizeActivity(activity, stay, activityIndex, tripInput));
    const routeArea = [...new Set(dayActivities.map((activity) => activity.location))].join(' + ') || stay.city;

    dailyBreakdown.push({
      day: index + 1,
      route_area: routeArea,
      stay: {
        name: stayDto.stay_name,
        location: stayDto.stay_city,
        price_per_night: stayDto.price_per_night,
        map_url: stayDto.map_url,
      },
      activities: dayActivities,
      day_summary: `Day ${index + 1}: ${dayActivities.map((activity) => activity.name).join(' + ') || routeArea}`,
    });
  }

  const staySegments = compressStaySegments(dailyBreakdown, nights);
  const firstStay = staySegments[0]?.stay;
  const baseStay = firstStay
    ? {
        selected_stay_id: stays.findIndex((item) => item.name === firstStay.stay_name) + 1,
        stay_name: firstStay.stay_name,
        stay_city: firstStay.stay_city,
        map_url: firstStay.map_url,
        price_per_night: firstStay.price_per_night,
        reasoning: 'First base in this multi-place route.',
        why_this_fits: 'Used as the opening base for nearby activities.',
      }
    : stayToDto(pickStayForBucket([], tripInput));

  const plannedActivityCost = dailyBreakdown.reduce((sum, day) => {
    return sum + day.activities.reduce((daySum, activity) => daySum + activity.price, 0);
  }, 0);
  const plannedAccommodationCost = dailyBreakdown.slice(0, nights).reduce((sum, day) => sum + day.stay.price_per_night, 0);

  return {
    trip_summary: `${tripInput.num_days}-day ${tripInput.vibe} multi-place Kerala route`,
    base_stay: baseStay,
    stay_segments: staySegments,
    daily_breakdown: dailyBreakdown,
    nights,
    stay_budget_total_inr: budgetPerNight * nights,
    activity_budget_total_inr: activityBudget,
    planned_accommodation_cost_inr: plannedAccommodationCost,
    planned_activity_cost_inr: plannedActivityCost,
    total_estimated_cost_inr: budgetPerNight * nights + activityBudget,
    conflict_resolution: `${reason}. Stays change by route area, so days do not return to one faraway base.`,
  };
}

module.exports = { buildLocalItinerary };
