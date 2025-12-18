# 🏢 Office Management System

A modern, feature-rich office management mobile application built with React Native and Expo. This app helps organizations manage employee attendance, leaves, work-from-home requests, and team celebrations seamlessly.

**Developed by Jainish G 💖**

---

## 📱 Features

### 🎯 Core Features
- ✅ **Smart Check-In/Check-Out System** - Swipeable interface with cooldown protection
- ✅ **Task Management** - Track daily tasks and completion status
- ✅ **Leave Management** - View and manage employee leaves
- ✅ **Work From Home Tracking** - Monitor WFH requests and approvals
- ✅ **Attendance Analytics** - Late arrivals, early departures, half-days
- ✅ **Birthday Celebrations** - Never miss a team member's special day
- ✅ **Pending Approvals** - Quick access to all pending requests

### 🎨 UI/UX Features
- ✨ **Smooth Animations** - Native-driven animations for 60fps performance
- 📱 **Responsive Design** - Optimized for all screen sizes
- 🎭 **Dynamic Tab Bar** - Auto-hide on scroll for immersive experience
- 🔄 **Expandable Sections** - Collapsible cards for better organization
- 🌈 **Modern Design** - Clean, professional interface with vibrant colors

### 🔐 Security Features
- 🔒 **Authentication System** - Secure login/signup with AsyncStorage
- 👤 **User Sessions** - Persistent login state
- 🚪 **Protected Routes** - Auth-based navigation

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Will be installed automatically
- **Expo Go App** - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/office-management.git
cd office-management
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install required packages**
```bash
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage
```

4. **Start the development server**
```bash
npx expo start -c
# or
yarn expo start -c
```

5. **Run on your device**
   - Scan the QR code with **Expo Go** app (Android)
   - Scan with **Camera** app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

---

## 📂 Project Structure

```
office-management/
├── app/                          # App routes and navigation
│   ├── (auth)/                   # Authentication screens
│   │   ├── _layout.tsx          # Auth stack navigator
│   │   ├── sign-in.tsx          # Sign in screen
│   │   ├── sign-up.tsx          # Sign up screen
│   │   └── forgotpass.tsx       # Forgot password screen
│   ├── (tabs)/                   # Main app tabs
│   │   ├── _layout.tsx          # Tab navigator with auto-hide
│   │   ├── index.tsx            # Home screen (entry point)
│   │   ├── explore.tsx          # Services/Explore screen
│   │   └── profile.tsx          # User profile screen
│   └── _layout.tsx              # Root layout with AuthProvider
│
├── components/                   # Reusable components
│   ├── Home/                    # Home screen components
│   │   ├── HomeScreen.tsx       # Main orchestrator (6.7KB)
│   │   ├── GreetingSection.tsx  # User greeting
│   │   ├── CheckInCard.tsx      # Check-in/out swipeable card
│   │   ├── TaskSection.tsx      # Task display
│   │   ├── MissedPunchSection.tsx # Missed punch dates
│   │   ├── AttendanceTrackingCards.tsx # Stats cards
│   │   ├── LeaveBalanceSection.tsx # Leave balance (PL/CL/SL/AB)
│   │   ├── PendingRequestsSection.tsx # Pending approvals
│   │   ├── InfoSection.tsx      # Generic info display
│   │   ├── EmployeesOnLeaveToday.tsx # Today's leaves
│   │   ├── UpcomingLeaves.tsx   # Upcoming leave requests
│   │   ├── UpcomingWFHs.tsx     # Upcoming WFH requests
│   │   ├── EmployeesWFHToday.tsx # Today's WFH employees
│   │   └── AllBirthdays.tsx     # Birthday celebrations 🎂
│   ├── Navigation/
│   │   └── Navbar.tsx           # App navigation bar
│   └── Custominputs.tsx         # Custom input component
│
├── contexts/                     # React Context providers
│   └── AuthContext.tsx          # Authentication context
│
├── constants/                    # App constants
│   └── TabBarContext.tsx        # Tab bar state management
│
├── assets/                       # Images, fonts, etc.
├── hooks/                        # Custom React hooks
├── scripts/                      # Utility scripts
│
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS config
├── babel.config.js               # Babel configuration
└── README.md                     # This file
```

---

## 🎨 Component Architecture

### Home Screen Components (14 Total)

#### **Core Components**
1. **HomeScreen.tsx** - Main orchestrator component
   - Manages state for all child components
   - Handles scroll-based tab bar animation
   - Coordinates expansion states

2. **GreetingSection.tsx** - Personalized user greeting
   - Displays user name
   - Shows current date/time

3. **CheckInCard.tsx** - Swipeable check-in/out
   - Swipe right to check in
   - Swipe left to check out
   - Cooldown protection after check-out
   - Visual feedback with animations

4. **TaskSection.tsx** - Task management
   - Conditional rendering (shows after first check-in)
   - Different views for checked-in vs checked-out
   - Task completion tracking

#### **Attendance & Leave Components**
5. **MissedPunchSection.tsx** - Missed punch dates
   - Horizontal scrollable list
   - Shows dates with missed check-in/out

6. **AttendanceTrackingCards.tsx** - Statistics cards
   - Late Check In count
   - Early Check Out count
   - Half Day count

7. **LeaveBalanceSection.tsx** - Leave balance display
   - PL (Privilege Leave) - Green
   - CL (Casual Leave) - Blue
   - SL (Sick Leave) - Orange
   - AB (Absent) - Red

8. **PendingRequestsSection.tsx** - Approval requests
   - Leave Approvals
   - Miss Punch Approvals
   - Half Day Approvals
   - Early Check-Out Approvals
   - WFH Approvals

#### **Employee Information Components**
9. **InfoSection.tsx** - Generic reusable component
   - Used for "Late Arrivals Today"
   - Used for "Leaving Early Today"
   - Customizable title and message

10. **EmployeesOnLeaveToday.tsx** - Today's leaves
    - Shows employee name
    - Displays leave type
    - Approval status indicator

11. **UpcomingLeaves.tsx** - Expandable leave list
    - Individual employee cards
    - Expand to see duration, reason, status
    - Smooth animations

12. **UpcomingWFHs.tsx** - WFH requests
    - Two-level expansion (main + individual)
    - Shows WFH details
    - Pending/Approved status

13. **EmployeesWFHToday.tsx** - Today's WFH
    - Collapsible section
    - Shows employee tasks
    - Home icon indicators

14. **AllBirthdays.tsx** - Birthday celebrations
    - Festive yellow/gold theme
    - Employee initials in colored circles
    - Birthday dates
    - 🎉 Celebration emojis

---

## 🔧 Technical Stack

### **Frontend Framework**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe JavaScript

### **Navigation**
- **Expo Router** - File-based routing
- **React Navigation** - Navigation library (via Expo Router)

### **State Management**
- **React Context API** - Global state (Authentication)
- **React Hooks** - Local state management
- **AsyncStorage** - Persistent storage

### **Styling**
- **React Native StyleSheet** - Component styling
- **NativeWind** - Tailwind CSS for React Native
- **Animated API** - Native-driven animations

### **UI Components**
- **Expo Vector Icons** - Icon library (Feather icons)
- **React Native Safe Area Context** - Safe area handling
- **Custom Components** - Reusable UI elements

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Expo DevTools** - Debugging and testing

---

## 🎯 Key Features Explained

### 1. **Smart Check-In/Out System**

```typescript
// Swipe-based interaction
- Swipe Right → Check In (Blue button)
- Swipe Left → Check Out (Yellow button)
- After Check Out → Disabled (Gray button with checkmark)
```

**Features:**
- Visual feedback with color changes
- Prevents multiple check-outs
- Smooth spring animations
- Threshold-based swipe detection (30% of screen width)

### 2. **Scroll-Based Tab Bar Animation**

```typescript
// Auto-hide tab bar on scroll
Scroll Down ↓ → Tab Bar Hides (More content space)
Scroll Up ↑   → Tab Bar Shows (Easy navigation)
```

**Implementation:**
- Native driver for 60fps performance
- Smart detection (hides after 50px scroll)
- 200ms smooth animation
- Direction-based behavior

### 3. **Expandable Sections**

All expandable sections use shared state and animations:

```typescript
const [expandedLeave, setExpandedLeave] = useState<number | null>(null);

// State values:
1-3   → Upcoming Leaves (individual employees)
4-7   → Upcoming WFHs (main + individuals)
8     → Employees WFH Today
9     → All Birthdays
null  → All collapsed
```

### 4. **Authentication Flow**

```
App Launch → Check Auth State
    ↓
Not Authenticated → Sign In/Sign Up Screens
    ↓
Authenticated → Main App (Tabs)
    ↓
Logout → Back to Sign In
```

**Features:**
- Persistent sessions with AsyncStorage
- Automatic navigation based on auth state
- Smooth transitions (no blocking alerts)
- Protected routes

---

## 🎨 Design System

### **Color Palette**

```typescript
// Primary Colors
Primary Blue:    #4289f4ff
Background:      #f0f2f5
Card Background: #fff

// Status Colors
Success Green:   #12df34ff
Pending Orange:  #ff9800
Error Red:       #f44336

// Leave Types
PL Green:        #4caf50
CL Blue:         #2196f3
SL Orange:       #ff9800
AB Red:          #f44336

// Birthday Theme
Background:      #fef5e7
Border:          #f9e79f
Title:           #d4145a
Profile Circle:  #8e44ad

// Text Colors
Primary:         #000
Secondary:       #666
Tertiary:        #a0a0a0ff
```

### **Typography**

```typescript
// Font Sizes
Title:           20px (700 weight)
Card Title:      16px (600 weight)
Subtitle:        14px (normal weight)
Detail Text:     14px
Greeting:        32px (700 weight)
Task Count:      24-28px (700 weight)
```

### **Spacing**

```typescript
// Margins
Card Horizontal: 20px
Card Top:        10px

// Padding
Card Horizontal: 12px
Card Vertical:   20px

// Border Radius
Cards:           15px
Buttons:         50px (rounded)
Profile Images:  22.5px (circular)

// Gaps
Between Items:   10px
Between Sections: 15px
```

---

## 📱 Screen Breakdown

### **Home Screen** (`app/(tabs)/index.tsx`)

**Sections (Top to Bottom):**
1. Navbar - App navigation
2. Greeting - "Hello {User}!"
3. Check-In Card - Swipeable check-in/out
4. Task Section - Task tracking (conditional)
5. Missed Punches - Horizontal scroll
6. Attendance Stats - 3 cards (Late/Early/Half Day)
7. Leave Balance - 4 badges (PL/CL/SL/AB)
8. Pending Requests - 5 approval types
9. Late Arrivals - Info section
10. Leaving Early - Info section
11. Employees on Leave Today - List
12. Upcoming Leaves - Expandable
13. Upcoming WFHs - Two-level expandable
14. Employees WFH Today - Collapsible
15. All Birthdays - Festive section

**Total Scroll Height:** ~3000-4000px (depending on expanded sections)

### **Authentication Screens**

#### **Sign In** (`app/(auth)/sign-in.tsx`)
- Email input
- Password input
- Forgot password link
- Sign in button
- Sign up link
- Smooth auto-navigation on success

#### **Sign Up** (`app/(auth)/sign-up.tsx`)
- Full name input
- Username input
- Email input
- Phone input
- Password input
- Sign up button
- Sign in link
- Auto-login after successful signup

---

## 🔐 Authentication System

### **AuthContext** (`contexts/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}
```

**Features:**
- User state management
- Persistent sessions (AsyncStorage)
- Loading states
- Login/Logout/Signup functions
- Automatic navigation

**Usage:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

---

## 🎭 Animations

### **Types of Animations**

1. **Press Animations** - Scale down/up on touch
   ```typescript
   Scale: 1 → 0.95 → 1
   Duration: 100ms each
   ```

2. **Expansion Animations** - Layout animation for expand/collapse
   ```typescript
   Duration: 300ms
   Type: easeInEaseOut
   ```

3. **Tab Bar Animation** - Slide up/down
   ```typescript
   Duration: 200ms
   Transform: translateY(0 → 100)
   Native Driver: true (60fps)
   ```

4. **Swipe Animation** - Spring animation for check-in/out
   ```typescript
   Type: Spring
   Friction: 8
   Tension: 40
   ```

---

## 📊 Data Flow

### **State Management**

```
Root Layout (AuthProvider)
    ↓
Auth State (user, isAuthenticated)
    ↓
Tabs Layout (TabBarProvider)
    ↓
Home Screen (Local State)
    ↓
Child Components (Props)
```

### **Component Communication**

```typescript
// Parent to Child (Props)
<CheckInCard onCheckInChange={handleCheckInChange} />

// Child to Parent (Callbacks)
const handleCheckInChange = (checkedIn, checkedOut) => {
  setIsCheckedIn(checkedIn);
  setHasCheckedOut(checkedOut);
};

// Shared State (Context)
const { user, logout } = useAuth();
```

---

## 🧪 Testing

### **Manual Testing Checklist**

#### Authentication
- [ ] Sign up creates account and auto-logs in
- [ ] Sign in with valid credentials works
- [ ] Sign in with invalid credentials shows error
- [ ] Logout clears session
- [ ] Session persists on app reload

#### Home Screen
- [ ] All sections render correctly
- [ ] Check-in swipe works (right swipe)
- [ ] Check-out swipe works (left swipe)
- [ ] Check-out disables further swipes
- [ ] Task section appears after first check-in
- [ ] All expandable sections toggle correctly

#### Animations
- [ ] Tab bar hides on scroll down
- [ ] Tab bar shows on scroll up
- [ ] Press animations work on all buttons
- [ ] Expansion animations are smooth
- [ ] No lag or stuttering

#### UI/UX
- [ ] All text is readable
- [ ] Colors are consistent
- [ ] Spacing is uniform
- [ ] Icons display correctly
- [ ] No overlapping elements

---

## 🚀 Deployment

### **Build for Production**

#### **Android (APK)**
```bash
# Build APK
eas build --platform android --profile preview

# Or build locally
npx expo build:android
```

#### **iOS (IPA)**
```bash
# Build IPA (requires Apple Developer account)
eas build --platform ios --profile preview

# Or build locally
npx expo build:ios
```

### **Expo Application Services (EAS)**

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Configure EAS**
```bash
eas build:configure
```

3. **Build**
```bash
# Production build
eas build --platform all

# Preview build
eas build --platform all --profile preview
```

4. **Submit to Stores**
```bash
# Google Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

---

## 📦 Dependencies

### **Core Dependencies**
```json
{
  "expo": "~52.0.11",
  "expo-router": "~4.0.9",
  "react": "18.3.1",
  "react-native": "0.76.3",
  "typescript": "~5.3.3"
}
```

### **UI & Navigation**
```json
{
  "@expo/vector-icons": "^14.0.4",
  "expo-image": "~2.0.0",
  "react-native-safe-area-context": "4.12.0",
  "nativewind": "^4.0.1"
}
```

### **Storage & State**
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

### **Development**
```json
{
  "@types/react": "~18.3.12",
  "eslint": "^9.15.0",
  "tailwindcss": "^3.4.17"
}
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Metro Bundler Cache Issues**
```bash
# Clear cache and restart
npx expo start -c
```

#### **2. Module Not Found Errors**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### **3. AsyncStorage Not Working**
```bash
# Install the package
npm install @react-native-async-storage/async-storage

# Clear Expo cache
npx expo start -c
```

#### **4. TypeScript Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

#### **5. Build Errors**
```bash
# Clear build cache
npx expo prebuild --clean
```

---

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Code Style Guidelines**

- Use TypeScript for all new files
- Follow existing component structure
- Add comments for complex logic
- Use meaningful variable names
- Keep components small and focused
- Write reusable, modular code

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Developed with 💖 by Jainish G**

- 🌐 Portfolio: [Your Portfolio URL]
- 💼 LinkedIn: [Your LinkedIn]
- 🐙 GitHub: [Your GitHub]
- 📧 Email: [Your Email]

---

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **React Native Community** - For continuous support and resources
- **Contributors** - For making this project better

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** - Most answers are here
2. **Search existing issues** - Someone might have faced the same problem
3. **Create a new issue** - Provide detailed information
4. **Contact the developer** - For urgent matters

---

## 🗺️ Roadmap

### **Upcoming Features**
- [ ] Push notifications for approvals
- [ ] Calendar integration
- [ ] Team chat functionality
- [ ] Document management
- [ ] Payroll integration
- [ ] Performance analytics
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Export reports (PDF/Excel)

---

## 📊 Project Stats

- **Total Components:** 14 (Home) + 10 (Other) = 24
- **Total Lines of Code:** ~15,000+
- **Languages:** TypeScript (95%), JavaScript (5%)
- **Screens:** 6 (Auth: 3, Tabs: 3)
- **Animations:** 4 types (Press, Expansion, Tab Bar, Swipe)
- **State Management:** Context API + Local State
- **Storage:** AsyncStorage (Persistent)

---

## 🎉 Version History

### **v1.0.0** (Current)
- ✅ Initial release
- ✅ Complete authentication system
- ✅ Home screen with 15 sections
- ✅ Scroll-based tab bar animation
- ✅ All expandable components
- ✅ Birthday celebrations
- ✅ WFH management
- ✅ Leave management

---

## 💡 Tips & Best Practices

### **For Developers**

1. **Always use TypeScript** - Catch errors early
2. **Keep components small** - Single responsibility principle
3. **Use props for data** - Make components reusable
4. **Optimize animations** - Use native driver when possible
5. **Test on real devices** - Emulators don't show all issues
6. **Follow the design system** - Maintain consistency
7. **Document your code** - Help future developers
8. **Use version control** - Commit often, push regularly

### **For Users**

1. **Keep the app updated** - Get latest features and fixes
2. **Report bugs** - Help improve the app
3. **Provide feedback** - Share your experience
4. **Check announcements** - Stay informed about updates

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐️ on GitHub!

---

**Made with ❤️ by Jainish G**

*Last Updated: December 11, 2025*