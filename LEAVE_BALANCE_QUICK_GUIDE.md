# Leave Balance System - Quick Reference

## How It Works 🎯

### The 4 Balance States

```
┌─────────────────────────────────────────────────────┐
│  TOTAL BALANCE: 10 CL                               │
│  ├─ Used: 3 CL (Approved & consumed) ✅             │
│  ├─ Pending: 2 CL (Waiting approval) ⏳            │
│  └─ Available: 5 CL (Can apply) 🟢                  │
│                                                      │
│  Formula: Available = Total - Used - Pending        │
└─────────────────────────────────────────────────────┘
```

## Leave Application Flow

### ✅ APPROVED Leave (Balance IS Deducted)

```
Step 1: Apply for 2 days CL
┌──────────────────┐
│ Total: 10        │
│ Used: 3          │
│ Pending: 2 ⬆️    │  ← Goes to pending
│ Available: 5 ⬇️  │  ← Decreases
└──────────────────┘

Step 2: Manager APPROVES ✅
┌──────────────────┐
│ Total: 10        │
│ Used: 5 ⬆️       │  ← Deducted here!
│ Pending: 0 ⬇️    │  ← Cleared
│ Available: 5     │  ← Stays same
└──────────────────┘

✅ Result: Balance deducted (2 days moved from pending to used)
```

### ❌ REJECTED Leave (Balance NOT Deducted)

```
Step 1: Apply for 2 days CL
┌──────────────────┐
│ Total: 10        │
│ Used: 3          │
│ Pending: 2 ⬆️    │  ← Goes to pending
│ Available: 5 ⬇️  │  ← Decreases
└──────────────────┘

Step 2: Manager REJECTS ❌
┌──────────────────┐
│ Total: 10        │
│ Used: 3          │  ← NOT deducted!
│ Pending: 0 ⬇️    │  ← Cleared
│ Available: 7 ⬆️  │  ← Restored!
└──────────────────┘

✅ Result: Balance restored (2 days returned to available)
```

## Key Points 🔑

1. **When you APPLY** → Balance goes to "Pending" (temporarily reserved)
2. **When APPROVED** → Balance is deducted (moved to "Used")
3. **When REJECTED** → Balance is restored (returned to "Available")

## What You See in the App

### Balance Cards
```
┌─────────────┐
│     5       │  ← Available (what you can apply for)
│    CL       │
│  of 10      │  ← Total allocated
│ (2 pending) │  ← Waiting approval
└─────────────┘
```

### Leave Type Selection
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ✓ CL (5) │  │ ○ SL (3) │  │ ○ PL (0) │
└──────────┘  └──────────┘  └──────────┘
   Active       Available     No balance
```

### Error Message (Insufficient Balance)
```
❌ Insufficient Leave Balance

You don't have enough CL leave balance.

📊 Balance Details:
• Total: 10 days
• Used: 3 days (already approved)
• Pending: 2 days (waiting approval)
• Available: 5 days (can apply)

🚫 Requested: 7 days
⚠️ Short by: 2.0 days
```

## Examples

### Example 1: Successful Application
```
You have: 10 CL total, 3 used, 0 pending = 7 available
You apply: 2 days CL
Result: ✅ Allowed (2 ≤ 7)
New state: 10 total, 3 used, 2 pending = 5 available
```

### Example 2: Insufficient Balance
```
You have: 10 CL total, 3 used, 2 pending = 5 available
You apply: 7 days CL
Result: ❌ Blocked (7 > 5)
Message: "Short by 2.0 days"
```

### Example 3: Approval Flow
```
Initial: 10 total, 3 used, 0 pending = 7 available
Apply 2 days: 10 total, 3 used, 2 pending = 5 available
Approved: 10 total, 5 used, 0 pending = 5 available ✅
(Balance deducted: 3 → 5 used)
```

### Example 4: Rejection Flow
```
Initial: 10 total, 3 used, 0 pending = 7 available
Apply 2 days: 10 total, 3 used, 2 pending = 5 available
Rejected: 10 total, 3 used, 0 pending = 7 available ✅
(Balance restored: 5 → 7 available)
```

## Backend Requirements ⚙️

The backend API must handle these transitions:

1. **POST /leaveapplications/** (Apply)
   - Increment `pending`
   - Decrement `available`
   - Status = "Pending"

2. **Approve Action**
   - Increment `used`
   - Decrement `pending`
   - Status = "Approved"

3. **Reject Action**
   - Decrement `pending`
   - Increment `available`
   - Status = "Rejected"

## Summary Table

| Event | Total | Used | Pending | Available | Balance Deducted? |
|-------|-------|------|---------|-----------|-------------------|
| Apply | 10 | 3 | 2 ⬆️ | 5 ⬇️ | ❌ No (pending) |
| Approve | 10 | 5 ⬆️ | 0 ⬇️ | 5 | ✅ Yes (deducted) |
| Reject | 10 | 3 | 0 ⬇️ | 7 ⬆️ | ❌ No (restored) |

---

**Remember**: Balance is only truly deducted when leave is **APPROVED** ✅  
If rejected, the balance is **RESTORED** ❌
