# Quick Start Guide - Testing Late/Early APIs

## 🎯 What You'll See

### 1. On HomeScreen
After the "Attendance Tracking Cards", you'll see a **yellow button**:

```
┌─────────────────────────────────────┐
│  🧪 Test Late/Early APIs            │
│  Tap to run endpoint tests          │
└─────────────────────────────────────┘
```

### 2. Tap the Button
You'll be taken to the **Test Screen** with these options:

```
╔═══════════════════════════════════════╗
║     API Endpoint Tests                ║
║  Test Late Check-In & Early Check-Out ║
╚═══════════════════════════════════════╝

┌─────────────────────────────────────┐
│  Test Late Check-In API             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Test Late/Early Count API          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Compare Both APIs                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Run All Tests                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Clear Results                      │
└─────────────────────────────────────┘

╔═══════════════════════════════════════╗
║  Test Results:                        ║
║                                       ║
║  (Results will appear here)           ║
║                                       ║
╚═══════════════════════════════════════╝
```

### 3. Test Results Example

When you tap "Run All Tests", you'll see:

```
========================================
TEST 1: Late Check-In Count API
========================================

📅 Testing for: { month: '1', year: '2026' }
🌐 Endpoint: /late-checkin-count/
📡 Response Status: 200

📊 Response Data:
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "late_checkin_count": 1,
    "allowed_late_checkins": 5,
    "remaining": 4
  }
}

✅ SUCCESS!
📊 Late Check-In Count: 1
📊 Remaining: 4

========================================
TEST 2: Late/Early Counts API
========================================

📅 Testing for date range: 2026-01-01 to 2026-01-31
🌐 Endpoint: /lateearlyscount/
📡 Response Status: 200

📊 Response Data:
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

✅ SUCCESS!
📊 Late Check-Ins: 1
📊 Early Check-Outs: 3

========================================
COMPARISON RESULTS
========================================

📊 Late Check-In Count:
   - From /late-checkin-count/: 1
   - From /lateearlyscount/: 1
   - Match: ✅ YES

📊 Early Check-Out Count:
   - From /lateearlyscount/: 3

========================================
✅ All tests completed successfully!
========================================
```

## 🔍 What to Look For

### ✅ Success Indicators:
- Response Status: **200**
- Status: **"Success"**
- Data is present and formatted correctly
- Counts match between APIs

### ❌ Error Indicators:
- Response Status: **400, 401, 403, 500**
- Status: **"Error"**
- Error messages in response
- Missing or null data

## 📱 In Your App

### Current Attendance Display:
The counts are already showing in your HomeScreen:

```
┌─────────────────────────────────────┐
│  Late Check In                      │
│  🔴 (if >= 5)                       │
│  🟡 (if 3-4)                        │
│  🟢 (if 0-2)                        │
│  1/5                                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Early Check Out                    │
│  🟡 (if 3-4)                        │
│  3/5                                │
└─────────────────────────────────────┘
```

## 🎬 Step-by-Step Testing

1. **Open your app** (already running)
2. **Scroll down** on HomeScreen to see the yellow test button
3. **Tap "🧪 Test Late/Early APIs"**
4. **Tap "Run All Tests"** button
5. **Wait** for tests to complete (a few seconds)
6. **Review results** displayed on screen
7. **Check console** for detailed logs

## ✨ What This Proves

After running the tests, you'll have verified:

✅ Backend is tracking late check-ins automatically  
✅ Backend is tracking early check-outs automatically  
✅ API endpoints are working correctly  
✅ Data is stored in backend (not locally)  
✅ Counts are accurate and up-to-date  
✅ Integration with HomeScreen is working  

## 🎯 Next Steps

1. **Run the tests** to verify everything works
2. **Check the counts** match your expectations
3. **Test check-in/out** to see counts update
4. **Remove test button** when done (optional)

---

**Ready to test?** Just open your app and look for the yellow button! 🚀
