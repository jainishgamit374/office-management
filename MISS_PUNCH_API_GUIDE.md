# Missed Punch IN/OUT API Documentation

## ✅ **YES - There is a Miss Punch API for BOTH IN and OUT!**

---

## Submit Miss Punch Request API

### **Function:** `submitMissPunch()`
**File:** `lib/missPunchList.ts`  
**Endpoint:** `/misspunch/`  
**Method:** POST

---

## Request Format

```typescript
{
  Date: string,        // Format: "YYYY-MM-DD"
  PunchType: 1 | 2,    // 1 = Punch IN, 2 = Punch OUT
  Reason: string       // Minimum 10 characters
}
```

---

## Examples

### **Example 1: Miss Punch IN**
```typescript
import { submitMissPunch } from '@/lib/missPunchList';

await submitMissPunch({
  Date: "2026-01-10",
  PunchType: 1,  // ← 1 = Punch IN
  Reason: "Forgot to punch in this morning due to urgent meeting"
});
```

**Response:**
```json
{
  "status": "Success",
  "statusCode": 201,
  "message": "Miss punch request submitted successfully"
}
```

---

### **Example 2: Miss Punch OUT**
```typescript
await submitMissPunch({
  Date: "2026-01-09",
  PunchType: 2,  // ← 2 = Punch OUT
  Reason: "Forgot to punch out yesterday evening"
});
```

**Response:**
```json
{
  "status": "Success",
  "statusCode": 201,
  "message": "Miss punch request submitted successfully"
}
```

---

## Validation Rules

✅ **Date**: Required, format "YYYY-MM-DD"  
✅ **PunchType**: Required, must be `1` (IN) or `2` (OUT)  
✅ **Reason**: Required, minimum 10 characters  

---

## PunchType Values

| Value | Type | Description |
|-------|------|-------------|
| `1` | Punch IN | For missed check-in |
| `2` | Punch OUT | For missed check-out |

---

## How to Use in Component

Here's an example of how to create a form to submit missed punch requests:

```typescript
import { submitMissPunch } from '@/lib/missPunchList';
import { useState } from 'react';

const MissPunchForm = () => {
  const [date, setDate] = useState('');
  const [punchType, setPunchType] = useState<1 | 2>(1);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await submitMissPunch({
        Date: date,
        PunchType: punchType,
        Reason: reason
      });
      
      console.log('✅ Success:', response.message);
      Alert.alert('Success', 'Miss punch request submitted!');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      {/* Date Picker */}
      <TextInput 
        value={date}
        onChange={setDate}
        placeholder="YYYY-MM-DD"
      />
      
      {/* Punch Type Selector */}
      <Picker
        selectedValue={punchType}
        onValueChange={setPunchType}
      >
        <Picker.Item label="Punch IN" value={1} />
        <Picker.Item label="Punch OUT" value={2} />
      </Picker>
      
      {/* Reason Input */}
      <TextInput
        value={reason}
        onChange={setReason}
        placeholder="Enter reason (min 10 chars)"
        multiline
      />
      
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};
```

---

## Related APIs

### **1. Get Miss Punch Details**
**Function:** `getMissingPunchDetails()`  
**Endpoint:** `/getmissingpunchdetails/`  
**Purpose:** Fetch all submitted miss punch requests with approval status

### **2. Get Miss Punch Approval List**
**Function:** `getMissPunchList()`  
**Endpoint:** `/misspunchapprovallist/`  
**Purpose:** Get list of miss punch requests pending approval (for managers)

---

## Complete Flow

```
User forgot to punch in/out
    ↓
User opens miss punch form
    ↓
User selects:
  - Date (when they forgot)
  - Type (IN or OUT)
  - Reason (why they forgot)
    ↓
Call submitMissPunch()
    ↓
Request sent to /misspunch/
    ↓
Backend creates request
    ↓
Request goes to manager for approval
    ↓
User can see status via getMissingPunchDetails()
```

---

## Summary

| Feature | API Endpoint | Method | Purpose |
|---------|--------------|--------|---------|
| Submit Miss Punch IN | `/misspunch/` | POST | Submit missed check-in request |
| Submit Miss Punch OUT | `/misspunch/` | POST | Submit missed check-out request |
| Get Miss Punch Details | `/getmissingpunchdetails/` | GET | View submitted requests |
| Get Approval List | `/misspunchapprovallist/` | GET | View pending approvals |

**Yes, there is a complete API for both Miss Punch IN and Miss Punch OUT!** ✅

---

**Last Updated:** 2026-01-12
