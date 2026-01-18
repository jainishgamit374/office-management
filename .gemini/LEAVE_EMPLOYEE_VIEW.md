# Leave Application - Employee View Updates

## ✅ Complete Implementation

The Leave Application screen has been updated to show comprehensive information for employees viewing their own leave requests!

## Changes Made

### 1. **Show Approver Information** ✅
- Displays who is reviewing or who approved/rejected the request
- Uses `ApprovalUsername` from API
- Color-coded based on status

### 2. **Show Rejection Reason** ✅
- Displays rejection reason when request is rejected
- Uses `RejectionReason` field from API
- Prominent red styling for visibility

### 3. **Removed Action Buttons** ✅
- Removed "Approve" and "Reject" buttons
- This is for employees viewing their own requests
- Only "View Workflow" button remains

## Visual Design

### **Complete Card Layout:**

```
┌────────────────────────────────────────────────────┐
│ 🏥 Sick Leave                      [REJECTED] 🔴   │
│ Applied: 16 Jan 2026                               │
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ From          →          To      [1 Days]  │    │
│ │ 18 Jan 2026              18 Jan 2026       │    │
│ └────────────────────────────────────────────┘    │
│                                                    │
│ "Family function 111111.."                         │
│                                                    │
│ ✗ Rejected by: Ravi Jadav                         │  ← Approver Info
│                                                    │
│ ┌────────────────────────────────────────────┐    │
│ │ ⚠ REJECTION REASON:                        │    │
│ │ Insufficient documentation provided.       │    │  ← Rejection Reason
│ │ Please attach medical certificate.         │    │
│ └────────────────────────────────────────────┘    │
│ ──────────────────────────────────────────────    │
│ View Workflow                                      │  ← Only Workflow Button
└────────────────────────────────────────────────────┘
```

## Status-Based Display

### **Pending Request:**
```
✓ Reviewing by: Ravi Jadav (Orange)
[No rejection reason]
[View Workflow button only]
```

### **Approved Request:**
```
✓ Approved by: Ravi Jadav (Green)
[No rejection reason]
[View Workflow button only]
```

### **Rejected Request:**
```
✗ Rejected by: Ravi Jadav (Red)

⚠ REJECTION REASON:
Insufficient documentation provided.
Please attach medical certificate.

[View Workflow button only]
```

## API Fields Used

### **From `/leaveapplications/` Response:**

```json
{
  "LeaveApplicationMasterID": 9,
  "ApprovalStatus": "Rejected",
  "ApprovalUsername": "Ravi Jadav",
  "RejectionReason": "Insufficient documentation provided. Please attach medical certificate.",
  "LeaveType": "Sick Leave",
  "Reason": "Family function 111111..",
  "StartDate": "2026-01-18",
  "EndDate": "2026-01-18"
}
```

## Component Structure

### **Approval Info Section:**
```tsx
{item.ApprovalUsername && (
    <View style={styles.approvalInfo}>
        <Feather name="user-check" size={14} color={statusStyle.color} />
        <Text style={styles.approvalLabel}>
            {isPending ? 'Reviewing by:' : `${statusStyle.label} by:`}
        </Text>
        <Text style={[styles.approvalName, { color: statusStyle.color }]}>
            {item.ApprovalUsername}
        </Text>
    </View>
)}
```

### **Rejection Reason Section:**
```tsx
{(item.ApprovalStatus?.toLowerCase().includes('reject') || 
  item.ApprovalStatus?.toLowerCase().includes('disapprove')) && 
 item.RejectionReason && (
    <View style={styles.rejectionBlock}>
        <View style={styles.rejectionHeader}>
            <Feather name="alert-circle" size={14} color="#C62828" />
            <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
        </View>
        <Text style={styles.rejectionText}>{item.RejectionReason}</Text>
    </View>
)}
```

### **Footer (Workflow Only):**
```tsx
<View style={styles.cardFooter}>
    <Pressable onPress={() => handleViewHistory(item)}>
        <Feather name="git-merge" size={14} color={colors.primary} />
        <Text style={styles.historyButtonText}>View Workflow</Text>
    </Pressable>
</View>
```

## Styles

### **Approval Info:**
```tsx
approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
}
```

### **Rejection Block:**
```tsx
rejectionBlock: {
    backgroundColor: '#FFEBEE',      // Light red background
    borderLeftWidth: 3,
    borderLeftColor: '#C62828',      // Dark red accent
    padding: 12,
    borderRadius: 8,
    gap: 8,
}
```

## Type Definitions Updated

### **Added to `LeaveApplicationDetails`:**
```typescript
export interface LeaveApplicationDetails {
    // ... existing fields
    ApprovalUsername: string;
    RejectionReason?: string;        // NEW!
    CreatedDate?: string;            // Alternative field name
    UpdatedDate?: string;            // Alternative field name
    CreatedBy?: number;
    UpdatedBy?: number;
    // ... rest of fields
}
```

## Features

### ✅ **Transparency**
- Employees know who is handling their request
- Clear visibility into approval process
- Rejection reasons help employees understand what went wrong

### ✅ **Clean UI**
- No confusing action buttons for employees
- Only "View Workflow" to see detailed history
- Color-coded for quick status recognition

### ✅ **Informative**
- Shows all relevant information
- Rejection reasons help employees resubmit correctly
- Approver name provides accountability

## Conditional Display Logic

| Condition | Display |
|-----------|---------|
| `ApprovalUsername` exists | Show approver info |
| Status is "Rejected" AND `RejectionReason` exists | Show rejection reason block |
| Always | Show "View Workflow" button |
| Never | Show "Approve"/"Reject" buttons |

## Color Coding

| Status | Approver Color | Rejection Block |
|--------|---------------|-----------------|
| Pending | 🟠 Orange `#F57C00` | N/A |
| Approved | 🟢 Green `#2E7D32` | N/A |
| Rejected | 🔴 Red `#C62828` | Red background `#FFEBEE` |

## Benefits

### **For Employees:**
1. ✅ Know who is reviewing their request
2. ✅ Understand why request was rejected
3. ✅ Can resubmit with correct information
4. ✅ Clear, professional interface
5. ✅ No confusion about actions they can't take

### **For Organization:**
1. ✅ Transparency in approval process
2. ✅ Better communication
3. ✅ Reduced back-and-forth
4. ✅ Professional appearance

## Example Scenarios

### **Scenario 1: Pending Request**
```
Employee applies for sick leave
→ Shows "Reviewing by: Ravi Jadav"
→ Orange color indicates pending
→ Only "View Workflow" button
```

### **Scenario 2: Approved Request**
```
Ravi approves the leave
→ Shows "Approved by: Ravi Jadav"
→ Green color indicates approval
→ No rejection reason
→ Only "View Workflow" button
```

### **Scenario 3: Rejected Request**
```
Ravi rejects the leave
→ Shows "Rejected by: Ravi Jadav"
→ Red color indicates rejection
→ Shows rejection reason in red box
→ Employee can understand why and resubmit
→ Only "View Workflow" button
```

## Summary

✅ **Shows approver name** from `ApprovalUsername`
✅ **Shows rejection reason** from `RejectionReason`
✅ **Removed action buttons** (Approve/Reject)
✅ **Clean employee view** with only relevant information
✅ **Color-coded** for quick status recognition
✅ **Professional design** with proper styling
✅ **Informative** - helps employees understand their request status

The Leave Application screen now provides complete transparency for employees viewing their own leave requests!
