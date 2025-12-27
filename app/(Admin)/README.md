# Admin Section - File Structure & Setup Guide

## 📁 Complete File Structure

```
e:\Democheck\officemanagement\
│
├── app/
│   ├── (Admin)/                          # Admin section folder
│   │   ├── _layout.tsx                   # Admin layout wrapper
│   │   ├── dashboard.tsx                 # Main admin dashboard
│   │   ├── profile.tsx                   # Admin profile (with logout)
│   │   └── employees/
│   │       ├── index.tsx                 # Employee list screen
│   │       └── [id].tsx                  # Employee detail/performance
│   │
│   ├── (auth)/                           # Authentication screens
│   │   ├── sign-in.tsx                   # Login (with admin toggle)
│   │   └── sign-up.tsx                   # Register (with admin toggle)
│   │
│   └── (tabs)/                           # Main app tabs
│       └── profile.tsx                   # Regular user profile
│
├── components/
│   └── Admin/                            # Admin-specific components
│       ├── QuickStatsCard.tsx           # Dashboard stat cards
│       ├── ApprovalCard.tsx             # Approval section cards
│       ├── UpcomingCard.tsx             # Upcoming events cards
│       ├── BirthdayCard.tsx             # Birthday celebration cards
│       └── EmployeeListItem.tsx         # Employee list item
│
└── lib/
    ├── adminApi.ts                       # Admin API functions
    ├── auth.ts                           # Authentication logic
    └── appwrite.ts                       # Appwrite SDK (includes signOut)
```

---

## 🚀 How to Access Admin Features

### 1. **Login as Admin**
- Go to Sign In screen
- Enter credentials
- **Toggle "Sign in as Admin" to ON** (blue)
- Submit
- You'll be auto-redirected to `/(Admin)/dashboard`

### 2. **Admin Dashboard**
**Route:** `/(Admin)/dashboard`

Features:
- Quick Stats (6 cards)
- Approvals (3 cards)
- Upcoming Leaves & WFH
- Birthdays
- Employee Performance

### 3. **Admin Profile (with Logout)**
**Route:** `/(Admin)/profile`

**How to Access:**
- From dashboard, tap the profile avatar in top-right corner
- Or navigate directly to `/(Admin)/profile`

**Features:**
- Personal details
- Contact information
- Administrative roles
- **🔴 LOGOUT BUTTON** at the bottom

**How Logout Works:**
```typescript
// When you tap "Log Out" button:
1. Shows confirmation alert
2. Calls signOut() from appwrite
3. Redirects to /(auth)/sign-in
```

### 4. **Employee List**
**Route:** `/(Admin)/employees/index`

Features:
- Search employees
- Filter by department
- View employee cards
- Tap to see performance details

### 5. **Employee Performance**
**Route:** `/(Admin)/employees/[id]`

Features:
- Performance metrics
- Quarterly trends
- Recent feedback
- Current goals

---

## 📝 File Locations Summary

### ✅ Already Created Files

| File | Location | Purpose |
|------|----------|---------|
| `_layout.tsx` | `app/(Admin)/` | Admin section layout |
| `dashboard.tsx` | `app/(Admin)/` | Main dashboard |
| `profile.tsx` | `app/(Admin)/` | **Admin profile with LOGOUT** |
| `index.tsx` | `app/(Admin)/employees/` | Employee list |
| `[id].tsx` | `app/(Admin)/employees/` | Employee details |
| `QuickStatsCard.tsx` | `components/Admin/` | Stat cards component |
| `ApprovalCard.tsx` | `components/Admin/` | Approval cards component |
| `UpcomingCard.tsx` | `components/Admin/` | Upcoming events component |
| `BirthdayCard.tsx` | `components/Admin/` | Birthday cards component |
| `EmployeeListItem.tsx` | `components/Admin/` | Employee list item component |
| `adminApi.ts` | `lib/` | Admin API functions |

---

## 🔐 Logout Functionality

### Current Implementation

The logout is **already implemented** in `app/(Admin)/profile.tsx`:

```typescript
const handleLogout = () => {
  Alert.alert('Log Out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Log Out',
      style: 'destructive',
      onPress: async () => {
        await signOut();  // Clears auth data
        router.replace('/(auth)/sign-in');  // Redirects to login
      },
    },
  ]);
};
```

### How to Use Logout

1. **From Dashboard:**
   - Tap profile avatar (top-right)
   - Scroll to bottom
   - Tap red "Log Out" button

2. **Confirmation:**
   - Alert appears: "Are you sure you want to log out?"
   - Tap "Log Out" to confirm
   - Or "Cancel" to stay logged in

3. **After Logout:**
   - Auth data cleared
   - Redirected to sign-in screen
   - Must login again to access admin

---

## 🎯 Navigation Flow

```
Sign In (with admin toggle)
         ↓
    Admin Dashboard
         ↓
    ┌────┴────┬─────────┬──────────┐
    ↓         ↓         ↓          ↓
Profile  Employees  Approvals  Reports
(Logout)   (List)
```

---

## 🛠️ Testing Checklist

- [ ] Login with admin toggle ON
- [ ] Verify redirect to dashboard
- [ ] Check all dashboard sections load
- [ ] Tap profile avatar in header
- [ ] Verify profile screen opens
- [ ] Scroll to bottom
- [ ] Tap "Log Out" button
- [ ] Confirm logout alert
- [ ] Verify redirect to sign-in
- [ ] Try to access admin routes (should fail)

---

## 📱 Admin Profile Screen Features

### Header
- Back button (chevron-back)
- Title: "Admin Profile"
- Edit button (top-right)

### Sections
1. **Profile Card**
   - Avatar with initials
   - Full name
   - Role: "Senior System Administrator"
   - Employee ID

2. **Personal Details**
   - Full Name
   - Department
   - Date of Birth

3. **Contact Information**
   - Email
   - Phone
   - Office Location

4. **Administrative Roles**
   - Current Roles
   - Permissions

5. **🔴 Logout Button**
   - Red background
   - Bottom of screen
   - Confirmation alert

---

## 🚨 Important Notes

1. **Logout is ALREADY implemented** - No need to create a separate logout page
2. **Profile screen has logout** - Located at `app/(Admin)/profile.tsx`
3. **All files are in correct locations** - No need to move anything
4. **Admin toggle must be ON** - During login to access admin features
5. **signOut() clears all auth data** - Including tokens and user info

---

## 🔄 Alternative: Add Logout to Dashboard

If you want a logout button directly on the dashboard, add this to `dashboard.tsx`:

```typescript
// In the header section, add a logout icon:
<TouchableOpacity onPress={handleLogout}>
  <Ionicons name="log-out-outline" size={24} color="#fff" />
</TouchableOpacity>

// Add the handler:
const handleLogout = () => {
  Alert.alert('Log Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Log Out',
      style: 'destructive',
      onPress: async () => {
        await signOut();
        router.replace('/(auth)/sign-in');
      },
    },
  ]);
};
```

---

## ✅ Summary

**You DON'T need to create any new files!**

Everything is already set up:
- ✅ Admin dashboard
- ✅ Admin profile
- ✅ **Logout functionality** (in profile screen)
- ✅ Employee management
- ✅ All components

**To logout:**
1. Go to admin profile
2. Scroll down
3. Tap red "Log Out" button
4. Confirm

That's it! 🎉


admin_test
Admin@123