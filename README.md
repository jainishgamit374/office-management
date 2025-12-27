# Office Management HRMS System

A comprehensive Human Resource Management System (HRMS) built with React Native and Expo, featuring employee attendance tracking, leave management, work-from-home requests, and an admin dashboard for HR managers.

## 🌟 Features

### For Employees
- **Attendance Management**
  - Check-in/Check-out with timestamp tracking
  - View attendance history and calendar
  - Track late arrivals and early departures
  
- **Leave Management**
  - Apply for different leave types (PL, CL, SL)
  - View leave balance (Privilege Leave, Casual Leave, Sick Leave)
  - Track leave application status
  - View leave history

- **Work From Home (WFH)**
  - Request WFH with full-day or half-day options
  - View WFH history and status
  - Track WFH balance

- **Request Management**
  - Miss punch requests
  - Early checkout requests
  - Late check-in requests
  - View all pending and approved requests

- **Profile Management**
  - View employee details
  - Employee ID tracking
  - Department and designation information

### For Administrators
- **Admin Dashboard**
  - Quick stats overview (Leave requests, Early checkout, Miss punch, Late check-in, WFH)
  - Pending approvals management
  - Leave and WFH balance tracking
  - Upcoming leaves and WFH schedules
  - Employee birthday celebrations
  - Employee performance metrics

- **Employee Management**
  - View all employee data
  - Track attendance records
  - Monitor leave balances
  - Performance tracking

- **Approval System**
  - Approve/reject leave requests
  - Approve/reject WFH requests
  - Approve/reject miss punch requests
  - Approve/reject early checkout requests

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Styling**: React Native StyleSheet
- **Storage**: AsyncStorage for local data persistence
- **API**: RESTful API integration with Django backend
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/office-management.git
   cd office-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
   EXPO_PUBLIC_RESEND_API_KEY=your_resend_api_key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

## 📱 App Structure

```
officemanagement/
├── app/                          # Main application screens
│   ├── (auth)/                   # Authentication screens
│   │   ├── sign-in.tsx          # Login screen
│   │   ├── sign-up.tsx          # Registration screen
│   │   └── forgotpass.tsx       # Password recovery
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── explore.tsx          # Services screen
│   │   └── profile.tsx          # Profile screen
│   ├── Attendance/              # Attendance related screens
│   ├── Dashboard/               # Admin dashboard
│   │   └── AdminDashboard.tsx   # Admin dashboard screen
│   ├── Requests/                # Request management screens
│   ├── ViewAllRequest/          # View all requests screens
│   ├── Resources/               # HR resources
│   └── Support/                 # Help and support
├── components/                   # Reusable components
│   ├── Admin/                   # Admin-specific components
│   │   ├── QuickStatsCard.tsx
│   │   ├── ApprovalCard.tsx
│   │   ├── UpcomingCard.tsx
│   │   ├── BirthdayCard.tsx
│   │   └── PerformanceCard.tsx
│   ├── Home/                    # Home screen components
│   └── Navigation/              # Navigation components
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication logic
│   ├── api.ts                   # API client
│   └── adminApi.ts              # Admin API functions
├── constants/                   # App constants
│   ├── theme.ts                 # Theme configuration
│   └── TabBarContext.tsx        # Tab bar context
├── contexts/                    # React contexts
│   └── ThemeContext.tsx         # Theme context
└── assets/                      # Static assets
```

## 🔐 Authentication

### User Registration
1. Navigate to Sign Up screen
2. Fill in required details:
   - First Name
   - Last Name
   - Username
   - Email
   - Phone (optional)
   - Designation (optional)
   - Password
3. Toggle "Sign up as Admin" if registering as administrator
4. Submit to create account

### User Login
1. Navigate to Sign In screen
2. Enter username and password
3. Toggle "Sign in as Admin" for admin access
4. Submit to login

### Admin Access
- Admin users have access to the Admin Dashboard
- Non-admin users are redirected if they try to access admin routes
- Admin status is stored securely in AsyncStorage

## 📊 Admin Dashboard

The Admin Dashboard provides comprehensive HR management capabilities:

### Quick Stats
- **Leave Requests**: Pending leave applications
- **Early Checkout**: Today's early checkout requests
- **Miss Punch**: Attendance alerts
- **Late Check-In**: Late arrival tracking
- **WFH Requests**: Active work-from-home requests
- **MyVedhik Approvals**: Pending approvals

### Approvals Section
- **Pending Approvals**: Total pending requests
- **Leave Balance**: Available leave days
- **WFH Balance**: Available WFH days

### Upcoming Events
- **Upcoming Leaves**: Next scheduled leaves
- **Upcoming WFH**: Next scheduled work-from-home days

### Birthdays
- Employee birthday celebrations
- Special highlighting for today's birthdays
- Upcoming birthdays within 30 days

### Employee Performance
- Top performers ranking
- Task completion metrics
- Performance trends (improving/stable/declining)
- Visual progress indicators

## 🔌 API Integration

The app integrates with a Django backend at `https://karmyog.pythonanywhere.com`

### Authentication Endpoints
- `POST /register/` - User registration
- `POST /` - User login
- `POST /api/token/refresh/` - Refresh access token

### Admin Endpoints
- `GET /api/admin/employees/` - Get all employees
- `GET /api/admin/attendance/` - Get attendance records
- `GET /api/admin/leave-requests/` - Get leave requests
- `GET /api/admin/wfh-requests/` - Get WFH requests
- `GET /api/admin/miss-punch-requests/` - Get miss punch requests
- `GET /api/admin/early-checkout-requests/` - Get early checkout requests
- `GET /api/admin/leave-balances/` - Get leave balances
- `GET /api/admin/birthdays/` - Get upcoming birthdays
- `GET /api/admin/performance/` - Get performance metrics
- `GET /api/admin/dashboard-stats/` - Get dashboard statistics

## 🎨 Theming

The app uses a consistent color scheme:
- **Primary**: `#007bff` (Blue)
- **Success**: `#28a745` (Green)
- **Warning**: `#ffc107` (Yellow)
- **Danger**: `#dc3545` (Red)
- **Info**: `#17a2b8` (Cyan)

Dark mode support is available through the ThemeContext.

## 📝 Key Features Implementation

### Pull-to-Refresh
All major screens support pull-to-refresh for data updates:
```typescript
<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
```

### Loading States
Professional loading indicators during data fetching:
```typescript
if (loading) {
  return (
    <ActivityIndicator size="large" color="#007bff" />
  );
}
```

### Error Handling
Graceful error handling with user-friendly messages:
```typescript
try {
  await apiCall();
} catch (error) {
  console.error('Error:', error);
  // Show error message to user
}
```

## 🧪 Testing

### Manual Testing
1. **Test Authentication**
   - Sign up as regular user
   - Sign up as admin
   - Login with both user types
   - Verify access control

2. **Test Dashboard**
   - Verify all stats display correctly
   - Test pull-to-refresh
   - Check data loading states
   - Verify empty states

3. **Test Requests**
   - Apply for leave
   - Request WFH
   - Submit miss punch request
   - View request status

## 🚧 Troubleshooting

### Common Issues

**Issue**: App won't start
```bash
# Clear cache and restart
npx expo start -c
```

**Issue**: Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Issue**: API connection errors
- Verify backend URL in `lib/api.ts`
- Check network connectivity
- Ensure backend is running

**Issue**: Authentication errors
- Clear AsyncStorage data
- Re-login with valid credentials
- Check JWT token expiration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- **Development Team**: Jainish Gamit
- **Backend API**: Karmyog Team

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and queries:
- Email: support@example.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/office-management/issues)

## 🗺️ Roadmap

### Upcoming Features
- [ ] Employee data table with search and filters
- [ ] Detailed drill-down views for each metric
- [ ] Direct approval/rejection from dashboard
- [ ] Charts and analytics
- [ ] Export reports (PDF/Excel)
- [ ] Real-time notifications
- [ ] Advanced filtering options
- [ ] Dark mode enhancements

## 📸 Screenshots

> Add screenshots of your app here

## 🙏 Acknowledgments

- React Native community
- Expo team
- Django REST framework
- All contributors and testers

---

**Made with ❤️ using React Native and Expo**