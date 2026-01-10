// Test data constants for comprehensive API testing

/**
 * Valid test data
 */
export const VALID_TEST_DATA = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '1990-01-01',
    joiningDate: '2024-01-01',
};

/**
 * Invalid email formats for validation testing
 */
export const INVALID_EMAILS = [
    'invalid-email',
    'missing@domain',
    '@nodomain.com',
    'spaces in@email.com',
    'double@@domain.com',
    'trailing.dot.@domain.com',
    '.leading@domain.com',
    'no-tld@domain',
    '',
    '   ',
    'a'.repeat(255) + '@domain.com', // Too long
];

/**
 * SQL Injection attack vectors
 */
export const SQL_INJECTION_PAYLOADS = [
    "admin'--",
    "admin' OR '1'='1",
    "admin' OR '1'='1'--",
    "admin'; DROP TABLE users--",
    "' OR 1=1--",
    "1' OR '1' = '1",
    "admin'/*",
    "' UNION SELECT NULL--",
    "1'; DELETE FROM users WHERE '1'='1",
];

/**
 * XSS (Cross-Site Scripting) attack vectors
 */
export const XSS_PAYLOADS = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
    '<iframe src="javascript:alert(1)">',
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<select onfocus=alert(1) autofocus>',
    '<textarea onfocus=alert(1) autofocus>',
    '<marquee onstart=alert(1)>',
];

/**
 * Special characters for password testing
 */
export const SPECIAL_CHAR_PASSWORDS = [
    'P@$$w0rd!',
    'Test#123$%^',
    'Pass&*()_+-=',
    'Secure!@#$%^&*()',
    'Complex[]{}|;:',
    'Strong<>?,./`~',
];

/**
 * Unicode and international characters
 */
export const UNICODE_TEST_DATA = {
    emails: [
        '用户@email.com',
        'tëst@ëmail.com',
        'тест@email.com',
        'テスト@email.com',
        'مستخدم@email.com',
    ],
    names: [
        'José García',
        'François Müller',
        '王小明',
        'Владимир',
        'محمد',
    ],
};

/**
 * Edge case inputs
 */
export const EDGE_CASES = {
    whitespace: {
        onlySpaces: '     ',
        leadingSpaces: '  test@email.com',
        trailingSpaces: 'test@email.com  ',
        bothSpaces: '  test@email.com  ',
        tabsAndNewlines: '\t\ntest@email.com\n\t',
    },
    emptyValues: {
        emptyString: '',
        null: null,
        undefined: undefined,
    },
    extremeLengths: {
        veryLongEmail: 'a'.repeat(500) + '@domain.com',
        veryLongPassword: 'P@ss' + 'a'.repeat(500),
        singleChar: 'a',
        maxLength: 'a'.repeat(255),
    },
    caseVariations: {
        allLowercase: 'user@email.com',
        allUppercase: 'USER@EMAIL.COM',
        mixedCase: 'UsEr@EmAiL.CoM',
        camelCase: 'testUser@emailDomain.com',
    },
};

/**
 * Brute force simulation data
 */
export const BRUTE_FORCE_DATA = {
    maxAttempts: 10,
    lockoutDuration: 900, // 15 minutes in seconds
    commonPasswords: [
        'password',
        '123456',
        'password123',
        'admin',
        'qwerty',
        'letmein',
        '12345678',
        'abc123',
        'password1',
        'welcome',
    ],
};

/**
 * Token test data
 */
export const TOKEN_TEST_DATA = {
    expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vVzR6ixZtmJGOlKqr3E_fZ9nZn9nZn9nZn9nZ',
    invalidToken: 'invalid.token.here',
    malformedToken: 'not-a-jwt-token',
    emptyToken: '',
};

/**
 * HTTP status codes for testing
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    LOCKED: 423,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    LOGIN: '/',
    REGISTER: '/register/',
    LOGOUT: '/logout/',
    PROFILE: '/api/profile/',
    TOKEN_VERIFY: '/api/token/verify/',
    TOKEN_REFRESH: '/api/token/refresh/',
    // Attendance endpoints
    PUNCH_STATUS: '/dashboard-punch-status/',
    PUNCH_RECORD: '/emp-punch/',
    MISSING_PUNCH_OUT: '/getmissingpunchout/',
    EARLY_LATE_PUNCH: '/early-late-punch/',
    LATE_CHECKIN_COUNT: '/late-checkin-count/',
    LATE_CHECKIN_REQUEST: '/late-checkin-request/',
    EARLY_CHECKOUT_CREATE: '/createearlycheckout/',
    EARLY_CHECKOUT_DETAILS: '/earlycheckoutdetails/',
    EARLY_CHECKOUT_LIST: '/earlycheckoutlist/',
    // Leave endpoints
    LEAVE_APPLY: '/leaveapplications/',
    LEAVE_LIST: '/leaveapplications-list/',
    LEAVE_BALANCE: '/getemployeeleavebalance/',
    LEAVE_DATA_VIEW: '/getemployeeleavedataview/',
    LEAVE_APPROVALS: '/leaveapprovals/',
    // WFH endpoints
    WFH_REQUEST: '/workfromhomereq/',
    WFH_APPLICATIONS_LIST: '/workfromhomeapplicationslist/',
    WFH_APPROVAL: '/workfromhomeapproval/',
    WFH_APPROVAL_HISTORY: '/workfromhomeapprovalhistory/',
    // Miss Punch endpoints
    MISS_PUNCH: '/misspunch/',
    MISS_PUNCH_DETAILS: '/getmissingpunchdetails/',
    MISS_PUNCH_APPROVAL_LIST: '/misspunchapprovallist/',
    // Workflow & Approvals
    WORKFLOW_APPROVAL: '/workflowapproval/',
    APPROVAL_HISTORY: '/approvalhistory/',
    ALL_APPROVE: '/allapprove/',
    ALL_DISAPPROVE: '/alldisapprove/',
    IS_AWAY_APPROVALS: '/isawayapprovals/',
    APPROVED_DISAPPROVED_LIST: '/approvedisapprovedlist/',
    IS_AWAY_APPROVAL_HISTORY: '/isawayapprovalhistory/',
    EARLY_CHECKOUT_APPROVAL_LIST: '/earlycheckoutapprovallist/',
    // Dashboard & Reports
    EXPECTED_LATE_ARRIVALS: '/expectedlatearrivals/',
    GET_EARLY_CHECKOUTS: '/getearlycheckouts/',
    TODAY_LEAVES: '/todayleaves/',
    TODAY_WFH: '/todayworkfromhome/',
    EMPLOYEE_OF_MONTH: '/getemployeeofthemonth/',
    GET_DOB: '/getdob/',
    GET_ABSENCE: '/getabsence/',
    APPROVED_EARLY_CHECKOUT_DETAILS: '/approvedearlycheckoutdetails/',
    EMPLOYEE_ATTENDANCE: '/employeeattendance/',
    LATE_EARLY_COUNT: '/lateearlyscount/',
    // Upcoming Events
    UPCOMING_LEAVES: '/getupcomingleaves/',
    UPCOMING_WFH: '/getupcomingworkfromhome/',
    MISS_CHECKOUT: '/getmisscheckout/',
};

/**
 * Test timeouts
 */
export const TIMEOUTS = {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    NETWORK_TIMEOUT: 30000,
};

// ==================== ATTENDANCE TEST DATA ====================

/**
 * Attendance punch test data
 */
export const ATTENDANCE_TEST_DATA = {
    validPunchIn: {
        latitude: 23.0225,
        longitude: 72.5714,
        timestamp: new Date().toISOString(),
    },
    invalidCoordinates: [
        { latitude: null, longitude: 72.5714 },
        { latitude: 23.0225, longitude: null },
        { latitude: 'invalid', longitude: 72.5714 },
        { latitude: 91, longitude: 72.5714 }, // Out of range
        { latitude: 23.0225, longitude: 181 }, // Out of range
    ],
    edgeCaseTimes: {
        midnight: '2026-01-08T00:00:00Z',
        justBeforeMidnight: '2026-01-08T23:59:59Z',
        earlyMorning: '2026-01-08T05:00:00Z',
        lateNight: '2026-01-08T23:00:00Z',
    },
    punchTimes: {
        onTime: '09:00:00',
        late: '09:15:00',
        veryLate: '10:30:00',
        early: '08:45:00',
        earlyCheckout: '17:00:00',
        normalCheckout: '18:00:00',
    },
};

/**
 * Date range test data
 */
export const DATE_RANGE_TEST_DATA = {
    validRanges: [
        { from: '2026-01-01', to: '2026-01-31' },
        { from: '2026-01-01', to: '2026-12-31' },
    ],
    invalidRanges: [
        { from: '2026-01-31', to: '2026-01-01' }, // Start > End
        { from: '2026-13-01', to: '2026-12-31' }, // Invalid month
        { from: '2026-01-32', to: '2026-01-31' }, // Invalid day
        { from: 'invalid', to: '2026-01-31' }, // Invalid format
    ],
    edgeCases: {
        sameDay: { from: '2026-01-15', to: '2026-01-15' },
        monthBoundary: { from: '2026-01-31', to: '2026-02-01' },
        yearBoundary: { from: '2025-12-31', to: '2026-01-01' },
        leapYear: { from: '2024-02-28', to: '2024-02-29' },
    },
};

// ==================== LEAVE TEST DATA ====================

/**
 * Leave application test data
 */
export const LEAVE_TEST_DATA = {
    validLeaveTypes: [
        'Casual Leave',
        'Sick Leave',
        'Earned Leave',
        'Maternity Leave',
        'Paternity Leave',
    ],
    invalidLeaveTypes: [
        'Invalid Leave',
        '',
        null,
        123,
    ],
    validReasons: [
        'Personal work',
        'Medical appointment',
        'Family function',
        'Emergency',
    ],
    invalidReasons: [
        '', // Empty
        'a', // Too short
        'a'.repeat(1000), // Too long
    ],
    dateScenarios: {
        singleDay: {
            StartDate: '2026-01-15',
            EndDate: '2026-01-15',
        },
        multipleDays: {
            StartDate: '2026-01-15',
            EndDate: '2026-01-20',
        },
        halfDay: {
            StartDate: '2026-01-15',
            EndDate: '2026-01-15',
            IsHalfDay: true,
            IsFirstHalf: true,
        },
        monthBoundary: {
            StartDate: '2026-01-30',
            EndDate: '2026-02-05',
        },
        yearBoundary: {
            StartDate: '2025-12-28',
            EndDate: '2026-01-05',
        },
    },
    invalidDates: {
        startAfterEnd: {
            StartDate: '2026-01-20',
            EndDate: '2026-01-15',
        },
        pastDates: {
            StartDate: '2025-01-01',
            EndDate: '2025-01-05',
        },
        invalidFormat: {
            StartDate: '01-15-2026',
            EndDate: '01-20-2026',
        },
    },
};

// ==================== WFH TEST DATA ====================

/**
 * Work From Home test data
 */
export const WFH_TEST_DATA = {
    validRequest: {
        DateTime: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        Reason: 'Remote work required for project',
        IsHalfDay: false,
        IsFirstHalf: false,
    },
    halfDayRequest: {
        DateTime: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        Reason: 'Personal appointment in morning',
        IsHalfDay: true,
        IsFirstHalf: true,
    },
    invalidRequests: [
        {
            DateTime: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
            Reason: 'Past date',
        },
        {
            DateTime: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            Reason: '', // Empty reason
        },
        {
            DateTime: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            Reason: 'a', // Too short
        },
    ],
};

// ==================== MISS PUNCH TEST DATA ====================

/**
 * Miss punch test data
 */
export const MISS_PUNCH_TEST_DATA = {
    validRequest: {
        datetime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        PunchType: 'out',
        reason: 'Forgot to punch out',
    },
    invalidRequests: [
        {
            datetime: new Date(Date.now() + 86400000).toISOString(), // Future
            PunchType: 'out',
            reason: 'Future date',
        },
        {
            datetime: new Date(Date.now() - 86400000 * 10).toISOString(), // Too old
            PunchType: 'out',
            reason: 'More than 7 days old',
        },
        {
            datetime: new Date(Date.now() - 86400000).toISOString(),
            PunchType: 'invalid', // Invalid type
            reason: 'Invalid punch type',
        },
        {
            datetime: new Date(Date.now() - 86400000).toISOString(),
            PunchType: 'out',
            reason: '', // Empty reason
        },
    ],
    punchTypes: ['in', 'out'],
    invalidPunchTypes: ['', 'invalid', null, 123],
};

// ==================== APPROVAL WORKFLOW TEST DATA ====================

/**
 * Approval workflow test data
 */
export const APPROVAL_TEST_DATA = {
    approvalStatuses: [
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled',
    ],
    priorities: [1, 2, 3, 4, 5],
    bulkOperations: {
        approveAll: {
            action: 'approve',
            count: 10,
        },
        disapproveAll: {
            action: 'disapprove',
            reason: 'Insufficient information',
            count: 5,
        },
    },
};

// ==================== BOUNDARY VALUE TEST DATA ====================

/**
 * Boundary value test cases
 */
export const BOUNDARY_VALUES = {
    integers: {
        zero: 0,
        negative: -1,
        maxInt: 2147483647,
        minInt: -2147483648,
    },
    strings: {
        empty: '',
        singleChar: 'a',
        maxLength: 'a'.repeat(255),
        tooLong: 'a'.repeat(1000),
    },
    arrays: {
        empty: [],
        single: [1],
        large: Array(1000).fill(1),
    },
    dates: {
        epoch: '1970-01-01',
        y2k: '2000-01-01',
        leapYear: '2024-02-29',
        farFuture: '2099-12-31',
    },
};

// ==================== PERFORMANCE TEST DATA ====================

/**
 * Performance test scenarios
 */
export const PERFORMANCE_TEST_DATA = {
    concurrentUsers: [1, 10, 50, 100],
    requestCounts: [10, 100, 1000],
    responseTimeTargets: {
        authentication: 2000, // 2s
        simpleGet: 1000, // 1s
        complexQuery: 2000, // 2s
        postRequest: 2000, // 2s
        bulkOperation: 5000, // 5s
    },
};

// ==================== TIMEZONE TEST DATA ====================

/**
 * Timezone test data
 */
export const TIMEZONE_TEST_DATA = {
    timezones: [
        'Asia/Kolkata', // IST (UTC+5:30)
        'America/New_York', // EST/EDT
        'Europe/London', // GMT/BST
        'Asia/Tokyo', // JST
        'Australia/Sydney', // AEDT
    ],
    dstTransitions: {
        springForward: '2026-03-08T02:00:00', // US DST start
        fallBack: '2026-11-01T02:00:00', // US DST end
    },
};
