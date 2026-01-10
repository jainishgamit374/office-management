# HR Functions & API Endpoints Documentation

## Overview
This document maps all HR functions to their corresponding API endpoints and explains how they work together to create a comprehensive office management system.

## 1. Attendance Tracking

### Purpose
Record and monitor employee check-ins, check-outs, and attendance status in real-time.

### API Endpoints

#### `/dashboard-punch-status/` (GET)
**Purpose**: Get current punch status for logged-in employee
**Response**:
```json
{
  "status": "success",
  "data": {
    "punch": {
      "PunchType": 1,  // 1 = IN, 2 = OUT
      "PunchDateTime": "2026-01-09T04:30:00Z",
      "WorkingHours": "08:30:00",
      "ExpectedCheckout": "2026-01-09T13:00:00Z",
      "OvertimeHours": "00:00:00"
    },
    "lateEarly": {
      "lateCheckins": 2,
      "earlyCheckouts": 1
    }
  }
}
```

#### `/emp-punch/` (POST)
**Purpose**: Record punch in/out
**Request**:
```json
{
  "PunchType": "IN",  // or "OUT"
  "Latitude": 23.0225,
  "Longitude": 72.5714
}
```

#### `/employeeattendance/` (GET)
**Purpose**: Get attendance history for date range
**Parameters**: `from_date`, `to_date`
**Response**: Array of attendance records with punch times and working hours

---

## 2. Leave Management

### Purpose
Apply for leaves, view leave balances, and process approvals.

### API Endpoints

#### `/leaveapplications/` (POST)
**Purpose**: Apply for leave
**Request**:
```json
{
  "LeaveType": "Casual Leave",
  "StartDate": "2026-01-15",
  "EndDate": "2026-01-17",
  "Reason": "Personal work",
  "IsHalfDay": false,
  "IsFirstHalf": false
}
```

#### `/leaveapplications-list/` (GET)
**Purpose**: Get employee's leave applications
**Response**: List of all leave applications with status

#### `/getemployeeleavebalance/` (GET)
**Purpose**: Get available leave balance
**Response**:
```json
{
  "status": "success",
  "data": {
    "casual_leave": 12,
    "sick_leave": 7,
    "earned_leave": 15,
    "total_leaves": 34
  }
}
```

#### `/leaveapprovals/` (GET)
**Purpose**: Get pending leave approvals (for managers)
**Response**: List of leave requests pending approval

---

## 3. Remote Work Requests (WFH)

### Purpose
Manage work-from-home applications and approvals.

### API Endpoints

#### `/workfromhomereq/` (POST)
**Purpose**: Submit WFH request
**Request**:
```json
{
  "DateTime": "2026-01-10",
  "Reason": "Remote work required",
  "IsHalfDay": false,
  "IsFirstHalf": false
}
```

#### `/workfromhomeapplicationslist/` (GET)
**Purpose**: Get employee's WFH applications
**Response**: List of WFH requests with approval status

#### `/workfromhomeapproval/` (GET)
**Purpose**: Get pending WFH approvals (for managers)
**Response**: List of WFH requests pending approval

#### `/todayworkfromhome/` (GET)
**Purpose**: Get list of employees working from home today
**Response**: Array of employees with WFH status for current day

---

## 4. Approval Workflows

### Purpose
Track and process various pending approvals efficiently.

### API Endpoints

#### `/workflowapproval/` (GET) ⭐ **MAIN DASHBOARD ENDPOINT**
**Purpose**: Get summary of all pending approvals
**Response**:
```json
{
  "status": "Success",
  "total_approvals": 7,
  "pending_approval_count": 1,
  "approved_count": 0,
  "disapproved_count": 0,
  "misscheckout_pending_approval_count": 1,
  "earlycheckout_pending_approval_count": 1,
  "IsAway_pending_approval_count": 0,
  "workfromhome_pending_approval_count": 1
}
```

**Use Case**: Display on admin dashboard to show all pending approvals at a glance

#### `/approvalhistory/` (GET)
**Purpose**: Get history of all approvals
**Response**: Complete history of approved/rejected requests

#### `/allapprove/` (POST)
**Purpose**: Approve all pending requests
**Use Case**: Bulk approval action

#### `/alldisapprove/` (POST)
**Purpose**: Reject all pending requests
**Use Case**: Bulk rejection action

---

## 5. Employee Performance

### Purpose
Recognize employee achievements like Employee of the Month.

### API Endpoints

#### `/getemployeeofthemonth/` (GET)
**Purpose**: Get Employee of the Month details
**Response**:
```json
{
  "status": "success",
  "data": {
    "employee_id": 123,
    "employee_name": "John Doe",
    "department": "Engineering",
    "achievement": "Outstanding performance",
    "month": "January",
    "year": 2026
  }
}
```

---

## 6. Absence Tracking

### Purpose
Monitor real-time absences and upcoming leaves.

### API Endpoints

#### `/getabsence/` (GET)
**Purpose**: Get list of absent employees today
**Response**: Array of employees marked absent

#### `/getupcomingleaves/` (GET)
**Purpose**: Get upcoming approved leaves
**Response**: List of employees on leave in coming days

#### `/todayleaves/` (GET)
**Purpose**: Get employees on leave today
**Response**: Array of employees currently on leave

---

## 7. Exception Handling

### Purpose
Address issues like missed punches, early checkouts, and late check-ins.

### API Endpoints

#### `/getmissingpunchout/` (GET)
**Purpose**: Get employees who forgot to punch out
**Response**: List of missing punch-out records

#### `/misspunch/` (POST)
**Purpose**: Submit missed punch request
**Request**:
```json
{
  "datetime": "2026-01-08T18:30:00Z",
  "PunchType": "out",
  "reason": "Forgot to punch out"
}
```

#### `/getmissingpunchdetails/` (GET)
**Purpose**: Get detailed list of missing punch requests
**Response**: Array of missed punch requests with status

#### `/misspunchapprovallist/` (GET)
**Purpose**: Get pending missed punch approvals
**Response**: List of missed punch requests pending approval

#### `/early-late-punch/` (GET)
**Purpose**: Get early/late punch records
**Response**: List of early checkout and late check-in records

#### `/createearlycheckout/` (POST)
**Purpose**: Submit early checkout request
**Request**:
```json
{
  "DateTime": "2026-01-09T16:00:00Z",
  "Reason": "Medical appointment"
}
```

#### `/earlycheckoutapprovallist/` (GET)
**Purpose**: Get pending early checkout approvals
**Response**: List of early checkout requests pending approval

#### `/late-checkin-count/` (GET)
**Purpose**: Get late check-in count for current month
**Parameters**: `month`, `year`
**Response**:
```json
{
  "status": "success",
  "data": {
    "late_checkin_count": 3,
    "allowed_late_checkins": 5,
    "remaining": 2
  }
}
```

#### `/early-checkout-count/` (GET)
**Purpose**: Get early checkout count for current month
**Parameters**: `month`, `year`
**Response**:
```json
{
  "status": "success",
  "data": {
    "early_checkout_count": 2,
    "allowed_early_checkouts": 5,
    "remaining": 3
  }
}
```

---

## Component Integration

### ApprovalsDashboard Component
**File**: `components/Admin/ApprovalsDashboard.tsx`

**Features**:
- ✅ Displays summary from `/workflowapproval/`
- ✅ Shows total, pending, approved, and rejected counts
- ✅ Individual cards for each approval type:
  - Work From Home Requests
  - Early Checkout Requests
  - Missing Checkout
  - Is Away Requests
- ✅ Quick actions: Approve All, View History
- ✅ Pull-to-refresh functionality
- ✅ Navigation to detailed approval screens

**Usage**:
```tsx
import ApprovalsDashboard from '@/components/Admin/ApprovalsDashboard';

// In your admin screen
<ApprovalsDashboard />
```

---

## Workflow Integration Example

### Manager's Daily Workflow

1. **Morning Check** - Open ApprovalsDashboard
   - See pending approval count from `/workflowapproval/`
   - Review WFH requests, early checkouts, etc.

2. **Process Approvals**
   - Click on specific approval type
   - Navigate to detailed list
   - Approve/reject individual requests

3. **Monitor Attendance**
   - Check `/getabsence/` for today's absences
   - Review `/todayworkfromhome/` for remote workers
   - Check `/getmissingpunchout/` for missing checkouts

4. **Handle Exceptions**
   - Review missed punch requests
   - Approve/reject early checkout requests
   - Monitor late check-in patterns

---

## Best Practices

### 1. Real-time Updates
- Use `useFocusEffect` to refresh data when screen comes into focus
- Implement pull-to-refresh for manual updates
- Consider WebSocket for real-time notifications

### 2. Error Handling
- Always show user-friendly error messages
- Provide retry mechanisms
- Log errors for debugging

### 3. Performance
- Cache approval counts locally
- Implement pagination for large lists
- Use optimistic updates for better UX

### 4. Security
- Validate user permissions before showing approval options
- Use secure token-based authentication
- Implement role-based access control

---

## Navigation Structure

```
/approvals
  ├── /dashboard          → ApprovalsDashboard
  ├── /wfh               → WFH Approval List
  ├── /early-checkout    → Early Checkout Approvals
  ├── /missing-checkout  → Missing Checkout Approvals
  ├── /is-away          → Is Away Approvals
  ├── /approve-all      → Bulk Approve Screen
  └── /history          → Approval History
```

---

## Testing Checklist

- [ ] Fetch workflow approval summary
- [ ] Display correct counts for each category
- [ ] Navigate to detailed approval screens
- [ ] Pull-to-refresh works correctly
- [ ] Error states display properly
- [ ] Loading states show during API calls
- [ ] Approve/reject actions work
- [ ] Bulk actions function correctly
- [ ] History shows all past approvals
- [ ] Permissions are enforced

---

## Future Enhancements

1. **Push Notifications** - Alert managers of new approval requests
2. **Approval Delegation** - Allow managers to delegate approvals
3. **Approval Rules** - Auto-approve based on predefined rules
4. **Analytics Dashboard** - Visualize approval trends
5. **Mobile App** - Native mobile app for on-the-go approvals
6. **Email Notifications** - Send email alerts for pending approvals
7. **Approval Comments** - Add comments when approving/rejecting
8. **Approval Workflow** - Multi-level approval chains
