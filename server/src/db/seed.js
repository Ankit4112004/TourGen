require('dotenv').config();
const pool = require('./index');
const { Mistral } = require('@mistralai/mistralai');
const stays = require('../../seed_data/stays.json');
const activities = require('../../seed_data/activities.json');

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function getEmbedding(text) {
  const res = await mistral.embeddings.create({ model: 'mistral-embed', inputs: [text] });
  return res.data[0].embedding;
}

async function seed() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stays (
      id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, location VARCHAR(100) NOT NULL,
      city VARCHAR(50) NOT NULL, latitude DECIMAL(10, 8) NOT NULL, longitude DECIMAL(11, 8) NOT NULL,
      price_per_night_inr INT NOT NULL, vibe_tags TEXT[] NOT NULL, type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL, amenities TEXT[], best_for TEXT[], embedding VECTOR(1024)
    );
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, location VARCHAR(100) NOT NULL,
      city VARCHAR(50) NOT NULL, latitude DECIMAL(10, 8) NOT NULL, longitude DECIMAL(11, 8) NOT NULL,
      price_per_person_inr INT, duration_hours DECIMAL(3,1) NOT NULL, vibe_tags TEXT[] NOT NULL,
      type VARCHAR(50) NOT NULL, best_time VARCHAR(50), description TEXT NOT NULL, embedding VECTOR(1024)
    );
  `);

  for (const stay of stays) {
    const text = `${stay.name}. ${stay.description}. Type: ${stay.type}. Vibe: ${stay.vibe_tags.join(', ')}. Location: ${stay.city}.`;
    const embedding = await getEmbedding(text);
    await pool.query(`
      INSERT INTO stays (name, location, city, latitude, longitude, price_per_night_inr, vibe_tags, type, description, amenities, best_for, embedding)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, [stay.name, stay.location, stay.city, stay.latitude, stay.longitude, stay.price_per_night_inr, stay.vibe_tags, stay.type, stay.description, stay.amenities, stay.best_for, JSON.stringify(embedding)]);
  }

  for (const act of activities) {
    const text = `${act.name}. ${act.description}. Type: ${act.type}. Vibe: ${act.vibe_tags.join(', ')}. Location: ${act.city}. Duration: ${act.duration_hours}h.`;
    const embedding = await getEmbedding(text);
    await pool.query(`
      INSERT INTO activities (name, location, city, latitude, longitude, price_per_person_inr, duration_hours, vibe_tags, type, best_time, description, embedding)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, [act.name, act.location, act.city, act.latitude, act.longitude, act.price_per_person_inr, act.duration_hours, act.vibe_tags, act.type, act.best_time, act.description, JSON.stringify(embedding)]);
  }

  console.log('Seeded!');
  process.exit(0);
}

seed();
