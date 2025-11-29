# Dashboard Events Display Fix - Comprehensive Guide

## Problem Analysis

Events are showing in the Case Details timeline but NOT on the Dashboard's "Upcoming Events" section.

### Root Causes Identified:

1. **Route Ordering Issue**
   - Current: `GET /events/upcoming` comes before `GET /events/:eventId`
   - Problem: Express matches first `/upcoming` but then might hit `:eventId` first depending on middleware
   - Fix: Ensure specific routes come BEFORE parameterized routes

2. **Status Filter Too Restrictive**
   - Query: `WHERE event_status = 'scheduled'`
   - Problem: Events might be created with NULL or empty status
   - Fix: Remove or make status filter optional, OR ensure status is always set

3. **Missing Event Fields**
   - Dashboard expects: `case_id`, `event_title`, `event_date`, `event_time`, `case_code`, `beneficiary_name`, `event_type`, `location`
   - Current return: Has these but might be missing `case_id` in some cases
   - Fix: Explicitly select all required fields

## Solution Implementation

### Backend Changes

#### 1. Fix Event Model - getUpcoming() method

**File**: `backend/src/models/Event.js`

**Change**: Remove `event_status = 'scheduled'` filter and ensure all required fields are returned

```javascript
async getUpcoming(days = 7) {
  const query = `
    SELECT e.*, c.case_code, c.id as case_id, c.case_title, b.name as beneficiary_name, 
           b.contact_number, b.has_smartphone, b.can_read
    FROM case_events e
    LEFT JOIN cases c ON e.case_id = c.id
    LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
    WHERE e.event_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * $1
    ORDER BY e.event_date ASC, e.event_time ASC
  `;
  const result = await pool.query(query, [days]);
  return result.rows;
}
```

**Key Changes**:
- Removed: `AND e.event_status = 'scheduled'`
- Added: `c.id as case_id` to ensure case_id is always available
- Reason: Events should show regardless of status; status filter was preventing events from displaying

#### 2. Fix Event Routes - Reorder routes

**File**: `backend/src/routes/eventRoutes.js`

**Current Order** (WRONG):
```javascript
router.get('/upcoming', getUpcomingEvents);      // Specific
router.get('/:eventId', getEventById);           // Generic - matches everything
```

**New Order** (CORRECT):
```javascript
router.get('/upcoming', getUpcomingEvents);      // Specific - must come first
router.get('/reminders/upcoming', getUpcomingReminders);  // Specific
router.get('/:eventId', getEventById);           // Generic - must come last
```

### Frontend Changes

#### Dashboard.jsx - Ensure proper event fetching

**File**: `frontend/src/pages/Dashboard.jsx`

**Current**: 
```javascript
eventAPI.getUpcoming(30)  // Fetch 30 days
```

**Better**:
```javascript
eventAPI.getUpcoming(90)  // Fetch 90 days for better visibility
```

And add error logging:
```javascript
const fetchDashboardData = async () => {
  try {
    const [statsRes, eventsRes] = await Promise.all([
      dashboardAPI.getStats(),
      eventAPI.getUpcoming(90)
    ]);
    setStats(statsRes.data);
    console.log('Events received:', eventsRes.data.events); // Debug log
    setAllEvents(eventsRes.data.events || []);
    setUpcomingEvents(eventsRes.data.events || []);
  } catch (error) {
    console.error('Error details:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};
```

## Testing Checklist

1. **Backend Route Test**
   ```bash
   curl http://localhost:3001/events/upcoming?days=30
   ```
   Should return: `{ events: [...] }` with event details

2. **Frontend Display Test**
   - Open Dashboard page
   - Check browser console for "Events received" log
   - Verify events from case details timeline appear on dashboard

3. **Field Verification**
   Each event should have:
   - ✅ id
   - ✅ case_id
   - ✅ case_code
   - ✅ beneficiary_name
   - ✅ event_title
   - ✅ event_date
   - ✅ event_time
   - ✅ event_type
   - ✅ location

## Debugging Steps if Still Not Working

1. **Check Event Creation**
   ```javascript
   // In Database
   SELECT * FROM case_events LIMIT 5;
   ```
   Verify events exist and have valid event_date

2. **Check API Response**
   - Open DevTools Network tab
   - Go to Dashboard
   - Look for `/events/upcoming?days=30` request
   - Check response data

3. **Check Status Values**
   ```javascript
   SELECT DISTINCT event_status FROM case_events;
   ```
   Verify what statuses are actually in database

4. **Check Date Ranges**
   - Events must have `event_date >= TODAY`
   - Events must have `event_date <= TODAY + N days`

## Summary of All Changes

| File | Change | Reason |
|------|--------|--------|
| Event.js | Remove status filter | Events were hidden if status wasn't 'scheduled' |
| Event.js | Add `c.id as case_id` | Ensure case_id is available for navigation |
| eventRoutes.js | Reorder routes | Ensure specific routes match before generic ones |
| Dashboard.jsx | Optional: Increase days to 90 | Better visibility of upcoming events |

---

**Status**: Ready to implement ✅
