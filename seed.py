#!/usr/bin/env python3
"""
PACE Foundation Case Management System - Database Seed Script
Populates the PostgreSQL database with realistic test data
"""

import psycopg2
from psycopg2.extras import execute_values
import random
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'soe'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'suhani')
}

# Sample data
SAMPLE_USERS = [
    ('Admin User', 'admin@pace.org', '$2b$10$C.csaDkG3SYVVCnTT4nmmutzcz7ttSYccf6wHviszitKkcLT2pFJO', 'admin'),
    ('Staff Member 1', 'staff1@pace.org', '$2b$10$C.csaDkG3SYVVCnTT4nmmutzcz7ttSYccf6wHviszitKkcLT2pFJO', 'staff'),
    ('Staff Member 2', 'staff2@pace.org', '$2b$10$C.csaDkG3SYVVCnTT4nmmutzcz7ttSYccf6wHviszitKkcLT2pFJO', 'staff'),
]

SAMPLE_NAMES = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Devi', 'Vikram Singh',
    'Meera Reddy', 'Ravi Verma', 'Anjali Gupta', 'Suresh Yadav', 'Kavita Joshi',
    'Manoj Tiwari', 'Pooja Nair', 'Arun Desai', 'Rekha Pillai', 'Sanjay Mehta',
    'Deepa Iyer', 'Ramesh Choudhary', 'Lalita Bansal', 'Kiran Kumar', 'Neha Agarwal'
]

CASE_TYPES = [
    'Domestic Violence', 'Child Custody', 'Property Dispute', 'Consumer Rights',
    'Labor Rights', 'Sexual Harassment', 'Dowry Harassment', 'Land Dispute',
    'Employment Issue', 'Divorce', 'Maintenance', 'Other'
]

CASE_RESOLUTION_TYPES = [
    'Litigation', 'Mediation', 'Arbitration', 'Legal Aid', 'Counseling'
]

COURTS = [
    'District Court Delhi', 'High Court Delhi', 'Family Court',
    'Consumer Court', 'Sessions Court', 'Magistrate Court', 'Other'
]

ORGANIZATIONS = [
    'PACE Foundation', 'Legal Aid Society', 'Women\'s Commission',
    'Child Welfare Board', 'Human Rights Commission'
]

EVENT_TYPES = [
    'Court Hearing', 'Counseling Session', 'Mediation Meeting',
    'Document Submission', 'Evidence Collection', 'Client Meeting'
]

STATUSES = ['active', 'pending', 'urgent', 'resolved']

def connect_db():
    """Establish database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Database connection established")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        exit(1)

def seed_users(cursor):
    """Seed users table"""
    print("\n📝 Seeding users...")
    query = """
        INSERT INTO users (name, email, password_hash, role)
        VALUES %s
        ON CONFLICT (email) DO NOTHING
        RETURNING id, name, email, role
    """
    execute_values(cursor, query, SAMPLE_USERS)
    print(f"✅ {len(SAMPLE_USERS)} users seeded")

def seed_beneficiaries(cursor):
    """Seed beneficiaries table"""
    print("\n📝 Seeding beneficiaries...")
    beneficiaries = []
    
    for name in SAMPLE_NAMES:
        contact = f"+91{random.randint(7000000000, 9999999999)}"
        email = f"{name.lower().replace(' ', '.')}@example.com"
        address = f"{random.randint(1, 999)} {random.choice(['MG Road', 'Gandhi Nagar', 'Park Street', 'Main Road'])}, Delhi"
        date_of_filing = (datetime.now() - timedelta(days=random.randint(1, 365))).date()
        has_smartphone = random.choice([True, False])
        can_read = random.choice([True, False])
        
        beneficiaries.append((
            name, contact, email, address, date_of_filing, has_smartphone, can_read
        ))
    
    query = """
        INSERT INTO beneficiaries (name, contact_number, email, address, date_of_filing, has_smartphone, can_read)
        VALUES %s
        RETURNING id
    """
    execute_values(cursor, query, beneficiaries)
    result = cursor.fetchall()
    beneficiary_ids = [row[0] for row in result]
    print(f"✅ {len(beneficiaries)} beneficiaries seeded")
    return beneficiary_ids

def seed_cases(cursor, beneficiary_ids):
    """Seed cases table"""
    print("\n📝 Seeding cases...")
    cases = []
    current_year = datetime.now().year
    
    for i, beneficiary_id in enumerate(beneficiary_ids):
        case_code = f"PACE-{current_year}-{str(i+1).zfill(3)}"
        case_type = random.choice(CASE_TYPES)
        case_title = f"{case_type} case for beneficiary {beneficiary_id}"
        case_resolution_type = random.choice(CASE_RESOLUTION_TYPES)
        court = random.choice(COURTS)
        organizations = random.sample(ORGANIZATIONS, k=random.randint(1, 3))
        status = random.choice(STATUSES)
        notes = f"Sample notes for case {case_code}"
        google_drive_url = f"https://drive.google.com/folder/sample_{case_code}"
        
        cases.append((
            case_code, beneficiary_id, case_type, case_title, case_resolution_type,
            court, organizations, status, notes, google_drive_url
        ))
    
    query = """
        INSERT INTO cases (case_code, beneficiary_id, case_type, case_title, case_resolution_type,
                          court, organizations, status, notes, google_drive_url)
        VALUES %s
        RETURNING id
    """
    execute_values(cursor, query, cases)
    result = cursor.fetchall()
    case_ids = [row[0] for row in result]
    print(f"✅ {len(cases)} cases seeded")
    return case_ids

def seed_events(cursor, case_ids):
    """Seed case events table"""
    print("\n📝 Seeding events...")
    events = []
    
    for case_id in case_ids:
        num_events = random.randint(1, 4)
        for _ in range(num_events):
            event_type = random.choice(EVENT_TYPES)
            event_title = f"{event_type} for case {case_id}"
            event_date = (datetime.now() + timedelta(days=random.randint(-30, 60))).date()
            event_time = f"{random.randint(9, 17):02d}:{random.choice(['00', '30'])}:00"
            location = random.choice(['Court Room 3', 'Mediation Center', 'PACE Office', 'Legal Aid Office'])
            description = f"Scheduled {event_type.lower()} session"
            event_status = random.choice(['scheduled', 'completed', 'cancelled'])
            google_drive_url = f"https://drive.google.com/folder/event_{case_id}"
            
            events.append((
                case_id, event_type, event_title, event_date, event_time,
                location, description, event_status, google_drive_url
            ))
    
    query = """
        INSERT INTO case_events (case_id, event_type, event_title, event_date, event_time,
                                location, description, event_status, google_drive_url)
        VALUES %s
        RETURNING id
    """
    execute_values(cursor, query, events)
    result = cursor.fetchall()
    event_ids = [row[0] for row in result]
    print(f"✅ {len(events)} events seeded")
    return event_ids

def seed_reminders(cursor, event_ids):
    """Seed reminders table"""
    print("\n📝 Seeding reminders...")
    reminders = []
    
    for event_id in event_ids[:10]:  # Add reminders for first 10 events
        send_date = (datetime.now() + timedelta(days=random.randint(1, 14))).date()
        send_time = f"{random.randint(9, 17):02d}:00:00"
        method = random.choice(['sms', 'whatsapp', 'voice-note', 'manual-call'])
        status = random.choice(['pending', 'sent', 'failed'])
        
        reminders.append((event_id, send_date, send_time, method, status))
    
    query = """
        INSERT INTO reminders (case_event_id, send_date, send_time, method, status)
        VALUES %s
    """
    execute_values(cursor, query, reminders)
    print(f"✅ {len(reminders)} reminders seeded")

def main():
    """Main execution function"""
    print("="*60)
    print("🌱 PACE Case Management System - Database Seeder")
    print("="*60)
    
    print(f"Using DB config: host={DB_CONFIG['host']} port={DB_CONFIG['port']} db={DB_CONFIG['database']} user={DB_CONFIG['user']}")
    
    conn = connect_db()
    print(f"Connected to database: {conn.get_dsn_parameters().get('dbname')}")
    cursor = conn.cursor()
    
    try:
        # Seed all tables
        seed_users(cursor)
        beneficiary_ids = seed_beneficiaries(cursor)
        case_ids = seed_cases(cursor, beneficiary_ids)
        event_ids = seed_events(cursor, case_ids)
        seed_reminders(cursor, event_ids)
        
        # Commit transaction
        conn.commit()
        print("\n" + "="*60)
        print("✅ Database seeding completed successfully!")
        print("="*60)
        print("\n📊 Summary:")
        print(f"   - Users: {len(SAMPLE_USERS)}")
        print(f"   - Beneficiaries: {len(beneficiary_ids)}")
        print(f"   - Cases: {len(case_ids)}")
        print(f"   - Events: {len(event_ids)}")
        print(f"   - Reminders: 10")
        print("\n🔐 Default Admin Credentials:")
        print("   Email: admin@pace.org")
        print("   Password: password123 (hash in script is placeholder)")
        print("\n⚠️  Remember to update .env with your actual database credentials!")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        cursor.close()
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()
