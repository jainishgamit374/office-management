# 📊 Current API Endpoints for Attendance Counts

## ✅ **Actual Backend Endpoints**

### 1. **Late Check-In Count** (Dedicated Endpoint)
- **Endpoint**: `/late-checkin-count/`
- **Method**: GET
- **Query Params**: `month`, `year` (optional)
- **Response**:
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "late_checkin_count": 1,
    "month": "1",
    "year": 2026,
    "allowed_late_checkins": 5,
    "remaining": 4
  }
}
```

### 2. **Early Check-Out Count** (Combined Endpoint)
- **Endpoint**: `/lateearlyscount/`
- **Method**: GET
- **Query Params**: `from_date`, `to_date` (YYYY-MM-DD format)
- **Response**:
```json
{
  "status": "Success",
  "data": [
    {
      "emp_id": 1,
      "fname": "Durgesh",
      "lname": "Jadav",
      "late": 1,
      "early": 3
    }
  ]
}
```
**Note**: This endpoint returns **both** late and early counts, but we only use the `early` field.

## 🔧 **Current Implementation**

### **AttendanceTrackingCards Component:**

```typescript
const fetchCounts = useCallback(async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStr = (month + 1).toString();
    const yearStr = year.toString();

    // Date range for combined endpoint
    const fromDate = new Date(year, month, 1);
    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDate = new Date(year, month + 1, 0);
    const toDateStr = toDate.toISOString().split('T')[0];

    // Fetch both counts in parallel
    const [lateResponse, earlyResponse] = await Promise.all([
        // Dedicated endpoint for late check-in count
        getLateCheckinCount(monthStr, yearStr),
        
        // Combined endpoint for early check-out count
        getLateEarlyCount(fromDateStr, toDateStr)
    ]);

    // Extract late count
    const lateCount = lateResponse?.data?.late_checkin_count || 0;
    
    // Extract early count from array
    const earlyCount = earlyResponse?.data?.[0]?.early || 0;
}, []);
```

## 📝 **Why Different Endpoints?**

### **Late Check-In:**
- ✅ Has dedicated endpoint: `/late-checkin-count/`
- ✅ Simple query params: `month`, `year`
- ✅ Direct response: `late_checkin_count`

### **Early Check-Out:**
- ⚠️ No dedicated endpoint yet
- 🔄 Uses combined endpoint: `/lateearlyscount/`
- 📅 Requires date range: `from_date`, `to_date`
- 📊 Returns array with both late and early counts

## 🎯 **Future Improvement**

If the backend adds a dedicated `/early-checkout-count/` endpoint similar to `/late-checkin-count/`, we can simplify the code:

```typescript
// Future implementation (when endpoint is available)
const [lateResponse, earlyResponse] = await Promise.all([
    getLateCheckinCount(monthStr, yearStr),
    getEarlyCheckoutCount(monthStr, yearStr)  // ← Dedicated endpoint
]);

const lateCount = lateResponse.data.late_checkin_count;
const earlyCount = earlyResponse.data.early_checkout_count;  // ← Direct value
```

### **Benefits of Dedicated Endpoint:**
- ✅ Consistent API pattern
- ✅ Simpler query parameters
- ✅ No date range calculation needed
- ✅ Direct count value (no array parsing)
- ✅ Better performance

## 📊 **Current Data Flow**

```
AttendanceTrackingCards
    ↓
┌─────────────────────────────────────┐
│  Fetch Late Check-In Count          │
│  GET /late-checkin-count/           │
│  ?month=1&year=2026                 │
│  → { late_checkin_count: 1 }        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Fetch Early Check-Out Count        │
│  GET /lateearlyscount/              │
│  ?from_date=2026-01-01              │
│  &to_date=2026-01-31                │
│  → [{ late: 1, early: 3 }]          │
│  Extract: early = 3                 │
└─────────────────────────────────────┘
    ↓
Display: Late: 1/5, Early: 3/5
```

## ✅ **Current Status**

The app is working correctly with:
- ✅ Dedicated endpoint for late check-in count
- ✅ Combined endpoint for early check-out count
- ✅ Proper error handling for both
- ✅ Auto-refresh on focus
- ✅ Manual refresh on tap
- ✅ Updates after check-in/out

**Everything is working as expected!** 🎉

---

**Note**: The `getEarlyCheckoutCount()` function was created in `lib/earlyLatePunch.ts` for future use when the backend implements the dedicated endpoint. For now, we use the existing `/lateearlyscount/` endpoint.
