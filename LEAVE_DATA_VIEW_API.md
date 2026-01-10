# Leave Data View API - Quick Reference

## API Endpoint

**URL**: `/getemployeeleavedataview/`  
**Method**: `GET`  
**Authentication**: Required (Bearer Token)

## Response Format

```json
{
  "status": "Success",
  "data": {
    "approved_count": 0,
    "applied_count": 1
  }
}
```

## Implementation

### 1. API Function

**File**: `lib/leaves.ts`

```typescript
import { getEmployeeLeaveDataView } from '@/lib/leaves';

// Fetch leave data
const response = await getEmployeeLeaveDataView();

// Access data
const approvedCount = response.data.approved_count;
const appliedCount = response.data.applied_count;
```

### 2. TypeScript Interface

```typescript
export interface LeaveDataViewResponse {
    status: string;
    statusCode?: number;
    message?: string;
    data: {
        approved_count: number;
        applied_count: number;
    };
    timestamp?: string;
    requestId?: string;
}
```

### 3. Usage in Component

```typescript
import React, { useEffect, useState } from 'react';
import { getEmployeeLeaveDataView } from '@/lib/leaves';

export default function MyComponent() {
    const [leaveData, setLeaveData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await getEmployeeLeaveDataView();
            if (response.status === 'Success') {
                setLeaveData(response.data);
                console.log('Approved:', response.data.approved_count);
                console.log('Applied:', response.data.applied_count);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Your UI here
    );
}
```

## Sample Component

A complete example component is available at:
**File**: `components/Leaves/LeaveDataView.tsx`

This component includes:
- ✅ Automatic data fetching on mount
- ✅ Refresh on screen focus
- ✅ Pull-to-refresh functionality
- ✅ Loading and error states
- ✅ Beautiful UI with statistics cards
- ✅ Approval rate calculation
- ✅ Progress bar visualization

## Features

### Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `approved_count` | number | Total number of approved leave applications |
| `applied_count` | number | Total number of leave applications submitted |

### Calculated Metrics

You can calculate additional metrics from the data:

```typescript
// Pending/Rejected count
const pendingOrRejected = appliedCount - approvedCount;

// Approval rate percentage
const approvalRate = (approvedCount / appliedCount) * 100;

// Success rate
const successRate = appliedCount > 0 
    ? Math.round((approvedCount / appliedCount) * 100) 
    : 0;
```

## Error Handling

```typescript
try {
    const response = await getEmployeeLeaveDataView();
    
    if (response.status === 'Success') {
        // Handle success
        console.log('Data:', response.data);
    } else {
        // Handle API error
        console.error('API Error:', response.message);
    }
} catch (error) {
    // Handle network/auth errors
    if (error.message.includes('session has expired')) {
        // Redirect to login
    } else {
        // Show error message
        console.error('Error:', error.message);
    }
}
```

## Common Use Cases

### 1. Display in Dashboard

```typescript
<View style={styles.statsRow}>
    <StatCard 
        title="Applied Leaves" 
        value={leaveData.applied_count}
        icon="📝"
    />
    <StatCard 
        title="Approved Leaves" 
        value={leaveData.approved_count}
        icon="✅"
    />
</View>
```

### 2. Show Approval Rate

```typescript
const approvalRate = leaveData.applied_count > 0
    ? Math.round((leaveData.approved_count / leaveData.applied_count) * 100)
    : 0;

<Text>Approval Rate: {approvalRate}%</Text>
```

### 3. Conditional Rendering

```typescript
{leaveData.applied_count === 0 && (
    <Text>No leave applications yet</Text>
)}

{leaveData.approved_count === leaveData.applied_count && (
    <Text>All applications approved! 🎉</Text>
)}
```

## Integration with Existing Components

### In CheckInCard.tsx

You can add leave statistics to your check-in card:

```typescript
import { getEmployeeLeaveDataView } from '@/lib/leaves';

// In your component
const [leaveStats, setLeaveStats] = useState(null);

useEffect(() => {
    const fetchLeaveStats = async () => {
        try {
            const response = await getEmployeeLeaveDataView();
            if (response.status === 'Success') {
                setLeaveStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching leave stats:', error);
        }
    };
    
    fetchLeaveStats();
}, []);

// Display in UI
{leaveStats && (
    <View style={styles.leaveStatsSection}>
        <Text>Leaves: {leaveStats.approved_count}/{leaveStats.applied_count}</Text>
    </View>
)}
```

## API Function Details

### Function Signature

```typescript
export const getEmployeeLeaveDataView = async (): Promise<LeaveDataViewResponse>
```

### Parameters
- None (uses authenticated user's token)

### Returns
- `Promise<LeaveDataViewResponse>` - Leave statistics data

### Throws
- Error if not authenticated
- Error if API request fails
- Error if session expired

### Example with Full Error Handling

```typescript
const fetchLeaveData = async () => {
    try {
        setLoading(true);
        setError(null);
        
        const response = await getEmployeeLeaveDataView();
        
        if (response.status === 'Success') {
            setLeaveData(response.data);
            
            // Log for debugging
            console.log('✅ Leave data fetched:', {
                approved: response.data.approved_count,
                applied: response.data.applied_count,
                rate: `${Math.round((response.data.approved_count / response.data.applied_count) * 100)}%`
            });
        } else {
            setError(response.message || 'Failed to fetch data');
        }
    } catch (error: any) {
        console.error('❌ Error:', error);
        
        if (error.message.includes('session has expired')) {
            // Handle session expiry
            Alert.alert('Session Expired', 'Please login again');
            // Navigate to login
        } else if (error.message.includes('network')) {
            setError('Network error. Please check your connection.');
        } else {
            setError(error.message || 'An error occurred');
        }
    } finally {
        setLoading(false);
    }
};
```

## Testing

### Manual Testing

1. **Login** to the app
2. **Navigate** to a screen using the component
3. **Verify** the data displays correctly
4. **Pull down** to refresh
5. **Check** that counts update

### Test Data

```typescript
// Expected response format
{
  "status": "Success",
  "data": {
    "approved_count": 5,
    "applied_count": 8
  }
}

// This means:
// - 8 total leave applications
// - 5 approved
// - 3 pending/rejected
// - 62.5% approval rate
```

## Notes

- ✅ Function automatically handles authentication
- ✅ Includes comprehensive error handling
- ✅ Logs all API calls for debugging
- ✅ Returns typed response for TypeScript safety
- ✅ Compatible with React Native and Expo
- ✅ Works with existing authentication system

## Related Functions

- `getEmployeeLeaveBalance()` - Get leave balance by type
- `getLeaveApplicationsList()` - Get detailed leave applications
- `applyLeave()` - Submit new leave application

---

**Created**: January 8, 2026  
**API Endpoint**: `/getemployeeleavedataview/`  
**Status**: ✅ Ready to use
