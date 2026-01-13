# API Integration Summary

## Overview
This document summarizes the API integrations for all updated components.

---

## 1. LeaveBalanceSection Component
**File:** `components/Home/LeaveBalanceSection.tsx`

### API Used:
- **Endpoint:** `/getemployeeleavebalance/`
- **Function:** `getEmployeeLeaveBalance()` from `@/lib/leaves`
- **Method:** GET

### Expected Response:
```json
{
  "status": "Success",
  "statusCode": 200,
  "message": "Leave balance retrieved successfully.",
  "data": [
    { "Leavename": "CL", "count": 15 },
    { "Leavename": "PL", "count": 15 },
    { "Leavename": "SL", "count": 13 }
  ]
}
```

### Features:
- ✅ Shows CL, PL, SL, and Total leave counts
- ✅ Sample data fallback when API returns empty array
- ✅ Auto-refresh on screen focus
- ✅ Color-coded badges

---

## 2. EarlyCheckouts Component
**File:** `components/Home/EarlyCheckouts.tsx`

### API Used:
- **Endpoint:** `/earlycheckoutdetails/`
- **Function:** `getEarlyCheckoutDetails()` from `@/lib/earlyLatePunch`
- **Method:** GET
- **Parameters:** `{ limit: 10, status: 'All' }`

### Expected Response:
```json
{
  "status": "Success",
  "data": [
    {
      "EarlyCheckoutReqMasterID": 4,
      "ApprovalStatusMasterID": 3,
      "datetime": "2025-04-20 12:00:28 PM",
      "Reason": "test1",
      "approval_status": "Awaiting Approve",
      "workflow_list": [
        {
          "Approve_name": "Durgesh Jadav",
          "Priority": 1,
          "status": "Awaiting Approve"
        }
      ]
    }
  ]
}
```

### Features:
- ✅ Shows early checkout requests with approval status
- ✅ Displays approver name from workflow
- ✅ Color-coded status (Green=Approved, Orange=Pending, Red=Rejected)
- ✅ Auto-refresh on screen focus

---

## 3. LateArrivals Component
**File:** `components/Home/LateArrivals.tsx`

### API Used:
- **Endpoint:** `/early-late-punch/`
- **Function:** `getEarlyLatePunchList()` from `@/lib/earlyLatePunch`
- **Method:** GET
- **Parameters:** `{ checkoutType: 'Late', limit: 10, sortBy: 'DateTime', sortOrder: 'desc' }`

### Expected Response:
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": [
    {
      "EarlyLatePunchMasterID": 1,
      "EmployeeID": 1,
      "DateTime": "2025-01-10 04:00:00 PM",
      "CheckoutType": "Late",
      "Reason": "Traffic delay",
      "IsActive": true
    }
  ]
}
```

### Features:
- ✅ Filters for CheckoutType='Late' only
- ✅ Shows late arrival records with date/time and reason
- ✅ Active/Inactive status indicator
- ✅ Auto-refresh on screen focus

---

## 4. AttendanceTrackingCards Component
**File:** `components/Home/AttendanceTrackingCards.tsx`

### APIs Used:

#### For Late Check-in:
- **Endpoint:** `/late-checkin-request/`
- **Function:** `submitLateCheckinRequest(dateTime, reason)` from `@/lib/earlyLatePunch`
- **Method:** POST
- **Request Body:**
```json
{
  "DateTime": "2025-01-15T10:55:00",
  "Reason": "Traffic delay"
}
```

#### For Early Checkout:
- **Endpoint:** `/early-late-punch/`
- **Function:** `createEarlyLatePunch(dateTime, 'Early', reason)` from `@/lib/earlyLatePunch`
- **Method:** POST
- **Request Body:**
```json
{
  "DateTime": "2025-01-10T10:30:00",
  "CheckoutType": "Early",
  "Reason": "Personal work"
}
```

### Features:
- ✅ Modal for recording early/late punch
- ✅ Separate API calls based on selected type
- ✅ Auto-refresh counts after submission
- ✅ Color-coded count indicators

---

## Debugging Steps

If data is not showing:

### 1. Check Console Logs
Look for these log messages in the console:
- `🔄 Fetching...` - API call started
- `📡 Response:` - API response received
- `✅ Loaded:` - Data successfully loaded
- `❌ Error:` - Something went wrong

### 2. Verify API Response
Check if the response has:
- `status: "Success"`
- `data` array with items
- Correct field names (case-sensitive)

### 3. Check Authentication
Ensure the access token is valid:
- Check AsyncStorage for `access_token`
- Token should not be expired
- User should be logged in

### 4. Test Individual APIs
Run the test file:
```bash
npx ts-node test-api-integrations.ts
```

---

## Common Issues & Solutions

### Issue: Empty data array
**Solution:** 
- LeaveBalanceSection: Will show sample data automatically
- Other components: Check if backend has records for the logged-in user

### Issue: "No access token" error
**Solution:** 
- User needs to log in again
- Check if token is stored in AsyncStorage

### Issue: Data not refreshing
**Solution:**
- Pull down to refresh (if RefreshControl is enabled)
- Navigate away and back to trigger useFocusEffect

---

## API Summary Table

| Component | Endpoint | Function | Type |
|-----------|----------|----------|------|
| LeaveBalanceSection | `/getemployeeleavebalance/` | `getEmployeeLeaveBalance()` | GET |
| EarlyCheckouts | `/earlycheckoutdetails/` | `getEarlyCheckoutDetails()` | GET |
| LateArrivals | `/early-late-punch/` | `getEarlyLatePunchList({checkoutType: 'Late'})` | GET |
| AttendanceTrackingCards (Late) | `/late-checkin-request/` | `submitLateCheckinRequest()` | POST |
| AttendanceTrackingCards (Early) | `/early-late-punch/` | `createEarlyLatePunch()` | POST |

---

**Last Updated:** 2026-01-12
