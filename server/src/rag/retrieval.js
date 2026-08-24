const pool = require('../db/index');
const { Mistral } = require('@mistralai/mistralai');
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function getEmbedding(text) {
  const res = await mistral.embeddings.create({ model: 'mistral-embed', inputs: [text] });
  return res.data[0].embedding;
}

async function retrieveStays(vibe, budget_per_night, limit = 5) {
  const searchText = `${vibe} stay in Bihar. Comfortable, scenic, good value.`;
  const embedding = await getEmbedding(searchText);

  const query = `
    SELECT id, name, location, city, latitude, longitude, price_per_night_inr, vibe_tags, type,
    description, amenities, best_for,
    1 - (embedding <=> $1) as similarity
    FROM stays WHERE price_per_night_inr <= $2 ORDER BY embedding <=> $1 LIMIT $3;
  `;

  const result = await pool.query(query, [JSON.stringify(embedding), budget_per_night, limit]);
  return result.rows;
}

async function retrieveActivities(vibe, city_filter, limit = 10) {
  const searchText = `${vibe} activities in Bihar. Outdoor, cultural, memorable experiences.`;
  const embedding = await getEmbedding(searchText);

  let query = `SELECT id, name, location, city, latitude, longitude, price_per_person_inr,
  duration_hours, vibe_tags, type, best_time, description, 1 - (embedding <=> $1) as similarity
  FROM activities`;

  const params = [JSON.stringify(embedding)];

  if (city_filter && city_filter !== 'All') {
    query += ` WHERE city = $2`;
    params.push(city_filter);
  }

  query += ` ORDER BY embedding <=> $1 LIMIT $${params.length + 1};`;
  params.push(limit);

  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = { retrieveStays, retrieveActivities, getEmbedding };
