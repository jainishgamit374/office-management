# 📊 Office Management System - Complete Code Map

## 🎯 Quick Stats

| Metric | Count |
|--------|-------|
| **Total TypeScript Files** | 172 |
| **Screen Components** | 50 |
| **Reusable Components** | 53 |
| **API Modules** | 33 |
| **Test Files** | 13+ |
| **Documentation Files** | 30+ |

---

## 📁 Complete Folder Structure

```
office-management-main/
│
├── 📱 app/ (50 files) - Application Screens
│   │
│   ├── (Admin)/ - Admin Dashboard & Management
│   │   ├── dashboard.tsx
│   │   ├── employeereport.tsx
│   │   ├── profile.tsx
│   │   ├── employees/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   └── tasks/
│   │       ├── index.tsx
│   │       ├── create.tsx
│   │       └── [id].tsx
│   │
│   ├── (auth)/ - Authentication
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── forgotpass.tsx
│   │   ├── test-api-screen.tsx
│   │   └── test-late-early-screen.tsx
│   │
│   ├── (tabs)/ - Main Navigation
│   │   ├── index.tsx (Home)
│   │   ├── explore.tsx
│   │   ├── profile.tsx
│   │   └── _layout.tsx
│   │
│   ├── Attendance/ - Attendance Management
│   │   ├── AttendenceList.tsx
│   │   ├── LeaveCalender.tsx
│   │   ├── LeaveApprovalList.tsx
│   │   ├── MissPunchList.tsx
│   │   ├── MissPunchDetails.tsx
│   │   ├── IsAwayList.tsx
│   │   ├── Wfhlist.tsx
│   │   ├── EarlyCheckoutList.tsx
│   │   ├── AbsenceList.tsx
│   │   └── _layout.tsx
│   │
│   ├── Requests/ - Employee Requests
│   │   ├── Leaveapplyreq.tsx
│   │   ├── Wfhapplyreq.tsx
│   │   ├── Misspunchreq.tsx
│   │   ├── Earlycheckoutreq.tsx
│   │   └── _layout.tsx
│   │
│   ├── ViewAllRequest/ - View All Requests
│   │   ├── LeaveApplication.tsx
│   │   ├── Wfhrequest.tsx
│   │   ├── ViewAllMisspunch.tsx
│   │   ├── EarlyCheckout.tsx
│   │   └── _layout.tsx
│   │
│   ├── Resources/ - HR Resources
│   │   ├── HrPolicies.tsx
│   │   ├── TeamDirectory.tsx
│   │   └── _layout.tsx
│   │
│   ├── Support/ - Help & Support
│   │   ├── Helpandfaq.tsx
│   │   ├── About.tsx
│   │   └── _layout.tsx
│   │
│   ├── approvals/ - Approval Workflows
│   │   ├── dashboard.tsx
│   │   ├── approve-all.tsx
│   │   └── history.tsx
│   │
│   ├── edit-profile.tsx
│   └── _layout.tsx
│
├── 🧩 components/ (53 files) - Reusable Components
│   │
│   ├── Home/ (21 files) - Home Screen Components
│   │   ├── CheckInCard.tsx ⭐ (38KB)
│   │   ├── AttendanceTrackingCards.tsx (37KB)
│   │   ├── AttendanceIrregularities.tsx (25KB)
│   │   ├── MissedPunchSection.tsx (18KB)
│   │   ├── UpcomingLeaves.tsx (14KB)
│   │   ├── PendingRequestsSection.tsx (12KB)
│   │   ├── UpcomingWFHs.tsx (10KB)
│   │   ├── EarlyCheckouts.tsx (9KB)
│   │   ├── LateArrivals.tsx (9KB)
│   │   ├── LeaveBalanceSection.tsx (8KB)
│   │   ├── AllBirthdays.tsx (7KB)
│   │   ├── NotificationCard.tsx (7KB)
│   │   ├── HomeScreen.tsx (6KB)
│   │   ├── EmployeesWFHToday.tsx (6KB)
│   │   ├── EmployeesOnLeaveToday.tsx (6KB)
│   │   ├── Checkoutdets.tsx (5KB)
│   │   ├── EmployeeOfTheMonthSection.tsx (4KB)
│   │   ├── NotificationBanner.tsx (3KB)
│   │   ├── InfoSection.tsx (2KB)
│   │   ├── TaskSection.tsx (1KB)
│   │   └── GreetingSection.tsx (1KB)
│   │
│   ├── Admin/ (17 files) - Admin Components
│   │   ├── ApprovalsDashboard.tsx (13KB)
│   │   ├── UpcomingSection.tsx (8KB)
│   │   ├── AdminToolsSection.tsx (7KB)
│   │   ├── ApprovalHistoryList.tsx (6KB)
│   │   ├── EmployeePerformanceCard.tsx (6KB)
│   │   ├── BirthdaysSection.tsx (4KB)
│   │   ├── ApprovalCard.tsx (4KB)
│   │   ├── DashboardHeader.tsx (4KB)
│   │   ├── PerformanceStatsHeader.tsx (3KB)
│   │   ├── QuickStatsSection.tsx (3KB)
│   │   ├── ApprovalHistoryModal.tsx (3KB)
│   │   ├── QuickStatsCard.tsx (2KB)
│   │   ├── BirthdayCard.tsx (2KB)
│   │   ├── ApprovalsSection.tsx (2KB)
│   │   ├── DashboardInfoCard.tsx (2KB)
│   │   ├── UpcomingCard.tsx (2KB)
│   │   └── EmployeeListItem.tsx (1KB)
│   │
│   ├── Attendance/
│   │   └── PunchButton.tsx
│   │
│   ├── Leaves/
│   │   └── LeaveDataView.tsx
│   │
│   ├── Employee/
│   │   └── (employee components)
│   │
│   ├── Navigation/
│   │   └── (navigation components)
│   │
│   ├── Dev/
│   │   └── (dev tools)
│   │
│   ├── CustomModal.tsx (9KB)
│   ├── Custominputs.tsx (2KB)
│   ├── QuickTestButton.tsx (1KB)
│   ├── parallax-scroll-view.tsx (2KB)
│   ├── themed-text.tsx (1KB)
│   ├── themed-view.tsx (0.5KB)
│   ├── haptic-tab.tsx (0.5KB)
│   ├── hello-wave.tsx (0.4KB)
│   └── external-link.tsx (0.8KB)
│
├── 📚 lib/ (33 files) - API & Business Logic
│   ├── api.ts ⭐ (40KB) - Main API Client
│   ├── attendance.ts (26KB) - Attendance APIs
│   ├── leaves.ts (22KB) - Leave Management
│   ├── auth.ts (21KB) - Authentication
│   ├── adminApi.ts (13KB) - Admin APIs
│   ├── localAttendance.ts (12KB) - Offline Attendance
│   ├── calendarEvents.ts (10KB) - Calendar Events
│   ├── attendanceStorage.ts (8KB) - Local Storage
│   ├── dailyEvents.ts (8KB) - Daily Events
│   ├── missPunchList.ts (7KB) - Miss Punch APIs
│   ├── earlyLatePunch.ts (7KB) - Late/Early APIs
│   ├── employeeAttendance.ts (7KB) - Employee Attendance
│   ├── workflow.ts (7KB) - Workflow APIs
│   ├── indianHolidays.ts (4KB) - Holiday Data
│   ├── wfhApprovalHistory.ts (4KB) - WFH Approvals
│   ├── isAwayList.ts (3KB) - Is Away APIs
│   ├── calendarApi.ts (3KB) - Calendar APIs
│   ├── test-api.ts (3KB) - API Testing
│   ├── punchValidation.ts (3KB) - Validation
│   ├── employeeId.ts (2KB) - Employee ID Utils
│   ├── attendanceIrregularities.ts (2KB)
│   ├── earlyCheckoutList.ts (2KB)
│   ├── leaveApprovalList.ts (2KB)
│   ├── employees.ts (2KB)
│   ├── tasks.ts (2KB)
│   ├── wfhList.ts (2KB)
│   ├── todayLeaves.ts (2KB)
│   ├── timezone.ts (2KB)
│   ├── dateUtils.ts (2KB)
│   ├── missCheckout.ts (2KB)
│   ├── user.ts (1KB)
│   ├── debugPunchStatus.ts (1KB)
│   ├── appwrite.ts (3KB)
│   └── examples/
│
├── 🎨 contexts/ (2 files) - Global State
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── 🔧 hooks/ - Custom React Hooks
│   └── (custom hooks)
│
├── 🎯 constants/ (2 files) - Configuration
│   ├── theme.ts
│   └── TabBarContext.tsx
│
├── 🛠️ utils/ (2 files) - Utilities
│   ├── themeStyles.ts
│   └── resetData.ts
│
├── 🧪 __tests__/ - Test Files
│   ├── api/
│   │   ├── attendance/
│   │   ├── auth/
│   │   └── leaves/
│   └── utils/
│
├── 📖 docs/ - Documentation
│   └── (9 documentation files)
│
├── 🖼️ assets/ - Static Assets
│   └── images/
│
├── 📜 scripts/ - Build Scripts
│   └── (build scripts)
│
├── 📝 Root Test Files
│   ├── test-all-apis.ts (23KB)
│   ├── api_test_suite.ts (18KB)
│   ├── test-late-early-apis.ts (10KB)
│   ├── test-attendance-endpoints.ts (6KB)
│   ├── test-api-integrations.ts (4KB)
│   ├── test-attendance-logic.ts (3KB)
│   ├── test-attendance-storage.ts (3KB)
│   ├── test-attendance-api.ts (2KB)
│   ├── test-api-integration.ts (2KB)
│   └── test-leave-data-view.ts (1KB)
│
├── 📋 Configuration Files
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── app.json
│   ├── eas.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── tailwind.config.js
│   ├── jest.config.js
│   ├── eslint.config.js
│   ├── .env
│   ├── .env.test
│   ├── .gitignore
│   ├── expo-env.d.ts
│   ├── nativewind-env.d.ts
│   ├── type.d.ts
│   └── global.css
│
├── 📚 Documentation Files (30+)
│   ├── README.md
│   ├── CODE_MAP.md ⭐ (This file)
│   ├── QUICK_REFERENCE.md
│   ├── FILE_STRUCTURE.md
│   ├── ARCHITECTURE_DIAGRAM.md
│   ├── COMPREHENSIVE_TESTING_GUIDE.md
│   ├── API_TESTING_README.md
│   ├── SLIDER_RESET_FIX_SUMMARY.md
│   ├── LATE_EARLY_HISTORY_FEATURE.md
│   ├── LEAVE_APPLICATION_DOCS.md
│   ├── MISS_PUNCH_INTEGRATION.md
│   ├── ATTENDANCE_LIST_DOCS.md
│   ├── LOCATION_RESTRICTION_200M.md
│   ├── CURRENT_API_ENDPOINTS.md
│   ├── HR_FUNCTIONS_API_GUIDE.md
│   └── (20+ more documentation files)
│
└── 🔧 Utility Scripts
    └── reset-checkin.sh
```

---

## 🔑 Top 20 Most Important Files

| Rank | File | Size | Purpose |
|------|------|------|---------|
| 1 | `lib/api.ts` | 40KB | Main API client |
| 2 | `components/Home/CheckInCard.tsx` | 38KB | Check-in/out interface |
| 3 | `components/Home/AttendanceTrackingCards.tsx` | 37KB | Attendance stats |
| 4 | `lib/attendance.ts` | 26KB | Attendance APIs |
| 5 | `components/Home/AttendanceIrregularities.tsx` | 25KB | Irregularities |
| 6 | `test-all-apis.ts` | 23KB | API test suite |
| 7 | `lib/leaves.ts` | 22KB | Leave management |
| 8 | `lib/auth.ts` | 21KB | Authentication |
| 9 | `api_test_suite.ts` | 18KB | API tests |
| 10 | `components/Home/MissedPunchSection.tsx` | 18KB | Missed punch UI |
| 11 | `components/Home/UpcomingLeaves.tsx` | 14KB | Upcoming leaves |
| 12 | `lib/adminApi.ts` | 13KB | Admin APIs |
| 13 | `components/Admin/ApprovalsDashboard.tsx` | 13KB | Approvals |
| 14 | `components/Home/PendingRequestsSection.tsx` | 12KB | Pending requests |
| 15 | `lib/localAttendance.ts` | 12KB | Offline attendance |
| 16 | `test-late-early-apis.ts` | 10KB | Late/early tests |
| 17 | `lib/calendarEvents.ts` | 10KB | Calendar events |
| 18 | `components/Home/UpcomingWFHs.tsx` | 10KB | Upcoming WFH |
| 19 | `components/CustomModal.tsx` | 9KB | Custom modal |
| 20 | `components/Home/EarlyCheckouts.tsx` | 9KB | Early checkouts |

---

## 🎯 Feature-to-File Mapping

### **Attendance Management**

#### Check-In/Out
- **UI**: `components/Home/CheckInCard.tsx` (38KB)
- **API**: `lib/attendance.ts` (26KB)
- **Storage**: `lib/attendanceStorage.ts` (8KB)
- **Offline**: `lib/localAttendance.ts` (12KB)
- **Validation**: `lib/punchValidation.ts` (3KB)

#### Attendance Tracking
- **Stats Cards**: `components/Home/AttendanceTrackingCards.tsx` (37KB)
- **List View**: `app/Attendance/AttendenceList.tsx`
- **Employee Attendance**: `lib/employeeAttendance.ts` (7KB)

#### Irregularities
- **UI**: `components/Home/AttendanceIrregularities.tsx` (25KB)
- **API**: `lib/attendanceIrregularities.ts` (2KB)
- **Late/Early**: `lib/earlyLatePunch.ts` (7KB)
- **Miss Punch**: `lib/missPunchList.ts` (7KB)

### **Leave Management**

#### Leave Application
- **API**: `lib/leaves.ts` (22KB)
- **Form**: `app/Requests/Leaveapplyreq.tsx`
- **Data View**: `components/Leaves/LeaveDataView.tsx`
- **Balance**: `components/Home/LeaveBalanceSection.tsx` (8KB)

#### Leave Approvals
- **List**: `app/Attendance/LeaveApprovalList.tsx`
- **API**: `lib/leaveApprovalList.ts` (2KB)
- **Calendar**: `app/Attendance/LeaveCalender.tsx`

#### Leave Display
- **Today's Leaves**: `components/Home/EmployeesOnLeaveToday.tsx` (6KB)
- **Upcoming**: `components/Home/UpcomingLeaves.tsx` (14KB)
- **Today API**: `lib/todayLeaves.ts` (2KB)

### **WFH (Work From Home)**

- **API**: `lib/wfhList.ts` (2KB)
- **Application**: `app/Requests/Wfhapplyreq.tsx`
- **List**: `app/Attendance/Wfhlist.tsx`
- **Today's WFH**: `components/Home/EmployeesWFHToday.tsx` (6KB)
- **Upcoming**: `components/Home/UpcomingWFHs.tsx` (10KB)
- **Approvals**: `lib/wfhApprovalHistory.ts` (4KB)

### **Admin Dashboard**

- **Main Dashboard**: `app/(Admin)/dashboard.tsx`
- **Approvals**: `components/Admin/ApprovalsDashboard.tsx` (13KB)
- **Tools**: `components/Admin/AdminToolsSection.tsx` (7KB)
- **API**: `lib/adminApi.ts` (13KB)
- **Reports**: `app/(Admin)/employeereport.tsx`

### **Authentication**

- **Login**: `app/(auth)/sign-in.tsx`
- **Signup**: `app/(auth)/sign-up.tsx`
- **Password Reset**: `app/(auth)/forgotpass.tsx`
- **API**: `lib/auth.ts` (21KB)
- **Context**: `contexts/AuthContext.tsx`

### **Notifications**

- **Card**: `components/Home/NotificationCard.tsx` (7KB)
- **Banner**: `components/Home/NotificationBanner.tsx` (3KB)
- **Daily Events**: `lib/dailyEvents.ts` (8KB)
- **Birthdays**: `components/Home/AllBirthdays.tsx` (7KB)

### **Calendar & Events**

- **Calendar API**: `lib/calendarApi.ts` (3KB)
- **Events**: `lib/calendarEvents.ts` (10KB)
- **Daily Events**: `lib/dailyEvents.ts` (8KB)
- **Holidays**: `lib/indianHolidays.ts` (4KB)
- **Leave Calendar**: `app/Attendance/LeaveCalender.tsx`

---

## 🔄 Data Flow Architecture

### **Authentication Flow**
```
User Input (sign-in.tsx)
    ↓
lib/auth.ts (API call)
    ↓
Backend API
    ↓
AuthContext (global state)
    ↓
Protected Routes (enabled/disabled)
```

### **Attendance Check-In Flow**
```
CheckInCard.tsx (user swipes)
    ↓
lib/attendance.ts (punchIn API)
    ↓
Backend API
    ↓
lib/attendanceStorage.ts (cache locally)
    ↓
Update UI (punchInTime, workingHours)
    ↓
AttendanceTrackingCards.tsx (update stats)
```

### **Leave Application Flow**
```
Leaveapplyreq.tsx (form submission)
    ↓
lib/leaves.ts (applyLeave API)
    ↓
Backend API
    ↓
PendingRequestsSection.tsx (show pending)
    ↓
Admin Dashboard (approval)
    ↓
LeaveApprovalList.tsx (approve/reject)
    ↓
Update leave balance
```

### **Approval Flow**
```
Request Submission
    ↓
API Call (lib/[feature].ts)
    ↓
Backend Storage
    ↓
Admin Dashboard (components/Admin/ApprovalsDashboard.tsx)
    ↓
Approval Action (approve/reject)
    ↓
Update Request Status
    ↓
Notify User
```

---

## 🧪 Testing Infrastructure

### **Test Files by Category**

#### API Tests
- `test-all-apis.ts` (23KB) - Comprehensive API tests
- `api_test_suite.ts` (18KB) - API test suite
- `test-late-early-apis.ts` (10KB) - Late/early punch tests
- `test-attendance-endpoints.ts` (6KB) - Attendance endpoints
- `test-api-integrations.ts` (4KB) - Integration tests
- `test-api-integration.ts` (2KB) - API integration

#### Feature Tests
- `test-attendance-logic.ts` (3KB) - Attendance logic
- `test-attendance-storage.ts` (3KB) - Storage tests
- `test-attendance-api.ts` (2KB) - Attendance API
- `test-leave-data-view.ts` (1KB) - Leave data

#### Test Screens
- `app/(auth)/test-api-screen.tsx` - API testing UI
- `app/(auth)/test-late-early-screen.tsx` - Late/early testing UI

#### Unit Tests
- `__tests__/api/attendance/` - Attendance tests
- `__tests__/api/auth/` - Auth tests
- `__tests__/api/leaves/` - Leave tests
- `__tests__/utils/` - Utility tests

---

## 📊 Component Statistics

### **Components by Feature**

| Feature | Count | Total Size |
|---------|-------|------------|
| Home Components | 21 | ~200KB |
| Admin Components | 17 | ~80KB |
| Attendance Components | 1 | ~2KB |
| Leave Components | 1 | ~5KB |
| Shared Components | 9 | ~20KB |
| **Total** | **53** | **~307KB** |

### **Screens by Category**

| Category | Count |
|----------|-------|
| Admin Screens | 12 |
| Auth Screens | 6 |
| Tab Screens | 4 |
| Attendance Screens | 11 |
| Request Screens | 5 |
| View Request Screens | 5 |
| Resource Screens | 3 |
| Support Screens | 3 |
| Approval Screens | 3 |
| **Total** | **50** |

### **API Modules by Domain**

| Domain | Count |
|--------|-------|
| Attendance | 8 |
| Leave Management | 3 |
| WFH | 3 |
| Authentication | 3 |
| Admin | 3 |
| Calendar/Events | 4 |
| Utilities | 9 |
| **Total** | **33** |

---

## 🎨 Technology Stack

### **Core Technologies**
- **Framework**: React Native
- **Platform**: Expo (SDK 51+)
- **Language**: TypeScript
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind CSS for RN)

### **State Management**
- React Context API
- AsyncStorage (local persistence)

### **Key Libraries**
- `@react-navigation` - Navigation
- `expo-location` - GPS/Location
- `expo-notifications` - Push notifications
- `expo-image-picker` - Image selection
- Various Expo modules

### **Development Tools**
- Jest - Testing
- ESLint - Linting
- TypeScript - Type checking
- EAS Build - Building & deployment

---

## 🔐 Security Features

### **Authentication**
- Token-based authentication
- Refresh token mechanism
- Secure token storage
- Session management

### **Location Validation**
- 200m radius check for punch in/out
- GPS accuracy validation
- Location permission handling
- Fallback mechanisms

### **Data Protection**
- Local data encryption
- Secure API communication
- Input validation
- XSS protection

---

## 📱 Navigation Structure

```
Root Layout (_layout.tsx)
│
├── (auth) Stack - Authentication
│   ├── /sign-in
│   ├── /sign-up
│   ├── /forgotpass
│   └── /test-* (testing screens)
│
├── (tabs) Stack - Main App
│   ├── / (Home - index.tsx)
│   ├── /explore
│   └── /profile
│
├── (Admin) Stack - Admin Features
│   ├── /dashboard
│   ├── /employeereport
│   ├── /employees
│   │   ├── /employees (list)
│   │   └── /employees/[id] (details)
│   └── /tasks
│       ├── /tasks (list)
│       ├── /tasks/create
│       └── /tasks/[id] (details)
│
├── Attendance Stack
│   ├── /Attendance/AttendenceList
│   ├── /Attendance/LeaveCalender
│   ├── /Attendance/LeaveApprovalList
│   ├── /Attendance/MissPunchList
│   └── (8 more attendance screens)
│
├── Requests Stack
│   ├── /Requests/Leaveapplyreq
│   ├── /Requests/Wfhapplyreq
│   ├── /Requests/Misspunchreq
│   └── /Requests/Earlycheckoutreq
│
├── ViewAllRequest Stack
│   ├── /ViewAllRequest/LeaveApplication
│   ├── /ViewAllRequest/Wfhrequest
│   └── (3 more view screens)
│
├── Resources Stack
│   ├── /Resources/HrPolicies
│   └── /Resources/TeamDirectory
│
├── Support Stack
│   ├── /Support/Helpandfaq
│   └── /Support/About
│
├── Approvals Stack
│   ├── /approvals/dashboard
│   ├── /approvals/approve-all
│   └── /approvals/history
│
└── Standalone Screens
    └── /edit-profile
```

---

## 💡 Development Guidelines

### **File Naming Conventions**
- **Screens**: PascalCase (e.g., `AttendenceList.tsx`)
- **Components**: PascalCase (e.g., `CheckInCard.tsx`)
- **API Modules**: camelCase (e.g., `attendance.ts`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Types**: PascalCase (e.g., `type.d.ts`)

### **Code Organization**
- Group related files by feature
- Keep components small and focused
- Separate business logic from UI
- Use TypeScript for type safety
- Follow React best practices

### **API Integration**
- All API calls go through `lib/api.ts`
- Use dedicated API modules for features
- Implement error handling
- Cache responses when appropriate
- Support offline mode

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Testing
npm test
npm run test:api

# Build for production
eas build --platform android
eas build --platform ios

# Utilities
./reset-checkin.sh  # Reset check-in data
```

---

## 📚 Documentation Index

### **Main Documentation**
1. **CODE_MAP.md** (this file) - Complete code map
2. **QUICK_REFERENCE.md** - Quick reference guide
3. **README.md** - Project overview
4. **FILE_STRUCTURE.md** - Detailed file structure
5. **ARCHITECTURE_DIAGRAM.md** - Architecture details

### **Feature Documentation**
- **SLIDER_RESET_FIX_SUMMARY.md** - Slider reset fix
- **LATE_EARLY_HISTORY_FEATURE.md** - Late/early history
- **LEAVE_APPLICATION_DOCS.md** - Leave application
- **MISS_PUNCH_INTEGRATION.md** - Miss punch feature
- **ATTENDANCE_LIST_DOCS.md** - Attendance list
- **LOCATION_RESTRICTION_200M.md** - Location validation

### **API Documentation**
- **CURRENT_API_ENDPOINTS.md** - All API endpoints
- **API_TESTING_README.md** - API testing guide
- **HR_FUNCTIONS_API_GUIDE.md** - HR functions
- **LEAVE_DATA_VIEW_API.md** - Leave data APIs
- **MISS_PUNCH_API_GUIDE.md** - Miss punch APIs

### **Testing Documentation**
- **COMPREHENSIVE_TESTING_GUIDE.md** - Complete testing guide
- **API_TESTING_SUMMARY.md** - API testing summary
- **TESTING_GUIDE.md** - General testing guide
- **QUICK_START_TESTING.md** - Quick start testing

---

## 🎯 Key Insights

### **Largest Components**
The largest components indicate the most complex features:
1. **CheckInCard.tsx** (38KB) - Most complex UI component
2. **AttendanceTrackingCards.tsx** (37KB) - Complex stats display
3. **AttendanceIrregularities.tsx** (25KB) - Multiple irregularity types

### **Largest API Modules**
The largest API modules handle the most business logic:
1. **api.ts** (40KB) - Main API client with all base functionality
2. **attendance.ts** (26KB) - Comprehensive attendance management
3. **leaves.ts** (22KB) - Complete leave management system
4. **auth.ts** (21KB) - Full authentication system

### **Most Documented Features**
Based on documentation file count:
1. Attendance management (10+ docs)
2. API testing (5+ docs)
3. Leave management (4+ docs)
4. Slider/check-in fixes (3+ docs)

---

## 📈 Project Metrics

### **Code Distribution**
- **Screens (app/)**: 29% of codebase
- **Components**: 31% of codebase
- **API/Logic (lib/)**: 19% of codebase
- **Tests**: 8% of codebase
- **Config/Utils**: 13% of codebase

### **Feature Complexity** (by file size)
1. **Attendance**: ~150KB (most complex)
2. **Leave Management**: ~80KB
3. **Admin Dashboard**: ~70KB
4. **Authentication**: ~50KB
5. **WFH**: ~40KB

---

## 🔗 Related Resources

- **Visual Diagrams**: See generated architecture and folder structure images
- **Component Map**: See component hierarchy diagram
- **API Endpoints**: Check `CURRENT_API_ENDPOINTS.md`
- **Testing Guide**: Check `COMPREHENSIVE_TESTING_GUIDE.md`

---

**Created**: January 2026  
**Last Updated**: January 13, 2026  
**Version**: 1.0  
**Total Files Analyzed**: 172 TypeScript files  
**Total Documentation**: 30+ markdown files  
**Project Type**: React Native + Expo Mobile Application
