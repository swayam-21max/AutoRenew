const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';
const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
const requiresSSL = process.env.VERCEL === '1' || process.env.DB_SSL === 'true' || 
  (process.env.DB_SSL !== 'false' && !isLocal);

const poolConfig = {
  connectionString: dbUrl,
  max: process.env.VERCEL === '1' ? 5 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (requiresSSL) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

/**
 * Ensures database and schema exist. Creates "policypulse" database and tables automatically if missing.
 */
async function initDatabase() {
  try {
    const client = await pool.connect();
    const tableCheck = await client.query(
      "SELECT to_regclass('public.users') as exists"
    );
    if (!tableCheck.rows[0].exists) {
      console.log('⚡ Initializing database schema from schema.sql...');
      const schemaPath = path.join(__dirname, '../../schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✓ Database tables created successfully');
    } else {
      console.log('✓ Connected to PostgreSQL database');
    }

    // Auto-migrate schema for Vehicle Compliance System
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          owner_name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone_number VARCHAR(20) NOT NULL,
          vehicle_number VARCHAR(100) NOT NULL,
          insurance_expiry DATE,
          puc_expiry DATE,
          road_tax_expiry DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
      CREATE INDEX IF NOT EXISTS idx_vehicles_number ON vehicles(vehicle_number);
      CREATE INDEX IF NOT EXISTS idx_vehicles_insurance ON vehicles(insurance_expiry);
      CREATE INDEX IF NOT EXISTS idx_vehicles_puc ON vehicles(puc_expiry);
      CREATE INDEX IF NOT EXISTS idx_vehicles_road_tax ON vehicles(road_tax_expiry);

      ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE;
      ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS days_before INT DEFAULT 0;
      ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255);
      ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'SUCCESS';
      ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS policy_id UUID;
      ALTER TABLE reminder_logs ALTER COLUMN policy_id DROP NOT NULL;
      ALTER TABLE reminder_logs DROP CONSTRAINT IF EXISTS reminder_logs_reminder_type_check;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vehicle_reminder_days 
          ON reminder_logs(vehicle_id, reminder_type, days_before);
    `);

    client.release();
  } catch (err) {
    if (err.code === '3D000' || (err.message && err.message.includes('does not exist'))) {
      try {
        console.log('⚡ Database does not exist. Attempting automatic creation...');
        const urlObj = new URL(dbUrl);
        const targetDbName = urlObj.pathname.replace('/', '') || 'policypulse';
        urlObj.pathname = '/postgres';

        const rootClient = new Client({
          connectionString: urlObj.toString(),
          ssl: poolConfig.ssl,
        });

        await rootClient.connect();
        await rootClient.query(`CREATE DATABASE "${targetDbName}"`);
        await rootClient.end();
        console.log(`✓ Created database "${targetDbName}"`);

        const client = await pool.connect();
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('✓ Database tables created successfully');
        client.release();
        return;
      } catch (autoErr) {
        console.error('⚠ Auto-create database failed:', autoErr.message);
      }
    }
    throw err;
  }
}

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = { pool, query, getClient, initDatabase };
