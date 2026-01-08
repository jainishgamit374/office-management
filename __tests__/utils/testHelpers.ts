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

export { API_BASE_URL, HTTP_STATUS };
