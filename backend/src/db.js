import pkg from 'pg';
const { Pool } = pkg;
import config from './config/index.js';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Database initialization - Create tables if they don't exist
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Beneficiaries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        date_of_filing DATE,
        has_smartphone BOOLEAN DEFAULT false,
        can_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id SERIAL PRIMARY KEY,
        case_code VARCHAR(100) UNIQUE NOT NULL,
        beneficiary_id INTEGER REFERENCES beneficiaries(id) ON DELETE CASCADE,
        case_type VARCHAR(255),
        case_title TEXT,
        case_resolution_type VARCHAR(255),
        court VARCHAR(255),
        organizations TEXT[],
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'urgent', 'resolved')),
        notes TEXT,
        google_drive_folder_id VARCHAR(255),
        google_drive_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Case Events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS case_events (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        event_type VARCHAR(255),
        event_title VARCHAR(255),
        event_date DATE,
        event_time TIME,
        location TEXT,
        description TEXT,
        event_status VARCHAR(50) DEFAULT 'scheduled' CHECK (event_status IN ('scheduled', 'completed', 'cancelled')),
        google_drive_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reminders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        case_event_id INTEGER REFERENCES case_events(id) ON DELETE CASCADE,
        send_date DATE,
        send_time TIME,
        method VARCHAR(50) CHECK (method IN ('sms', 'whatsapp', 'voice-note', 'manual-call')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        drive_file_id VARCHAR(255) NOT NULL,
        drive_url TEXT NOT NULL,
        download_url TEXT NOT NULL,
        mime_type VARCHAR(100),
        size INTEGER,
        category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('complaint', 'order', 'correspondence', 'evidence', 'other')),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cases_beneficiary ON cases(beneficiary_id);
      CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
      CREATE INDEX IF NOT EXISTS idx_events_case ON case_events(case_id);
      CREATE INDEX IF NOT EXISTS idx_events_date ON case_events(event_date);
      CREATE INDEX IF NOT EXISTS idx_reminders_event ON reminders(case_event_id);
      CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
      CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
