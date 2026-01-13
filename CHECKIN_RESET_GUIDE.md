# CheckInCard Reset Guide

## ✅ **How to Reset CheckInCard State**

The CheckInCard is not showing data. Here's how to reset it:

---

## Method 1: Use Reset Script (Recommended)

```bash
# Make script executable
chmod +x reset-checkin.sh

# Run the reset script
./reset-checkin.sh

# Restart Expo
npx expo start -c
```

---

## Method 2: Manual Reset

### **Step 1: Clear AsyncStorage**

Add this code temporarily to your app to clear storage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this in your component
const clearAllStorage = async () => {
  await AsyncStorage.clear();
  console.log('✅ All storage cleared!');
};

// Call it once
clearAllStorage();
```

### **Step 2: Clear Metro Cache**

```bash
# Stop Metro
# Press Ctrl+C in the terminal running expo

# Clear cache and restart
npx expo start -c
```

### **Step 3: Check Console Logs**

Look for these logs in the console:

```
🔄 Fetching punch status from API...
📊 Full API Response: {...}
📍 Punch Data: {...}
✅ Status: Checked IN/OUT
⏰ Setting punch-in time: ...
⏱️ Setting working hours: ...
```

---

## Method 3: Force Reset via Code

Add this temporary button to your HomeScreen:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this button
<TouchableOpacity
  onPress={async () => {
    await AsyncStorage.setItem('forceResetMode', 'true');
    Alert.alert('Reset', 'Please reload the app');
  }}
  style={{ padding: 20, backgroundColor: 'red' }}
>
  <Text style={{ color: 'white' }}>FORCE RESET</Text>
</TouchableOpacity>
```

---

## Debugging Checklist

### **1. Check API Response**

Look for this log:
```
📊 Full API Response: {...}
```

**Expected Response:**
```json
{
  "status": "Success",
  "data": {
    "punch": {
      "PunchType": 1,
      "PunchDateTime": "2026-01-12 09:45:00 AM",
      "WorkingHours": "2h 15m",
      "WorkingMinutes": 135
    }
  }
}
```

### **2. Check State Updates**

Look for these logs:
```
⏰ Setting punch-in time: 2026-01-12 09:45:00 AM
⏱️ Setting working hours: 2h 15m
```

### **3. Check UI Rendering**

The time boxes should show:
- **Check-In**: `9:45 AM` (green)
- **Working Hours**: `2h 15m` (blue)
- **Check-Out**: `--` (gray)

---

## Common Issues

### **Issue 1: Data Not Showing**

**Cause:** Cached state from previous session

**Fix:**
```bash
# Clear cache and restart
npx expo start -c
```

### **Issue 2: API Not Called**

**Cause:** Component not re-fetching

**Fix:**
```typescript
// Force reload by navigating away and back
// Or use the force reset method above
```

### **Issue 3: Times Show as "--"**

**Cause:** API response missing fields

**Fix:** Check console logs for API response structure

---

## Quick Reset Commands

```bash
# Full reset (recommended)
./reset-checkin.sh && npx expo start -c

# Or manual
rm -rf .expo && npx expo start -c

# Or just clear cache
npx expo start -c
```

---

## Verification Steps

After reset:

1. ✅ Open app
2. ✅ Check console for API logs
3. ✅ Verify punch status loads
4. ✅ Check if times display correctly
5. ✅ Test check-in/out slider

---

## Expected Console Output

```
🔄 Fetching punch status from API...
📊 Full API Response: {
  "status": "Success",
  "data": {
    "punch": {
      "PunchType": 1,
      "PunchDateTime": "2026-01-12 09:45:00 AM",
      "WorkingHours": "2h 15m"
    }
  }
}
📍 Punch Data: {
  punchType: 1,
  punchDateTime: "2026-01-12 09:45:00 AM",
  workingHours: "2h 15m",
  workingMinutes: 135
}
✅ Status: Checked IN
⏰ Setting punch-in time: 2026-01-12 09:45:00 AM
⏱️ Setting working hours: 2h 15m
```

---

**Last Updated:** 2026-01-12
