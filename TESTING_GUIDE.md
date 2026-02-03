# Testing Guide: Missed Punch Filtering

## ✅ What to Check in Your App

### 1. Open the App
- Navigate to the **Home Screen**
- Scroll down to the **"Missed Punches"** section

---

## 🧪 Test Cases

### ✅ Test Case 1: No Missed Punches
**What to do:**
- Pull down to refresh the home screen

**What to look for:**
- ✅ "Missed Punches" section should show
- ✅ Should display a **check-circle icon** (✓)
- ✅ Should show text: **"No missed punches"**
- ✅ Count badge should NOT appear (no number)

**Console logs to check:**
```
🔍 MissedPunchSection state: { isLoading: false, missedPunchesCount: 0, ... }
✅ MissedPunchSection: No data to display
```

---

### ✅ Test Case 2: Pending Missed Punches
**What to do:**
- If you have pending missed punch requests in the system

**What to look for:**
- ✅ "Missed Punches" section should show
- ✅ Should display **horizontal scrollable cards**
- ✅ Each card shows:
  - Date (e.g., "Feb 3, 2026")
  - Type ("Check-In" or "Check-Out")
- ✅ Count badge shows correct number (e.g., "(2)")

**Console logs to check:**
```
📥 MissedPunchSection API responses: { missedPunch: { status: 'Success', dataLength: 2 } }
✅ MissedPunchSection: Parsed missed punches: 2
```

---

### ✅ Test Case 3: Approved/Rejected Items (Should Be Hidden)
**What to do:**
- If you have approved or rejected missed punch requests

**What to look for:**
- ✅ These should **NOT** appear in the list
- ✅ Only **pending** items should show
- ✅ Count should only include pending items

**Console logs to check:**
```
⚠️ MissedPunchSection: Filtering out processed item (status: Approved)
⚠️ MissedPunchSection: Filtering out processed item (status: Rejected)
✅ MissedPunchSection: Parsed missed punches: 1  (only pending ones)
```

---

### ⚠️ Test Case 4: Late Check-In Scenario (CRITICAL)
**What to do:**
1. Check in **after 10:00 AM** (late check-in)
2. Pull down to refresh
3. Check **both** sections:
   - "Missed Punches" section
   - "Late Arrivals Today" section

**What to look for (CURRENT BEHAVIOR - MAY BE WRONG):**
- ⚠️ If you see the same date in **BOTH** sections → **Backend fix needed**
- ✅ If you see it **ONLY** in "Late Arrivals" → **Working correctly**

**Expected behavior:**
- ❌ Should **NOT** show in "Missed Punches"
- ✅ Should **ONLY** show in "Late Arrivals Today"

**Console logs to check:**
```
📊 [LateArrivals] Total items received: X
✅ [LateArrivals] Filtered to X Late items
```

---

## 🔍 How to Check Console Logs

### On Physical Device (Android):
1. Connect device via USB
2. Run: `adb logcat | grep -i "missed\|late"`

### On Expo Go:
1. Shake device to open developer menu
2. Tap "Debug Remote JS"
3. Open Chrome DevTools
4. Check Console tab

### On Simulator/Emulator:
1. Logs appear automatically in the terminal where you ran `npx expo start`

---

## 📊 Expected Results Summary

| Scenario | Missed Punches Section | Late Arrivals Section | Notes |
|----------|----------------------|---------------------|-------|
| No issues | "No missed punches" | Empty or shows data | ✅ Normal |
| Pending missed punch | Shows card(s) | - | ✅ Correct |
| Approved missed punch | Hidden (filtered) | - | ✅ Correct |
| Late check-in (after 10 AM) | Should be empty | Shows late check-in | ⚠️ Backend dependent |
| On-time check-in (before 10 AM) | Empty | Empty | ✅ Normal |

---

## 🐛 Known Issues & Fixes

### Issue: Late check-in shows in BOTH sections
**Status:** ⚠️ Requires backend fix  
**Fix:** See `MISSED_PUNCH_LOGIC.md`  
**Frontend:** Already filtering approved/rejected items ✅

### Issue: Count is wrong
**Status:** ✅ Fixed  
**Fix:** Now filters out processed items before counting

### Issue: Section doesn't show at all
**Status:** ✅ Fixed  
**Fix:** Now always shows with "No data" message when empty

---

## 📝 Testing Checklist

- [ ] Section appears on home screen
- [ ] Shows "No missed punches" when no data
- [ ] Shows correct count badge
- [ ] Cards display correct date and type
- [ ] Can tap card to open submit modal
- [ ] Approved items are filtered out
- [ ] Rejected items are filtered out
- [ ] Only pending items are shown
- [ ] Late check-in appears in correct section
- [ ] Console logs show filtering messages

---

## 🆘 Troubleshooting

### Section doesn't appear at all
- Check if `<MissedPunchSection>` is in `HomeScreen.tsx` (line 165)
- Pull down to refresh
- Check console for errors

### Count shows 0 but should have data
- Check API response in console logs
- Verify `approval_status` values
- May be filtering out all items (check status values)

### Late check-in shows in both sections
- **This is a backend issue**
- Backend needs to mark missed punch as "Resolved" when user checks in late
- See `MISSED_PUNCH_LOGIC.md` for fix

---

## ✅ Success Criteria

The feature is working correctly if:
1. ✅ Section always appears (doesn't hide completely)
2. ✅ Shows "No data" message when empty
3. ✅ Only shows pending items
4. ✅ Filters out approved/rejected items
5. ✅ Count badge is accurate
6. ⚠️ Late check-ins appear ONLY in Late Arrivals (backend dependent)
