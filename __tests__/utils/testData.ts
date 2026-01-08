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
    // Leave endpoints
    LEAVE_APPLY: '/leaveapplications/',
    LEAVE_BALANCE: '/getemployeeleavebalance/',
    LEAVE_CANCEL: '/leaveapplications/:id/cancel/',
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
