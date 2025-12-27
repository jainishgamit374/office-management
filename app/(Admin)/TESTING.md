# 🧪 Admin Routes Testing Checklist

## ✅ Pre-Testing Setup

1. **Make sure Expo is running:**
   ```bash
   npx expo start -c
   ```

2. **Open app on your device/emulator**

3. **Have test credentials ready:**
   - Username: `admin_test`
   - Password: `Admin@123`
   - Or use any existing account

---

## 📋 Route Testing Checklist

### 1️⃣ **Authentication Routes**

#### Test: Sign In as Admin
- [ ] Navigate to Sign In screen
- [ ] Enter username and password
- [ ] **Toggle "Sign in as Admin" to ON** (should be blue)
- [ ] Tap "Sign In"
- [ ] **Expected:** Success message appears
- [ ] **Expected:** Auto-redirect to `/(Admin)/dashboard`

**Route:** `/(auth)/sign-in`
**Status:** ⬜ Pass / ⬜ Fail

---

### 2️⃣ **Admin Dashboard**

#### Test: Dashboard Loads
- [ ] Dashboard screen appears after login
- [ ] Blue header shows "HRMS Dashboard"
- [ ] Welcome section shows your name
- [ ] Quick Stats section has 6 cards
- [ ] Approvals section has 3 cards
- [ ] Upcoming section has 2 columns
- [ ] Birthdays section displays
- [ ] Pull-to-refresh works

**Route:** `/(Admin)/dashboard`
**Status:** ⬜ Pass / ⬜ Fail

**Expected Elements:**
- ✅ Header: Menu icon, title, profile avatar
- ✅ Welcome: "Welcome, [Name]!"
- ✅ Quick Stats: 6 colored cards
- ✅ Approvals: 3 cards (Pending, Leave Balance, WFH Balance)
- ✅ Upcoming: Leaves & WFH columns
- ✅ Birthdays: Birthday cards with emojis

---

### 3️⃣ **Admin Profile**

#### Test: Profile Navigation
- [ ] From dashboard, tap profile avatar (top-right)
- [ ] Profile screen opens
- [ ] Back button works
- [ ] Profile info displays correctly

#### Test: Profile Content
- [ ] Avatar with initials shows
- [ ] Full name displays
- [ ] Role shows "Senior System Administrator"
- [ ] Personal Details section visible
- [ ] Contact Information section visible
- [ ] Administrative Roles section visible
- [ ] Red "Log Out" button at bottom

**Route:** `/(Admin)/profile`
**Status:** ⬜ Pass / ⬜ Fail

---

### 4️⃣ **Logout Functionality**

#### Test: Logout Process
- [ ] Scroll to bottom of profile
- [ ] Tap red "Log Out" button
- [ ] Alert appears: "Are you sure you want to log out?"
- [ ] Tap "Log Out" to confirm
- [ ] **Expected:** Redirects to sign-in screen
- [ ] **Expected:** Cannot access admin routes anymore
- [ ] Try navigating to `/(Admin)/dashboard` manually
- [ ] **Expected:** Should redirect or show error

**Route:** Logout from `/(Admin)/profile`
**Status:** ⬜ Pass / ⬜ Fail

---

### 5️⃣ **Employee List**

#### Test: Employee List Access
**Note:** You need to add navigation to this route from dashboard

- [ ] Navigate to `/(Admin)/employees/index` manually
- [ ] Or add a button on dashboard to access it
- [ ] Employee list screen loads
- [ ] Search bar visible
- [ ] Filter chips visible (All, Engineering, Sales, etc.)
- [ ] Employee cards display
- [ ] Can search employees
- [ ] Can filter by department

**Route:** `/(Admin)/employees/index`
**Status:** ⬜ Pass / ⬜ Fail

**Manual Navigation Test:**
```typescript
// Add this button to dashboard.tsx to test:
<TouchableOpacity 
  style={styles.viewAllButton}
  onPress={() => router.push('/(Admin)/employees/index')}
>
  <Text>View All Employees</Text>
</TouchableOpacity>
```

---

### 6️⃣ **Employee Detail/Performance**

#### Test: Employee Detail Navigation
- [ ] From employee list, tap an employee card
- [ ] Employee performance screen opens
- [ ] Back button works
- [ ] Employee ID shows in name
- [ ] Performance metrics display
- [ ] Quarterly trend section visible
- [ ] Recent feedback section visible
- [ ] Current goals section visible
- [ ] Progress bars animate

**Route:** `/(Admin)/employees/[id]`
**Status:** ⬜ Pass / ⬜ Fail

---

## 🔍 Component Testing

### Admin Components

#### QuickStatsCard
- [ ] Icon displays (emoji)
- [ ] Title shows
- [ ] Count displays
- [ ] Subtitle shows
- [ ] Background color correct
- [ ] Touchable (if onPress provided)

#### ApprovalCard
- [ ] Title displays
- [ ] Count or days shows
- [ ] Limit text (if applicable)
- [ ] Background color correct
- [ ] Centered layout

#### UpcomingCard
- [ ] Avatar with initials
- [ ] Employee name shows
- [ ] Date range displays
- [ ] Different colors for leave vs WFH

#### BirthdayCard
- [ ] Avatar with initials
- [ ] Employee name shows
- [ ] Birthday emoji (🎂)
- [ ] Special styling for today's birthdays
- [ ] Balloons for today (🎈🎉)

#### EmployeeListItem
- [ ] Avatar image loads
- [ ] Employee name shows
- [ ] Department and role display
- [ ] Icon on right side
- [ ] Touchable, navigates to detail

---

## 🐛 Common Issues & Fixes

### Issue 1: "Route not found"
**Fix:** Make sure file names match exactly:
- `dashboard.tsx` (not `Dashboard.tsx`)
- `[id].tsx` (not `[ID].tsx`)

### Issue 2: "Cannot find module"
**Fix:** Check imports in files:
```typescript
// Correct:
import QuickStatsCard from '@/components/Admin/QuickStatsCard';

// Wrong:
import QuickStatsCard from '@/app/(Admin)/QuickStatsCard';
```

### Issue 3: "Redirect loop"
**Fix:** Check admin access logic in `dashboard.tsx`:
```typescript
// Should be commented out for testing:
/*
if (!userData || !userData.is_admin) {
  router.replace('/');
  return;
}
*/
```

### Issue 4: "Logout doesn't work"
**Fix:** Check import in `profile.tsx`:
```typescript
import { signOut } from '@/lib/appwrite';
```

---

## 📊 Test Results Summary

| Route | Status | Notes |
|-------|--------|-------|
| `/(auth)/sign-in` | ⬜ | Admin toggle test |
| `/(Admin)/dashboard` | ⬜ | Main dashboard |
| `/(Admin)/profile` | ⬜ | Profile & logout |
| `/(Admin)/employees/index` | ⬜ | Employee list |
| `/(Admin)/employees/[id]` | ⬜ | Employee detail |

---

## 🎯 Quick Test Commands

### Test Navigation Manually:
```typescript
// In any screen, add these buttons to test routes:

// Dashboard
router.push('/(Admin)/dashboard');

// Profile
router.push('/(Admin)/profile');

// Employees
router.push('/(Admin)/employees/index');

// Employee Detail
router.push({
  pathname: '/(Admin)/employees/[id]',
  params: { id: '123' }
});
```

---

## ✅ All Tests Pass Criteria

- [ ] Can login as admin
- [ ] Redirects to dashboard
- [ ] Dashboard loads all sections
- [ ] Can navigate to profile
- [ ] Can logout successfully
- [ ] Can view employee list (if navigation added)
- [ ] Can view employee details
- [ ] All components render correctly
- [ ] No console errors
- [ ] Smooth navigation between screens

---

## 📝 Notes

- Some routes require manual navigation (employees list)
- API calls will fail until backend is ready (expected)
- Placeholder data is shown for testing UI
- Admin check is disabled for testing

**Last Updated:** December 23, 2025
