# Fix: App State Reset After Closing

## Problem
When the app was closed and reopened, the punch state would incorrectly reset to "checked in" (PunchType = 1) even if the user had already checked out (PunchType = 2).

### Root Cause
1. **No State Persistence**: The `latestStateRef` was only stored in memory, so it was lost when the app closed
2. **Failed State Protection**: The state protection guard at line 491 only checked `previousPunchType.current` which was also lost on app restart
3. **API Limitation**: The backend appears to return incorrect `PunchType` after checkout - it returns `1` (IN) instead of `2` (OUT)

### Scenario
```
1. User checks in → PunchType = 1 ✅
2. User checks out → PunchType = 2 ✅
3. User closes app → latestStateRef lost ❌
4. User reopens app → fetchPunchStatus() called
5. API returns → PunchType = 1 (incorrect!) ❌
6. State protection fails → latestStateRef is null ❌
7. Result → App shows "checked in" instead of "checked out" ❌
```

## Solution Implemented

### 1. **Added AsyncStorage Persistence** ✅
- Import `AsyncStorage` from `@react-native-async-storage/async-storage`
- Added `STORAGE_KEY_PREFIX` constant: `'@punch_state_'`
- Created `saveStateToStorage()` function to persist state
- Created `loadStateFromStorage()` function to restore state
- State is saved on every `applyState()` call (types 0, 1, 2)

### 2. **Restore State on Mount** ✅
- In `fetchPunchStatus()`, added step 0️⃣ to load persisted state before API call
- If `latestStateRef.current` is null (app restart), load from AsyncStorage
- Only load if date matches today (prevents stale state)

### 3. **Enhanced State Protection Guard** ✅
- Simplified condition: `if (latestState?.punchType === 2 && newType === 1 && isSameDayState)`
- No longer depends on `previousPunchType.current` (which is lost on restart)
- Only depends on stored state, which now persists across restarts
- Added comprehensive warning logs for debugging

## Key Changes

### Before
```tsx
// State protection (didn't work after app restart)
if (previousPunchType.current === 2 && newType !== 2 && isSameDayState && latestState?.punchType === 2) {
  console.warn('[API] Ignoring downgraded punch type');
  applyState(2, latestState.punchInTime, latestState.punchOutTime, latestState.workingMinutes);
}
```

### After
```tsx
// 0️⃣ Load persisted state from storage (NEW!)
if (!latestStateRef.current) {
  const storedState = await loadStateFromStorage(today);
  if (storedState && storedState.date === today) {
    latestStateRef.current = storedState;
  }
}

// 🛡️ STATE PROTECTION: Simplified and more reliable
if (latestState?.punchType === 2 && newType === 1 && isSameDayState) {
  console.warn('🛡️ [STATE GUARD] Prevented downgrade from type 2 (OUT) to type 1 (IN)');
  applyState(2, latestState.punchInTime, latestState.punchOutTime, latestState.workingMinutes);
}
```

## How It Works Now

### Scenario: App Restart After Checkout
```
1. User checks out → PunchType = 2
   → applyState(2, ...) called
   → saveStateToStorage({ punchType: 2, ... }) ✅
   
2. User closes app
   → latestStateRef lost in memory ❌
   → BUT state persisted in AsyncStorage ✅
   
3. User reopens app
   → fetchPunchStatus() called
   → loadStateFromStorage() restores latestStateRef ✅
   → API returns PunchType = 1 (wrong!)
   → State guard detects: latestState.punchType === 2 && newType === 1
   → Guard blocks the downgrade ✅
   → applyState(2, ...) keeps checkout state ✅
```

## Testing
1. Check in to the app
2. Check out from the app
3. Close the app completely
4. Reopen the app
5. ✅ Expected: App should show "Checked Out" state
6. ✅ Console should show: `🛡️ [STATE GUARD] Prevented downgrade from type 2 (OUT) to type 1 (IN)`

## Files Modified
- `/components/Home/CheckInCard.tsx`
  - Added `AsyncStorage` import
  - Added `STORAGE_KEY_PREFIX` constant
  - Added `saveStateToStorage()` function
  - Added `loadStateFromStorage()` function
  - Modified `applyState()` to save state on every change
  - Modified `fetchPunchStatus()` to restore state on mount
  - Enhanced state protection guard with better logic

## Notes
- State is stored per date: `@punch_state_2026-01-22`
- State automatically clears at midnight (existing midnight reset logic)
- AsyncStorage is already installed in package.json (v2.2.0)
- No additional dependencies required
