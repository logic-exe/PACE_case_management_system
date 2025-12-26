# PACE Case Management System - Documentation Outline

## Part 1: User Guide (For Organization Staff)

### 1. Introduction
- What is the system
- Purpose and benefits
- Who should use it

### 2. Getting Started
- Login process
- Dashboard overview
- Navigation menu

### 3. Dashboard
- Stat cards: Total Cases, Active Cases, Pending Cases, Resolved Cases, Urgent Cases
- Upcoming Events section
- Filters: Search, Event Type, Status, Days Range
- Add Event button
- Add New Case button

### 4. Cases Management
- **All Cases Page**
  - View all cases in table format
  - Search functionality
  - Filters: Case Type, Status, Resolution Type, Court, Date Range
  - Click case to view details
  - New Case button

- **Case Details Page**
  - Case header: Case Code, Type, Beneficiary, Status dropdown
  - Case description
  - Case info: Date Filed, Duration, Total Events
  - Status dropdown: Active, Pending, Resolved, Urgent
  - Edit Case button
  - Delete Case button
  - Documents section: Google Drive integration, upload/view documents
  - Timeline section: Events list, Add Event button, Edit/Delete event options

- **New Case**
  - Beneficiary Information: Name, Contact, Email, Address, Communication Preferences
  - Case Details: Type, Title, Resolution Type, Court, Organizations, Notes
  - Google Drive folder creation
  - Document upload

- **Edit Case**
  - Pre-filled form with current case data
  - Update beneficiary and case information
  - Same fields as New Case

### 5. Events Management
- **Add Event**
  - Case selection (with search) or auto-select from case page
  - Event Type, Event Title, Date, Time, Location, Description
  - Google Drive URL (uses case folder)
  - Event Status: Scheduled, Completed, Cancelled

- **Event Display**
  - Dashboard: Shows upcoming events with filters
  - Case Timeline: Shows all events for a case
  - Event details: Type (main), Title (subtext), Date, Time, Location, Beneficiary pill

- **Event Status**
  - Automatic case status: Case becomes "Pending" when event created
  - Case returns to "Active" when all events resolved

### 6. Beneficiaries Management
- **Beneficiaries Page**
  - List of all beneficiaries
  - Beneficiary cards: Name, Contact, Email, Address, Date of Filing
  - Cases count per beneficiary
  - Click card to expand and view all cases
  - Edit Beneficiary button
  - New Beneficiary button

- **New/Edit Beneficiary**
  - Personal information
  - Communication preferences
  - Date of filing

### 7. Features Overview
- **Status Management**
  - Active: Case is open and no events scheduled
  - Pending: Case has scheduled events
  - Resolved: Case is closed
  - Urgent: Case requires immediate attention

- **Google Drive Integration**
  - Connect Google Drive account
  - Auto-create folders for cases
  - Upload/view documents
  - Link to Drive folders

- **Search & Filters**
  - Search by case code, beneficiary name, case title
  - Filter by type, status, resolution type, court, date range
  - Real-time filtering

- **Notifications**
  - Toast notifications for actions
  - Success/error messages

### 8. Workflows
- Creating a new case
- Adding events to a case
- Updating case status
- Managing documents
- Viewing case timeline
- Filtering and searching cases

---

## Part 2: Technical Documentation (For Developers)

### 1. System Architecture
- Frontend: React with Vite
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: JWT tokens
- File Storage: Google Drive API

### 2. Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn
- Google Cloud Project with Drive API enabled

### 3. Project Structure
```
SOE/
├── frontend/
│   ├── src/
│   │   ├── pages/          # All page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── App.jsx         # Main app component
│   │   └── App.css         # Global styles
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── db.js           # Database connection
│   │   ├── server.js       # Express server
│   │   └── config/         # Configuration files
│   └── package.json
└── documentation.md
```

### 4. Installation Steps

#### Backend Setup
1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Create `.env` file with:
   - Database connection details (host, port, user, password, database)
   - JWT secret key
   - Server port
   - Google Drive API credentials (client ID, client secret, redirect URI)
4. Ensure PostgreSQL is running
5. Database tables auto-create on first run
6. Start server: `npm start` or `npm run dev`

#### Frontend Setup
1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Create `.env` file with:
   - Backend API URL (e.g., `http://localhost:5000`)
4. Start dev server: `npm run dev`
5. Build for production: `npm run build`

### 5. Database Schema
- **users**: id, name, email, password_hash, role, created_at, updated_at
- **beneficiaries**: id, name, contact_number, email, address, date_of_filing, has_smartphone, can_read, created_at, updated_at
- **cases**: id, case_code, beneficiary_id, case_type, case_title, case_resolution_type, court, organizations, status, notes, google_drive_folder_id, google_drive_url, created_at, updated_at
- **case_events**: id, case_id, event_type, event_title, event_date, event_time, location, description, event_status, google_drive_url, created_at, updated_at
- **documents**: id, case_id, file_name, file_type, file_size, google_drive_file_id, google_drive_url, uploaded_by, created_at
- **reminders**: id, case_event_id, send_date, send_time, method, status, created_at

### 6. API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get case by ID
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case
- `GET /api/cases/filter` - Get cases with filters

#### Events
- `GET /api/events/case/:id` - Get events for a case
- `POST /api/events/case/:id` - Create event for a case
- `GET /api/events/:eventId` - Get event by ID
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event
- `GET /api/events/upcoming` - Get upcoming events

#### Beneficiaries
- `GET /api/beneficiaries` - Get all beneficiaries
- `GET /api/beneficiaries/:id` - Get beneficiary by ID
- `POST /api/beneficiaries` - Create beneficiary
- `PUT /api/beneficiaries/:id` - Update beneficiary
- `DELETE /api/beneficiaries/:id` - Delete beneficiary

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

#### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/case/:id` - Get documents for a case
- `DELETE /api/documents/:id` - Delete document

### 7. Key Features Implementation

#### Automatic Case Status Management
- When event is created: Case status changes from "active" to "pending" if it was active
- When all events resolved: Case status changes from "pending" to "active"
- Implemented in `backend/src/controllers/eventController.js`

#### Google Drive Integration
- OAuth 2.0 authentication flow
- Auto-create folders for cases
- Upload documents to Drive
- Custom hook: `useDriveAuth`
- Service: `driveService`

#### Real-time Updates
- Custom events: `caseUpdated`, `eventUpdated`
- Dashboard and pages listen for updates
- Automatic refresh on data changes

### 8. Configuration Files

#### Backend `.env`
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=pace_db
JWT_SECRET=your_jwt_secret
PORT=5000
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

#### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
```

### 9. Deployment

#### Backend Deployment
- Use PM2 or similar process manager
- Set environment variables on server
- Ensure PostgreSQL is accessible
- Configure CORS for frontend domain

#### Frontend Deployment
- Build: `npm run build`
- Deploy `dist/` folder to web server (Nginx, Apache, etc.)
- Configure reverse proxy if needed
- Update API URL in production `.env`

### 10. Dependencies

#### Backend
- express: Web framework
- pg: PostgreSQL client
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- multer: File upload handling
- googleapis: Google Drive API
- cors: Cross-origin resource sharing
- dotenv: Environment variables

#### Frontend
- react: UI library
- react-router-dom: Routing
- axios: HTTP client
- react-hot-toast: Notifications
- react-icons: Icons

### 11. Troubleshooting
- Database connection issues
- Google Drive authentication problems
- CORS errors
- JWT token expiration
- File upload failures
- Port conflicts

### 12. Security Considerations
- Password hashing with bcrypt
- JWT token expiration
- Environment variables for secrets
- CORS configuration
- Input validation
- SQL injection prevention (parameterized queries)

---

## Additional Notes

### Status Logic
- **Active**: Case has no scheduled events
- **Pending**: Case has at least one scheduled event OR status is "pending"
- **Resolved**: Case is closed
- **Urgent**: Manually set for urgent cases

### Event Status
- **Scheduled**: Event is upcoming
- **Completed**: Event has occurred
- **Cancelled**: Event was cancelled

### Case Code Generation
- Auto-generated sequential codes (e.g., CASE-001, CASE-002)

### Google Drive Folder Naming
- Format: `{sequential_id} - {beneficiary_name}`
- Created automatically when case is created (if Drive connected)

