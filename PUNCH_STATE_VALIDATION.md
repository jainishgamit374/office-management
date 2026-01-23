# Punch State Validation Implementation

## Overview
This document explains the strict state validation logic implemented in `CheckInCard.tsx` for punch in/out operations.

## State Transition Rules

The punch system follows a strict sequential flow:

```
0 (Not Punched) → 1 (Checked In) → 2 (Checked Out) → 0 (Reset at Midnight)
```

### State Definitions

- **State 0**: Not Punched / Fresh Day
  - User has not checked in yet
  - Can only transition to State 1 (Check-In)
  
- **State 1**: Checked In
  - User is actively working
  - Can only transition to State 2 (Check-Out)
  
- **State 2**: Checked Out
  - User has completed their day
  - Cannot manually transition (auto-resets to State 0 at midnight)

## Implementation Details

### Unified Punch Handler

The new `handlePunch()` function validates state transitions using **if/else/elseif** conditions:

```typescript
const handlePunch = async (): Promise<boolean> => {
  if (punchType === 0) {
    // State 0 → 1: Check-In allowed
    // - Validates location permission
    // - Checks late check-in limits
    // - Makes API call with PunchType: 1
    
  } else if (punchType === 1) {
    // State 1 → 2: Check-Out allowed
    // - Validates location permission
    // - Makes API call with PunchType: 2
    
  } else if (punchType === 2) {
    // State 2: Already checked out
    // - Shows info notification
    // - Returns false (no action taken)
    
  } else {
    // Invalid state: Error handling
    // - Shows error notification
    // - Returns false
  }
}
```

### API Integration with Axios

The implementation uses **Axios** directly for API calls instead of the wrapper function:

```typescript
const response = await axios.post(
  'https://karmyog.pythonanywhere.com/emp-punch/',
  {
    PunchType: 1, // or 2 for checkout
    Latitude: location.latitude.toString(),
    Longitude: location.longitude.toString(),
    IsAway: false,
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }
);
```

### Key Features

1. **Strict Validation**: Each state can only transition to its designated next state
2. **Clear Logging**: Console logs show current state and attempted transition
3. **User Feedback**: Informative notifications for each scenario
4. **Error Handling**: Proper Axios error detection with detailed messages
5. **Cooldown Protection**: Prevents conflicting API responses within 2-minute window

## Benefits

1. **Data Integrity**: Prevents invalid state transitions
2. **User Experience**: Clear feedback on what actions are allowed
3. **Security**: Token-based authentication with explicit headers
4. **Debugging**: Comprehensive logging for troubleshooting
5. **Type Safety**: Full TypeScript typing with proper error handling

## Error Handling

The implementation handles errors at multiple levels:

1. **Location Permission**: Clear prompts if location is denied
2. **Late Check-In Limits**: Prevents check-in if limit exceeded
3. **Network Errors**: Axios error detection with user-friendly messages
4. **Invalid States**: Graceful handling with refresh fallback
5. **Type Safety**: Proper TypeScript error typing (`error: unknown`)

## Testing Checklist

- [ ] **State 0 → 1**: Swipe right to check in successfully
- [ ] **State 1 → 2**: Swipe left to check out successfully  
- [ ] **State 2**: Attempt to swipe shows "Already Checked Out" notification
- [ ] **Late Check-In**: Warning shown when checking in late
- [ ] **Early Check-Out**: Warning shown when checking out early
- [ ] **Location Denied**: Error shown with permission request
- [ ] **Network Error**: Proper error message displayed
- [ ] **Midnight Reset**: State 2 → 0 after midnight

## Migration Notes

### Changes from Previous Implementation

1. **Removed**: Separate `handlePunchIn()` and `handlePunchOut()` functions
2. **Added**: Unified `handlePunch()` with state validation
3. **Changed**: Direct Axios calls instead of `recordPunch()` wrapper
4. **Enhanced**: Explicit state logging for debugging
5. **Improved**: Type-safe error handling

### Dependencies

- `axios` - HTTP client for API calls
- `@react-native-async-storage/async-storage` - Authentication token storage

## Console Output Examples

### Successful Check-In
```
🔄 Current state: 0 (Not Punched) → Attempting transition to 1 (Check-In)
📤 Sending CHECK-IN request with Axios: {PunchType: 1, ...}
✅ Check-in successful: {...}
🛡️ Cooldown protection activated for 2 minutes
```

### Successful Check-Out
```
🔄 Current state: 1 (Checked-In) → Attempting transition to 2 (Check-Out)
📤 Sending CHECK-OUT request with Axios: {PunchType: 2, ...}
✅ Check-out successful: {...}
🛡️ Cooldown protection activated for 2 minutes
```

### Already Checked Out
```
⚠️ Current state: 2 (Checked-Out) → No manual transition allowed
```

## Future Enhancements

1. **Offline Support**: Queue punch actions when offline
2. **Geofencing**: Validate location within office premises
3. **Biometric**: Add fingerprint/face verification
4. **Break Tracking**: Support break in/out states (3, 4, etc.)
5. **Multi-Shift**: Handle different shift timings
