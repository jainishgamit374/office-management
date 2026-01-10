// Test helper functions and utilities
import { API_ENDPOINTS, HTTP_STATUS } from './testData';

const API_BASE_URL = process.env.API_BASE_URL || 'https://karmyog.pythonanywhere.com';

/**
 * Authentication helper - Login and get tokens
 */
export async function loginAndGetTokens(
    email: string,
    password: string
): Promise<{ accessToken: string; refreshToken: string; user: any } | null> {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                Email: email,
                Password: password,
            }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (data.status === 'Success' && data.data?.access_token) {
            return {
                accessToken: data.data.access_token,
                refreshToken: data.data.refresh_token,
                user: {
                    id: data.data.UserID,
                    email: data.data.Email,
                    firstName: data.data.FirstName,
                    lastName: data.data.LastName,
                },
            };
        }

        return null;
    } catch (error) {
        console.error('Login helper error:', error);
        return null;
    }
}

/**
 * Make authenticated API request
 */
export async function authenticatedRequest(
    endpoint: string,
    method: string = 'GET',
    token: string,
    body?: any
): Promise<Response> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    return fetch(`${API_BASE_URL}${endpoint}`, options);
}

/**
 * Make unauthenticated API request
 */
export async function unauthenticatedRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any
): Promise<Response> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    return fetch(`${API_BASE_URL}${endpoint}`, options);
}

/**
 * Wait for a specified duration
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random email
 */
export function generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `test.${timestamp}.${random}@example.com`;
}

/**
 * Generate random password
 */
export function generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

/**
 * Decode JWT token payload (without verification)
 */
export function decodeJWT(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
        return true;
    }
    return Date.now() >= decoded.exp * 1000;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasUppercase && hasLowercase && hasNumber;
}

/**
 * Sanitize input to check for XSS/SQL injection
 */
export function containsMaliciousCode(input: string): boolean {
    const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /DROP TABLE/i,
        /DELETE FROM/i,
        /INSERT INTO/i,
        /UPDATE.*SET/i,
        /UNION.*SELECT/i,
        /--/,
        /;.*--/,
    ];
    return maliciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Measure response time
 */
export async function measureResponseTime(
    requestFn: () => Promise<any>
): Promise<{ result: any; duration: number }> {
    const startTime = Date.now();
    const result = await requestFn();
    const duration = Date.now() - startTime;
    return { result, duration };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                await wait(delay);
            }
        }
    }
    throw lastError;
}

/**
 * Create test user (for setup)
 */
export async function createTestUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    joiningDate: string;
}): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await unauthenticatedRequest(API_ENDPOINTS.REGISTER, 'POST', {
            FName: userData.firstName,
            LName: userData.lastName,
            Email: userData.email,
            DOB: userData.dateOfBirth,
            JoiningDate: userData.joiningDate,
            Password: userData.password,
            ConfirmPassword: userData.password,
        });

        const data = await response.json();
        return {
            success: data.status === 'Success',
            message: data.message,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
}

/**
 * Cleanup test user (for teardown)
 */
export async function cleanupTestUser(email: string, password: string): Promise<void> {
    // Note: This requires a delete user endpoint on the backend
    // For now, we'll just log the cleanup attempt
    console.log(`Cleanup: Would delete test user ${email}`);
}

/**
 * Assert response structure
 */
export function assertResponseStructure(
    data: any,
    expectedFields: string[]
): { valid: boolean; missingFields: string[] } {
    const missingFields = expectedFields.filter((field) => !(field in data));
    return {
        valid: missingFields.length === 0,
        missingFields,
    };
}

/**
 * Generate test report summary
 */
export function generateTestSummary(results: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
}): string {
    const passRate = ((results.passed / results.total) * 100).toFixed(2);
    return `
╔════════════════════════════════════════╗
║         Test Summary                   ║
╠════════════════════════════════════════╣
║ Total:   ${results.total.toString().padEnd(30)}║
║ Passed:  ${results.passed.toString().padEnd(30)}║
║ Failed:  ${results.failed.toString().padEnd(30)}║
║ Skipped: ${results.skipped.toString().padEnd(30)}║
║ Pass Rate: ${passRate}%${' '.repeat(25 - passRate.length)}║
╚════════════════════════════════════════╝
  `.trim();
}

// ==================== ADVANCED TESTING UTILITIES ====================

/**
 * Performance testing - Measure throughput (requests per second)
 */
export async function measureThroughput(
    requestFn: () => Promise<any>,
    durationMs: number = 10000
): Promise<{ requestsPerSecond: number; totalRequests: number; errors: number }> {
    const startTime = Date.now();
    let totalRequests = 0;
    let errors = 0;

    while (Date.now() - startTime < durationMs) {
        try {
            await requestFn();
            totalRequests++;
        } catch (error) {
            errors++;
        }
    }

    const actualDuration = (Date.now() - startTime) / 1000;
    const requestsPerSecond = totalRequests / actualDuration;

    return { requestsPerSecond, totalRequests, errors };
}

/**
 * Load testing - Simulate concurrent users
 */
export async function simulateConcurrentUsers(
    requestFn: () => Promise<any>,
    userCount: number
): Promise<{
    successful: number;
    failed: number;
    avgResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
}> {
    const promises = Array(userCount)
        .fill(null)
        .map(async () => {
            const startTime = Date.now();
            try {
                await requestFn();
                return { success: true, duration: Date.now() - startTime };
            } catch (error) {
                return { success: false, duration: Date.now() - startTime };
            }
        });

    const results = await Promise.all(promises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const durations = results.map((r) => r.duration);

    return {
        successful,
        failed,
        avgResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
        maxResponseTime: Math.max(...durations),
        minResponseTime: Math.min(...durations),
    };
}

/**
 * Rate limiting test - Check if rate limiting is enforced
 */
export async function testRateLimiting(
    requestFn: () => Promise<Response>,
    requestCount: number = 20,
    delayMs: number = 100
): Promise<{ rateLimited: boolean; limitReachedAt: number | null }> {
    for (let i = 0; i < requestCount; i++) {
        const response = await requestFn();
        if (response.status === 429) {
            return { rateLimited: true, limitReachedAt: i + 1 };
        }
        await wait(delayMs);
    }
    return { rateLimited: false, limitReachedAt: null };
}

/**
 * Security testing - Test for SQL injection vulnerability
 */
export async function testSQLInjection(
    endpoint: string,
    method: string,
    fieldName: string,
    sqlPayloads: string[]
): Promise<{ vulnerable: boolean; vulnerablePayloads: string[] }> {
    const vulnerablePayloads: string[] = [];

    for (const payload of sqlPayloads) {
        try {
            const body = { [fieldName]: payload };
            const response = await unauthenticatedRequest(endpoint, method, body);
            const data = await response.json();

            // Check for SQL error messages or successful injection
            const responseText = JSON.stringify(data).toLowerCase();
            if (
                responseText.includes('sql') ||
                responseText.includes('syntax') ||
                responseText.includes('mysql') ||
                responseText.includes('postgresql') ||
                data.status === 'Success' // Successful injection
            ) {
                vulnerablePayloads.push(payload);
            }
        } catch (error) {
            // Network errors are not vulnerabilities
        }
    }

    return {
        vulnerable: vulnerablePayloads.length > 0,
        vulnerablePayloads,
    };
}

/**
 * Security testing - Test for XSS vulnerability
 */
export async function testXSS(
    endpoint: string,
    method: string,
    fieldName: string,
    xssPayloads: string[]
): Promise<{ vulnerable: boolean; vulnerablePayloads: string[] }> {
    const vulnerablePayloads: string[] = [];

    for (const payload of xssPayloads) {
        try {
            const body = { [fieldName]: payload };
            const response = await unauthenticatedRequest(endpoint, method, body);
            const data = await response.json();

            // Check if payload is reflected unsanitized
            const responseText = JSON.stringify(data);
            if (responseText.includes(payload) && payload.includes('<')) {
                vulnerablePayloads.push(payload);
            }
        } catch (error) {
            // Network errors are not vulnerabilities
        }
    }

    return {
        vulnerable: vulnerablePayloads.length > 0,
        vulnerablePayloads,
    };
}

/**
 * Authorization testing - Check if user can access other user's data
 */
export async function testAuthorizationBypass(
    endpoint: string,
    token: string,
    otherUserId: number
): Promise<{ vulnerable: boolean; message: string }> {
    try {
        // Try to access other user's data by manipulating user ID
        const response = await authenticatedRequest(
            `${endpoint}?user_id=${otherUserId}`,
            'GET',
            token
        );

        if (response.ok) {
            return {
                vulnerable: true,
                message: 'Successfully accessed other user data',
            };
        }

        return {
            vulnerable: false,
            message: 'Authorization check passed',
        };
    } catch (error) {
        return {
            vulnerable: false,
            message: 'Request failed (expected)',
        };
    }
}

/**
 * Mock data factory - Generate attendance punch data
 */
export function generateMockPunchData(overrides: any = {}) {
    return {
        latitude: 23.0225,
        longitude: 72.5714,
        timestamp: new Date().toISOString(),
        ...overrides,
    };
}

/**
 * Mock data factory - Generate leave application data
 */
export function generateMockLeaveApplication(overrides: any = {}) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 7); // 7 days from now
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 2); // 2 days duration

    return {
        StartDate: startDate.toISOString().split('T')[0],
        EndDate: endDate.toISOString().split('T')[0],
        LeaveType: 'Casual Leave',
        Reason: 'Personal work',
        IsHalfDay: false,
        IsFirstHalf: false,
        ...overrides,
    };
}

/**
 * Mock data factory - Generate WFH request data
 */
export function generateMockWFHRequest(overrides: any = {}) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
        DateTime: tomorrow.toISOString().split('T')[0],
        Reason: 'Remote work required',
        IsHalfDay: false,
        IsFirstHalf: false,
        ...overrides,
    };
}

/**
 * Mock data factory - Generate miss punch request data
 */
export function generateMockMissPunchRequest(overrides: any = {}) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return {
        datetime: yesterday.toISOString(),
        PunchType: 'out',
        reason: 'Forgot to punch out',
        ...overrides,
    };
}

/**
 * Date utility - Generate date range
 */
export function generateDateRange(
    startDate: Date,
    endDate: Date
): { fromDate: string; toDate: string } {
    return {
        fromDate: startDate.toISOString().split('T')[0],
        toDate: endDate.toISOString().split('T')[0],
    };
}

/**
 * Date utility - Get current month date range
 */
export function getCurrentMonthRange(): { fromDate: string; toDate: string } {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return generateDateRange(firstDay, lastDay);
}

/**
 * Validation helper - Check if response matches expected structure
 */
export function validateResponseStructure(
    response: any,
    expectedStructure: Record<string, string>
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, type] of Object.entries(expectedStructure)) {
        if (!(field in response)) {
            errors.push(`Missing field: ${field}`);
        } else if (typeof response[field] !== type && type !== 'any') {
            errors.push(`Field ${field} has wrong type: expected ${type}, got ${typeof response[field]}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Test fixture - Create test user with cleanup
 */
export async function withTestUser<T>(
    testFn: (user: { email: string; password: string; token: string }) => Promise<T>
): Promise<T> {
    const email = generateRandomEmail();
    const password = generateRandomPassword();

    // Create test user
    await createTestUser({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        joiningDate: new Date().toISOString().split('T')[0],
    });

    // Login to get token
    const tokens = await loginAndGetTokens(email, password);
    if (!tokens) {
        throw new Error('Failed to login test user');
    }

    try {
        // Run test
        return await testFn({ email, password, token: tokens.accessToken });
    } finally {
        // Cleanup
        await cleanupTestUser(email, password);
    }
}

/**
 * Assertion helper - Assert response is successful
 */
export function assertSuccessResponse(response: any) {
    expect(response).toHaveProperty('status');
    expect(response.status).toBe('Success');
    expect(response).toHaveProperty('data');
}

/**
 * Assertion helper - Assert response is error
 */
export function assertErrorResponse(response: any, expectedStatus?: number) {
    expect(response).toHaveProperty('status');
    expect(response.status).not.toBe('Success');
    expect(response).toHaveProperty('message');
    if (expectedStatus) {
        expect(response.statusCode).toBe(expectedStatus);
    }
}

export { API_BASE_URL, HTTP_STATUS };
