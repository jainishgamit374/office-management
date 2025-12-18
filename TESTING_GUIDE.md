# Quick Start Testing Guide

## 🚀 Testing the Refactored App

### Prerequisites
- Expo server is running (`npx expo start -c`)
- Mobile device or emulator connected

---

## 📱 Manual Testing Checklist

### 1. Authentication Flow

#### Test Sign-Up
- [ ] Open the app (should show sign-in screen)
- [ ] Click "Sign Up" link
- [ ] Fill in all fields:
  - Full Name: `Test User`
  - Username: `testuser`
  - Email: `test@example.com`
  - Phone: `1234567890`
  - Password: `password123`
- [ ] Click "Sign Up" button
- [ ] **Expected**: Success alert, automatic login, navigate to home screen

#### Test Sign-In
- [ ] If logged in, logout first (from profile)
- [ ] Enter credentials:
  - Email: `test@example.com`
  - Password: `password123`
- [ ] Click "Sign In" button
- [ ] **Expected**: Success alert, navigate to home screen

#### Test Invalid Login
- [ ] Enter invalid credentials
- [ ] Click "Sign In"
- [ ] **Expected**: Error alert showing "Invalid credentials"

#### Test Empty Fields
- [ ] Leave email or password empty
- [ ] Click "Sign In"
- [ ] **Expected**: Error alert "Both email and password are required"

---

### 2. Home Screen Components

#### Navbar
- [ ] **Expected**: Navbar visible at top
- [ ] Shows app branding/logo

#### Greeting Section
- [ ] **Expected**: Personalized greeting
- [ ] Shows user name (e.g., "Hello, Jainish!")
- [ ] Shows current date/time

#### Check-In Card
- [ ] **Expected**: Swipeable check-in button visible
- [ ] Swipe right to check in
- [ ] **Expected**: Status changes to "Checked In"
- [ ] Swipe left to check out
- [ ] **Expected**: Cooldown timer appears
- [ ] **Expected**: Check-in disabled during cooldown

#### Task Section
- [ ] Before first check-in: **Expected** - Not visible
- [ ] After first check-in: **Expected** - Becomes visible
- [ ] Shows task progress (e.g., "4 tasks to complete out of 12")
- [ ] Different content when checked in vs checked out

#### Missed Punch Section
- [ ] **Expected**: Blue card with title "Missed Pushed/ Check-Out"
- [ ] Horizontal scrollable list of dates
- [ ] Shows multiple date cards (07 / Dec / 2025)

#### Attendance Tracking Cards
- [ ] **Expected**: Three cards in a row:
  1. Late Check In (with log-in icon)
  2. Early Check Out (with log-out icon)
  3. Half Day (with calendar icon)
- [ ] Each shows count (currently 0)

#### Leave Balance Section
- [ ] **Expected**: White card with "Leave Balance" title
- [ ] Four circular badges:
  - PL (green) - 10
  - CL (blue) - 10
  - SL (orange) - 10
  - AB (red) - 0

#### Pending Requests Section
- [ ] **Expected**: White card with "My Pending Requests" title
- [ ] Five rows with icons:
  1. Leave Approvals (green check)
  2. Miss Punch Approvals (red clock)
  3. Half Day Approvals (blue calendar)
  4. Early Check-Out Approvals (blue log-out)
  5. WFH Approval (red home)

#### Info Sections
- [ ] **Expected**: "Late Arrivals Today" section
- [ ] Shows "No record available" message
- [ ] **Expected**: "Leaving Early Today" section
- [ ] Shows "No record available" message

---

### 3. Navigation

#### Tab Navigation
- [ ] Click "Home" tab - **Expected**: Home screen
- [ ] Click "Services" tab - **Expected**: Services/Explore screen
- [ ] Click "Profile" tab - **Expected**: Profile screen
- [ ] **Expected**: Tab bar at bottom with rounded corners
- [ ] **Expected**: Active tab highlighted

---

### 4. Logout Flow

#### From Profile
- [ ] Go to Profile tab
- [ ] Find logout button/option
- [ ] Click logout
- [ ] **Expected**: Navigate back to sign-in screen
- [ ] **Expected**: User state cleared

#### Verify Logout
- [ ] Close and reopen app
- [ ] **Expected**: Shows sign-in screen (not home)
- [ ] Sign in again
- [ ] **Expected**: Successfully logs in

---

### 5. Persistence Testing

#### Auth Persistence
- [ ] Sign in to the app
- [ ] Close the app completely
- [ ] Reopen the app
- [ ] **Expected**: Still logged in, shows home screen

#### State Persistence
- [ ] Check in
- [ ] Close app
- [ ] Reopen app
- [ ] **Expected**: Check-in state may or may not persist (depends on implementation)

---

## 🐛 Common Issues & Solutions

### Issue: App shows blank screen
**Solution**: 
- Check Expo terminal for errors
- Reload app (shake device → Reload)
- Clear cache: `npx expo start -c`

### Issue: Components not rendering
**Solution**:
- Check import paths in `HomeScreen.tsx`
- Verify all component files exist in `components/Home/`
- Check for TypeScript errors

### Issue: Auth not working
**Solution**:
- Check `AuthContext.tsx` is properly imported
- Verify `AsyncStorage` is installed
- Check console for auth errors

### Issue: Navigation not working
**Solution**:
- Verify `expo-router` is installed
- Check `_layout.tsx` files are correct
- Ensure proper Stack/Tabs configuration

---

## 📊 Performance Checks

### Load Time
- [ ] App loads within 2-3 seconds
- [ ] No significant lag when navigating

### Scroll Performance
- [ ] Home screen scrolls smoothly
- [ ] No stuttering or frame drops
- [ ] Horizontal scroll in Missed Punch section is smooth

### Memory Usage
- [ ] App doesn't crash on repeated navigation
- [ ] No memory leaks (check with dev tools)

---

## 🎨 Visual Checks

### Styling
- [ ] All cards have proper rounded corners
- [ ] Shadows/elevation visible on cards
- [ ] Colors match design:
  - Primary blue: `#4289f4ff`
  - Background: `#f0f2f5`
  - Card background: `#fff`

### Spacing
- [ ] Consistent padding/margins
- [ ] No overlapping elements
- [ ] Proper gap between sections

### Icons
- [ ] All icons display correctly
- [ ] Proper colors for each icon
- [ ] Icons are properly sized

---

## ✅ Success Criteria

All checkboxes above should be checked (✓) for a successful refactoring test.

### Critical Tests (Must Pass)
1. ✓ Sign-up works
2. ✓ Sign-in works
3. ✓ Home screen displays all sections
4. ✓ Navigation between tabs works
5. ✓ Logout works
6. ✓ Auth state persists

### Important Tests (Should Pass)
7. ✓ Check-in/out functionality
8. ✓ All components render correctly
9. ✓ No console errors
10. ✓ Smooth performance

---

## 📝 Test Report Template

```
Date: _______________
Tester: _______________
Device: _______________

Authentication Flow:
[ ] Sign-up: PASS / FAIL
[ ] Sign-in: PASS / FAIL
[ ] Logout: PASS / FAIL
[ ] Persistence: PASS / FAIL

Home Screen Components:
[ ] Navbar: PASS / FAIL
[ ] Greeting: PASS / FAIL
[ ] Check-In Card: PASS / FAIL
[ ] Task Section: PASS / FAIL
[ ] Missed Punch: PASS / FAIL
[ ] Attendance Cards: PASS / FAIL
[ ] Leave Balance: PASS / FAIL
[ ] Pending Requests: PASS / FAIL
[ ] Info Sections: PASS / FAIL

Navigation:
[ ] Tab Navigation: PASS / FAIL
[ ] Screen Transitions: PASS / FAIL

Performance:
[ ] Load Time: PASS / FAIL
[ ] Scroll Performance: PASS / FAIL
[ ] Memory Usage: PASS / FAIL

Overall Result: PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ Mark refactoring as complete
2. ✅ Commit changes to version control
3. ✅ Update project documentation
4. ✅ Plan next features

If tests fail:
1. ❌ Document failing tests
2. ❌ Check error logs
3. ❌ Fix issues
4. ❌ Re-test

---

## 📞 Support

If you encounter issues:
1. Check `REFACTORING_DOCS.md` for detailed documentation
2. Review `ARCHITECTURE_DIAGRAM.md` for structure
3. Check Expo terminal for error messages
4. Review component files for TypeScript errors

---

**Happy Testing! 🎉**
