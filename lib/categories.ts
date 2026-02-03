import { Feather } from '@expo/vector-icons';

export interface FeatureItem {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    route: string;
    badge?: number;
}

export interface Category {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Feather.glyphMap;
    gradient: [string, string];
    badge?: number;
    features: FeatureItem[];
}

export const CATEGORIES: Category[] = [
    {
        id: 'attendance',
        title: 'Attendance',
        subtitle: 'Track work hours',
        icon: 'clock',
        gradient: ['#6366F1', '#4F46E5'],
        features: [
            { id: 'history', title: 'Attendance History', subtitle: 'View past records', icon: 'calendar', color: '#6366F1', route: '/Attendance/AttendenceList' },
        ],
    },
    {
        id: 'leave',
        title: 'Leave Management',
        subtitle: 'Manage time off',
        icon: 'calendar',
        gradient: ['#F59E0B', '#D97706'],
        features: [
            { id: 'leavereq', title: 'Apply Leave', subtitle: 'Submit leave request', icon: 'calendar', color: '#10B981', route: '/Requests/Leaveapplyreq' },
            { id: 'myleaves', title: 'My Leave Applications', subtitle: 'View all your leaves', icon: 'file-text', color: '#6366F1', route: '/ViewAllRequest/LeaveApplication' },
            { id: 'approval', title: 'Leave Approvals', subtitle: 'Approve/reject leaves', icon: 'check-circle', color: '#10B981', route: '/Attendance/LeaveApprovalList' },
        ],
    },
    {
        id: 'misspunch',
        title: 'Missed Punch',
        subtitle: 'Track missed punches',
        icon: 'alert-circle',
        gradient: ['#EC4899', '#DB2777'],
        features: [
            { id: 'mymisspunch', title: 'My Missed Punches', subtitle: 'View missed punches', icon: 'alert-circle', color: '#EC4899', route: '/ViewAllRequest/ViewAllMisspunch' },
            { id: 'misspunchreq', title: 'Miss Punch Request', subtitle: 'Report missed punch', icon: 'alert-circle', color: '#EC4899', route: '/Requests/Misspunchreq' },
        ],
    },
    {
        id: 'earlycheckout',
        title: 'Early Checkout',
        subtitle: 'Track early departures',
        icon: 'log-out',
        gradient: ['#8B5CF6', '#7C3AED'],
        features: [
            { id: 'myearlycheckout', title: 'My Early Checkouts', subtitle: 'View early checkouts', icon: 'log-out', color: '#F59E0B', route: '/ViewAllRequest/EarlyCheckout' },
            { id: 'earlycheckoutreq', title: 'Early Checkout Request', subtitle: 'Request early checkout', icon: 'log-out', color: '#F59E0B', route: '/Requests/Earlycheckoutreq' },
        ],
    },
    {
        id: 'wfh',
        title: 'Work From Home',
        subtitle: 'Remote work',
        icon: 'home',
        gradient: ['#06B6D4', '#0891B2'],
        features: [
            { id: 'wfhreq', title: 'Apply WFH', subtitle: 'Submit WFH request', icon: 'home', color: '#06B6D4', route: '/Requests/Wfhapplyreq' },
            { id: 'mywfh', title: 'My WFH Requests', subtitle: 'View WFH history', icon: 'list', color: '#8B5CF6', route: '/ViewAllRequest/Wfhrequest' },
        ],
    },
    {
        id: 'resources',
        title: 'Resources, Support & About',
        subtitle: 'Info & help',
        icon: 'book',
        gradient: ['#10B981', '#059669'],
        features: [
            { id: 'about', title: 'About', subtitle: 'App information', icon: 'info', color: '#8B5CF6', route: '/Support/About' },
            { id: 'teamdirectory', title: 'Team Directory', subtitle: 'Find teammates', icon: 'users', color: '#6366F1', route: '/Resources/TeamDirectory' },
            { id: 'hrpolicies', title: 'HR Policies', subtitle: 'Company guidelines', icon: 'file-text', color: '#10B981', route: '/Resources/HrPolicies' },
            { id: 'helpfaq', title: 'Help & FAQ', subtitle: 'Get help', icon: 'help-circle', color: '#F59E0B', route: '/Support/Helpandfaq' },
        ],
    },
];
