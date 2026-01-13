# Reset Punch & Attendance Data

## ✅ New Feature: Comprehensive Reset Function

A new reset function has been added to completely reset check-in/out state and delete all attendance data with one click.

## What Gets Reset

The `resetPunchAndAttendance()` function clears:

✅ **Check-in/out state** (`checkInCardState`)  
✅ **Last reset date** (`lastResetDate`)  
✅ **Attendance records** (`attendance_records`, `@attendance_records`)  
✅ **Lunch alerts** (`lastLunchAlert`)  
✅ **Force reset flags** (`forceResetMode`)  
✅ **Punch times** (`punchInTime`, `punchOutTime`)  
✅ **Working hours** (`workingHours`)  

## How to Use

### Method 1: Dev Tools Button (Recommended)

Add the `ResetDataButton` component to your HomeScreen:

```tsx
import ResetDataButton from '@/components/Dev/ResetDataButton';

// In your HomeScreen
<ScrollView>
  {/* Your content */}
  
  <ResetDataButton />
</ScrollView>
```

The button provides three reset options:
1. **🔄 Reset Attendance Data** - Clears attendance only, keeps login
2. **🗑️ Reset Punch & Attendance** - Comprehensive reset (NEW!)
3. **🗑️ Clear All Data** - Clears everything including auth

### Method 2: Programmatic Reset

```typescript
import DevUtils from '@/utils/resetData';

// Reset punch and attendance data
await DevUtils.resetPunchAndAttendance();

// Then reload the app
// (shake device → Reload, or press 'r' in terminal)
```

### Method 3: Individual Functions

```typescript
import DevUtils from '@/utils/resetData';

// Clear only attendance data (keeps login)
await DevUtils.clearAttendanceData();

// Clear data for specific user
await DevUtils.clearUserData('123');

// Force reset on next load
await DevUtils.forceResetOnNextLoad();

// Clear everything (logs out)
await DevUtils.clearAllData();
```

## User Flow

### Using the Reset Button

1. **Click "Reset Punch & Attendance"**
   ```
   Alert: "This will reset check-in/out state and delete ALL attendance data. Continue?"
   ```

2. **Confirm "Reset All"**
   ```
   Processing...
   - Scanning AsyncStorage for attendance keys
   - Removing all matching keys
   - Setting force reset flag
   ```

3. **Success Message**
   ```
   Alert: "Punch and attendance data reset! Please reload the app."
   ```

4. **Reload App**
   - Shake device → Reload
   - Or press 'r' in terminal
   - Or close and reopen app

5. **Fresh State**
   - Check-in card shows "Not In"
   - No attendance records
   - Ready to punch in fresh

## Console Output

When you run the reset, you'll see:

```
🔄 Starting comprehensive punch and attendance reset...
📋 Keys to remove: [
  "checkInCardState_123",
  "lastResetDate_123",
  "@attendance_records_123",
  "lastLunchAlert_123",
  "forceResetMode_123"
]
✅ Removed 5 attendance-related keys
✅ Punch and attendance data reset complete!
ℹ️  Please reload the app to see changes
```

## What Happens After Reset

### Before Reset
```
Check-in Status: Checked In (9:30 AM)
Attendance Records: 15 records
Last Reset: 2026-01-11
```

### After Reset
```
Check-in Status: Not In
Attendance Records: 0 records
Last Reset: (not set)
State: Fresh, ready for new punch
```

## Safety Features

✅ **Confirmation Dialog** - Requires user confirmation  
✅ **Development Only** - Button only shows in `__DEV__` mode  
✅ **Error Handling** - Catches and displays errors  
✅ **Keeps Login** - User stays logged in  
✅ **User-Specific** - Only clears current user's data  

## Comparison of Reset Methods

| Method | Clears Attendance | Clears Login | Use Case |
|--------|------------------|--------------|----------|
| `clearAttendanceData()` | ✅ | ❌ | Daily testing |
| `resetPunchAndAttendance()` | ✅ | ❌ | Comprehensive reset |
| `clearUserData(userId)` | ✅ | ✅ | Specific user cleanup |
| `clearAllData()` | ✅ | ✅ | Complete fresh start |

## Testing Scenarios

### Scenario 1: Reset After Check-In
1. Check in at 9:00 AM
2. Click "Reset Punch & Attendance"
3. Reload app
4. **Expected:** Shows "Not In", can check in again

### Scenario 2: Reset with Multiple Records
1. Have 10 attendance records
2. Click "Reset Punch & Attendance"
3. Reload app
4. **Expected:** All records cleared, fresh state

### Scenario 3: Reset Between Users
1. User A checks in
2. User A logs out
3. User B logs in
4. **Expected:** User B sees fresh state (automatic)

### Scenario 4: Reset and Re-Check-In
1. Check in
2. Reset
3. Reload
4. Check in again
5. **Expected:** New punch recorded successfully

## Troubleshooting

### Reset Not Working?
1. Check console for error messages
2. Verify you clicked "Reset All" in confirmation
3. Make sure you reloaded the app after reset
4. Try clearing app cache: `npx expo start -c`

### Still Seeing Old Data?
1. The app might be using cached state
2. Force close the app completely
3. Clear Metro bundler cache
4. Restart: `npx expo start -c`

### Button Not Showing?
1. Make sure you're in development mode (`__DEV__`)
2. Check that `ResetDataButton` is imported correctly
3. Verify it's added to your screen component

## Production Considerations

### Before Production Release

1. **Remove Dev Button**
   ```tsx
   // Remove or comment out
   // <ResetDataButton />
   ```

2. **Or Hide Behind Flag**
   ```tsx
   {process.env.EXPO_PUBLIC_SHOW_DEV_TOOLS === 'true' && <ResetDataButton />}
   ```

3. **Keep Utility Functions**
   - The `utils/resetData.ts` functions can stay
   - They won't be accessible without the button
   - Useful for debugging production issues

## Summary

✅ **New Function:** `resetPunchAndAttendance()`  
✅ **Clears:** All punch and attendance data  
✅ **Keeps:** User logged in  
✅ **UI Button:** Added to `ResetDataButton` component  
✅ **Safety:** Requires confirmation, dev-only  
✅ **Usage:** One click → Reload → Fresh state  

Perfect for:
- 🧪 Testing punch flows
- 🔄 Resetting after errors
- 🗑️ Clearing test data
- 🆕 Starting fresh each day

Use the "Reset Punch & Attendance" button whenever you need to completely reset the check-in/out state and attendance data! 🎯
