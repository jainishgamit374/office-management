# Data Reset Guide

## How to Reset All Attendance Data

### Option 1: Clear App Data (Recommended)
**On iOS Simulator:**
1. Stop the app
2. Run: `npx expo start -c` (clears cache)
3. In simulator: Device → Erase All Content and Settings
4. Reinstall the app

**On Android Emulator:**
1. Stop the app
2. Settings → Apps → Your App → Storage → Clear Data
3. Or run: `adb shell pm clear com.yourapp.package`

**On Physical Device:**
1. Uninstall the app completely
2. Reinstall from Expo

### Option 2: Manual AsyncStorage Clear (Quick)
Add this temporary code to your app and run it once:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this function somewhere accessible (e.g., in a dev menu)
const resetAllData = async () => {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 All storage keys:', keys);
    
    // Clear everything
    await AsyncStorage.clear();
    console.log('✅ All data cleared!');
    
    // Or selectively clear attendance data
    const attendanceKeys = keys.filter(key => 
      key.includes('checkInCardState') ||
      key.includes('lastResetDate') ||
      key.includes('attendance_records') ||
      key.includes('lastLunchAlert') ||
      key.includes('forceResetMode')
    );
    
    await AsyncStorage.multiRemove(attendanceKeys);
    console.log('✅ Attendance data cleared!', attendanceKeys);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Call it
resetAllData();
```

### Option 3: Force Reset on Next Login
The app already has a force reset mechanism. To trigger it:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set force reset flag
await AsyncStorage.setItem('forceResetMode', 'true');

// Next time the app loads, it will reset the check-in state
```

## API Endpoints Fixed

### ✅ `/emp-punch/` - Record Punch
**Request:**
```json
{
  "PunchType": 1,  // 1 = IN, 2 = OUT
  "Latitude": "21.1702",
  "Longitude": "72.8311",
  "IsAway": false
}
```

**Response:**
```json
{
  "status": "Success",
  "message": "Punch recorded successfully",
  "PunchTime": "2025-12-24 11:49:46 AM"
}
```

### ✅ `/dashboard-punch-status/` - Get Punch Status
**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "PunchType": 1,  // 0 = Not In/Out, 1 = IN, 2 = OUT
    "PunchDateTime": "25-12-2025 06:31:15 AM"
  }
}
```

## Changes Made

1. **Updated `PunchStatusResponse` interface** (`lib/attendance.ts`)
   - Made all nested objects optional except `PunchType` and `PunchDateTime`
   - These are now at the root of `data` object, not nested in `punch`

2. **Updated `CheckInCard.tsx`**
   - Now reads `PunchType` and `PunchDateTime` from `response.data` directly
   - Falls back to `response.data.punch` for additional data (if available)
   - Handles both simple and complex API responses

3. **Maintained backward compatibility**
   - App still works if backend sends the full detailed response
   - Gracefully handles minimal response with just PunchType and PunchDateTime

## Testing

1. **Clear all data** using one of the methods above
2. **Login** with your employee account
3. **Check-in** - should show "Not In" state initially
4. **Swipe right** to punch in
5. **Verify** the state persists after hot reload
6. **Check-out** - swipe left
7. **Verify** the state shows "Already Checked Out"

## What's User-Specific Now

All these keys are now scoped per user ID:
- `checkInCardState_{userId}`
- `lastResetDate_{userId}`
- `@attendance_records_{userId}`
- `lastLunchAlert_{userId}`
- `forceResetMode_{userId}`

When a new user logs in, they get a fresh state automatically!
