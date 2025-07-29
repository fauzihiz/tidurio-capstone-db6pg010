// src/services/db/postgres.js
const { Pool } = require('pg');
const config = require('../../utils/config'); // Adjust path to config.js

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

// Optional: Add a simple check to ensure the connection works on startup
pool.on('connect', () => {
  console.log('PostgreSQL client connected!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1); // Exit process on unrecoverable db error
});


module.exports = pool;