# Implementation Code Reference

## Frontend Changes Summary

### File: `frontend/src/pages/AllCases.jsx`

#### 1. State Management (Lines 12-13)
```jsx
const [openDropdown, setOpenDropdown] = useState(null);    // Track which dropdown is open
const [updatingCase, setUpdatingCase] = useState(null);    // Track updating status
```

#### 2. Click Outside Handler (Lines 36-45)
```jsx
useEffect(() => {
  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.status-dropdown-container')) {
      setOpenDropdown(null);
    }
  };

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);
```

#### 3. Status Badge Class Getter (Lines 100-108)
```jsx
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    active: 'badge-active',
    pending: 'badge-pending',
    urgent: 'badge-urgent',
    resolved: 'badge-resolved',
    closed: 'badge-closed'
  };
  return statusClasses[status] || 'badge-default';
};
```

#### 4. Status Change Handler (Lines 110-127)
```jsx
const handleStatusChange = async (caseId, newStatus) => {
  setUpdatingCase(caseId);
  try {
    await caseAPI.update(caseId, { status: newStatus });
    
    // Update local state
    setCases(prev =>
      prev.map(c =>
        c.id === caseId ? { ...c, status: newStatus } : c
      )
    );
    
    toast.success(`Case status updated to ${newStatus}`);
    setOpenDropdown(null);
  } catch {
    toast.error('Failed to update case status');
  } finally {
    setUpdatingCase(null);
  }
};
```

#### 5. Status Click Handler (Lines 129-132)
```jsx
const handleStatusClick = (e, caseId) => {
  e.stopPropagation(); // Prevent row click navigation
  setOpenDropdown(openDropdown === caseId ? null : caseId);
};
```

#### 6. JSX - Status Cell Rendering (Lines 275-315)
```jsx
<td>
  <div className="status-dropdown-container">
    <button
      className={`badge ${getStatusBadgeClass(caseItem.status)} status-badge-btn`}
      onClick={(e) => handleStatusClick(e, caseItem.id)}
      disabled={updatingCase === caseItem.id}
    >
      {updatingCase === caseItem.id ? 'Updating...' : caseItem.status}
    </button>
    
    {openDropdown === caseItem.id && (
      <div className="status-dropdown">
        <button
          className="dropdown-item"
          onClick={() => handleStatusChange(caseItem.id, 'active')}
        >
          Active
        </button>
        <button
          className="dropdown-item"
          onClick={() => handleStatusChange(caseItem.id, 'pending')}
        >
          Pending
        </button>
        <button
          className="dropdown-item"
          onClick={() => handleStatusChange(caseItem.id, 'urgent')}
        >
          Urgent
        </button>
        <button
          className="dropdown-item"
          onClick={() => handleStatusChange(caseItem.id, 'resolved')}
        >
          Resolved
        </button>
        <button
          className="dropdown-item"
          onClick={() => handleStatusChange(caseItem.id, 'closed')}
        >
          Closed
        </button>
      </div>
    )}
  </div>
</td>
```

---

### File: `frontend/src/App.css`

#### 1. Status Badge Button Styling
```css
.status-badge-btn {
  background: none;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.status-badge-btn:hover:not(:disabled) {
  filter: brightness(0.9);
  transform: scale(1.05);
}

.status-badge-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
```

#### 2. Dropdown Container Styling
```css
.status-dropdown-container {
  position: relative;
  display: inline-block;
}
```

#### 3. Dropdown Menu Styling
```css
.status-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 150px;
  margin-top: 0.5rem;
  animation: dropdownSlide 0.2s ease;
}
```

#### 4. Dropdown Animation
```css
@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 5. Dropdown Item Styling
```css
.status-dropdown .dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.status-dropdown .dropdown-item:first-child {
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.status-dropdown .dropdown-item:last-child {
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.status-dropdown .dropdown-item:hover {
  background-color: var(--bg-secondary);
}

.status-dropdown .dropdown-item:active {
  background-color: var(--bg-tertiary);
}
```

#### 6. New Badge Color for Closed Status
```css
.badge-closed,
.badge.badge-closed {
  background: #e5e7eb;
  color: #374151;
}
```

---

## How It Works - Flow Diagram

```
User Action
    ↓
[Click Status Badge]
    ↓
handleStatusClick() 
    ├─ e.stopPropagation()
    └─ setOpenDropdown(caseId or null)
    ↓
React re-renders component
    ├─ Dropdown appears if openDropdown === caseId
    └─ Shows all status options
    ↓
[User Clicks Status Option]
    ↓
handleStatusChange(caseId, newStatus)
    ├─ setUpdatingCase(caseId)
    ├─ Call API: caseAPI.update(caseId, {status: newStatus})
    ├─ Update local state: setCases()
    ├─ Show toast success
    ├─ setOpenDropdown(null)
    └─ setUpdatingCase(null)
    ↓
Component re-renders
    ├─ Badge updates to new status color
    ├─ Dropdown closes
    ├─ Button enabled again
    └─ API syncs with backend
```

---

## API Integration

### Backend Endpoint Used
```
PUT /cases/:id
Body: { status: 'active|pending|urgent|resolved|closed' }
Response: { message: string, case: CaseObject }
```

### Frontend API Call
```javascript
await caseAPI.update(caseId, { status: newStatus });
```

Located in: `frontend/src/services/apiService.js`
```javascript
export const caseAPI = {
  // ... other methods ...
  update: (id, data) => api.put(`/cases/${id}`, data),
};
```

---

## Data Flow

```
AllCases Component State
    ├─ cases[] - All cases from backend
    ├─ filteredCases[] - Filtered display cases
    ├─ openDropdown - Currently open dropdown ID
    └─ updatingCase - Currently updating case ID
         ↓
    User clicks badge
         ↓
    setOpenDropdown(caseId)
         ↓
    Component re-renders
    Dropdown JSX conditional renders
         ↓
    User selects status
         ↓
    handleStatusChange()
         ↓
    caseAPI.update() ← API Call
         ↓
    Backend updates database
         ↓
    Frontend updates local state
    setCases() with new status
         ↓
    Component re-renders
    Badge shows new color
```

---

## Error Handling

```javascript
try {
  // Try to update
  await caseAPI.update(caseId, { status: newStatus });
  
  // Success - update UI
  setCases(prev => ...);
  toast.success(`Case status updated to ${newStatus}`);
  
} catch {
  // Error - show message, don't update UI
  toast.error('Failed to update case status');
  // The old status remains visible
  
} finally {
  // Always cleanup
  setUpdatingCase(null);
}
```

---

## Testing Checklist

```javascript
// Test 1: Dropdown opens/closes
test('Click badge opens dropdown', () => {
  const badge = screen.getByRole('button', { name: /active/i });
  fireEvent.click(badge);
  expect(screen.getByText('Pending')).toBeInTheDocument();
});

// Test 2: Dropdown closes on outside click
test('Click outside closes dropdown', () => {
  // Open dropdown
  // Click outside
  // Verify closed
});

// Test 3: Status updates
test('Select new status updates case', async () => {
  // Open dropdown
  // Click new status
  // Verify API called
  // Verify UI updated
  // Verify toast shown
});

// Test 4: Error handling
test('Show error on failed update', async () => {
  // Mock API to fail
  // Click status
  // Verify error toast shown
  // Verify UI reverted
});
```

---

## Browser DevTools Tips

### In Console, you can check:
```javascript
// Get all cases
document.querySelectorAll('.status-dropdown-container')

// Get specific dropdown
document.querySelector('[data-case-id="1"] .status-dropdown')

// Check if dropdown is open
document.querySelector('.status-dropdown')
```

### In Elements, look for:
```html
<div class="status-dropdown-container">
  <button class="badge badge-active status-badge-btn">
    Active
  </button>
  <div class="status-dropdown">
    <button class="dropdown-item">Pending</button>
    ...
  </div>
</div>
```

---

## Performance Notes

- **Render Optimization**: Only one dropdown rendered per case
- **Event Handling**: Event delegation with e.stopPropagation()
- **State Updates**: Minimal re-renders using functional setState
- **API Calls**: No debouncing needed (user can't click too fast)
- **Memory**: Cleanup event listeners in useEffect return

---

## Accessibility Considerations

Current implementation:
- ✓ Keyboard accessible (can tab to buttons)
- ✓ Disabled state prevents interaction during update
- ✓ Clear visual feedback with colors
- ✓ Semantic HTML (button elements)

Future improvements:
- [ ] ARIA labels for dropdown
- [ ] Keyboard arrow key navigation
- [ ] Escape key to close
- [ ] Screen reader announcements

---

## Related Files

- Backend: `src/controllers/caseController.js` (updateCase method)
- Backend: `src/models/Case.js` (update method)
- Frontend API: `src/services/apiService.js`
- Frontend Page: `src/pages/AllCases.jsx`
- Frontend Styles: `src/App.css`

---

**Last Updated**: November 28, 2025
**Implementation Status**: ✅ Complete
