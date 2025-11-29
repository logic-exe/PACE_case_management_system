# Case Status Dropdown - User Guide

## Quick Start

### How to Change a Case Status

1. **Navigate to All Cases**
   - Click on "All Cases" in the sidebar
   - You'll see a table with all cases

2. **Locate the Status Column**
   - Look at the rightmost column labeled "Status"
   - You'll see colored badges (Active, Pending, Urgent, Resolved, Closed)

3. **Click the Status Badge**
   - Click on any status badge to open the dropdown menu
   - The badge will show available status options

4. **Select New Status**
   - Click the desired status from the dropdown
   - The status updates immediately

5. **Confirmation**
   - A success message appears at the top
   - The badge color changes to reflect new status
   - The case status is saved to the database

---

## Status Colors & Meanings

### 🔵 Active (Light Blue)
- **Meaning**: Case is currently being worked on
- **Use When**: Case is ongoing and requires attention

### 🟡 Pending (Light Yellow)
- **Meaning**: Case is waiting for action or response
- **Use When**: Awaiting court decision, waiting for documents, etc.

### 🔴 Urgent (Light Red)
- **Meaning**: Case requires immediate attention
- **Use When**: Deadline approaching, critical hearing coming up

### 🟢 Resolved (Light Green)
- **Meaning**: Case has been resolved or settled
- **Use When**: Issue has been resolved, case settled in favor

### ⚫ Closed (Gray)
- **Meaning**: Case is completely closed
- **Use When**: Case is finalized and archived

---

## Visual Guide

### Before Clicking Status Badge
```
┌─────────────────────────────────────────┐
│ PACE-2024-001 │ Priya Sharma │ ...  │   │
│ ...           │ ...          │ ...  │ 🔵│
│ ...           │ ...          │ ...  │Active
└─────────────────────────────────────────┘
```

### After Clicking Status Badge
```
┌─────────────────────────────────────────┐
│ PACE-2024-001 │ Priya Sharma │ ...  │   │
│ ...           │ ...          │ ...  │ 🔵│
│ ...           │ ...          │ ...  │ 📋│
│                                      ├─ Active
│                                      ├─ Pending
│                                      ├─ Urgent
│                                      ├─ Resolved
│                                      └─ Closed
└─────────────────────────────────────────┘
```

### After Selecting "Resolved"
```
┌─────────────────────────────────────────┐
│ PACE-2024-001 │ Priya Sharma │ ...  │   │
│ ...           │ ...          │ ...  │ 🟢│
│ ...           │ ...          │ ...  │Resolved
└─────────────────────────────────────────┘
✓ Case status updated to resolved
```

---

## Common Workflows

### Workflow 1: Mark Case as Complete
1. Open All Cases
2. Find the case in the list
3. Click its status badge (e.g., "Active")
4. Select "Resolved"
5. Status updates to green "Resolved"

### Workflow 2: Mark Urgent Case
1. Open All Cases
2. Find a "Pending" case that needs immediate attention
3. Click the "Pending" badge
4. Select "Urgent"
5. Status changes to red "Urgent" 
6. Everyone sees it needs attention

### Workflow 3: Close a Resolved Case
1. Open All Cases
2. Find a "Resolved" case
3. Click the "Resolved" badge
4. Select "Closed"
5. Case is now archived with gray "Closed" status

---

## Tips & Tricks

### ✅ Do's
- ✓ Update status regularly to keep cases current
- ✓ Use "Urgent" for cases with approaching deadlines
- ✓ Mark cases "Resolved" when they're settled
- ✓ Close cases after they're completely finalized
- ✓ Click outside the dropdown to cancel without changing

### ❌ Don'ts
- ✗ Don't leave cases in "Active" indefinitely
- ✗ Don't skip updating the status to "Resolved" when case is done
- ✗ Don't mark case as "Closed" unless completely final
- ✗ Don't worry about accidental clicks - dropdown appears on hover

---

## Troubleshooting

### Issue: Dropdown doesn't appear when I click the badge
**Solution**: 
- Ensure you clicked directly on the badge
- Try clicking in the center of the badge
- Check if browser has JavaScript enabled

### Issue: Changes don't save
**Solution**:
- Check internet connection
- Look for error message in toast (top right)
- Try refreshing the page
- Contact support if problem persists

### Issue: Status reverts to old value after update
**Solution**:
- This might indicate an API error
- Check the error message that appeared
- Ensure you have permission to update cases
- Try again or contact administrator

### Issue: Dropdown closes when I try to click an option
**Solution**:
- Click more carefully on the exact option text
- Try using keyboard arrow keys (if supported)
- Close dropdown and try again

---

## Feature Details

### Real-time Updates
- Changes sync to database immediately
- No need to save or confirm separately
- Other users see updates when they refresh

### Error Handling
- If update fails, old status is restored
- Error message explains what went wrong
- You can try again

### Performance
- Updates are fast (usually < 1 second)
- Dropdown opens instantly
- No lag or delays

### Mobile Friendly
- Works on smartphones and tablets
- Touch-friendly dropdown options
- Responsive layout on all screen sizes

---

## Status Workflow Diagram

```
┌─────────┐
│  Active │ ──→ Can change to:
└─────────┘     - Pending
                - Urgent
                - Resolved
                - Closed

┌─────────┐
│ Pending │ ──→ Can change to:
└─────────┘     - Active
                - Urgent
                - Resolved
                - Closed

┌─────────┐
│ Urgent  │ ──→ Can change to:
└─────────┘     - Active
                - Pending
                - Resolved
                - Closed

┌─────────────┐
│  Resolved   │ ──→ Can change to:
└─────────────┘     - Active
                    - Pending
                    - Urgent
                    - Closed

┌─────────┐
│ Closed  │ ──→ Can change to:
└─────────┘     - Active
                - Pending
                - Urgent
                - Resolved
```

---

## Examples

### Example 1: New Case Progress
```
Step 1: Create case → Status: Active
Step 2: Waiting for documents → Status: Pending
Step 3: Hearing next week → Status: Urgent
Step 4: Case settled → Status: Resolved
Step 5: After 6 months → Status: Closed
```

### Example 2: Quick Status Fix
```
Mistake: Marked as "Closed" too early
Fix: Click badge → Select "Resolved" → Continue working
```

### Example 3: Priority Change
```
Case was "Active" but deadline approaching
Update: Click badge → Select "Urgent" 
Result: Now prioritized for immediate attention
```

---

## FAQ

**Q: Can I change status back?**
A: Yes! You can change between any statuses at any time.

**Q: Will changing status affect documents?**
A: No! Status changes don't affect any case documents or events.

**Q: Who can change case status?**
A: Any logged-in staff member. Admins may have additional permissions.

**Q: Is there a history of status changes?**
A: Currently, status changes are immediate. A history log may be added later.

**Q: What happens to closed cases?**
A: Closed cases still appear in the list. You can reopen them by changing status.

**Q: Can I change multiple cases at once?**
A: Currently, you must change each case individually. Bulk updates may be added later.

---

## Related Features

- **All Cases Page**: View and filter all cases
- **Case Details**: See full case information and events
- **Add Event**: Create court hearings and meetings
- **Documents**: Upload and manage case documents

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Contact your administrator
3. Check the main help documentation
4. Submit a support ticket

---

**Last Updated**: November 28, 2025
**Version**: 1.0
