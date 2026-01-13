# How to Use the Reset Data Button

## Quick Start

Add the `ResetDataButton` component to your HomeScreen for easy access during development:

```tsx
// In components/Home/HomeScreen.tsx or any other screen

import ResetDataButton from '@/components/Dev/ResetDataButton';

// Inside your component's render method:
<ScrollView>
  {/* Your existing content */}
  
  {/* Add this at the bottom - only shows in dev mode */}
  <ResetDataButton onReset={() => {
    // Optional: Reload your data after reset
    loadPunchStatus();
  }} />
</ScrollView>
```

## What It Does

The button provides three actions:

### 1. 🔄 Reset Attendance Data
- Clears all check-in/out data
- Keeps you logged in
- Clears: `checkInCardState`, `lastResetDate`, `attendance_records`, etc.
- **Use this** when testing the punch flow

### 2. 🗑️ Clear All Data
- Clears EVERYTHING including auth tokens
- Logs you out
- **Use this** for a complete fresh start

### 3. 📋 List Storage Keys
- Shows all AsyncStorage keys in console
- **Use this** for debugging what's stored

## Safety Features

✅ Only visible in development mode (`__DEV__`)  
✅ Confirmation dialogs before destructive actions  
✅ Loading states to prevent double-clicks  
✅ Error handling with user-friendly messages

## Example Integration

### Option 1: Add to HomeScreen (Recommended)

```tsx
// components/Home/HomeScreen.tsx
import ResetDataButton from '@/components/Dev/ResetDataButton';

export default function HomeScreen() {
  return (
    <ScrollView>
      <CheckInCard />
      <AttendanceStats />
      
      {/* Dev tools at the bottom */}
      <ResetDataButton />
    </ScrollView>
  );
}
```

### Option 2: Add to Settings Screen

```tsx
// app/settings.tsx
import ResetDataButton from '@/components/Dev/ResetDataButton';

export default function SettingsScreen() {
  return (
    <View>
      <Text>Settings</Text>
      
      {/* Dev section */}
      <ResetDataButton />
    </View>
  );
}
```

### Option 3: Add to a Dev Menu

```tsx
// components/DevMenu.tsx
import ResetDataButton from '@/components/Dev/ResetDataButton';

export default function DevMenu() {
  if (!__DEV__) return null;
  
  return (
    <View style={styles.devMenu}>
      <Text style={styles.title}>Developer Menu</Text>
      <ResetDataButton />
      {/* Other dev tools */}
    </View>
  );
}
```

## Testing Workflow

1. **Add the button** to your HomeScreen
2. **Login** with a test account
3. **Punch in** (swipe right)
4. **Verify** the state updates
5. **Click "Reset Attendance Data"**
6. **Confirm** the reset
7. **Reload the app** (shake device → Reload)
8. **Verify** the state is reset to "Not In"

## Production Build

The button automatically hides in production builds because of:

```tsx
if (!__DEV__) {
  return null;
}
```

So you can safely leave it in your code - it won't appear in the production app!

## Console Output

When you use the reset button, you'll see helpful console logs:

```
📋 Clearing attendance keys: [
  "checkInCardState_123",
  "lastResetDate_123",
  "@attendance_records_123",
  "lastLunchAlert_123"
]
✅ Attendance data cleared successfully!
```

## Troubleshooting

**Button not showing?**
- Make sure you're running in development mode
- Check that `__DEV__` is true in your environment

**Reset not working?**
- Check the console for error messages
- Verify the `utils/resetData.ts` file exists
- Make sure AsyncStorage is properly imported

**State not resetting after button click?**
- You need to manually reload the app after reset
- Shake device → Reload, or press `r` in terminal
- Or add automatic reload in the `onReset` callback

## Advanced: Auto-Reload After Reset

```tsx
import { Updates } from 'expo-updates';

<ResetDataButton 
  onReset={async () => {
    // Reload the app automatically
    await Updates.reloadAsync();
  }} 
/>
```

## Remove Before Production

While the button hides automatically, you can remove it completely before production:

```tsx
// Remove or comment out this line:
// <ResetDataButton />
```

Or keep it and add a feature flag:

```tsx
{process.env.EXPO_PUBLIC_SHOW_DEV_TOOLS === 'true' && <ResetDataButton />}
```
