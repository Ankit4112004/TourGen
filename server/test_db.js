require('dotenv').config();
const { Pool } = require('pg');

// Try different configurations
async function testConnection() {
  const configs = [
    {
      name: 'Pooler port 6543 (session mode)',
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    {
      name: 'Pooler port 5432 (transaction mode)',
      connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/'),
      ssl: { rejectUnauthorized: false }
    }
  ];

  for (const config of configs) {
    console.log(`\nTrying: ${config.name}`);
    console.log(`  URL: ${config.connectionString.replace(/:[^:@]+@/, ':****@')}`);
    const pool = new Pool({
      connectionString: config.connectionString,
      ssl: config.ssl,
      connectionTimeoutMillis: 10000
    });

    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW()');
      console.log(`  ✅ Connected! Server time: ${res.rows[0].now}`);
      client.release();
      await pool.end();
      return config;
    } catch (err) {
      console.log(`  ❌ Failed: ${err.code} - ${err.message}`);
      await pool.end();
    }
  }
  console.log('\n❌ All connection attempts failed.');
  return null;
}

testConnection();
