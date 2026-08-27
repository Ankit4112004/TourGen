const { z } = require('zod');
const { Mistral } = require('@mistralai/mistralai');
const { toBoundedText } = require('../utils/llmOutput');
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const StayOutputSchema = z.object({
  selected_stay_id: z.number(),
  stay_name: z.string(),
  stay_city: z.string(),
  stay_latitude: z.number(),
  stay_longitude: z.number(),
  price_per_night: z.number(),
  reasoning: z.string().max(200),
  why_this_fits: z.string().max(150)
});

async function stayAgent(tripInput, retrievedStays) {
  const prompt = `You are a Bihar travel expert specializing in accommodation.

TRIP REQUIREMENTS:
- Region: Bihar
- Dates: ${tripInput.start_date} to ${tripInput.end_date} (${tripInput.num_days} days)
- Budget per night: Rs.${tripInput.budget_per_night}
- Vibe: ${tripInput.vibe}
- Travelers: ${tripInput.travelers}

AVAILABLE STAYS (retrieved via semantic search):
${retrievedStays.map((s, i) => `
${i+1}. ${s.name} (${s.city}) -- Rs.${s.price_per_night_inr}/night
Type: ${s.type} | Vibe: ${[].concat(s.vibe_tags || []).join(', ')}
Description: ${s.description}
Amenities: ${[].concat(s.amenities || []).join(', ')}
Best for: ${[].concat(s.best_for || []).join(', ')}
`).join('\n')}

TASK: Select the SINGLE best stay for this trip. Consider:
1. Vibe alignment with trip requirements
2. Budget fit
3. Location as a base for exploring Bihar
4. Amenities that match traveler type

Return JSON with: selected_stay_id (number), stay_name (string), stay_city (string), stay_latitude (number), stay_longitude (number), price_per_night (number), reasoning (string, maximum 200 characters), why_this_fits (string, maximum 150 characters). Keep both explanations concise.`;

  const response = await mistral.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: 'You return only valid flat JSON. No markdown, no explanation outside JSON.' },
      { role: 'user', content: prompt }
    ],
    responseFormat: { type: 'json_object' }
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  
  parsed.reasoning = toBoundedText(parsed.reasoning, 200);
  parsed.why_this_fits = toBoundedText(parsed.why_this_fits, 150);

  return StayOutputSchema.parse(parsed);
}

module.exports = { stayAgent };
