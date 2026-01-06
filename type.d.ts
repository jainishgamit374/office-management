// Office Management App Type Definitions

// Custom Input Component Props
interface CustomInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

// User Interface
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
    avatar?: string;
}

// Authentication
export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
}

export interface SignInParams {
    email: string;
    password: string;
}

export interface SignUpParams {
    name: string;
    email: string;
    phone: string;
    password: string;
}

// Leave Management
export interface LeaveRequest {
    id: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    duration: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface LeaveBalance {
    pl: number; // Privilege Leave
    cl: number; // Casual Leave
    sl: number; // Sick Leave
    ab: number; // Absent
}

// Work From Home
export interface WFHRequest {
    id: string;
    employeeName: string;
    date: string;
    duration: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    task?: string;
}

export interface WFHEmployee {
    id: string;
    name: string;
    task: string;
}

// Attendance
export interface AttendanceRecord {
    id: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'WFH';
}

export interface AttendanceStats {
    lateCheckIn: number;
    earlyCheckOut: number;
    halfDay: number;
}

// Birthday
export interface Birthday {
    id: string;
    name: string;
    initials: string;
    date: string;
}

// Pending Requests
export interface PendingRequest {
    id: string;
    type: 'Leave' | 'Miss Punch' | 'Half Day' | 'Early Check-Out' | 'WFH';
    count: number;
}

// Employee on Leave
export interface EmployeeOnLeave {
    id: string;
    name: string;
    leaveType: string;
    status?: 'Pending' | 'Approved';
}

// Tab Bar Context
export interface TabBarContextType {
    scrollY: any; // Animated.Value
    lastScrollY: React.MutableRefObject<number>;
    tabBarTranslateY: any; // Animated.Value
}

// Task
export interface Task {
    id: string;
    title: string;
    completed: boolean;
}

// Missed Punch
export interface MissedPunch {
    id: string;
    date: string;
    type: 'Check In' | 'Check Out';
}