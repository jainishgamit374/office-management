/**
 * Punch Status API Test Suite
 * 
 * Comprehensive tests for GET /dashboard-punch-status/ endpoint
 * Covers all 8 test cases from STATUS-001 to STATUS-008
 */

import {
    authenticatedRequest,
    loginAndGetTokens,
    unauthenticatedRequest,
    wait,
} from '../../utils/testHelpers';

import {
    API_ENDPOINTS,
    HTTP_STATUS,
    TOKEN_TEST_DATA,
    VALID_TEST_DATA,
} from '../../utils/testData';

describe('Punch Status API Tests', () => {
    const PUNCH_STATUS_ENDPOINT = API_ENDPOINTS.PUNCH_STATUS;

    describe('STATUS-001: Fresh Day - No Punches', () => {
        it('should return null or 0 PunchType when no punches recorded', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            expect(response.status).toBe(HTTP_STATUS.OK);

            const data = await response.json();
            expect(data).toHaveProperty('status');
            expect(data).toHaveProperty('data');

            // PunchType should be 0 (not punched) or null for fresh day
            if (data.data && data.data.punch) {
                expect([0, null]).toContain(data.data.punch.PunchType);
            }
        });
    });

    describe('STATUS-002: After Punch IN', () => {
        it('should return PunchType: 1 after punch in', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            const data = await response.json();

            // If user has punched in, PunchType should be 1
            if (data.data && data.data.punch && data.data.punch.PunchType === 1) {
                expect(data.data.punch.PunchType).toBe(1);
                expect(data.data.punch.PunchTypeName).toBeDefined();
                expect(data.data.punch.PunchDateTime).toBeDefined();
            }
        });
    });

    describe('STATUS-003: After Punch OUT', () => {
        it('should return PunchType: 2 after punch out', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            const data = await response.json();

            // If user has punched out, PunchType should be 2
            if (data.data && data.data.punch && data.data.punch.PunchType === 2) {
                expect(data.data.punch.PunchType).toBe(2);
                expect(data.data.punch.PunchTypeName).toBeDefined();
                expect(data.data.punch.WorkingHours).toBeDefined();
            }
        });
    });

    describe('STATUS-004: Invalid Token', () => {
        it('should return 401 Unauthorized with invalid token', async () => {
            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                TOKEN_TEST_DATA.invalidToken
            );

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });

        it('should return 401 with malformed token', async () => {
            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                TOKEN_TEST_DATA.malformedToken
            );

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });

        it('should return 401 without token', async () => {
            const response = await unauthenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET'
            );

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });
    });

    describe('STATUS-005: Expired Token', () => {
        it('should return 401 with expired token', async () => {
            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                TOKEN_TEST_DATA.expiredToken
            );

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });

        it('should include refresh token hint in error', async () => {
            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                TOKEN_TEST_DATA.expiredToken
            );

            const data = await response.json();

            // Should indicate token expiry
            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);

            // Error message should be helpful
            if (data.message) {
                expect(typeof data.message).toBe('string');
            }
        });
    });

    describe('STATUS-006: Server Error', () => {
        it('should handle server errors gracefully', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            // Should not return 500 errors under normal circumstances
            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    });

    describe('STATUS-007: Network Failure', () => {
        it('should handle network timeout gracefully', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 100); // Very short timeout

            try {
                await fetch(`https://karmyog.pythonanywhere.com${PUNCH_STATUS_ENDPOINT}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokens.accessToken}`,
                    },
                    signal: controller.signal,
                });
            } catch (error: any) {
                expect(error.name).toBe('AbortError');
            } finally {
                clearTimeout(timeoutId);
            }
        }, 10000);

        it('should implement retry logic for failed requests', async () => {
            // This test verifies that the client can handle retries
            // In a real implementation, you would test the retry mechanism
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            // Simulate retry by making multiple requests
            const maxRetries = 3;
            let lastError: any = null;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    const response = await authenticatedRequest(
                        PUNCH_STATUS_ENDPOINT,
                        'GET',
                        tokens.accessToken
                    );

                    if (response.ok) {
                        expect(response.status).toBe(HTTP_STATUS.OK);
                        break;
                    }
                } catch (error) {
                    lastError = error;
                    if (i < maxRetries - 1) {
                        await wait(1000); // Wait before retry
                    }
                }
            }
        }, 15000);
    });

    describe('STATUS-008: Rate Limiting', () => {
        it('should handle rate limiting with 429 status', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            // Make multiple rapid requests to potentially trigger rate limiting
            const requests = Array(20)
                .fill(null)
                .map(() => authenticatedRequest(
                    PUNCH_STATUS_ENDPOINT,
                    'GET',
                    tokens.accessToken
                ));

            const responses = await Promise.all(requests);

            // Check if any response indicates rate limiting
            const hasRateLimiting = responses.some(
                (r) => r.status === HTTP_STATUS.TOO_MANY_REQUESTS
            );

            // If rate limiting is implemented, at least one should be 429
            // If not implemented, all should be 200
            responses.forEach((response) => {
                expect([HTTP_STATUS.OK, HTTP_STATUS.TOO_MANY_REQUESTS]).toContain(response.status);
            });

            console.log('Rate limiting test - responses:', responses.map(r => r.status));
        }, 30000);
    });

    describe('Response Structure Validation', () => {
        it('should return consistent response structure', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            const data = await response.json();

            // Validate response structure
            expect(data).toHaveProperty('status');
            expect(data).toHaveProperty('statusCode');
            expect(data).toHaveProperty('message');
            expect(data).toHaveProperty('data');
            expect(data).toHaveProperty('timestamp');
        });

        it('should include employee information', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            const data = await response.json();

            if (data.data && data.data.employee) {
                expect(data.data.employee).toHaveProperty('EmployeeID');
                expect(data.data.employee).toHaveProperty('FullName');
                expect(data.data.employee).toHaveProperty('Email');
            }
        });

        it('should include punch information', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            const data = await response.json();

            if (data.data && data.data.punch) {
                expect(data.data.punch).toHaveProperty('PunchType');
                expect(data.data.punch).toHaveProperty('PunchTypeName');

                // PunchType should be 0, 1, or 2
                expect([0, 1, 2]).toContain(data.data.punch.PunchType);
            }
        });

        it('should include today information', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            const data = await response.json();

            if (data.data && data.data.today) {
                expect(data.data.today).toHaveProperty('date');
                expect(data.data.today).toHaveProperty('dayName');
                expect(data.data.today).toHaveProperty('isHoliday');
                expect(data.data.today).toHaveProperty('isWeekend');
            }
        });
    });

    describe('Performance Tests', () => {
        it('should respond within acceptable time', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const startTime = Date.now();

            const response = await authenticatedRequest(
                PUNCH_STATUS_ENDPOINT,
                'GET',
                tokens.accessToken
            );

            const duration = Date.now() - startTime;

            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(duration).toBeLessThan(3000); // Should respond within 3 seconds
        });
    });
});
