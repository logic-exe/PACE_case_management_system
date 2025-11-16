# PACE Foundation - Legal Case Management System

A full-stack web application for managing legal cases at PACE Foundation.

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

### Frontend
- **React** (Vite) - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📋 Features

✅ **Authentication System**
- JWT-based authentication
- HttpOnly cookies for secure token storage
- Protected routes
- Auto-logout on token expiration

✅ **Dashboard**
- Total cases count
- Ongoing cases (active + pending)
- Disposed cases
- Upcoming events (next 7 days only)

✅ **Case Management**
- Create, view, update, delete cases
- Auto-generated case codes (PACE-2024-001)
- Filter by case type, status, court, resolution type
- Support for "Other" options in case type and court

✅ **Beneficiary Management**
- View all beneficiaries (alphabetically sorted)
- Display smartphone and literacy status
- Date of Filing (instead of Registration Date)
- Associated cases for each beneficiary

✅ **Event Management**
- Schedule case events
- Split layout (case list + event form)
- Automatic reminder method selection based on beneficiary preferences

✅ **Smart Reminder System**
- **Smartphone + Can Read** → WhatsApp Text
- **No Smartphone + Can Read** → SMS
- **Smartphone + Cannot Read** → WhatsApp Voice Note
- **No Smartphone + Cannot Read** → Manual Call Alert

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Python 3.x (for seeding)

### 1. Clone the Repository
```bash
cd soe-website/pace-case-management
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your database credentials
nano .env
```

Update `.env` file:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=pace_case_management

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb pace_case_management

# Or using psql
psql -U postgres
CREATE DATABASE pace_case_management;
\q
```

### 4. Seed Database (Python Script)

```bash
cd ..  # Go back to pace-case-management root

# Install Python dependencies
pip install psycopg2-binary python-dotenv

# Update seed.py with your DB credentials or use .env
# Then run the seed script
python3 seed.py
```

The seed script will create:
- 3 users (1 admin, 2 staff)
- 20 beneficiaries
- 20 cases with auto-generated case codes
- Multiple events
- 10 reminders

**Default Login Credentials:**
```
Email: admin@pace.org
Password: password123
```
(Note: The password hash in seed.py needs to be generated properly with bcrypt)

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 6. Frontend Setup

Open a new terminal:

```bash
cd pace-case-management/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 7. Access the Application

Open your browser and go to:
```
http://localhost:5173
```

Login with the seeded credentials.

## 📁 Project Structure

```
pace-case-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & upload middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions (reminders)
│   │   ├── db.js            # Database connection & initialization
│   │   └── server.js        # Express server setup
│   ├── uploads/             # File upload storage
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.jsx          # Main app with routing
│   │   └── App.css          # Global styles
│   └── .env                 # Frontend environment variables
│
└── seed.py                  # Database seeding script
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (Admin only)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Beneficiaries
- `GET /api/beneficiaries` - Get all (sorted alphabetically)
- `GET /api/beneficiaries/:id` - Get one with cases
- `POST /api/beneficiaries` - Create
- `PUT /api/beneficiaries/:id` - Update
- `DELETE /api/beneficiaries/:id` - Delete

### Cases
- `GET /api/cases` - Get all (sorted by beneficiary name)
- `GET /api/cases/ongoing` - Get active + pending
- `GET /api/cases/filter` - Filter cases
- `GET /api/cases/:id` - Get one
- `POST /api/cases` - Create (auto-generates case code)
- `PUT /api/cases/:id` - Update
- `DELETE /api/cases/:id` - Delete

### Events
- `GET /api/events/upcoming?days=7` - Get upcoming events
- `POST /api/events/cases/:id/events` - Create event for case
- `GET /api/events/cases/:id/events` - Get case events
- `PUT /api/events/:eventId` - Update event
- `POST /api/events/:id/reminders` - Create reminder (auto-selects method)
- `GET /api/events/reminders/upcoming` - Get pending reminders

### Dashboard
- `GET /api/dashboard/stats` - Get case statistics

## 🎨 Key Features Implementation

### 1. Automatic Case Code Generation
```javascript
// Format: PACE-2024-001
// Auto-increments for each year
```

### 2. Smart Reminder Selection
The system automatically selects the best reminder method based on:
- Smartphone ownership
- Literacy level

### 3. Protected Routes
All pages except login require authentication via JWT token in HttpOnly cookie.

### 4. Filter System
Cases can be filtered by:
- Case Type (with "Other" option)
- Status (active/pending/urgent/resolved)
- Court (with "Other" option)
- Resolution Type

## 🔒 Security Features

- JWT tokens stored in HttpOnly cookies
- Password hashing with bcrypt
- CORS configuration
- Protected API routes
- SQL injection prevention (parameterized queries)
- Input validation

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d pace_case_management
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Module Not Found Errors
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## 📝 Development Notes

- Backend uses ES6 modules (`"type": "module"` in package.json)
- Frontend uses Vite for fast development
- Database tables are auto-created on server start
- Seed script can be run multiple times (may create duplicates)

## 🚧 Future Enhancements

- [ ] File upload to cloud storage (AWS S3)
- [ ] Actual WhatsApp/SMS integration (Twilio)
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Role-based permissions (admin vs staff)
- [ ] Audit logs
- [ ] Case timeline visualization
- [ ] PDF export for case reports

## 📄 License

© 2024 PACE Foundation. All rights reserved.

## 👥 Support

For issues or questions, contact the PACE Foundation IT team.
