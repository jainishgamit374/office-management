# Leave Balance Workflow - Approval & Rejection Handling

## Overview
This document explains how leave balance is managed throughout the leave application lifecycle, ensuring that balance is only deducted when leave is **approved**, and restored/not deducted when leave is **rejected**.

## Leave Balance States

### 1. **Total Balance**
- The total number of leaves allocated to an employee for a leave type
- Example: 10 CL (Casual Leave) per year

### 2. **Used Balance**
- Leaves that have been **approved** and consumed
- Only increments when leave status = "Approved"
- Example: 3 CL used

### 3. **Pending Balance**
- Leaves that are **applied but awaiting approval**
- Temporarily reserved but not yet deducted
- Example: 2 CL pending approval

### 4. **Available Balance** ✅
- Leaves that can be applied for
- **Formula**: `Available = Total - Used - Pending`
- Example: 10 - 3 - 2 = **5 CL available**

## Workflow Lifecycle

### Scenario 1: Leave Application → Approval ✅

```
Initial State:
├─ Total: 10 CL
├─ Used: 3 CL
├─ Pending: 0 CL
└─ Available: 7 CL

Step 1: Employee applies for 2 days CL
├─ Total: 10 CL (unchanged)
├─ Used: 3 CL (unchanged)
├─ Pending: 2 CL (increased) ⬆️
└─ Available: 5 CL (decreased) ⬇️

Step 2: Manager approves the leave
├─ Total: 10 CL (unchanged)
├─ Used: 5 CL (increased) ⬆️
├─ Pending: 0 CL (decreased) ⬇️
└─ Available: 5 CL (unchanged)

Final State:
✅ Leave is approved and deducted from balance
```

### Scenario 2: Leave Application → Rejection ❌

```
Initial State:
├─ Total: 10 CL
├─ Used: 3 CL
├─ Pending: 0 CL
└─ Available: 7 CL

Step 1: Employee applies for 2 days CL
├─ Total: 10 CL (unchanged)
├─ Used: 3 CL (unchanged)
├─ Pending: 2 CL (increased) ⬆️
└─ Available: 5 CL (decreased) ⬇️

Step 2: Manager rejects the leave
├─ Total: 10 CL (unchanged)
├─ Used: 3 CL (unchanged)
├─ Pending: 0 CL (decreased) ⬇️
└─ Available: 7 CL (restored) ⬆️

Final State:
✅ Leave is rejected and balance is restored
```

### Scenario 3: Multiple Pending Applications

```
Initial State:
├─ Total: 10 CL
├─ Used: 2 CL
├─ Pending: 0 CL
└─ Available: 8 CL

Application 1: 3 days CL (Pending)
├─ Total: 10 CL
├─ Used: 2 CL
├─ Pending: 3 CL ⬆️
└─ Available: 5 CL ⬇️

Application 2: 2 days CL (Pending)
├─ Total: 10 CL
├─ Used: 2 CL
├─ Pending: 5 CL ⬆️
└─ Available: 3 CL ⬇️

Application 1: Approved ✅
├─ Total: 10 CL
├─ Used: 5 CL ⬆️
├─ Pending: 2 CL ⬇️
└─ Available: 3 CL

Application 2: Rejected ❌
├─ Total: 10 CL
├─ Used: 5 CL
├─ Pending: 0 CL ⬇️
└─ Available: 5 CL ⬆️

Final State:
✅ Only approved leave (3 days) is deducted
✅ Rejected leave (2 days) is restored
```

## Backend Implementation Requirements

### API Endpoint: `/getemployeeleavebalance/`

**Expected Response Structure:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": [
    {
      "Leavename": "CL",
      "total": 10,
      "used": 3,
      "pending": 2,
      "count": 5  // This is the available balance (total - used - pending)
    },
    {
      "Leavename": "SL",
      "total": 10,
      "used": 1,
      "pending": 0,
      "count": 9
    },
    {
      "Leavename": "PL",
      "total": 15,
      "used": 5,
      "pending": 3,
      "count": 7
    }
  ]
}
```

### Backend Logic Requirements

1. **On Leave Application (POST /leaveapplications/)**
   ```python
   # Pseudocode
   def apply_leave(employee_id, leave_type, days):
       balance = get_leave_balance(employee_id, leave_type)
       
       # Check if sufficient balance
       if balance.available < days:
           return error("Insufficient balance")
       
       # Create leave application with status = "Pending"
       application = create_leave_application(
           employee_id=employee_id,
           leave_type=leave_type,
           days=days,
           status="Pending"
       )
       
       # Update pending count (but NOT used count)
       update_pending_balance(employee_id, leave_type, +days)
       
       return success(application)
   ```

2. **On Leave Approval**
   ```python
   def approve_leave(application_id):
       application = get_application(application_id)
       
       # Move from pending to used
       update_pending_balance(application.employee_id, application.leave_type, -application.days)
       update_used_balance(application.employee_id, application.leave_type, +application.days)
       
       # Update application status
       application.status = "Approved"
       application.save()
       
       return success()
   ```

3. **On Leave Rejection**
   ```python
   def reject_leave(application_id):
       application = get_application(application_id)
       
       # Restore balance (remove from pending, don't add to used)
       update_pending_balance(application.employee_id, application.leave_type, -application.days)
       
       # Update application status
       application.status = "Rejected"
       application.save()
       
       return success()
   ```

## Frontend Implementation

### Current Implementation (app/Requests/Leaveapplyreq.tsx)

The frontend correctly:
1. ✅ Fetches balance from API
2. ✅ Calculates available as `total - used - pending`
3. ✅ Validates before submission
4. ✅ Shows pending approvals in balance cards
5. ✅ Prevents submission if insufficient balance

### Balance Display Logic

```typescript
// Calculate available balance
const total = item.count || 0;
const used = item.used || 0;
const pending = item.pending || 0;
const available = Math.max(0, total - used - pending);

balanceMap[key] = {
    name: item.Leavename,
    total: total,
    used: used,
    pending: pending,
    available: available  // This is what users can apply for
};
```

### Validation Logic

```typescript
// Check if sufficient balance
if (balance.available < totalDays) {
    Alert.alert(
        'Insufficient Leave Balance',
        `You don't have enough ${selectedLeaveType} leave balance.\n\n` +
        `📊 Balance Details:\n` +
        `• Total: ${balance.total} days\n` +
        `• Used: ${balance.used} days\n` +
        `• Pending: ${balance.pending} days\n` +
        `• Available: ${balance.available} days\n\n` +
        `🚫 Requested: ${totalDays} days`
    );
    return; // Prevent submission
}
```

## User Experience

### What Users See

**Balance Card Display:**
```
┌─────────────┐
│     5       │  ← Available balance (can apply)
│    CL       │  ← Leave type
│  of 10      │  ← Total allocated
│ (2 pending) │  ← Pending approvals (if any)
└─────────────┘
```

**When Applying:**
- ✅ Can apply if: `requested ≤ available`
- ❌ Cannot apply if: `requested > available`

**After Application:**
- Pending count increases
- Available count decreases
- Used count stays same (until approved)

**After Approval:**
- Pending count decreases
- Used count increases
- Available count stays same

**After Rejection:**
- Pending count decreases
- Available count increases
- Used count stays same

## Testing Scenarios

### Test 1: Apply and Approve
1. Check initial balance (e.g., 10 CL available)
2. Apply for 3 days CL
3. Verify: Available = 7, Pending = 3, Used = unchanged
4. Approve the leave
5. Verify: Available = 7, Pending = 0, Used = 3

### Test 2: Apply and Reject
1. Check initial balance (e.g., 10 CL available)
2. Apply for 3 days CL
3. Verify: Available = 7, Pending = 3, Used = unchanged
4. Reject the leave
5. Verify: Available = 10, Pending = 0, Used = unchanged

### Test 3: Multiple Applications
1. Apply for 3 days (Pending)
2. Apply for 2 days (Pending)
3. Verify: Pending = 5, Available = reduced by 5
4. Approve first (3 days)
5. Verify: Used +3, Pending -3
6. Reject second (2 days)
7. Verify: Available +2, Pending -2

## Important Notes

⚠️ **Backend Responsibility**: The backend MUST handle the state transitions correctly:
- Apply → Increment pending, decrement available
- Approve → Increment used, decrement pending
- Reject → Decrement pending, increment available

✅ **Frontend Responsibility**: The frontend should:
- Display accurate balance information
- Validate before submission
- Refresh balance after actions
- Show clear feedback to users

🔄 **Auto-Refresh**: Balance should refresh:
- After successful leave application
- When returning to the screen (useFocusEffect)
- After approval/rejection (if viewing own leaves)

## Summary

| Action | Total | Used | Pending | Available |
|--------|-------|------|---------|-----------|
| **Initial** | 10 | 0 | 0 | 10 |
| **Apply 3 days** | 10 | 0 | 3 ⬆️ | 7 ⬇️ |
| **Approve** | 10 | 3 ⬆️ | 0 ⬇️ | 7 |
| **Apply 2 days** | 10 | 3 | 2 ⬆️ | 5 ⬇️ |
| **Reject** | 10 | 3 | 0 ⬇️ | 7 ⬆️ |

✅ **Key Principle**: Balance is only deducted (moved to "used") when leave is **approved**. Rejected leaves restore the balance.
