# Office Management App - File Structure

## 📁 Project Structure

```
officemanagement/
│
├── 📁 app/                          # Main application directory (Expo Router)
│   ├── 📁 (auth)/                   # Authentication routes
│   │   ├── sign-in.tsx              # Sign in screen
│   │   ├── sign-up.tsx              # Sign up screen
│   │   └── forgotpass.tsx           # Forgot password screen
│   │
│   ├── 📁 (tabs)/                   # Tab-based navigation
│   │   ├── _layout.tsx              # Tab layout configuration
│   │   ├── index.tsx                # Home/Dashboard screen
│   │   ├── explore.tsx              # Explore screen
│   │   └── profile.tsx              # User profile screen
│   │
│   └── _layout.tsx                  # Root layout
│
├── 📁 components/                   # Reusable UI components
│   ├── 📁 ui/                       # Basic UI components
│   │   ├── Button.tsx               # Custom button component
│   │   ├── Card.tsx                 # Card component
│   │   ├── Input.tsx                # Input field component
│   │   └── Modal.tsx                # Modal component
│   │
│   ├── 📁 forms/                    # Form-related components
│   │   ├── Custominputs.tsx         # Custom input fields
│   │   └── FormField.tsx            # Form field wrapper
│   │
│   ├── 📁 attendance/               # Attendance-related components
│   │   ├── CheckInButton.tsx        # Check-in/out button
│   │   ├── AttendanceCard.tsx       # Attendance display card
│   │   └── SwipeButton.tsx          # Swipeable check-in button
│   │
│   ├── 📁 leave/                    # Leave management components
│   │   ├── LeaveCard.tsx            # Leave request card
│   │   ├── LeaveList.tsx            # List of leaves
│   │   └── LeaveForm.tsx            # Leave application form
│   │
│   ├── 📁 employee/                 # Employee-related components
│   │   ├── EmployeeCard.tsx         # Employee info card
│   │   ├── EmployeeList.tsx         # List of employees
│   │   └── EmployeeAvatar.tsx       # Employee avatar component
│   │
│   ├── 📁 Navigation/               # Navigation components
│   │   └── (existing navigation)
│   │
│   ├── external-link.tsx            # External link component
│   ├── haptic-tab.tsx               # Haptic feedback tab
│   ├── hello-wave.tsx               # Wave animation
│   ├── parallax-scroll-view.tsx     # Parallax scroll view
│   ├── themed-text.tsx              # Themed text component
│   └── themed-view.tsx              # Themed view component
│
├── 📁 constants/                    # App constants and configuration
│   ├── theme.ts                     # Theme configuration
│   ├── TabBarContext.tsx            # Tab bar context
│   ├── Colors.ts                    # Color palette
│   └── Config.ts                    # App configuration
│
├── 📁 hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts          # Color scheme hook
│   ├── use-color-scheme.web.ts      # Web color scheme hook
│   ├── use-theme-color.ts           # Theme color hook
│   ├── useThemeColor.ts             # Theme color utility
│   ├── useAuth.ts                   # Authentication hook
│   ├── useAttendance.ts             # Attendance management hook
│   └── useLeave.ts                  # Leave management hook
│
├── 📁 services/                     # API and external services
│   ├── 📁 api/                      # API service layer
│   │   ├── auth.service.ts          # Authentication API
│   │   ├── attendance.service.ts    # Attendance API
│   │   ├── leave.service.ts         # Leave management API
│   │   ├── employee.service.ts      # Employee API
│   │   └── index.ts                 # API exports
│   │
│   ├── 📁 appwrite/                 # Appwrite configuration
│   │   ├── config.ts                # Appwrite config
│   │   ├── database.ts              # Database operations
│   │   └── storage.ts               # Storage operations
│   │
│   └── 📁 notifications/            # Notification services
│       └── push.service.ts          # Push notifications
│
├── 📁 store/                        # State management
│   ├── 📁 slices/                   # Redux slices (if using Redux)
│   │   ├── auth.slice.ts            # Auth state
│   │   ├── attendance.slice.ts      # Attendance state
│   │   └── leave.slice.ts           # Leave state
│   │
│   └── index.ts                     # Store configuration
│
├── 📁 utils/                        # Utility functions
│   ├── date.utils.ts                # Date formatting utilities
│   ├── validation.utils.ts          # Form validation
│   ├── storage.utils.ts             # Local storage utilities
│   └── format.utils.ts              # Data formatting utilities
│
├── 📁 types/                        # TypeScript type definitions
│   ├── auth.types.ts                # Authentication types
│   ├── attendance.types.ts          # Attendance types
│   ├── leave.types.ts               # Leave types
│   ├── employee.types.ts            # Employee types
│   └── index.ts                     # Type exports
│
├── 📁 assets/                       # Static assets
│   ├── 📁 images/                   # Image files
│   │   ├── logo.png
│   │   └── placeholder.png
│   │
│   ├── 📁 icons/                    # Icon files
│   │   └── (custom icons)
│   │
│   └── 📁 fonts/                    # Custom fonts
│       └── (font files)
│
├── 📁 scripts/                      # Build and utility scripts
│   └── (existing scripts)
│
├── 📁 .agent/                       # Agent workflows
│   └── 📁 workflows/                # Workflow definitions
│
├── 📄 app.json                      # Expo configuration
├── 📄 package.json                  # Dependencies
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 type.d.ts                     # Global type definitions
├── 📄 eas.json                      # EAS Build configuration
├── 📄 eslint.config.js              # ESLint configuration
├── 📄 expo-env.d.ts                 # Expo environment types
└── 📄 README.md                     # Project documentation
```

## 📋 Folder Descriptions

### `/app` - Application Routes
Contains all screen components organized by Expo Router conventions. Uses file-based routing.

### `/components` - Reusable Components
Organized by feature/domain for better maintainability:
- **ui/**: Basic, reusable UI components
- **forms/**: Form-related components
- **attendance/**: Attendance feature components
- **leave/**: Leave management components
- **employee/**: Employee-related components

### `/services` - External Services
All API calls and external service integrations:
- **api/**: REST API service layer
- **appwrite/**: Appwrite backend configuration
- **notifications/**: Push notification services

### `/store` - State Management
Centralized state management (Redux/Zustand/Context):
- Global app state
- Feature-specific slices

### `/utils` - Utility Functions
Helper functions for common operations:
- Date formatting
- Validation
- Storage operations
- Data formatting

### `/types` - TypeScript Types
Type definitions for type safety across the app.

### `/hooks` - Custom Hooks
Reusable React hooks for common logic.

### `/constants` - Configuration
App-wide constants and configuration values.

## 🎯 Best Practices

1. **Component Organization**: Group by feature, not by type
2. **Naming Conventions**: 
   - Components: PascalCase (e.g., `EmployeeCard.tsx`)
   - Utilities: camelCase (e.g., `date.utils.ts`)
   - Types: PascalCase with `.types.ts` suffix
3. **Import Order**: External → Internal → Relative
4. **File Size**: Keep files under 300 lines; split if larger
5. **Single Responsibility**: One component/function per file

## 📝 Next Steps

1. Create missing folders
2. Organize existing components into appropriate folders
3. Set up service layer for API calls
4. Define TypeScript types
5. Create custom hooks for business logic
