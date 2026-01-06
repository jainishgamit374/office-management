# Component Architecture Diagram

## App Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      Root Layout                             │
│                   (app/_layout.tsx)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            AuthProvider (Context)                     │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         RootLayoutNav                          │  │  │
│  │  │                                                │  │  │
│  │  │  if (isLoading)                               │  │  │
│  │  │    → Show Loading Indicator                   │  │  │
│  │  │                                                │  │  │
│  │  │  if (!isAuthenticated)                        │  │  │
│  │  │    → Auth Stack                               │  │  │
│  │  │       ├── Sign In                             │  │  │
│  │  │       ├── Sign Up                             │  │  │
│  │  │       └── Forgot Password                     │  │  │
│  │  │                                                │  │  │
│  │  │  if (isAuthenticated)                         │  │  │
│  │  │    → Main App Stack (Tabs)                    │  │  │
│  │  │       ├── Home Tab (index)                    │  │  │
│  │  │       ├── Services Tab (explore)              │  │  │
│  │  │       └── Profile Tab                         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Home Screen Component Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                    HomeScreen                                 │
│              (components/Home/HomeScreen.tsx)                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  State Management                                    │    │
│  │  • isCheckedIn                                       │    │
│  │  • hasCheckedOut                                     │    │
│  │  • hasEverCheckedIn                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Navbar                                              │    │
│  │  (components/Navigation/Navbar.tsx)                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  GreetingSection                                     │    │
│  │  • Displays user name                                │    │
│  │  • Shows current time/date                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  CheckInCard                                         │    │
│  │  • Swipeable check-in/out                            │    │
│  │  • Cooldown timer                                    │    │
│  │  • Callback: onCheckInChange()                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TaskSection                                         │    │
│  │  • Conditional rendering                             │    │
│  │  • Shows after first check-in                        │    │
│  │  • Props: hasEverCheckedIn, isCheckedIn              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MissedPunchSection                                  │    │
│  │  • Horizontal scroll                                 │    │
│  │  • Shows missed dates                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AttendanceTrackingCards                             │    │
│  │  ├── Late Check In Card                              │    │
│  │  ├── Early Check Out Card                            │    │
│  │  └── Half Day Card                                   │    │
│  │  Props: lateCheckIns, earlyCheckOuts, halfDays       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  LeaveBalanceSection                                 │    │
│  │  ├── PL (Privilege Leave)                            │    │
│  │  ├── CL (Casual Leave)                               │    │
│  │  ├── SL (Sick Leave)                                 │    │
│  │  └── AB (Absent)                                     │    │
│  │  Props: leaveBalance object                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PendingRequestsSection                              │    │
│  │  ├── Leave Approvals                                 │    │
│  │  ├── Miss Punch Approvals                            │    │
│  │  ├── Half Day Approvals                              │    │
│  │  ├── Early Check-Out Approvals                       │    │
│  │  └── WFH Approval                                    │    │
│  │  Props: requests array                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  InfoSection (Late Arrivals Today)                   │    │
│  │  Props: title="Late Arrivals Today"                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  InfoSection (Leaving Early Today)                   │    │
│  │  Props: title="Leaving Early Today"                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    App Launch                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   AuthContext Check   │
         │   (AsyncStorage)      │
         └───────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌────────┐      ┌──────────┐
   │ User   │      │ No User  │
   │ Found  │      │ Found    │
   └───┬────┘      └────┬─────┘
       │                │
       ▼                ▼
┌──────────────┐  ┌─────────────┐
│ isLoading =  │  │ isLoading = │
│ false        │  │ false       │
│              │  │             │
│ isAuth =     │  │ isAuth =    │
│ true         │  │ false       │
└──────┬───────┘  └──────┬──────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌─────────────────┐
│ Show Main    │  │ Show Auth Stack │
│ App (Tabs)   │  │ (Sign In)       │
└──────────────┘  └─────────┬───────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ User Signs In/Up │
                  └─────────┬────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ AuthContext      │
                  │ .login() or      │
                  │ .signup()        │
                  └─────────┬────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Update User      │
                  │ State            │
                  │ Save to          │
                  │ AsyncStorage     │
                  └─────────┬────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Auto Navigate    │
                  │ to Main App      │
                  └──────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Component Event     │
         │   (onPress, onChange) │
         └───────┬───────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │   Local State Update  │
         │   (useState)          │
         └───────┬───────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │   Callback to Parent  │
         │   (if needed)         │
         └───────┬───────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │   Parent State Update │
         └───────┬───────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │   Re-render Children  │
         │   with new props      │
         └───────────────────────┘

Example: Check-In Flow
─────────────────────
CheckInCard (swipe) 
    → setState(isCheckedIn: true)
    → onCheckInChange(true, false)
    → HomeScreen.handleCheckInChange()
    → setState(isCheckedIn: true, hasEverCheckedIn: true)
    → TaskSection receives new props
    → TaskSection re-renders (now visible)
```

## Component Reusability Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                  InfoSection Component                       │
│                  (Generic/Reusable)                          │
│                                                              │
│  Props Interface:                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ interface InfoSectionProps {                        │    │
│  │   title: string;                                    │    │
│  │   emptyMessage?: string;                            │    │
│  │ }                                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Usage 1:                                                    │
│  <InfoSection title="Late Arrivals Today" />                │
│                                                              │
│  Usage 2:                                                    │
│  <InfoSection                                                │
│    title="Leaving Early Today"                              │
│    emptyMessage="No early departures"                       │
│  />                                                          │
│                                                              │
│  Future Usage:                                               │
│  <InfoSection title="Birthdays This Week" />                │
│  <InfoSection title="New Joiners" />                        │
│  <InfoSection title="Upcoming Holidays" />                  │
└─────────────────────────────────────────────────────────────┘
```

## File Size Comparison

```
Before Refactoring:
┌──────────────────────────────────┐
│ HomeScreen.tsx                   │
│ 554 lines                        │
│ 17,052 bytes                     │
│                                  │
│ ████████████████████████████████ │
│ ████████████████████████████████ │
│ ████████████████████████████████ │
│ ████████████████████████████████ │
│ ████████████████████████████████ │
└──────────────────────────────────┘

After Refactoring:
┌──────────────────────────────────┐
│ HomeScreen.tsx (Orchestrator)    │
│ ~90 lines                        │
│ 2,644 bytes                      │
│ ██████                           │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ MissedPunchSection.tsx           │
│ ~90 lines | 2,757 bytes          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ AttendanceTrackingCards.tsx      │
│ ~75 lines | 2,105 bytes          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ LeaveBalanceSection.tsx          │
│ ~110 lines | 3,409 bytes         │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ PendingRequestsSection.tsx       │
│ ~100 lines | 3,161 bytes         │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ InfoSection.tsx                  │
│ ~80 lines | 2,415 bytes          │
└──────────────────────────────────┘

Total: ~545 lines across 6 files
(vs 554 lines in 1 file)
```

## Benefits Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    BEFORE                                    │
├─────────────────────────────────────────────────────────────┤
│ ❌ Single 554-line file                                     │
│ ❌ Hard to maintain                                         │
│ ❌ Difficult to test                                        │
│ ❌ No reusability                                           │
│ ❌ Tight coupling                                           │
│ ❌ Hard to understand                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     AFTER                                    │
├─────────────────────────────────────────────────────────────┤
│ ✅ 6 focused components                                     │
│ ✅ Easy to maintain                                         │
│ ✅ Simple to test                                           │
│ ✅ Highly reusable                                          │
│ ✅ Loose coupling                                           │
│ ✅ Clear structure                                          │
│ ✅ Better performance                                       │
│ ✅ Scalable architecture                                    │
└─────────────────────────────────────────────────────────────┘
```
