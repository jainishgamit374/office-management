# MissedPunchSection API Documentation

## ✅ **YES - This Component Uses REAL APIs!**

The `MissedPunchSection` component fetches **100% REAL DATA** from the backend APIs. No static or mock data is used.

---

## APIs Used

### 1. **Missed Punch Requests API**
**Function:** `getMissingPunchDetails()`  
**File:** `lib/missPunchList.ts`  
**Endpoint:** `/misspunchdetails/`  
**Method:** GET

**What it returns:**
```json
{
  "status": "Success",
  "data": [
    {
      "MissPunchReqMasterID": 1,
      "datetime": "2026-01-10T10:00:00",
      "PunchType": "1",  // "1" = Check-In, "2" = Check-Out
      "reason": "Forgot to punch in",
      "approval_status": "Awaiting Approve"
    }
  ]
}
```

**Used for:** Blue cards showing missed punch requests that are pending approval

---

### 2. **Missing Punch-Out API**
**Function:** `getMissingPunchOut()`  
**File:** `lib/attendance.ts`  
**Endpoint:** `/missingpunchout/`  
**Method:** GET

**What it returns:**
```json
{
  "status": "Success",
  "data": [
    {
      "missing_date": "2026-01-09"
    }
  ]
}
```

**Used for:** Red warning cards showing dates when user forgot to punch out

---

## Data Flow

```
Component Mount
    ↓
useFocusEffect triggers
    ↓
fetchMissedPunches() called
    ↓
Promise.all([
    getMissingPunchDetails(),  ← API Call 1
    getMissingPunchOut()       ← API Call 2
])
    ↓
Transform API responses
    ↓
Update state with real data
    ↓
Render cards with API data
```

---

## What Data is Displayed

### From `getMissingPunchDetails()`:
- ✅ Request ID (`MissPunchReqMasterID`)
- ✅ Date & Time (`datetime`)
- ✅ Punch Type (`PunchType`: 1=In, 2=Out)
- ✅ Reason (`reason`)
- ✅ Approval Status (`approval_status`)

### From `getMissingPunchOut()`:
- ✅ Missing date (`missing_date`)

---

## Modal Details

When you click a card, the modal shows:

### For Missed Punch Requests (Blue Cards):
- **Type**: Punch-In or Punch-Out (from API)
- **Date & Time**: Full datetime (from API)
- **Reason**: User-provided reason (from API)
- **Status**: Approval status with color coding (from API)

### For Missing Punch-Outs (Red Cards):
- **Type**: Missing Punch-Out
- **Date**: The date when punch-out was missed (from API)
- **Warning**: Reminder to submit a request

---

## Auto-Refresh

The component automatically refreshes data when:
- ✅ Component mounts
- ✅ Screen comes into focus (`useFocusEffect`)
- ✅ User navigates back to the screen

---

## Console Logs to Verify

You can see these logs in the console to confirm API calls:
```
📋 Fetching missed punches and missing punch-outs from API...
✅ Missed punches loaded from API: X
✅ Missing punch-outs loaded from API: Y
```

---

## Summary

| Component | Data Source | API Endpoint | Type |
|-----------|-------------|--------------|------|
| MissedPunchSection | Real API | `/misspunchdetails/` | GET |
| MissedPunchSection | Real API | `/missingpunchout/` | GET |

**Conclusion:** This component uses **100% REAL API DATA**. No static or hardcoded data! ✅

---

**Last Updated:** 2026-01-12
