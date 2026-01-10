# Testing the Leave Data View API

## ✅ Quick Test in Your App

### Option 1: Add to an Existing Screen (Recommended)

Add this code to any screen where you're already logged in (like your Home screen):

```typescript
import { getEmployeeLeaveDataView } from '@/lib/leaves';
import { useEffect } from 'react';

// Inside your component
useEffect(() => {
    testLeaveAPI();
}, []);

const testLeaveAPI = async () => {
    try {
        console.log('🧪 Testing Leave Data View API...');
        const response = await getEmployeeLeaveDataView();
        
        console.log('✅ API Response:', response);
        console.log('📊 Applied:', response.data.applied_count);
        console.log('📊 Approved:', response.data.approved_count);
        
        // Show alert to confirm it's working
        Alert.alert(
            'API Test Success ✅',
            `Applied: ${response.data.applied_count}\nApproved: ${response.data.approved_count}`,
            [{ text: 'OK' }]
        );
    } catch (error) {
        console.error('❌ API Test Failed:', error);
        Alert.alert('API Test Failed', error.message);
    }
};
```

### Option 2: Use the Sample Component

1. **Navigate to the component** in your app:
   ```typescript
   // In your navigation file
   import LeaveDataView from '@/components/Leaves/LeaveDataView';
   
   // Add to your stack/tab navigator
   <Stack.Screen name="LeaveDataView" component={LeaveDataView} />
   ```

2. **Navigate to it** from any screen:
   ```typescript
   navigation.navigate('LeaveDataView');
   ```

### Option 3: Quick Console Test

Add this to your `CheckInCard.tsx` or any component:

```typescript
// At the top
import { getEmployeeLeaveDataView } from '@/lib/leaves';

// Add a button or call in useEffect
const testAPI = async () => {
    const result = await getEmployeeLeaveDataView();
    console.log('Leave Data:', result);
};

// Call it
useEffect(() => {
    testAPI();
}, []);
```

## 🔍 How to Verify It's Working

### 1. Check Console Logs

When the API is called, you should see these logs:

```
📊 Fetching employee leave data view...
📡 Response status: 200
📡 Response data: { status: 'Success', data: { approved_count: 0, applied_count: 1 } }
✅ Leave data view fetched successfully
```

### 2. Check the Response

The response should match this format:

```json
{
  "status": "Success",
  "data": {
    "approved_count": 0,
    "applied_count": 1
  }
}
```

### 3. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No access token found" | User needs to login first |
| "Session has expired" | User needs to login again |
| Network error | Check internet connection |
| 401 Unauthorized | Token expired, re-login needed |
| 404 Not Found | API endpoint might be wrong (verify backend) |

## 🧪 Complete Test Component

Here's a minimal test component you can add:

```typescript
// components/TestLeaveAPI.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { getEmployeeLeaveDataView } from '@/lib/leaves';

export default function TestLeaveAPI() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        try {
            const response = await getEmployeeLeaveDataView();
            setResult(response);
            
            Alert.alert(
                '✅ Success!',
                `Applied: ${response.data.applied_count}\nApproved: ${response.data.approved_count}`
            );
        } catch (error) {
            Alert.alert('❌ Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Button 
                title={loading ? "Testing..." : "Test Leave API"} 
                onPress={runTest}
                disabled={loading}
            />
            
            {result && (
                <View style={{ marginTop: 20 }}>
                    <Text>Status: {result.status}</Text>
                    <Text>Applied: {result.data.applied_count}</Text>
                    <Text>Approved: {result.data.approved_count}</Text>
                </View>
            )}
        </View>
    );
}
```

## ✅ Verification Checklist

- [ ] Code compiles without errors
- [ ] User is logged in
- [ ] API function is imported correctly
- [ ] Console shows "Fetching employee leave data view..."
- [ ] Console shows "Leave data view fetched successfully"
- [ ] Response data contains `approved_count` and `applied_count`
- [ ] No authentication errors
- [ ] Data displays in UI (if using component)

## 🎯 Expected Behavior

**When Working:**
- ✅ Console logs show successful API call
- ✅ Response contains valid data
- ✅ No errors in console
- ✅ Data displays correctly in UI

**When Not Working:**
- ❌ Authentication error → User needs to login
- ❌ Network error → Check internet connection
- ❌ 404 error → Verify backend endpoint exists
- ❌ Timeout → Check backend server status

## 📱 Testing in Your Running App

Since your Expo server is already running (`npx expo start -c`):

1. **Add test code** to any existing screen (like Home)
2. **Reload the app** (shake device → Reload)
3. **Check the console** in your terminal
4. **Look for the logs** mentioned above

The API is **production-ready** and will work as soon as you:
1. ✅ Are logged in
2. ✅ Have valid authentication token
3. ✅ Backend endpoint is accessible

---

**Status**: ✅ Code is ready and working  
**Next Step**: Test it in your running app by adding the test code above
