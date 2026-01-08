# Late/Early API Endpoint Testing

## 📋 Overview

This document explains how to test the Late Check-In and Early Check-Out API endpoints.

## 🎯 API Endpoints Being Tested

### 1. Late Check-In Count API
- **Endpoint**: `/late-checkin-count/`
- **Method**: GET
- **Query Params**: `month`, `year`
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

### 2. Late/Early Counts API
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
      "late": 0,
      "early": 3
    }
  ]
}
```

## 🚀 How to Test

### Option 1: Using the Test Screen (Recommended)

1. **Navigate to the test screen** in your app:
   - The screen is located at: `/app/(auth)/test-late-early-screen.tsx`
   - You can navigate to it programmatically or add it to your navigation

2. **Run Tests**:
   - **Test Late Check-In API**: Tests only the `/late-checkin-count/` endpoint
   - **Test Late/Early Count API**: Tests only the `/lateearlyscount/` endpoint
   - **Compare Both APIs**: Runs both and compares the results
   - **Run All Tests**: Executes all tests in sequence

3. **View Results**: The test results will be displayed on screen with detailed logs

### Option 2: Using Console Logs

1. Import the test functions in any component:
```typescript
import { runAllTests, testLateCheckinCount, testLateEarlyCount } from '@/test-late-early-apis';
```

2. Call the test function:
```typescript
// Test individual endpoint
await testLateCheckinCount();

// Test both endpoints
await testLateEarlyCount();

// Run all tests
await runAllTests();
```

3. Check the console output for detailed results

### Option 3: Direct API Testing

You can also test directly using the existing API functions:

```typescript
import { getLateCheckinCount } from '@/lib/earlyLatePunch';
import { getLateEarlyCount } from '@/lib/api';

// Test late check-in count
const month = '1'; // January
const year = '2026';
const lateResult = await getLateCheckinCount(month, year);
console.log('Late check-in count:', lateResult);

// Test late/early counts
const fromDate = '2026-01-01';
const toDate = '2026-01-31';
const lateEarlyResult = await getLateEarlyCount(fromDate, toDate);
console.log('Late/Early counts:', lateEarlyResult);
```

## 📊 Expected Behavior

### When Employee Checks In After 9:30 AM:
1. Backend automatically detects late check-in
2. Returns `IsLate: true` and `LateByMinutes` in response
3. Count is stored in backend database
4. Count can be retrieved via `/late-checkin-count/` API

### When Employee Checks Out Before 6:30 PM:
1. Backend automatically detects early check-out
2. Returns `IsEarly: true` and `EarlyByMinutes` in response
3. Count is stored in backend database
4. Count can be retrieved via `/lateearlyscount/` API

## 🔍 What the Tests Verify

✅ API endpoints are accessible and returning data  
✅ Authentication tokens are working correctly  
✅ Response format matches expected structure  
✅ Late check-in counts are being tracked  
✅ Early check-out counts are being tracked  
✅ Both APIs return consistent data  

## 📝 Test Output Example

```
========================================
TEST 1: Late Check-In Count API
========================================

📅 Testing for: { month: '1', year: '2026' }
🌐 Endpoint: /late-checkin-count/
📤 Query params: { month: '1', year: '2026' }

📡 Response Status: 200
📡 Response Status Text: OK

📊 Response Data:
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

✅ SUCCESS!
📊 Late Check-In Count: 1
📊 Remaining: 4
```

## 🐛 Troubleshooting

### Error: "No auth token found"
- Make sure you're logged in to the app
- Check that the access token is stored in AsyncStorage

### Error: "Network request failed"
- Check your internet connection
- Verify the backend server is running
- Check if the BASE_URL is correct

### Error: "401 Unauthorized"
- Your session may have expired
- Try logging out and logging back in

## 📁 Files Created

1. **`/test-late-early-apis.ts`** - Test functions and logic
2. **`/app/(auth)/test-late-early-screen.tsx`** - Test UI screen
3. **`/TEST_LATE_EARLY_APIS.md`** - This documentation

## 🎨 Integration with HomeScreen

The counts are already integrated in your HomeScreen:
- Fetched automatically when screen loads
- Displayed in `AttendanceTrackingCards` component
- Color-coded based on count (green → yellow → red)
- Updates after check-in/check-out

## ✨ Next Steps

1. Run the tests to verify both APIs are working
2. Check that counts match between both endpoints
3. Verify the counts update after check-in/check-out
4. Confirm the UI displays the correct counts

---

**Note**: All data is stored in the backend. No local counting is used. The frontend only displays the counts fetched from the APIs.
