# Office Management System - Quick Reference Guide

## 📊 Project Statistics

- **Total TypeScript Files**: 172
- **Screen Components**: 50 (in `app/`)
- **Reusable Components**: 53 (in `components/`)
- **API Modules**: 33 (in `lib/`)
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)

---

## 🗺️ Quick Navigation Map

### **Need to modify attendance check-in/out?**
→ `components/Home/CheckInCard.tsx` (38KB - main check-in interface)
→ `lib/attendance.ts` (26KB - attendance APIs)

### **Need to work on leave management?**
→ `lib/leaves.ts` (22KB - comprehensive leave APIs)
→ `components/Leaves/LeaveDataView.tsx`
→ `app/Requests/Leaveapplyreq.tsx`

### **Need to modify admin dashboard?**
→ `app/(Admin)/dashboard.tsx`
→ `components/Admin/ApprovalsDashboard.tsx`
→ `lib/adminApi.ts`

### **Need to work on authentication?**
→ `app/(auth)/sign-in.tsx`
→ `lib/auth.ts`
→ `contexts/AuthContext.tsx`

### **Need to modify home screen?**
→ `app/(tabs)/index.tsx`
→ `components/Home/HomeScreen.tsx`
→ Various `components/Home/*` components

### **Need to work on WFH features?**
→ `lib/wfhList.ts`
→ `app/Requests/Wfhapplyreq.tsx`
→ `components/Home/EmployeesWFHToday.tsx`

### **Need to modify notifications?**
→ `components/Home/NotificationCard.tsx`
→ `components/Home/NotificationBanner.tsx`
→ `lib/dailyEvents.ts`

---

## 📁 Directory Breakdown

### **`app/` - Application Screens (50 files)**

#### Route Groups:
- **(Admin)/** - Admin-only screens (dashboard, reports, employee management)
- **(auth)/** - Authentication screens (login, signup, password reset)
- **(tabs)/** - Main tab navigation (home, explore, profile)
- **Attendance/** - Attendance management screens
- **Requests/** - Employee request forms
- **ViewAllRequest/** - Request viewing screens
- **Resources/** - HR policies, team directory
- **Support/** - Help, FAQ, About
- **approvals/** - Approval workflows

#### Key Screens:
```
app/
├── (Admin)/dashboard.tsx          # Admin dashboard
├── (auth)/sign-in.tsx             # Login screen
├── (tabs)/index.tsx               # Home screen
├── Attendance/AttendenceList.tsx  # Attendance list
├── Requests/Leaveapplyreq.tsx     # Leave application
└── edit-profile.tsx               # Profile editing
```

---

### **`components/` - Reusable Components (53 files)**

#### Subdirectories:
- **Home/** (21 files) - Home screen components
- **Admin/** (17 files) - Admin dashboard components
- **Attendance/** - Attendance UI components
- **Leaves/** - Leave management components
- **Employee/** - Employee-specific components
- **Navigation/** - Navigation components

#### Most Important Components:
```
components/
├── Home/
│   ├── CheckInCard.tsx                 # ⭐ Main check-in/out (38KB)
│   ├── AttendanceTrackingCards.tsx     # Attendance stats (37KB)
│   ├── AttendanceIrregularities.tsx    # Irregularities display (25KB)
│   ├── MissedPunchSection.tsx          # Missed punch UI (18KB)
│   ├── PendingRequestsSection.tsx      # Pending requests (12KB)
│   └── [16 more home components]
│
└── Admin/
    ├── ApprovalsDashboard.tsx          # Approvals interface (13KB)
    ├── AdminToolsSection.tsx           # Admin tools (7KB)
    └── [15 more admin components]
```

---

### **`lib/` - API & Business Logic (33 files)**

#### Core API Modules:
```
lib/
├── api.ts                    # ⭐ Main API client (40KB)
├── attendance.ts             # ⭐ Attendance APIs (26KB)
├── leaves.ts                 # ⭐ Leave management (22KB)
├── auth.ts                   # Authentication (21KB)
├── adminApi.ts               # Admin APIs (13KB)
├── localAttendance.ts        # Offline attendance (12KB)
├── calendarEvents.ts         # Calendar events (10KB)
├── attendanceStorage.ts      # Local storage (8KB)
├── dailyEvents.ts            # Daily events (8KB)
├── missPunchList.ts          # Miss punch APIs (7KB)
├── earlyLatePunch.ts         # Late/early APIs (7KB)
├── employeeAttendance.ts     # Employee attendance (7KB)
├── workflow.ts               # Workflow APIs (7KB)
└── [20 more API modules]
```

#### API Module Categories:

**Authentication & User:**
- `auth.ts` - Login, logout, registration
- `user.ts` - User profile APIs
- `employeeId.ts` - Employee ID utilities

**Attendance:**
- `attendance.ts` - Main attendance APIs
- `attendanceStorage.ts` - Local storage
- `localAttendance.ts` - Offline logic
- `punchValidation.ts` - Validation logic
- `employeeAttendance.ts` - Employee attendance

**Leave Management:**
- `leaves.ts` - Leave APIs
- `leaveApprovalList.ts` - Leave approvals
- `todayLeaves.ts` - Today's leaves

**Irregularities:**
- `attendanceIrregularities.ts` - Irregularities
- `missPunchList.ts` - Miss punch
- `earlyLatePunch.ts` - Late/early punch
- `missCheckout.ts` - Miss checkout

**WFH:**
- `wfhList.ts` - WFH requests
- `wfhApprovalHistory.ts` - WFH approvals
- `isAwayList.ts` - Is Away status

**Admin:**
- `adminApi.ts` - Admin operations
- `employees.ts` - Employee management
- `tasks.ts` - Task management

**Calendar & Events:**
- `calendarApi.ts` - Calendar APIs
- `calendarEvents.ts` - Calendar events
- `dailyEvents.ts` - Daily events
- `indianHolidays.ts` - Holiday data

**Utilities:**
- `dateUtils.ts` - Date utilities
- `timezone.ts` - Timezone handling
- `debugPunchStatus.ts` - Debug tools
- `test-api.ts` - API testing

---

### **`contexts/` - Global State**

```
contexts/
├── AuthContext.tsx    # Authentication state
└── ThemeContext.tsx   # Theme (light/dark mode)
```

---

### **`constants/` - Configuration**

```
constants/
├── theme.ts           # Theme configuration
└── TabBarContext.tsx  # Tab bar state
```

---

### **`hooks/` - Custom React Hooks**

Custom hooks for reusable logic across components.

---

### **`utils/` - Utility Functions**

```
utils/
├── themeStyles.ts    # Theme styling utilities
└── resetData.ts      # Data reset utilities
```

---

### **`__tests__/` - Test Files**

```
__tests__/
├── api/
│   ├── attendance/   # Attendance API tests
│   ├── auth/         # Auth API tests
│   └── leaves/       # Leaves API tests
└── utils/            # Utility tests
```

---

## 🔑 Key Files by Size (Largest First)

1. **`lib/api.ts`** (40KB) - Main API client
2. **`components/Home/CheckInCard.tsx`** (38KB) - Check-in/out interface
3. **`components/Home/AttendanceTrackingCards.tsx`** (37KB) - Attendance stats
4. **`lib/attendance.ts`** (26KB) - Attendance APIs
5. **`components/Home/AttendanceIrregularities.tsx`** (25KB) - Irregularities
6. **`lib/leaves.ts`** (22KB) - Leave management
7. **`lib/auth.ts`** (21KB) - Authentication
8. **`components/Home/MissedPunchSection.tsx`** (18KB) - Missed punch UI
9. **`lib/adminApi.ts`** (13KB) - Admin APIs
10. **`components/Admin/ApprovalsDashboard.tsx`** (13KB) - Approvals

---

## 🎯 Common Tasks & File Locations

### **Adding a New Feature**

1. **Create screen**: Add to `app/[feature]/` directory
2. **Create components**: Add to `components/[feature]/`
3. **Add API calls**: Add to `lib/[feature].ts`
4. **Update navigation**: Modify `app/_layout.tsx` or relevant `_layout.tsx`

### **Modifying Attendance Logic**

- **UI**: `components/Home/CheckInCard.tsx`
- **API**: `lib/attendance.ts`
- **Storage**: `lib/attendanceStorage.ts`
- **Offline**: `lib/localAttendance.ts`
- **Validation**: `lib/punchValidation.ts`

### **Modifying Leave System**

- **API**: `lib/leaves.ts`
- **UI**: `components/Leaves/LeaveDataView.tsx`
- **Application**: `app/Requests/Leaveapplyreq.tsx`
- **Approvals**: `app/Attendance/LeaveApprovalList.tsx`

### **Modifying Admin Dashboard**

- **Main Dashboard**: `app/(Admin)/dashboard.tsx`
- **Approvals**: `components/Admin/ApprovalsDashboard.tsx`
- **Tools**: `components/Admin/AdminToolsSection.tsx`
- **API**: `lib/adminApi.ts`

### **Styling Changes**

- **Theme**: `constants/theme.ts`
- **Tailwind Config**: `tailwind.config.js`
- **Theme Context**: `contexts/ThemeContext.tsx`
- **Utilities**: `utils/themeStyles.ts`

---

## 🔄 Data Flow Patterns

### **Typical API Call Flow**

```
Component → lib/[feature].ts → lib/api.ts → Backend API
                ↓
         Update Local State
                ↓
         Store in AsyncStorage (if needed)
                ↓
         Re-render Component
```

### **Authentication Flow**

```
sign-in.tsx → lib/auth.ts → API → AuthContext → 
Protected Routes (enabled/disabled based on auth state)
```

### **Attendance Check-in Flow**

```
CheckInCard.tsx → lib/attendance.ts → API
                        ↓
                lib/attendanceStorage.ts (cache)
                        ↓
                Update UI (punchInTime, workingHours)
```

---

## 🧪 Testing Files

Located in root directory:
- `test-all-apis.ts` - Comprehensive API tests
- `test-late-early-apis.ts` - Late/early punch tests
- `test-attendance-api.ts` - Attendance API tests
- `test-attendance-endpoints.ts` - Endpoint tests
- `test-attendance-logic.ts` - Logic tests
- `test-attendance-storage.ts` - Storage tests
- `test-api-integration.ts` - Integration tests
- `api_test_suite.ts` - API test suite

---

## 📝 Documentation Files

The project has **30+ markdown documentation files**:

### **Key Documentation:**
- `README.md` - Main project documentation
- `CODE_MAP.md` - This comprehensive code map
- `FILE_STRUCTURE.md` - Detailed file structure
- `ARCHITECTURE_DIAGRAM.md` - Architecture details
- `API_TESTING_README.md` - API testing guide
- `COMPREHENSIVE_TESTING_GUIDE.md` - Complete testing guide

### **Feature Documentation:**
- `SLIDER_RESET_FIX_SUMMARY.md` - Slider reset fix
- `LATE_EARLY_HISTORY_FEATURE.md` - Late/early history
- `LEAVE_APPLICATION_DOCS.md` - Leave application
- `MISS_PUNCH_INTEGRATION.md` - Miss punch feature
- `ATTENDANCE_LIST_DOCS.md` - Attendance list
- `LOCATION_RESTRICTION_200M.md` - Location validation

### **API Documentation:**
- `CURRENT_API_ENDPOINTS.md` - All API endpoints
- `API_TESTING_SUMMARY.md` - API testing summary
- `HR_FUNCTIONS_API_GUIDE.md` - HR functions
- `LEAVE_DATA_VIEW_API.md` - Leave data APIs
- `MISS_PUNCH_API_GUIDE.md` - Miss punch APIs

---

## 🚀 Quick Commands

### **Development**
```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
```

### **Testing**
```bash
npm test             # Run Jest tests
npm run test:api     # Run API tests
```

### **Building**
```bash
eas build --platform android
eas build --platform ios
```

### **Utilities**
```bash
./reset-checkin.sh   # Reset check-in data (for testing)
```

---

## 🎨 Styling System

### **NativeWind (Tailwind CSS for React Native)**

Use Tailwind classes in components:
```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-blue-600">
    Hello World
  </Text>
</View>
```

### **Theme Configuration**

Located in `constants/theme.ts`:
- Color palette
- Font sizes
- Spacing
- Border radius
- Shadows

### **Dark Mode Support**

Managed by `contexts/ThemeContext.tsx`:
- Automatic theme switching
- Persistent theme preference
- Themed components

---

## 🔐 Security & Validation

### **Location-Based Check-in**
- 200m radius validation
- GPS accuracy check
- Location permission handling
- Code: `lib/punchValidation.ts`

### **Authentication**
- Token-based auth
- Refresh token mechanism
- Secure storage
- Code: `lib/auth.ts`, `contexts/AuthContext.tsx`

### **Data Validation**
- Input sanitization
- Type checking (TypeScript)
- API response validation

---

## 📱 Navigation Structure

### **Expo Router (File-based)**

Routes are defined by file structure:
- `app/(tabs)/index.tsx` → `/` (Home)
- `app/(auth)/sign-in.tsx` → `/sign-in`
- `app/(Admin)/dashboard.tsx` → `/dashboard`
- `app/Attendance/AttendenceList.tsx` → `/Attendance/AttendenceList`

### **Route Groups**
- `(tabs)` - Tab navigation
- `(auth)` - Auth stack
- `(Admin)` - Admin stack

### **Dynamic Routes**
- `app/(Admin)/employees/[id].tsx` → `/employees/:id`
- `app/(Admin)/tasks/[id].tsx` → `/tasks/:id`

---

## 💡 Pro Tips

1. **Finding a feature**: Use the search in this document or `CODE_MAP.md`
2. **Large files**: The biggest files are usually the most important
3. **API calls**: Always go through `lib/api.ts` for consistency
4. **Testing**: Use the test screens in `app/(auth)/test-*-screen.tsx`
5. **Documentation**: Check the 30+ .md files for detailed info
6. **Debugging**: Use `lib/debugPunchStatus.ts` for attendance debugging
7. **Reset data**: Use `utils/resetData.ts` or `reset-checkin.sh`

---

## 🔗 Related Files

- **CODE_MAP.md** - Comprehensive architecture documentation
- **FILE_STRUCTURE.md** - Detailed file structure
- **README.md** - Project overview and setup
- **ARCHITECTURE_DIAGRAM.md** - Visual architecture

---

**Last Updated**: January 2026
**Total Files**: 172 TypeScript files
**Project Type**: React Native + Expo Mobile App
