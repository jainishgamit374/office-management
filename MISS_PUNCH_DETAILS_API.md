# Miss Punch Details API - Complete Guide

## API Endpoint

**URL**: `/getmissingpunchdetails/`  
**Method**: `GET`  
**Authentication**: Required (Bearer Token)

## Response Format

```json
{
    "status": "Success",
    "data": [
        {
            "MissPunchReqMasterID": 1,
            "ApprovalStatusMasterID": 3,
            "datetime": "2026-01-01",
            "reason": "Forgot to punch in",
            "approval_status": "Awaiting Approve",
            "PunchType": "1",
            "workflow_list": [
                {
                    "Approve_name": "Durgesh Jadav",
                    "Priority": 1,
                    "status": "Awaiting Approve"
                }
            ]
        }
    ]
}
```

## Implementation

### 1. TypeScript Interfaces

**File**: `lib/missPunchList.ts`

```typescript
export interface WorkflowApprover {
    Approve_name: string;
    Priority: number;
    status: string;
}

export interface MissPunchDetail {
    MissPunchReqMasterID: number;
    ApprovalStatusMasterID: number;
    datetime: string;
    reason: string;
    approval_status: string;
    PunchType: string;  // "1" = Punch In, "2" = Punch Out
    workflow_list: WorkflowApprover[];
}

export interface MissPunchDetailsResponse {
    status: string;
    statusCode?: number;
    message?: string;
    data: MissPunchDetail[];
    timestamp?: string;
    requestId?: string;
}
```

### 2. API Function

```typescript
import { getMissingPunchDetails } from '@/lib/missPunchList';

// Fetch miss punch details
const response = await getMissingPunchDetails();

// Access data
const details = response.data;
details.forEach(detail => {
    console.log('Request ID:', detail.MissPunchReqMasterID);
    console.log('Status:', detail.approval_status);
    console.log('Punch Type:', detail.PunchType === '1' ? 'In' : 'Out');
    console.log('Workflow:', detail.workflow_list);
});
```

### 3. Usage in Component

```typescript
import React, { useEffect, useState } from 'react';
import { getMissingPunchDetails, MissPunchDetail } from '@/lib/missPunchList';

export default function MyComponent() {
    const [details, setDetails] = useState<MissPunchDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            const response = await getMissingPunchDetails();
            if (response.status === 'Success') {
                setDetails(response.data);
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

## Data Fields

### MissPunchDetail Object

| Field | Type | Description |
|-------|------|-------------|
| `MissPunchReqMasterID` | number | Unique request ID |
| `ApprovalStatusMasterID` | number | Status ID (1=Approved, 2=Pending, 3=Awaiting) |
| `datetime` | string | Date/time of missed punch |
| `reason` | string | Reason for missing punch |
| `approval_status` | string | Human-readable status |
| `PunchType` | string | "1" for Punch In, "2" for Punch Out |
| `workflow_list` | WorkflowApprover[] | List of approvers |

### WorkflowApprover Object

| Field | Type | Description |
|-------|------|-------------|
| `Approve_name` | string | Approver's name |
| `Priority` | number | Approval priority (1, 2, 3...) |
| `status` | string | Approval status for this approver |

## Punch Types

```typescript
const getPunchTypeLabel = (punchType: string) => {
    return punchType === '1' ? 'Punch In' : 'Punch Out';
};

const getPunchTypeIcon = (punchType: string) => {
    return punchType === '1' ? 'log-in' : 'log-out';
};
```

## Approval Status

Common status values:
- `"Approved"` - Request approved
- `"Awaiting Approve"` - Pending approval
- `"Rejected"` - Request rejected
- `"Pending"` - In review

### Status Color Coding

```typescript
const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') && !statusLower.includes('awaiting')) {
        return { text: '#4CAF50', bg: '#E8F5E9' }; // Green
    } else if (statusLower.includes('rejected')) {
        return { text: '#FF5252', bg: '#FFEBEE' }; // Red
    } else if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
        return { text: '#FF9800', bg: '#FFF3E0' }; // Orange
    }
    return { text: '#999', bg: '#F5F5F5' }; // Gray
};
```

## Sample Components

### 1. Complete Component with Workflow

**File**: `app/Attendance/MissPunchDetails.tsx`

This component includes:
- ✅ Full workflow visualization
- ✅ Approval priority display
- ✅ Punch type indicators
- ✅ Status badges with colors
- ✅ Refresh functionality
- ✅ Loading and error states
- ✅ Beautiful, production-ready UI

### 2. Existing Component (Updated)

**File**: `app/Attendance/MissPunchList.tsx`

Uses the simpler `/misspunchapprovallist/` endpoint for basic list view.

## Common Use Cases

### 1. Display Workflow Progress

```typescript
{detail.workflow_list.map((approver, index) => (
    <View key={index}>
        <Text>Priority {approver.Priority}: {approver.Approve_name}</Text>
        <Text>Status: {approver.status}</Text>
    </View>
))}
```

### 2. Show Pending Approvals

```typescript
const pendingApprovals = details.filter(detail => 
    detail.approval_status.toLowerCase().includes('awaiting') ||
    detail.approval_status.toLowerCase().includes('pending')
);

<Text>Pending: {pendingApprovals.length}</Text>
```

### 3. Group by Status

```typescript
const groupedByStatus = details.reduce((acc, detail) => {
    const status = detail.approval_status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(detail);
    return acc;
}, {} as Record<string, MissPunchDetail[]>);
```

### 4. Find Next Approver

```typescript
const getNextApprover = (workflow: WorkflowApprover[]) => {
    return workflow.find(approver => 
        approver.status.toLowerCase().includes('awaiting') ||
        approver.status.toLowerCase().includes('pending')
    );
};

const nextApprover = getNextApprover(detail.workflow_list);
if (nextApprover) {
    console.log('Waiting for:', nextApprover.Approve_name);
}
```

## Error Handling

```typescript
try {
    const response = await getMissingPunchDetails();
    
    if (response.status === 'Success') {
        if (response.data.length === 0) {
            console.log('No miss punch requests found');
        } else {
            console.log('Found', response.data.length, 'requests');
        }
    } else {
        console.error('API Error:', response.message);
    }
} catch (error: any) {
    if (error.message.includes('session has expired')) {
        // Redirect to login
    } else if (error.message.includes('No access token')) {
        // User not authenticated
    } else {
        // Other errors
        console.error('Error:', error.message);
    }
}
```

## Integration Examples

### In Dashboard

```typescript
const [missPunchCount, setMissPunchCount] = useState(0);

useEffect(() => {
    const fetchCount = async () => {
        const response = await getMissingPunchDetails();
        if (response.status === 'Success') {
            const pending = response.data.filter(d => 
                d.approval_status.toLowerCase().includes('awaiting')
            );
            setMissPunchCount(pending.length);
        }
    };
    fetchCount();
}, []);

<Badge count={missPunchCount} />
```

### With Notifications

```typescript
const checkForNewRequests = async () => {
    const response = await getMissingPunchDetails();
    if (response.status === 'Success') {
        const newRequests = response.data.filter(d => {
            // Check if request is new (created today)
            const requestDate = new Date(d.datetime);
            const today = new Date();
            return requestDate.toDateString() === today.toDateString();
        });
        
        if (newRequests.length > 0) {
            Alert.alert(
                'New Miss Punch Requests',
                `You have ${newRequests.length} new request(s)`,
                [{ text: 'View', onPress: () => navigation.navigate('MissPunchDetails') }]
            );
        }
    }
};
```

## Comparison with Other Endpoints

### `/misspunchapprovallist/` vs `/getmissingpunchdetails/`

| Feature | misspunchapprovallist | getmissingpunchdetails |
|---------|----------------------|------------------------|
| Workflow Info | ❌ No | ✅ Yes |
| Punch Type | ❌ No | ✅ Yes |
| Approval Status ID | ✅ Yes | ✅ Yes |
| Detailed Status | ❌ No | ✅ Yes |
| Use Case | Simple list | Detailed view with workflow |

**Recommendation**: 
- Use `/misspunchapprovallist/` for simple lists
- Use `/getmissingpunchdetails/` for detailed views with workflow tracking

## Testing

### Manual Testing

1. **Login** to the app
2. **Navigate** to Miss Punch Details screen
3. **Verify** data displays correctly
4. **Check** workflow approvers show in order
5. **Test** pull-to-refresh
6. **Verify** status colors match approval state

### Test Data Validation

```typescript
const validateMissPunchDetail = (detail: MissPunchDetail) => {
    const errors: string[] = [];
    
    if (!detail.MissPunchReqMasterID) errors.push('Missing request ID');
    if (!detail.datetime) errors.push('Missing datetime');
    if (!detail.PunchType) errors.push('Missing punch type');
    if (!['1', '2'].includes(detail.PunchType)) errors.push('Invalid punch type');
    if (!detail.workflow_list || detail.workflow_list.length === 0) {
        errors.push('Missing workflow');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};
```

## Performance Tips

### 1. Memoize Filtered Data

```typescript
const pendingRequests = useMemo(() => 
    details.filter(d => d.approval_status.toLowerCase().includes('awaiting')),
    [details]
);
```

### 2. Optimize Workflow Rendering

```typescript
const WorkflowItem = React.memo(({ approver }: { approver: WorkflowApprover }) => {
    // Component code
});
```

### 3. Pagination (if needed)

```typescript
const [page, setPage] = useState(1);
const itemsPerPage = 10;

const paginatedDetails = details.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
);
```

## Related Functions

- `getMissPunchList()` - Get simple miss punch approval list
- `recordPunch()` - Record attendance punch
- `getEmployeeAttendance()` - Get attendance history

## Notes

- ✅ Function automatically handles authentication
- ✅ Includes comprehensive error handling
- ✅ Logs all API calls for debugging
- ✅ Returns typed response for TypeScript safety
- ✅ Compatible with React Native and Expo
- ✅ Works with existing authentication system
- ✅ Workflow list shows approval hierarchy
- ✅ Punch type indicates IN or OUT punch

---

**Created**: January 8, 2026  
**API Endpoint**: `/getmissingpunchdetails/`  
**Status**: ✅ Ready to use
