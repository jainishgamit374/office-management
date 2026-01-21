# ✅ Final Implementation: API-First Punch Flow

## 🎯 **Implementation:**

Exactly as you requested:

```
Backend:
├── Check-In  → PunchType = 1
├── Check-Out → PunchType = 2
└── Midnight  → PunchType = 0 (automatic)

Frontend:
├── App Opens     → GET /dashboard-punch-status/ → Apply state
├── Check-In      → POST /emp-punch/ → Refresh from API → PunchType = 1
├── Check-Out     → POST /emp-punch/ → Refresh from API → PunchType = 2
└── Pull-Refresh  → GET /dashboard-punch-status/ → Update state
```

## 📝 **How It Works:**

### **1. App Opens (with Timeout & Retry)**
```typescript
// Configuration
const API_TIMEOUT_MS = 15000; // 15 seconds timeout
const MAX_RETRY_ATTEMPTS = 3; // Maximum retry attempts
const RETRY_DELAY_BASE_MS = 1000; // Base delay for exponential backoff

useEffect(() => {
  fetchPunchStatus(true); // GET /dashboard-punch-status/
}, []);
```
- Fetches current punch status from backend with **15-second timeout**
- **Automatic retry** with exponential backoff (1s, 2s, 4s delays)
- Up to **3 retry attempts** before showing error
- Applies state based on `PunchType` (0, 1, or 2)
- Shows loading state while fetching
- **Prevents indefinite loading** - always resolves with either success or error UI
- **User-facing error messages** with retry button when all attempts fail

### **2. Check-In Flow (with Duplicate Tap Prevention)**
```typescript
const handlePunchIn = async () => {
  // 0. Guard: Prevent duplicate taps
  if (isPunchingRef.current) return false;

  // Set isPunching flag IMMEDIATELY
  setIsPunching(true);
  isPunchingRef.current = true;

  try {
    // 1. Check permissions...
    // ... [Permission checks logic] ...

    // 2. Call punch API FIRST (Get backend confirmation)
    const response = await recordPunch('IN', false, true); 
    
    // 3. Extract confirmed time (or use local fallback)
    const punchTime = response.PunchTime || new Date().toISOString();
    
    // 4. Update UI Optimistically
    applyState(1, punchTime, null, 0);

    // 5. Verify Backend State (15s delay)
    setTimeout(() => fetchPunchStatus(false), 15000);

  } catch (error) {
    // ⚠️ Rollback on Failure
    applyState(0, null, null, 0); 
    
    Alert.alert(
      'Check-In Failed', 
      error.message,
      [{ text: 'Retry', onPress: handlePunchIn }, { text: 'OK' }]
    );
  } finally {
    setIsPunching(false); 
    isPunchingRef.current = false;
  }
};
    
    // 4. Apply state immediately (optimistic update) with valid timestamp
    applyState(1, punchTime, null, 0);
    
    // 5. Refresh from API to ensure full consistency
    await fetchPunchStatus(false); 
    
    Alert.alert('Checked In! ✅');
    return true;

  } catch (error) {
    // Rollback: Revert to "Not Punched" state if IN-punch fails
    applyState(0, null, null, 0); 
    
    Alert.alert('Check-In Failed', error.message);
    return false;
  } finally {
    setIsPunching(false);
    isPunchingRef.current = false;
  }
};
```


**Flow:**
1. User swipes right
2. POST `/emp-punch/` with `PunchType: 1`
3. Backend saves punch record
4. Frontend applies state immediately (shows "Checked In")
5. GET `/dashboard-punch-status/` to confirm
6. Backend returns `PunchType: 1`
7. Frontend updates state with confirmed data

### **3. Check-Out Flow (with Duplicate Tap Prevention)**
```typescript
const handlePunchOut = async () => {
  // 0. Guard: Prevent duplicate taps
  if (isPunchingRef.current) return false;

  // Set isPunching flag IMMEDIATELY
  setIsPunching(true);
  isPunchingRef.current = true;

  try {
    // 1. Check permissions...
    // ... [Permission checks logic] ...

    // 2. Call punch API FIRST (Get backend confirmation)
    const response = await recordPunch('OUT', false, true); 
    
    // 3. Extract confirmed data from response (avoid undefined vars)
    // Use response.data if available, otherwise fallback or wait for fetchPunchStatus
    const confirmedTime = response.PunchTime || new Date().toISOString();
    
    // 4. Update UI - Wait for full refresh to get accurate WorkingMinutes
    // Or apply safe optimistic state without showing incorrect minutes yet
    applyState(2, punchInTime, confirmedTime, 0); // 0 minutes temp until refresh
    
    // 5. Refresh from API to get backend's final calculated WorkingMinutes
    await fetchPunchStatus(false); 
    
    Alert.alert('Checked Out! 🏁');
    return true;

  } catch (error) {
    // Rollback: Revert to Check-In state if API fails
    // (Assuming we were checked in before)
    applyState(1, punchInTime, null, workingMinutes); 
    
    Alert.alert('Check-Out Failed', error.message);
    return false;
  } finally {
    setIsPunching(false);
    isPunchingRef.current = false;
  }
};
```


**Flow:**
1. User swipes left
2. POST `/emp-punch/` (See **API Endpoints** section below for Auth/Idempotency details)
3. Backend saves punch record
4. Frontend applies state immediately (shows "Checked Out")
5. GET `/dashboard-punch-status/` to confirm
6. Backend returns `PunchType: 2`
7. Frontend updates state with confirmed data

### **4. Pull-to-Refresh**
```typescript
useEffect(() => {
  if (refreshKey > 0) {
    fetchPunchStatus(false); // GET /dashboard-punch-status/
  }
}, [refreshKey]);
```
- User pulls down to refresh
- Fetches latest status from backend
- Updates UI with current `PunchType`

### **5. Controlled Background Polling**
```typescript
useEffect(() => {
  let pollingTimer: NodeJS.Timeout;
  let isMounted = true;
  let abortController = new AbortController();
  
  // Backoff configuration
  let failCount = 0;
  const BASE_DELAY = 5 * 60 * 1000; // 5 minutes
  const MAX_DELAY = 30 * 60 * 1000; // 30 minutes

  const startPolling = async () => {
    // 0. Guards: Only poll if visible, actively checked in, and not currently punching
    if (AppState.currentState !== 'active' || !isCheckedIn || isPunchingRef.current) return;

    try {
      abortController = new AbortController();
      await fetchPunchStatus(false, abortController.signal);
      
      // Success: Reset backoff
      failCount = 0;
      scheduleNext(BASE_DELAY);
    } catch (error) {
      if (!isMounted) return;
      
      // Failure: Exponential backoff + Jitter
      failCount++;
      const backoff = Math.min(BASE_DELAY * Math.pow(2, failCount), MAX_DELAY);
      const jitter = Math.random() * 10000; // 0-10s jitter
      scheduleNext(backoff + jitter);
    }
  };

  const scheduleNext = (delay: number) => {
    if (!isMounted) return;
    clearTimeout(pollingTimer);
    pollingTimer = setTimeout(startPolling, delay);
  };

  // Listen to AppState (pause when backgrounded, resume/refresh when active)
  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      startPolling(); // Immediate check on resume
    } else {
      clearTimeout(pollingTimer); // Pause in background
      abortController.abort(); // Cancel in-flight
    }
  });

  // Start loop
  scheduleNext(BASE_DELAY);

  return () => {
    isMounted = false;
    clearTimeout(pollingTimer);
    abortController.abort();
    subscription.remove();
  };
}, [isCheckedIn]); // Re-run if check-in state turns on/off
```
- **Guarded**: Only polls when app is ACTIVE and user is CHECKED IN.
- **Smart Backoff**: Increases delay on failures (up to 30 mins) to save battery/server.
- **Conflict Prevention**: Skips if `isPunching` is true (prevents race conditions).
- **Clean**: Aborts in-flight requests and clears timers on unmount/background.

### **6. Screen Focus**
```typescript
useFocusEffect(
  useCallback(() => {
    if (isInitialized && !isPunching) {
      fetchPunchStatus(false); // GET /dashboard-punch-status/
    }
  }, [])
);
```
```
- Refreshes when user returns to screen
- Ensures latest data is shown

## 🛡️ **Error Handling & Retry Logic:**

### **Timeout Configuration:**
- **API Timeout**: 15 seconds per request
- Prevents indefinite waiting for slow/unresponsive APIs
- Clear timeout error messages for users

### **Retry Policy:**
- **Max Attempts**: 3 retries
- **Exponential Backoff**: 1s → 2s → 4s delays between retries
- Automatic retry on network errors or timeouts
- Console logs show retry progress

### **Error Messages:**
The app provides user-friendly error messages:
- **Timeout**: "Request timed out. Please check your internet connection."
- **Network Error**: "Network error. Please check your internet connection."
- **Other Errors**: Displays the actual error message

### **Fallback Behavior:**
When all retries fail:
- ✅ Shows error UI with clear message
- ✅ Displays retry button for manual retry
- ✅ Preserves any existing state (doesn't force reset to "not checked in")
- ✅ Prevents indefinite loading spinner
- ✅ User can retry or continue using app

### **Example Console Output:**
```
📡 Fetching punch status from API (attempt 1/3)...
❌ Attempt 1/3 failed: Request timeout
⏳ Retrying in 1000ms...
📡 Fetching punch status from API (attempt 2/3)...
❌ Attempt 2/3 failed: Request timeout
⏳ Retrying in 2000ms...
📡 Fetching punch status from API (attempt 3/3)...
✅ API Response: { newType: 1, ... }
```


## 🔄 **State Synchronization:**

### **Optimistic Updates:**
- ✅ Immediate UI feedback (no waiting for API)
- ✅ Shows check-in/out state instantly
- ✅ Better user experience

### **API Confirmation:**
- ✅ Fetches latest state from backend
- ✅ Confirms punch was recorded correctly
- ✅ Updates UI with accurate data (working minutes, etc.)

### **Why Both?**
1. **Optimistic update** = Fast UI response
2. **API refresh** = Accurate backend data

This gives you:
- ⚡ Fast UI (no lag)
- ✅ Accurate data (from backend)
- 🔄 Always in sync

### **Failure Scenarios & Rollback**

While "Optimistic Updates" and "API Confirmation" handle the happy path, real-world networks require robust edge case handling:

1. **Optimistic Success + POST Failure**
   - **Scenario**: User swipes, UI updates immediately, but the `POST /emp-punch/` request fails (network error, server error).
   - **Strategy**: **Revert UI immediately.**
   - **UI Handling**: Show an error toast ("Check-in failed") and a retry button. The swipe button returns to its original state.

2. **POST Success + Confirmation GET Failure**
   - **Scenario**: Punch recorded successfully, but the subsequent `GET /dashboard-punch-status/` fails or times out.
   - **Strategy**: **Mark as "Awaiting Confirmation".**
   - **UI Handling**: Keep the checked-in state but show a small "Syncing..." or "Pending" indicator. Trigger a background retry of the GET request.

3. **User Action Before Confirmation**
   - **Scenario**: User checks in (optimistic), then quickly checks out before the backend confirms the check-in.
   - **Strategy**: **Serialize or queue actions.**
   - **UI Handling**: Disable the button until the first action completes (confirmed or failed). If queued, apply actions in sequence against the latest confirmed state. Handle merge conflicts by treating the confirmed backend state as the source of truth (Last-Write-Wins or user-resolve).

4. **Intermittent Network/Response Loss**
   - **Scenario**: Request sent, but response lost due to spotty connection.
   - **Strategy**: **Idempotent Retries & Exponential Backoff.**
   - **UI Handling**: Show a "Connecting..." or visible pending state. Retry the request with exponential backoff. Since the punch API should be idempotent (deduplicated by backend), safe retries ensure consistency without duplicate punches.

## 📊 **API Endpoints:**

### **GET /dashboard-punch-status/**
**Returns:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "punch": {
      "PunchType": 1,  // 0 = Not punched, 1 = Checked in, 2 = Checked out
      "PunchDateTime": "21-01-2026 06:30:00 PM",
      "PunchInTime": "21-01-2026 09:30:00 AM",
      "WorkingMinutes": 540
    },
    "lateEarly": {
      "lateCheckins": 2,
      "earlyCheckouts": 1,
      "remainingLateCheckins": 3
    }
  }
}
```

### **POST /emp-punch/**

#### **Authentication & Headers:**
- **Authorization**: `Bearer <JWT_TOKEN>` (Required)
  - **Scopes**: `punch:write`
- **Idempotency-Key**: `<UUID>` (Required for retries)
  - Prevents duplicate punches if network fails and client retries
  - Server caches key for 24 hours

#### **Request Body:**
```json
{
  "PunchType": 1,         // 1 = IN, 2 = OUT
  "Latitude": "23.0352",  // Required (Transport: TLS 1.3 only)
  "Longitude": "72.5616", // Required
  "IsAway": false
}
```

#### **Success Response (200 OK):**
```json
{
  "status": "Success",
  "message": "Punch recorded successfully",
  "PunchTime": "2026-01-21 12:55:03 PM"
}
```

#### **Error Responses:**
- **400 Bad Request** (Invalid Data):
  ```json
  {
    "status": "error",
    "code": "INVALID_COORDINATES",
    "message": "Latitude must be between -90 and 90",
    "details": null
  }
  ```
- **401 Unauthorized** (Expired/Invalid Token):
  ```json
  { "status": "error", "code": "AUTH_FAILED", "message": "Token expired" }
  ```
- **409 Conflict** (Duplicate Punch within window):
  ```json
  {
    "status": "error",
    "code": "DUPLICATE_PUNCH",
    "message": "You already punched in less than 5 minutes ago."
  }
  ```
- **500 Internal Server Error**:
  ```json
  { "status": "error", "code": "INTERNAL_ERROR", "message": "Please try again later." }
  ```

#### **GPS Privacy & Retention Policy:**
- **Transport Security**: All location data MUST be transmitted over HTTPS (TLS 1.2+).
- **Storage**: Coordinates are encrypted at rest (AES-256).
- **Retention**: Raw GPS data is retained for 30 days for audit trails, then anonymized or deleted.
- **Logging**: Access to location logs is restricted to HR admins only.

## 🎯 **Backend Requirements:**

For this to work correctly, your backend must:

1. **Update PunchType on punch:**
   - POST `/emp-punch/` with `PunchType: 1` → Database `PunchType = 1`
   - POST `/emp-punch/` with `PunchType: 2` → Database `PunchType = 2`

2. **Return correct PunchType:**
   - GET `/dashboard-punch-status/` → Returns current `PunchType` from database
   - Should return the LATEST punch record for today

3. **Midnight Reset & Timezone Rules:**
   - **Timezone Standard:** All "Midnight" calculations must use the **User's Local Timezone** (or the office's assigned timezone), NOT generic Server UTC.
   - **Standard Reset:** At 12:00 AM (00:00) Local Time:
     - For users with `PunchType = 0` or `PunchType = 2` (Checked Out): Reset/Archive today's records and set `PunchType = 0` for the new day.
   - **Active Shift Guard (Overnight Workers):**
     - **IF** a user has `PunchType = 1` (Checked In) cross midnight:
       - **DO NOT** reset `PunchType` to 0 immediately.
       - Allow the punch to remain active so they can check out normally in the morning.
       - Upon checkout (next day), split the shift logic or attribute the hours to the "Check-In Day" based on company policy.
     - **Alternative:** Create a "previous day" segment marker, but ensure the frontend still receives `PunchType = 1` until the user manually checks out.

## ✅ **Testing Checklist:**

### **Check-In:**
1. ✅ Swipe right to check in
2. ✅ Should see "Checked In! ✅" alert
3. ✅ Should show check-in time immediately
4. ✅ Console should show:
   ```
   📦 Punch IN Response: { ... }
   🔄 Refreshing from API to confirm check-in...
   📡 Fetching punch status from API...
   ✅ API Response: { newType: 1, ... }
   ```
5. ✅ UI should show "Checked In" state
6. ✅ Progress bar should appear

### **Check-Out:**
1. ✅ Swipe left to check out
2. ✅ Should see "Checked Out! 🏁" alert
3. ✅ Should show working hours
4. ✅ Console should show:
   ```
   📦 Punch OUT Response: { ... }
   🔄 Refreshing from API to confirm check-out...
   📡 Fetching punch status from API...
   ✅ API Response: { newType: 2, ... }
   ```
5. ✅ UI should show "Checked Out for Today ✓"
6. ✅ Button should be grayed out

### **App Reopen:**
1. ✅ Check in
2. ✅ Close app completely
3. ✅ Reopen app
4. ✅ Should show checked-in state (from API)
5. ✅ Console should show:
   ```
   📡 Fetching punch status from API...
   ✅ API Response: { newType: 1, ... }
   ```

### **Pull-to-Refresh:**
1. ✅ Pull down on home screen
2. ✅ Should refresh from API
3. ✅ Should update UI with latest state

## 🐛 **Troubleshooting:**

### **Issue: Check-in resets to 0**
**Cause:** Backend returning `PunchType: 2` or `PunchType: 0` after check-in  
**Fix:** Check backend `/dashboard-punch-status/` endpoint - it should return `PunchType: 1` after check-in

### **Issue: Check-out doesn't persist**
**Cause:** Backend not saving checkout or returning wrong `PunchType`  
**Fix:** Check backend `/emp-punch/` endpoint - it should update database with `PunchType: 2`

### **Issue: Shows old data after midnight**
**Cause:** Backend not resetting `PunchType` at midnight  
**Fix:** Implement midnight reset in backend to set `PunchType = 0` for all users

## 🎉 **Summary:**

The component now:
- ✅ Applies state immediately (fast UI)
- ✅ Refreshes from API after punch actions (accurate data)
- ✅ Syncs with backend on app open, pull-refresh, and screen focus
- ✅ Background polling every 5 minutes
- ✅ No local storage (API is single source of truth)
- ✅ Backend controls everything (including midnight reset)

**This is exactly the flow you requested!** 🚀
