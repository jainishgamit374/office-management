# Office Management System - Code Map & Architecture

## 📋 Project Overview
This is a **React Native Expo** application for office management with attendance tracking, leave management, WFH requests, and admin functionalities.

---

## 🗂️ Folder Structure

```
office-management-main/
├── 📱 app/                          # Main application screens (Expo Router)
│   ├── (Admin)/                     # Admin-specific screens
│   │   ├── dashboard.tsx            # Admin dashboard
│   │   ├── employeereport.tsx       # Employee reports
│   │   ├── profile.tsx              # Admin profile
│   │   ├── employees/               # Employee management
│   │   │   ├── index.tsx            # Employee list
│   │   │   └── [id].tsx             # Employee details (dynamic route)
│   │   └── tasks/                   # Task management
│   │       ├── index.tsx            # Task list
│   │       ├── create.tsx           # Create task
│   │       └── [id].tsx             # Task details (dynamic route)
│   │
│   ├── (auth)/                      # Authentication screens
│   │   ├── sign-in.tsx              # Login screen
│   │   ├── sign-up.tsx              # Registration screen
│   │   ├── forgotpass.tsx           # Password recovery
│   │   ├── test-api-screen.tsx      # API testing screen
│   │   └── test-late-early-screen.tsx # Late/early testing screen
│   │
│   ├── (tabs)/                      # Main tab navigation
│   │   ├── index.tsx                # Home tab
│   │   ├── explore.tsx              # Explore tab
│   │   ├── profile.tsx              # Profile tab
│   │   └── _layout.tsx              # Tab layout configuration
│   │
│   ├── Attendance/                  # Attendance management
│   │   ├── AttendenceList.tsx       # Attendance list/dashboard
│   │   ├── LeaveCalender.tsx        # Leave calendar view
│   │   ├── LeaveApprovalList.tsx    # Leave approvals
│   │   ├── MissPunchList.tsx        # Miss punch requests
│   │   ├── MissPunchDetails.tsx     # Miss punch details
│   │   ├── IsAwayList.tsx           # Is Away status list
│   │   ├── Wfhlist.tsx              # WFH list
│   │   ├── EarlyCheckoutList.tsx    # Early checkout list
│   │   └── AbsenceList.tsx          # Absence tracking
│   │
│   ├── Requests/                    # Employee request screens
│   │   ├── Leaveapplyreq.tsx        # Leave application
│   │   ├── Wfhapplyreq.tsx          # WFH application
│   │   ├── Misspunchreq.tsx         # Miss punch request
│   │   └── Earlycheckoutreq.tsx     # Early checkout request
│   │
│   ├── ViewAllRequest/              # View all requests
│   │   ├── LeaveApplication.tsx     # All leave applications
│   │   ├── Wfhrequest.tsx           # All WFH requests
│   │   ├── ViewAllMisspunch.tsx     # All miss punch requests
│   │   └── EarlyCheckout.tsx        # All early checkout requests
│   │
│   ├── Resources/                   # Resource screens
│   │   ├── HrPolicies.tsx           # HR policies
│   │   └── TeamDirectory.tsx        # Team directory
│   │
│   ├── Support/                     # Support screens
│   │   ├── Helpandfaq.tsx           # Help & FAQ
│   │   └── About.tsx                # About screen
│   │
│   ├── approvals/                   # Approval workflows
│   │   ├── dashboard.tsx            # Approvals dashboard
│   │   ├── approve-all.tsx          # Bulk approve
│   │   └── history.tsx              # Approval history
│   │
│   ├── edit-profile.tsx             # Profile editing
│   └── _layout.tsx                  # Root layout
│
├── 🧩 components/                   # Reusable components
│   ├── Home/                        # Home screen components
│   │   ├── CheckInCard.tsx          # Check-in/out card with slider
│   │   ├── AttendanceTrackingCards.tsx # Attendance stats cards
│   │   ├── AttendanceIrregularities.tsx # Irregularities display
│   │   ├── GreetingSection.tsx      # User greeting
│   │   ├── LeaveBalanceSection.tsx  # Leave balance display
│   │   ├── PendingRequestsSection.tsx # Pending requests
│   │   ├── NotificationCard.tsx     # Notifications
│   │   ├── NotificationBanner.tsx   # Notification banner
│   │   ├── MissedPunchSection.tsx   # Missed punch display
│   │   ├── EmployeesOnLeaveToday.tsx # Today's leaves
│   │   ├── EmployeesWFHToday.tsx    # Today's WFH
│   │   ├── LateArrivals.tsx         # Late arrivals list
│   │   ├── EarlyCheckouts.tsx       # Early checkouts list
│   │   ├── UpcomingLeaves.tsx       # Upcoming leaves
│   │   ├── UpcomingWFHs.tsx         # Upcoming WFH
│   │   ├── AllBirthdays.tsx         # Birthday list
│   │   ├── EmployeeOfTheMonthSection.tsx # EOTM display
│   │   ├── TaskSection.tsx          # Task display
│   │   ├── InfoSection.tsx          # Info cards
│   │   ├── Checkoutdets.tsx         # Checkout details
│   │   └── HomeScreen.tsx           # Main home screen
│   │
│   ├── Admin/                       # Admin components
│   │   ├── ApprovalsDashboard.tsx   # Approvals dashboard
│   │   ├── AdminToolsSection.tsx    # Admin tools
│   │   ├── DashboardHeader.tsx      # Dashboard header
│   │   ├── DashboardInfoCard.tsx    # Info cards
│   │   ├── QuickStatsSection.tsx    # Quick stats
│   │   ├── QuickStatsCard.tsx       # Stats card
│   │   ├── ApprovalsSection.tsx     # Approvals section
│   │   ├── ApprovalCard.tsx         # Approval card
│   │   ├── ApprovalHistoryList.tsx  # History list
│   │   ├── ApprovalHistoryModal.tsx # History modal
│   │   ├── BirthdaysSection.tsx     # Birthdays section
│   │   ├── BirthdayCard.tsx         # Birthday card
│   │   ├── UpcomingSection.tsx      # Upcoming events
│   │   ├── UpcomingCard.tsx         # Upcoming card
│   │   ├── EmployeePerformanceCard.tsx # Performance card
│   │   ├── PerformanceStatsHeader.tsx # Performance header
│   │   └── EmployeeListItem.tsx     # Employee list item
│   │
│   ├── Attendance/                  # Attendance components
│   │   └── PunchButton.tsx          # Punch in/out button
│   │
│   ├── Leaves/                      # Leave components
│   │   └── LeaveDataView.tsx        # Leave data view
│   │
│   ├── Employee/                    # Employee components
│   │   └── (employee-specific components)
│   │
│   ├── Navigation/                  # Navigation components
│   │   └── (navigation components)
│   │
│   ├── CustomModal.tsx              # Custom modal component
│   ├── Custominputs.tsx             # Custom input components
│   ├── QuickTestButton.tsx          # Quick test button
│   ├── themed-text.tsx              # Themed text component
│   ├── themed-view.tsx              # Themed view component
│   ├── parallax-scroll-view.tsx     # Parallax scroll view
│   ├── hello-wave.tsx               # Wave animation
│   ├── haptic-tab.tsx               # Haptic feedback tab
│   └── external-link.tsx            # External link component
│
├── 📚 lib/                          # API & utility libraries
│   ├── api.ts                       # Main API client (40KB - core API)
│   ├── auth.ts                      # Authentication APIs
│   ├── attendance.ts                # Attendance APIs
│   ├── attendanceStorage.ts         # Local attendance storage
│   ├── attendanceIrregularities.ts  # Irregularities APIs
│   ├── leaves.ts                    # Leave management APIs
│   ├── leaveApprovalList.ts         # Leave approval APIs
│   ├── missPunchList.ts             # Miss punch APIs
│   ├── earlyCheckoutList.ts         # Early checkout APIs
│   ├── earlyLatePunch.ts            # Late/early punch APIs
│   ├── wfhList.ts                   # WFH APIs
│   ├── wfhApprovalHistory.ts        # WFH approval history
│   ├── isAwayList.ts                # Is Away APIs
│   ├── employeeAttendance.ts        # Employee attendance APIs
│   ├── employees.ts                 # Employee management APIs
│   ├── adminApi.ts                  # Admin-specific APIs
│   ├── tasks.ts                     # Task management APIs
│   ├── user.ts                      # User APIs
│   ├── employeeId.ts                # Employee ID utilities
│   ├── workflow.ts                  # Workflow APIs
│   ├── calendarApi.ts               # Calendar APIs
│   ├── calendarEvents.ts            # Calendar events
│   ├── dailyEvents.ts               # Daily events
│   ├── indianHolidays.ts            # Indian holidays data
│   ├── todayLeaves.ts               # Today's leaves
│   ├── localAttendance.ts           # Local attendance logic
│   ├── missCheckout.ts              # Miss checkout logic
│   ├── punchValidation.ts           # Punch validation
│   ├── dateUtils.ts                 # Date utilities
│   ├── timezone.ts                  # Timezone utilities
│   ├── debugPunchStatus.ts          # Debug utilities
│   ├── test-api.ts                  # API testing utilities
│   ├── appwrite.ts                  # Appwrite configuration
│   └── examples/                    # Example code
│
├── 🎨 contexts/                     # React contexts
│   ├── AuthContext.tsx              # Authentication context
│   └── ThemeContext.tsx             # Theme context
│
├── 🔧 hooks/                        # Custom React hooks
│   └── (custom hooks)
│
├── 🎯 constants/                    # Constants & configuration
│   ├── theme.ts                     # Theme configuration
│   └── TabBarContext.tsx            # Tab bar context
│
├── 🛠️ utils/                        # Utility functions
│   ├── themeStyles.ts               # Theme styling utilities
│   └── resetData.ts                 # Data reset utilities
│
├── 🧪 __tests__/                    # Test files
│   ├── api/                         # API tests
│   │   ├── attendance/              # Attendance API tests
│   │   ├── auth/                    # Auth API tests
│   │   └── leaves/                  # Leaves API tests
│   └── utils/                       # Utility tests
│
├── 📖 docs/                         # Documentation
│   └── (various documentation files)
│
├── 🖼️ assets/                       # Static assets
│   └── images/                      # Image assets
│
├── 📜 scripts/                      # Build & utility scripts
│   └── (scripts)
│
├── 📝 Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript configuration
│   ├── app.json                     # Expo configuration
│   ├── eas.json                     # EAS Build configuration
│   ├── babel.config.js              # Babel configuration
│   ├── metro.config.js              # Metro bundler config
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── jest.config.js               # Jest testing config
│   ├── eslint.config.js             # ESLint configuration
│   └── .env                         # Environment variables
│
└── 📊 Test & Debug Files
    ├── test-all-apis.ts             # Comprehensive API tests
    ├── test-late-early-apis.ts      # Late/early API tests
    ├── test-attendance-api.ts       # Attendance API tests
    ├── test-attendance-endpoints.ts # Attendance endpoint tests
    ├── test-attendance-logic.ts     # Attendance logic tests
    ├── test-attendance-storage.ts   # Storage tests
    ├── test-api-integration.ts      # Integration tests
    ├── test-api-integrations.ts     # API integration tests
    ├── test-leave-data-view.ts      # Leave data tests
    ├── api_test_suite.ts            # API test suite
    └── reset-checkin.sh             # Reset check-in script
```

---

## 🏗️ Architecture Overview

### **Technology Stack**
- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API
- **Testing**: Jest
- **Build**: EAS Build

### **Key Architectural Patterns**

#### 1. **File-Based Routing** (Expo Router)
- Routes are defined by file structure in `app/` directory
- `(tabs)` = Tab navigation group
- `(auth)` = Authentication group
- `(Admin)` = Admin-only routes
- `[id]` = Dynamic route parameters

#### 2. **Component Organization**
- **Feature-based**: Components grouped by feature (Home, Admin, Attendance, etc.)
- **Reusable**: Shared components in root of `components/`
- **Themed**: Themed components for consistent styling

#### 3. **API Layer** (`lib/`)
- Centralized API calls
- Separated by domain (auth, attendance, leaves, etc.)
- Local storage for offline support
- Validation and error handling

#### 4. **Context Providers**
- `AuthContext`: User authentication state
- `ThemeContext`: App theme (light/dark mode)
- `TabBarContext`: Tab bar visibility control

---

## 🔑 Core Features & Components

### **1. Attendance Management**
**Key Files:**
- `components/Home/CheckInCard.tsx` - Main check-in/out interface with slider
- `lib/attendance.ts` - Attendance API calls
- `lib/attendanceStorage.ts` - Local storage for attendance data
- `lib/localAttendance.ts` - Offline attendance logic

**Features:**
- Check-in/out with slider interface
- Location-based validation (200m radius)
- Offline support with local storage
- Auto-checkout at midnight
- Working hours tracking
- Punch status display

### **2. Leave Management**
**Key Files:**
- `lib/leaves.ts` - Leave APIs (22KB - comprehensive)
- `components/Leaves/LeaveDataView.tsx` - Leave data display
- `app/Requests/Leaveapplyreq.tsx` - Leave application form
- `app/Attendance/LeaveApprovalList.tsx` - Approval interface

**Features:**
- Leave application
- Leave balance tracking
- Approval workflow
- Leave calendar
- Half-day support
- Leave history

### **3. WFH (Work From Home)**
**Key Files:**
- `lib/wfhList.ts` - WFH APIs
- `lib/wfhApprovalHistory.ts` - WFH approval history
- `app/Requests/Wfhapplyreq.tsx` - WFH application
- `components/Home/EmployeesWFHToday.tsx` - Today's WFH display

**Features:**
- WFH request submission
- Approval workflow
- WFH calendar
- Today's WFH employees

### **4. Attendance Irregularities**
**Key Files:**
- `components/Home/AttendanceIrregularities.tsx` - Main irregularities display
- `lib/attendanceIrregularities.ts` - Irregularities APIs
- `lib/earlyLatePunch.ts` - Late/early punch handling
- `lib/missPunchList.ts` - Miss punch APIs

**Types:**
- Late check-ins
- Early checkouts
- Missed punches
- Missing punch-outs
- Half days

### **5. Admin Dashboard**
**Key Files:**
- `app/(Admin)/dashboard.tsx` - Main admin dashboard
- `components/Admin/ApprovalsDashboard.tsx` - Approvals interface
- `lib/adminApi.ts` - Admin-specific APIs
- `app/(Admin)/employeereport.tsx` - Employee reports

**Features:**
- Employee management
- Attendance tracking
- Approval workflows
- Performance metrics
- Task management
- Reports generation

### **6. Notifications & Alerts**
**Key Files:**
- `components/Home/NotificationCard.tsx` - Notification display
- `components/Home/NotificationBanner.tsx` - Banner notifications
- `lib/dailyEvents.ts` - Daily event notifications

**Types:**
- Birthdays
- Holidays
- Pending approvals
- Late arrivals
- Early checkouts

---

## 🔄 Data Flow

### **Authentication Flow**
```
sign-in.tsx → lib/auth.ts → AuthContext → Protected Routes
```

### **Attendance Flow**
```
CheckInCard.tsx → lib/attendance.ts → API → attendanceStorage.ts (local cache)
                                    ↓
                            AttendanceTrackingCards.tsx (display)
```

### **Approval Flow**
```
Request Form → lib/[feature].ts → API → Admin Dashboard → Approval Action → Update UI
```

---

## 📡 API Integration

### **Main API Client**: `lib/api.ts` (40KB)
- Base URL configuration
- Request/response interceptors
- Error handling
- Token management

### **Key API Modules**:
1. **Authentication** (`lib/auth.ts`)
   - Login, logout, register
   - Token refresh
   - Password reset

2. **Attendance** (`lib/attendance.ts`)
   - Punch in/out
   - Get punch status
   - Attendance history
   - Working hours calculation

3. **Leaves** (`lib/leaves.ts`)
   - Apply leave
   - Get leave balance
   - Leave approvals
   - Leave history

4. **Admin** (`lib/adminApi.ts`)
   - Employee management
   - Reports
   - Bulk operations
   - Analytics

---

## 🎨 Styling & Theming

### **Styling System**
- **NativeWind**: Tailwind CSS for React Native
- **Theme Context**: Light/dark mode support
- **Themed Components**: `themed-text.tsx`, `themed-view.tsx`

### **Color Scheme**
- Defined in `constants/theme.ts`
- Dynamic theme switching
- Consistent color palette

---

## 🧪 Testing Strategy

### **Test Files**
- Unit tests in `__tests__/`
- API integration tests: `test-all-apis.ts`
- Component tests
- E2E testing capabilities

### **Test Coverage**
- Authentication flows
- Attendance logic
- API integrations
- Storage mechanisms

---

## 📱 Navigation Structure

```
Root (_layout.tsx)
├── (auth) - Authentication Stack
│   ├── sign-in
│   ├── sign-up
│   └── forgotpass
│
├── (tabs) - Main Tab Navigation
│   ├── index (Home)
│   ├── explore
│   └── profile
│
├── (Admin) - Admin Stack
│   ├── dashboard
│   ├── employees
│   └── tasks
│
├── Attendance - Attendance Stack
│   ├── AttendenceList
│   ├── LeaveCalender
│   └── [various attendance screens]
│
├── Requests - Request Stack
│   ├── Leaveapplyreq
│   ├── Wfhapplyreq
│   └── [various request screens]
│
└── [Other feature stacks]
```

---

## 🔐 Security Features

1. **Authentication**: Token-based auth with refresh tokens
2. **Location Validation**: 200m radius check for punch in/out
3. **Offline Support**: Secure local storage
4. **Role-based Access**: Admin vs Employee routes
5. **Data Validation**: Input validation and sanitization

---

## 📊 State Management

### **Global State** (Context API)
- `AuthContext`: User session, authentication status
- `ThemeContext`: App theme preferences
- `TabBarContext`: UI state for tab bar

### **Local State**
- Component-level state with `useState`
- Form state management
- UI interaction state

### **Persistent State**
- AsyncStorage for offline data
- Attendance cache
- User preferences

---

## 🚀 Key Performance Optimizations

1. **Local Caching**: Attendance data cached locally
2. **Lazy Loading**: Dynamic imports for routes
3. **Optimized Re-renders**: React.memo, useMemo, useCallback
4. **Image Optimization**: Optimized asset loading
5. **API Response Caching**: Reduce redundant API calls

---

## 📝 Documentation Files

The project includes extensive documentation:
- `README.md` - Main project documentation
- `FILE_STRUCTURE.md` - Detailed file structure
- `ARCHITECTURE_DIAGRAM.md` - Architecture details
- `API_TESTING_README.md` - API testing guide
- `COMPREHENSIVE_TESTING_GUIDE.md` - Complete testing guide
- Various feature-specific docs (30+ markdown files)

---

## 🔧 Development Workflow

### **Setup**
```bash
npm install
npm start
```

### **Testing**
```bash
npm test
npm run test:api
```

### **Building**
```bash
eas build --platform android
eas build --platform ios
```

---

## 📦 Dependencies

**Key Dependencies** (from `package.json`):
- `expo` - Expo framework
- `react-native` - React Native core
- `nativewind` - Tailwind CSS for RN
- `@react-navigation` - Navigation
- `expo-router` - File-based routing
- Various Expo modules (location, notifications, etc.)

---

## 🎯 Future Enhancements

Based on the codebase structure, potential areas for expansion:
1. Real-time notifications
2. Advanced analytics dashboard
3. Mobile app optimization
4. Biometric authentication
5. Enhanced reporting features

---

**Last Updated**: January 2026
**Version**: Based on current codebase analysis
