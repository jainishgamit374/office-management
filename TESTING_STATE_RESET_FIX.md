# Testing Guide: App State Reset Fix

## What Was Fixed
The app was incorrectly resetting to "checked in" (PunchType = 1) when closing and reopening after checking out.

## Root Cause  
- **Backend Issue**: The API returns `PunchType: 1` instead of `PunchType: 2` after checkout
- **No Persistence**: The app's state protection wasn't working because state wasn't persisted across app restarts

## How to Test

### Test 1: Normal Checkout Flow
1. **Check In**
   - Swipe right to check in
   - ✅ Should show "Checked In" state
   - 📝 Check console: Should see `💾 State saved to storage: { punchType: 1, ... }`

2. **Check Out**  
   - Swipe left to check out
   - ✅ Should show "Checked Out for Today ✓"
   - 📝 Check console: Should see `💾 State saved to storage: { punchType: 2, ... }`

3. **Close App**
   - Fully close the app (swipe away from app switcher)

4. **Reopen App**
   - Reopen the app
   - 📝 Check console for these logs:
     ```
     📂 State loaded from storage: { punchType: 2, ... }
     🔄 Restored state from storage on mount: { punchType: 2, ... }
     📡 API Response: { newType: 1, punchDateTime: "...", ... }
     🛡️ [STATE GUARD] Prevented downgrade from type 2 (OUT) to type 1 (IN)
        Stored state: { punchType: 2, ... }
        API returned: { newType: 1, ... }
        Action: Keeping checkout state, ignoring API
     🔄 Applying state: { type: 2, ... }
     ```
   - ✅ **EXPECTED**: App should still show "Checked Out for Today ✓"
   - ❌ **BEFORE FIX**: App would show "Checked In" state

### Test 2: Check Stored State
Run in the React Native Debugger console or via test script:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Read stored state
AsyncStorage.getItem(`@punch_state_${today}`).then(data => {
  console.log('Stored State:', JSON.parse(data));
});
```

Expected output after checkout:
```json
{
  "punchType": 2,
  "punchInTime": "22-01-2026 03:09:27 PM",
  "punchOutTime": "22-01-2026 05:30:00 PM",
  "workingMinutes": 120,
  "date": "2026-01-22"
}
```

### Test 3: Midnight Reset
1. Check out as normal
2. Wait for midnight (or manually test by clearing AsyncStorage)
3. App should automatically reset to type 0 (not checked in)

## Console Log Reference

### Normal Flow (Working Correctly)
```
💾 State saved to storage: { punchType: 1, ... }  ← Check-in
📡 API Response: { newType: 1, ... }
🔄 Applying state: { type: 1, ... }

💾 State saved to storage: { punchType: 2, ... }  ← Check-out
📡 API Response: { newType: 2, ... }  (or 1 if backend is wrong)
🔄 Applying state: { type: 2, ... }
```

### App Restart After Checkout (FIXED!)
```
📂 State loaded from storage: { punchType: 2, ... }
🔄 Restored state from storage on mount: { punchType: 2, ... }
📡 API Response: { newType: 1, ... }  ← Backend returns wrong type!
🛡️ [STATE GUARD] Prevented downgrade from type 2 (OUT) to type 1 (IN)
   Stored state: { punchType: 2, punchOutTime: "...", ... }
   API returned: { newType: 1, punchDateTime: "...", ... }
   Action: Keeping checkout state, ignoring API
🔄 Applying state: { type: 2, ... }  ← Correct state preserved!
```

## What to Look For in Logs

### ✅ Good Signs
- `💾 State saved to storage` - State is being persisted
- `📂 State loaded from storage` - State restored on app restart
- `🛡️ [STATE GUARD] Prevented downgrade` - Protection working!
- `🔄 Applying state: { type: 2, ... }` after checkout

### ❌ Bad Signs (If These Happen, Fix Failed)
- No `📂 State loaded from storage` on app restart
- No `🛡️ [STATE GUARD]` message when API returns wrong type
- `🔄 Applying state: { type: 1, ... }` after you've checked out

## Expected Behavior Summary

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| Check in, close app, reopen | ✅ Shows "Checked In" | ✅ Shows "Checked In" |
| Check out, close app, reopen | ❌ Shows "Checked In" (WRONG!) | ✅ Shows "Checked Out" (CORRECT!) |
| Check in, wait, reopen | ✅ Shows "Checked In" | ✅ Shows "Checked In" |
| No punch, close app, reopen | ✅ Shows "Swipe to Check-In" | ✅ Shows "Swipe to Check-In" |

## Troubleshooting

### Issue: State not persisting
- Check AsyncStorage permissions
- Look for `❌ Failed to save state to storage` errors
- Verify `@react-native-async-storage/async-storage` is installed

### Issue: State guard not activating  
- Check that stored state has `punchType: 2`
- Verify API is returning `newType: 1` (the wrong value)
- Check date matches: stored state date === today's date

### Issue: App still resetting to wrong state
- Clear AsyncStorage and try again
- Check for errors in `loadStateFromStorage()`
- Verify `latestStateRef.current` is being set

## Clear Test Data
To reset for testing:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all punch state
AsyncStorage.getAllKeys().then(keys => {
  const punchKeys = keys.filter(k => k.startsWith('@punch_state_'));
  AsyncStorage.multiRemove(punchKeys);
});
```
