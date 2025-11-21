# Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

1. Create PostgreSQL database:
```bash
createdb pace_case_management
```

2. Create a user (optional, or use existing postgres user):
```bash
psql -c "CREATE USER pace_admin WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE pace_case_management TO pace_admin;"
```

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `backend/` directory:
```
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=pace_admin
DB_PASSWORD=your_password
DB_NAME=pace_case_management
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5174
```

4. Start backend server:
```bash
npm run dev
```

The server will automatically create database tables on first run.

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start frontend server:
```bash
npm run dev
```

The frontend will run on http://localhost:5174

## Default Login

If you use the seed script, default credentials are:
- Email: admin@pace.org
- Password: password123

Otherwise, create a user through the registration endpoint or directly in the database.

## What Works Without Google Drive

- User registration and login
- Creating beneficiaries
- Creating cases
- Adding case events
- Viewing dashboard and case lists
- All database operations

## What Requires Google Drive

- Document uploads
- Auto-creating Drive folders for cases
- Viewing documents from Drive

Note: Google Drive features will show errors if not configured. All other features work normally.

