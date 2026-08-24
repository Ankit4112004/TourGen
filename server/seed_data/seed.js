/**
 * Database seed script for BiharChale
 * 
 * Usage: npm run seed
 * 
 * Prerequisites:
 *   1. Docker containers running (docker-compose up -d)
 *   2. .env configured with DATABASE_URL and MISTRAL_API_KEY
 * 
 * This script will:
 *   - Enable the pgvector extension
 *   - Create stays and activities tables
 *   - Generate embeddings for each entry using Mistral AI
 *   - Insert all seed data
 */

require('dotenv').config();
const { Pool } = require('pg');
const { Mistral } = require('@mistralai/mistralai');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function getEmbedding(text) {
  const res = await mistral.embeddings.create({ model: 'mistral-embed', inputs: [text] });
  return res.data[0].embedding;
}

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🔧 Enabling pgvector extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // Drop existing tables to avoid dimension conflicts on re-seed
    console.log('🗑️  Dropping existing tables (if any)...');
    await client.query('DROP TABLE IF EXISTS stays CASCADE;');
    await client.query('DROP TABLE IF EXISTS activities CASCADE;');

    console.log('📦 Creating tables...');
    await client.query(`
      CREATE TABLE stays (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        city TEXT NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        price_per_night_inr INTEGER,
        vibe_tags TEXT[],
        type TEXT,
        description TEXT,
        amenities TEXT[],
        best_for TEXT[],
        embedding vector(1024)
      );
    `);

    await client.query(`
      CREATE TABLE activities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        city TEXT NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        price_per_person_inr INTEGER DEFAULT 0,
        duration_hours REAL,
        vibe_tags TEXT[],
        type TEXT,
        best_time TEXT,
        description TEXT,
        embedding vector(1024)
      );
    `);

    // Seed stays
    const staysPath = path.join(__dirname, 'stays.json');
    const stays = JSON.parse(fs.readFileSync(staysPath, 'utf-8'));

    console.log(`🏨 Seeding ${stays.length} stays...`);
    for (const s of stays) {
      const embeddingText = `${s.name}. ${s.description}. Vibe: ${s.vibe_tags.join(', ')}. Type: ${s.type}. Best for: ${(s.best_for || []).join(', ')}`;
      const embedding = await getEmbedding(embeddingText);

      await client.query(
        `INSERT INTO stays (name, location, city, latitude, longitude, price_per_night_inr, vibe_tags, type, description, amenities, best_for, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [s.name, s.location, s.city, s.latitude, s.longitude, s.price_per_night_inr,
         s.vibe_tags, s.type, s.description, s.amenities || [], s.best_for || [],
         JSON.stringify(embedding)]
      );
      console.log(`  ✅ ${s.name}`);
    }

    // Seed activities
    const activitiesPath = path.join(__dirname, 'activities.json');
    const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'));

    console.log(`🎯 Seeding ${activities.length} activities...`);
    for (const a of activities) {
      const embeddingText = `${a.name}. ${a.description}. Vibe: ${a.vibe_tags.join(', ')}. Type: ${a.type}. Best time: ${a.best_time}`;
      const embedding = await getEmbedding(embeddingText);

      await client.query(
        `INSERT INTO activities (name, location, city, latitude, longitude, price_per_person_inr, duration_hours, vibe_tags, type, best_time, description, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [a.name, a.location, a.city, a.latitude, a.longitude, a.price_per_person_inr || 0,
         a.duration_hours, a.vibe_tags, a.type, a.best_time, a.description,
         JSON.stringify(embedding)]
      );
      console.log(`  ✅ ${a.name}`);
    }

    console.log('\n🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
