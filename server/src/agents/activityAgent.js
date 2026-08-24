const { z } = require('zod');
const { Mistral } = require('@mistralai/mistralai');
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const ActivityOutputSchema = z.object({
  daily_activities: z.array(z.object({
    day: z.number(),
    activity_id: z.number(),
    activity_name: z.string(),
    activity_city: z.string(),
    activity_latitude: z.number(),
    activity_longitude: z.number(),
    time_slot: z.enum(['morning', 'afternoon', 'evening', 'full_day']),
    duration_hours: z.number(),
    price_per_person: z.number(),
    reasoning: z.string().max(150)
  }))
});

async function activityAgent(tripInput, retrievedActivities, numDays) {
  const prompt = `You are a Bihar travel expert specializing in activities and experiences.

TRIP REQUIREMENTS:
- Region: Bihar
- Dates: ${tripInput.start_date} to ${tripInput.end_date} (${numDays} days)
- Vibe: ${tripInput.vibe}
- Budget per person for activities: Rs.${tripInput.activity_budget}
- Travelers: ${tripInput.travelers}

AVAILABLE ACTIVITIES (retrieved via semantic search):
${retrievedActivities.map((a, i) => `
${i+1}. ${a.name} (${a.city}) -- ${a.duration_hours}h -- Rs.${a.price_per_person_inr || 0}/person
Type: ${a.type} | Best time: ${a.best_time} | Vibe: ${[].concat(a.vibe_tags || []).join(', ')}
Description: ${a.description}
`).join('\n')}

TASK: Plan exactly ${numDays} days of activities (1-2 activities per day). Consider:
1. Vibe alignment
2. Geographic feasibility (group nearby activities on same day)
3. Time slot appropriateness (morning/afternoon/evening)
4. Budget per person
5. Don't repeat similar activities on consecutive days

Return JSON with daily_activities array. Each activity must have: day (number), activity_id (number), activity_name (string), activity_city (string), activity_latitude (number), activity_longitude (number), time_slot (string), duration_hours (number), price_per_person (number), reasoning (string).`;

  const response = await mistral.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: 'You return only valid flat JSON. No markdown, no explanation outside JSON.' },
      { role: 'user', content: prompt }
    ],
    responseFormat: { type: 'json_object' }
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  
  if (parsed.daily_activities && Array.isArray(parsed.daily_activities)) {
    parsed.daily_activities = parsed.daily_activities.map(act => {
      if (typeof act.reasoning === 'object' && act.reasoning !== null) {
        act.reasoning = JSON.stringify(act.reasoning);
      }
      return act;
    });
  }

  return ActivityOutputSchema.parse(parsed);
}

module.exports = { activityAgent };
