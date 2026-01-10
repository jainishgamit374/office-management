# Miss Punch Submission API - Quick Reference

## API Endpoint

**URL**: `/misspunch/`  
**Method**: `POST`  
**Authentication**: Required (Bearer Token)

## Request Format

```json
{
  "Date": "2026-01-01",
  "PunchType": 1,
  "Reason": "Forgot to punch in"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Date` | string | Yes | Date in YYYY-MM-DD format |
| `PunchType` | number | Yes | 1 = Punch In, 2 = Punch Out |
| `Reason` | string | Yes | Reason for missing punch (min 10 characters) |

## Response Format

```json
{
    "status": "Success",
    "statusCode": 200,
    "message": "Miss punch request submitted successfully."
}
```

## Implementation

### 1. API Function

**File**: `lib/missPunchList.ts`

```typescript
import { submitMissPunch } from '@/lib/missPunchList';

// Submit miss punch request
const result = await submitMissPunch({
    Date: '2026-01-01',
    PunchType: 1,  // 1 = In, 2 = Out
    Reason: 'Forgot to punch in'
});

console.log(result.message); // "Miss punch request submitted successfully."
```

### 2. TypeScript Interfaces

```typescript
export interface SubmitMissPunchData {
    Date: string;        // Format: YYYY-MM-DD
    PunchType: 1 | 2;    // 1 = Punch In, 2 = Punch Out
    Reason: string;
}

export interface SubmitMissPunchResponse {
    status: string;
    statusCode: number;
    message: string;
    timestamp?: string;
    requestId?: string;
}
```

### 3. Usage in Component

```typescript
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { submitMissPunch } from '@/lib/missPunchList';

export default function MyComponent() {
    const [date, setDate] = useState('2026-01-01');
    const [punchType, setPunchType] = useState<1 | 2>(1);
    const [reason, setReason] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await submitMissPunch({
                Date: date,
                PunchType: punchType,
                Reason: reason
            });
            
            Alert.alert('Success', response.message);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        // Your UI here
    );
}
```

## Validation Rules

### Date
- **Required**: Yes
- **Format**: YYYY-MM-DD
- **Example**: "2026-01-01"

### PunchType
- **Required**: Yes
- **Values**: 
  - `1` = Punch In
  - `2` = Punch Out
- **Type**: Number (not string)

### Reason
- **Required**: Yes
- **Minimum Length**: 10 characters
- **Example**: "Forgot to punch in"

## Error Handling

```typescript
try {
    const response = await submitMissPunch({
        Date: '2026-01-01',
        PunchType: 1,
        Reason: 'Forgot to punch in'
    });
    
    if (response.status === 'Success') {
        console.log('✅', response.message);
    }
} catch (error: any) {
    // Handle specific errors
    if (error.message.includes('session has expired')) {
        // Redirect to login
    } else if (error.message.includes('Reason must be')) {
        // Show validation error
    } else {
        // Show generic error
        console.error('Error:', error.message);
    }
}
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Date and Reason are required" | Missing required fields | Provide both Date and Reason |
| "PunchType must be 1 or 2" | Invalid punch type | Use 1 for In, 2 for Out |
| "Reason must be at least 10 characters" | Reason too short | Provide detailed reason |
| "Your session has expired" | Invalid/expired token | Re-login required |
| "Invalid request data" | Malformed request | Check data format |

## Integration Example

### In CheckInCard Component

```typescript
import { submitMissPunch } from '@/lib/missPunchList';

const handleMissPunch = async (punchType: 1 | 2) => {
    try {
        // Show input dialog for reason
        Alert.prompt(
            'Miss Punch Request',
            'Please provide a reason (minimum 10 characters):',
            async (reason) => {
                if (reason.length < 10) {
                    Alert.alert('Error', 'Reason must be at least 10 characters');
                    return;
                }
                
                const today = new Date().toISOString().split('T')[0];
                
                const response = await submitMissPunch({
                    Date: today,
                    PunchType: punchType,
                    Reason: reason
                });
                
                Alert.alert('Success', response.message);
            }
        );
    } catch (error: any) {
        Alert.alert('Error', error.message);
    }
};
```

### With Date Picker

```typescript
import DateTimePicker from '@react-native-community/datetimepicker';

const [selectedDate, setSelectedDate] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);

const handleSubmitMissPunch = async () => {
    try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        const response = await submitMissPunch({
            Date: dateStr,
            PunchType: 1,
            Reason: 'Forgot to punch in due to meeting'
        });
        
        Alert.alert('Success ✅', response.message);
    } catch (error: any) {
        Alert.alert('Error ❌', error.message);
    }
};
```

## Response Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (session expired) |
| 500 | Server Error |

## Best Practices

1. **Validate Before Submission**
   ```typescript
   if (reason.trim().length < 10) {
       Alert.alert('Error', 'Please provide a detailed reason');
       return;
   }
   ```

2. **Show Loading State**
   ```typescript
   setLoading(true);
   try {
       await submitMissPunch(data);
   } finally {
       setLoading(false);
   }
   ```

3. **Provide User Feedback**
   ```typescript
   Alert.alert(
       'Request Submitted ✅',
       'Your miss punch request has been submitted for approval.',
       [{ text: 'OK' }]
   );
   ```

4. **Handle Network Errors**
   ```typescript
   catch (error: any) {
       if (error.message.includes('network')) {
           Alert.alert('Network Error', 'Please check your connection');
       } else {
           Alert.alert('Error', error.message);
       }
   }
   ```

## Testing

### Manual Test

```typescript
// Test data
const testData = {
    Date: '2026-01-01',
    PunchType: 1 as 1 | 2,
    Reason: 'Forgot to punch in this morning'
};

// Submit
const response = await submitMissPunch(testData);
console.log('Response:', response);
```

### Expected Success Response

```json
{
    "status": "Success",
    "statusCode": 200,
    "message": "Miss punch request submitted successfully."
}
```

## Notes

- ✅ Function automatically handles authentication
- ✅ Includes comprehensive validation
- ✅ Logs all API calls for debugging
- ✅ Returns typed response for TypeScript safety
- ✅ Compatible with React Native and Expo
- ✅ Works with existing authentication system
- ✅ Validates reason length (minimum 10 characters)
- ✅ Validates punch type (must be 1 or 2)

---

**Created**: January 8, 2026  
**API Endpoint**: `/misspunch/`  
**Status**: ✅ Ready to use
