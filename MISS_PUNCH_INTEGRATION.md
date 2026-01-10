# Miss Punch Integration Guide for CheckInCard

## ✅ Implementation Complete

The miss punch submission API has been successfully implemented and is ready to integrate into your CheckInCard component.

## 📍 What Was Created

### 1. API Function
**File**: `lib/missPunchList.ts`

```typescript
export const submitMissPunch = async (data: SubmitMissPunchData): Promise<SubmitMissPunchResponse>
```

### 2. Types
```typescript
export interface SubmitMissPunchData {
    Date: string;        // Format: YYYY-MM-DD
    PunchType: 1 | 2;    // 1 = Punch In, 2 = Punch Out
    Reason: string;      // Minimum 10 characters
}

export interface SubmitMissPunchResponse {
    status: string;
    statusCode: number;
    message: string;
}
```

## 🎯 How to Use in CheckInCard

### Option 1: Add Miss Punch Button

Add this to your CheckInCard component:

```typescript
import { submitMissPunch } from '@/lib/missPunchList';
import { Alert } from 'react-native';

// Add this function to CheckInCard component
const handleMissPunchRequest = async (punchType: 1 | 2) => {
    Alert.prompt(
        'Miss Punch Request',
        `Request a missed ${punchType === 1 ? 'Check-In' : 'Check-Out'}\n\nPlease provide a reason (minimum 10 characters):`,
        async (reason) => {
            if (!reason || reason.trim().length < 10) {
                Alert.alert('Error', 'Reason must be at least 10 characters');
                return;
            }
            
            try {
                setIsLoading(true);
                
                const today = new Date().toISOString().split('T')[0];
                
                const response = await submitMissPunch({
                    Date: today,
                    PunchType: punchType,
                    Reason: reason.trim()
                });
                
                Alert.alert(
                    'Success ✅',
                    response.message || 'Miss punch request submitted successfully',
                    [{ text: 'OK' }]
                );
            } catch (error: any) {
                Alert.alert(
                    'Error ❌',
                    error.message || 'Failed to submit miss punch request',
                    [{ text: 'OK' }]
                );
            } finally {
                setIsLoading(false);
            }
        },
        'plain-text'
    );
};
```

### Option 2: Add to Existing UI

Add buttons below the swipe section:

```tsx
{/* Miss Punch Buttons */}
{!isCheckedIn && !hasCheckedOut && (
    <View style={styles.missPunchSection}>
        <Text style={styles.missPunchTitle}>Forgot to punch?</Text>
        <View style={styles.missPunchButtons}>
            <TouchableOpacity
                style={styles.missPunchButton}
                onPress={() => handleMissPunchRequest(1)}
            >
                <Text style={styles.missPunchButtonText}>Request Check-In</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.missPunchButton}
                onPress={() => handleMissPunchRequest(2)}
            >
                <Text style={styles.missPunchButtonText}>Request Check-Out</Text>
            </TouchableOpacity>
        </View>
    </View>
)}
```

### Styles to Add

```typescript
missPunchSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
},
missPunchTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
},
missPunchButtons: {
    flexDirection: 'row',
    gap: 8,
},
missPunchButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
},
missPunchButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
},
```

## 📱 User Flow

1. **User forgot to check in/out**
2. **Taps "Request Check-In" or "Request Check-Out"**
3. **System shows prompt for reason**
4. **User enters reason (min 10 characters)**
5. **System submits to `/misspunch/` API**
6. **Success message shown**
7. **Request goes to approval workflow**

## 🎨 UI Placement Options

### Option A: Below Swipe Section
```
┌─────────────────────────────┐
│   [Swipe to Check-In]       │
├─────────────────────────────┤
│   Forgot to punch?          │
│  [Request In] [Request Out] │
└─────────────────────────────┘
```

### Option B: In Time Info Section
```
┌─────────────────────────────┐
│ Check-In | Hours | Check-Out│
├─────────────────────────────┤
│  [Request Miss Punch]       │
└─────────────────────────────┘
```

### Option C: Floating Action Button
```
┌─────────────────────────────┐
│   [Swipe to Check-In]       │
│                         [+] │ ← FAB for miss punch
└─────────────────────────────┘
```

## ✨ Features

- ✅ **Validation**: Ensures reason is at least 10 characters
- ✅ **Date Auto-fill**: Uses today's date automatically
- ✅ **Punch Type**: Supports both IN (1) and OUT (2)
- ✅ **Error Handling**: Shows clear error messages
- ✅ **Loading State**: Prevents duplicate submissions
- ✅ **Success Feedback**: Confirms submission to user

## 🔄 Complete Integration Example

```typescript
import { submitMissPunch } from '@/lib/missPunchList';

// Inside CheckInCard component
const [showMissPunchModal, setShowMissPunchModal] = useState(false);
const [missPunchType, setMissPunchType] = useState<1 | 2>(1);
const [missPunchReason, setMissPunchReason] = useState('');

const handleSubmitMissPunch = async () => {
    if (missPunchReason.trim().length < 10) {
        Alert.alert('Error', 'Reason must be at least 10 characters');
        return;
    }
    
    try {
        setIsLoading(true);
        
        const today = new Date().toISOString().split('T')[0];
        
        const response = await submitMissPunch({
            Date: today,
            PunchType: missPunchType,
            Reason: missPunchReason.trim()
        });
        
        Alert.alert('Success ✅', response.message);
        setShowMissPunchModal(false);
        setMissPunchReason('');
    } catch (error: any) {
        Alert.alert('Error ❌', error.message);
    } finally {
        setIsLoading(false);
    }
};
```

## 📝 Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Date | YYYY-MM-DD format | "2026-01-08" |
| PunchType | 1 or 2 | 1 = In, 2 = Out |
| Reason | Min 10 characters | "Forgot to punch in this morning" |

## 🚀 Quick Start

1. **Import the function**:
   ```typescript
   import { submitMissPunch } from '@/lib/missPunchList';
   ```

2. **Add the handler**:
   ```typescript
   const handleMissPunchRequest = async (punchType: 1 | 2) => { ... }
   ```

3. **Add UI buttons** (choose your preferred option)

4. **Test it**:
   - Tap button
   - Enter reason
   - Check console for success
   - Verify in miss punch list

## 📚 Related Documentation

- **API Reference**: `MISS_PUNCH_SUBMIT_API.md`
- **Miss Punch Details**: `MISS_PUNCH_DETAILS_API.md`
- **Miss Punch List**: `app/Attendance/MissPunchList.tsx`

---

**Status**: ✅ Ready to integrate  
**API Endpoint**: `/misspunch/`  
**Method**: POST
