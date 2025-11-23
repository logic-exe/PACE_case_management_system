#!/usr/bin/env python3
"""
PACE Foundation Database Setup - Complete Single Script
Creates a clean database with schema and minimal sample data
"""

import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, date
import os
from dotenv import load_dotenv

# Load environment variables from the backend directory
load_dotenv('./backend/.env')

# Database configuration - explicitly set to 'soe' to override any cached values
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'your_pwd'),
    'database': 'soe'  # Force use 'soe' database
}

def connect_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected to database successfully")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        exit(1)

def create_complete_schema(cursor):
    """Create the complete database schema"""
    print("🏗️  Creating database schema...")
    
    schema_sql = """
    -- Drop existing tables if they exist (in reverse dependency order)
    DROP TABLE IF EXISTS reminders CASCADE;
    DROP TABLE IF EXISTS documents CASCADE;
    DROP TABLE IF EXISTS case_events CASCADE;
    DROP TABLE IF EXISTS beneficiaries_cases CASCADE;
    DROP TABLE IF EXISTS cases CASCADE;
    DROP TABLE IF EXISTS beneficiaries CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- Create Users table
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Beneficiaries table
    CREATE TABLE beneficiaries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        date_of_filing DATE NOT NULL,
        has_smartphone BOOLEAN DEFAULT FALSE,
        can_read BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Cases table
    CREATE TABLE cases (
        id SERIAL PRIMARY KEY,
        case_code VARCHAR(50) UNIQUE NOT NULL,
        beneficiary_id INTEGER REFERENCES beneficiaries(id) ON DELETE CASCADE,
        case_type VARCHAR(100) NOT NULL,
        case_title TEXT NOT NULL,
        case_resolution_type VARCHAR(100),
        court VARCHAR(255),
        organizations TEXT[],
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'urgent', 'resolved', 'closed')),
        notes TEXT,
        google_drive_folder_id VARCHAR(255),
        google_drive_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create junction table for many-to-many relationship between beneficiaries and cases
    CREATE TABLE beneficiaries_cases (
        id SERIAL PRIMARY KEY,
        beneficiary_id INTEGER REFERENCES beneficiaries(id) ON DELETE CASCADE,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        role VARCHAR(100) DEFAULT 'primary',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(beneficiary_id, case_id)
    );

    -- Create Case Events table
    CREATE TABLE case_events (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        event_title VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        event_time TIME,
        location VARCHAR(255),
        description TEXT,
        event_status VARCHAR(50) DEFAULT 'scheduled' CHECK (event_status IN ('scheduled', 'completed', 'cancelled', 'postponed')),
        google_drive_url TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Documents table
    CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES case_events(id) ON DELETE SET NULL,
        document_name VARCHAR(255) NOT NULL,
        document_type VARCHAR(100),
        category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('complaint', 'order', 'correspondence', 'evidence', 'other')),
        file_path TEXT,
        google_drive_id VARCHAR(255),
        google_drive_url TEXT,
        file_size BIGINT,
        mime_type VARCHAR(100),
        uploaded_by INTEGER REFERENCES users(id),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Reminders table
    CREATE TABLE reminders (
        id SERIAL PRIMARY KEY,
        case_event_id INTEGER REFERENCES case_events(id) ON DELETE CASCADE,
        send_date DATE NOT NULL,
        send_time TIME NOT NULL,
        method VARCHAR(50) NOT NULL CHECK (method IN ('sms', 'whatsapp', 'voice-note', 'manual-call', 'email')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
        message_content TEXT,
        sent_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX idx_beneficiaries_name ON beneficiaries(name);
    CREATE INDEX idx_cases_status ON cases(status);
    CREATE INDEX idx_cases_case_code ON cases(case_code);
    CREATE INDEX idx_case_events_date ON case_events(event_date);
    CREATE INDEX idx_documents_case_id ON documents(case_id);

    -- Create updated_at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Add updated_at triggers
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_case_events_updated_at BEFORE UPDATE ON case_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """
    
    cursor.execute(schema_sql)
    print("✅ Database schema created successfully")

def insert_sample_data(cursor):
    """Insert minimal sample data for testing"""
    print("🌱 Inserting sample data...")
    
    # Insert users
    users = [
        ('Admin User', 'admin@pace.org', '$2b$10$C.csaDkG3SYVVCnTT4nmmutzcz7ttSYccf6wHviszitKkcLT2pFJO', 'admin'),
        ('Staff Member', 'staff@pace.org', '$2b$10$C.csaDkG3SYVVCnTT4nmmutzcz7ttSYccf6wHviszitKkcLT2pFJO', 'staff')
    ]
    
    execute_values(cursor, """
        INSERT INTO users (name, email, password_hash, role)
        VALUES %s
        ON CONFLICT (email) DO NOTHING
    """, users)
    print("   ✅ Added 2 users")
    
    # Insert beneficiaries
    beneficiaries = [
        ('Priya Sharma', '9876543210', 'priya.sharma@example.com', '123 MG Road, Delhi', date(2024, 1, 15), True, True),
        ('Rajesh Kumar', '9876543211', 'rajesh.kumar@example.com', '456 Gandhi Nagar, Delhi', date(2024, 2, 20), False, True),
        ('Sunita Devi', '9876543212', 'sunita.devi@example.com', '789 Park Street, Delhi', date(2024, 3, 10), True, False),
        ('Amit Patel', '9876543213', 'amit.patel@example.com', '321 Main Road, Delhi', date(2024, 4, 5), True, True)
    ]
    
    execute_values(cursor, """
        INSERT INTO beneficiaries (name, contact_number, email, address, date_of_filing, has_smartphone, can_read)
        VALUES %s
        RETURNING id
    """, beneficiaries)
    
    beneficiary_ids = [row[0] for row in cursor.fetchall()]
    print("   ✅ Added 4 beneficiaries")
    
    # Insert cases
    cases = [
        ('PACE-2024-001', beneficiary_ids[0], 'Domestic Violence', 'Domestic Violence case for Priya Sharma', 'Legal Aid', 'Family Court', ['PACE Foundation', 'Women\'s Commission'], 'active', 'Active domestic violence case requiring immediate attention'),
        ('PACE-2024-002', beneficiary_ids[1], 'Property Dispute', 'Property dispute case for Rajesh Kumar', 'Litigation', 'District Court Delhi', ['PACE Foundation', 'Legal Aid Society'], 'pending', 'Property ownership dispute case'),
        ('PACE-2024-003', beneficiary_ids[2], 'Child Custody', 'Child custody case for Sunita Devi', 'Mediation', 'Family Court', ['PACE Foundation', 'Child Welfare Board'], 'urgent', 'Urgent child custody matter'),
        ('PACE-2024-004', beneficiary_ids[3], 'Labor Rights', 'Employment rights case for Amit Patel', 'Arbitration', 'Labor Court', ['PACE Foundation'], 'active', 'Workplace discrimination case')
    ]
    
    execute_values(cursor, """
        INSERT INTO cases (case_code, beneficiary_id, case_type, case_title, case_resolution_type, court, organizations, status, notes)
        VALUES %s
        RETURNING id
    """, cases)
    
    case_ids = [row[0] for row in cursor.fetchall()]
    print("   ✅ Added 4 cases")
    
    # Insert beneficiaries_cases relationships
    relationships = [(beneficiary_ids[i], case_ids[i], 'primary') for i in range(4)]
    
    execute_values(cursor, """
        INSERT INTO beneficiaries_cases (beneficiary_id, case_id, role)
        VALUES %s
    """, relationships)
    print("   ✅ Added beneficiary-case relationships")
    
    # Insert case events
    events = [
        (case_ids[0], 'Court Hearing', 'Initial hearing for domestic violence case', date(2024, 12, 15), '10:00', 'Family Court Room 1', 'First hearing scheduled'),
        (case_ids[1], 'Document Submission', 'Property documents submission', date(2024, 12, 10), '14:00', 'District Court', 'Submit property ownership documents'),
        (case_ids[2], 'Mediation Meeting', 'Child custody mediation session', date(2024, 12, 20), '11:00', 'Mediation Center', 'Custody mediation with both parties'),
        (case_ids[3], 'Client Meeting', 'Initial consultation with client', date(2024, 12, 8), '16:00', 'PACE Office', 'Discuss employment discrimination case')
    ]
    
    execute_values(cursor, """
        INSERT INTO case_events (case_id, event_type, event_title, event_date, event_time, location, description)
        VALUES %s
    """, events)
    print("   ✅ Added 4 case events")

def main():
    """Main function to set up the complete database"""
    print("=" * 60)
    print("🏥 PACE Foundation - Complete Database Setup")
    print("=" * 60)
    print(f"Database: {DB_CONFIG['database']} | Host: {DB_CONFIG['host']}")
    
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        # Create schema
        create_complete_schema(cursor)
        
        # Insert sample data
        insert_sample_data(cursor)
        
        # Commit all changes
        conn.commit()
        
        print("\n" + "=" * 60)
        print("🎉 Database setup completed successfully!")
        print("=" * 60)
        print("\n📊 Database Summary:")
        print("   • 2 users (1 admin, 1 staff)")
        print("   • 4 beneficiaries with realistic data")
        print("   • 4 cases covering different legal areas")
        print("   • 4 upcoming events/appointments")
        
        print("\n🔐 Login Credentials:")
        print("   Admin: admin@pace.org / password123")
        print("   Staff: staff@pace.org / password123")
        
        print("\n📝 Sample Cases Created:")
        print("   • PACE-2024-001: Domestic Violence (Active)")
        print("   • PACE-2024-002: Property Dispute (Pending)")
        print("   • PACE-2024-003: Child Custody (Urgent)")
        print("   • PACE-2024-004: Labor Rights (Active)")
        
        print("\n🚀 Your database is ready! Start your application servers.")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Setup failed: {e}")
        raise
    finally:
        cursor.close()
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()
