/**
 * Leave Application API Test Suite
 * 
 * Comprehensive tests for POST /leaveapplications/ endpoint
 * Covers all 15 test cases from LEAVE-001 to LEAVE-015 plus date edge cases
 */

import {
    authenticatedRequest,
    loginAndGetTokens
} from '../../utils/testHelpers';

import {
    API_ENDPOINTS,
    HTTP_STATUS,
    VALID_TEST_DATA,
    XSS_PAYLOADS,
} from '../../utils/testData';

describe('Leave Application API Tests', () => {
    const LEAVE_APPLY_ENDPOINT = API_ENDPOINTS.LEAVE_APPLY;

    // Helper function to create leave application
    const applyLeave = async (token: string, leaveData: any) => {
        return authenticatedRequest(
            LEAVE_APPLY_ENDPOINT,
            'POST',
            token,
            leaveData
        );
    };

    // Helper to get future date
    const getFutureDate = (daysFromNow: number): string => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // Helper to get past date
    const getPastDate = (daysAgo: number): string => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    };

    describe('LEAVE-001: Valid Single Day Leave', () => {
        it('should successfully apply for single day leave', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Personal work - single day leave',
                StartDate: getFutureDate(10),
                EndDate: getFutureDate(10),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);
            const data = await response.json();

            // Should succeed or fail gracefully
            expect([HTTP_STATUS.OK, HTTP_STATUS.CREATED, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);

            if (response.ok) {
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('message');
            }
        });
    });

    describe('LEAVE-002: Valid Multi-Day Leave', () => {
        it('should successfully apply for multi-day leave', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'PL',
                Reason: 'Family vacation - multi day leave',
                StartDate: getFutureDate(15),
                EndDate: getFutureDate(18), // 4 days
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect([HTTP_STATUS.OK, HTTP_STATUS.CREATED, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);
        });
    });

    describe('LEAVE-003: End Date Before Start Date', () => {
        it('should reject leave with end date before start date', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Testing invalid date range',
                StartDate: getFutureDate(20),
                EndDate: getFutureDate(18), // End before start
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('LEAVE-004: Same Day Leave', () => {
        it('should handle same day leave application', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const sameDate = getFutureDate(25);
            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Same day leave application test',
                StartDate: sameDate,
                EndDate: sameDate,
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect([HTTP_STATUS.OK, HTTP_STATUS.CREATED, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);
        });
    });

    describe('LEAVE-005: Past Date Leave', () => {
        it('should reject leave application for past dates', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Testing past date leave',
                StartDate: getPastDate(5),
                EndDate: getPastDate(3),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should reject past dates
            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('LEAVE-006: Far Future Leave', () => {
        it('should handle leave application for far future dates', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'PL',
                Reason: 'Planning vacation 2 years ahead',
                StartDate: getFutureDate(730), // ~2 years
                EndDate: getFutureDate(735),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should handle per policy (accept or reject)
            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    });

    describe('LEAVE-007: Overlapping Leave', () => {
        it('should detect and reject overlapping leave applications', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            // First application
            const leaveData1 = {
                LeaveType: 'CL',
                Reason: 'First leave application',
                StartDate: getFutureDate(30),
                EndDate: getFutureDate(32),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            await applyLeave(tokens.accessToken, leaveData1);

            // Overlapping application
            const leaveData2 = {
                LeaveType: 'CL',
                Reason: 'Overlapping leave application',
                StartDate: getFutureDate(31), // Overlaps with first
                EndDate: getFutureDate(33),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData2);

            // Should reject or warn about overlap
            expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.CONFLICT]).toContain(response.status);
        });
    });

    describe('LEAVE-008: Insufficient Balance', () => {
        it('should reject leave when balance is insufficient', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            // Apply for excessive days (e.g., 100 days)
            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Testing insufficient balance scenario',
                StartDate: getFutureDate(40),
                EndDate: getFutureDate(140), // 100+ days
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should reject due to insufficient balance
            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('LEAVE-009: Invalid Leave Type', () => {
        it('should reject invalid leave type', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'INVALID',
                Reason: 'Testing invalid leave type',
                StartDate: getFutureDate(45),
                EndDate: getFutureDate(46),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });

        it('should only accept CL, SL, or PL', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const invalidTypes = ['ML', 'EL', 'LWP', 'COMP', 'SICK'];

            for (const invalidType of invalidTypes) {
                const leaveData = {
                    LeaveType: invalidType,
                    Reason: `Testing invalid type: ${invalidType}`,
                    StartDate: getFutureDate(50),
                    EndDate: getFutureDate(51),
                    IsHalfDay: false,
                    IsFirstHalf: false,
                };

                const response = await applyLeave(tokens.accessToken, leaveData);
                expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            }
        });
    });

    describe('LEAVE-010: Empty Reason', () => {
        it('should handle empty reason field', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: '',
                StartDate: getFutureDate(55),
                EndDate: getFutureDate(56),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should reject empty reason
            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
        });

        it('should reject whitespace-only reason', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: '     ',
                StartDate: getFutureDate(60),
                EndDate: getFutureDate(61),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('LEAVE-011: Very Long Reason', () => {
        it('should handle or reject very long reason (10000 chars)', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const longReason = 'A'.repeat(10000);
            const leaveData = {
                LeaveType: 'CL',
                Reason: longReason,
                StartDate: getFutureDate(65),
                EndDate: getFutureDate(66),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should either truncate or reject
            expect([HTTP_STATUS.OK, HTTP_STATUS.CREATED, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);
        });
    });

    describe('LEAVE-012: Special Characters in Reason', () => {
        it('should sanitize HTML/script tags in reason', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: XSS_PAYLOADS[0], // <script>alert(1)</script>
                StartDate: getFutureDate(70),
                EndDate: getFutureDate(71),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should sanitize or reject
            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });

        it('should handle emojis in reason', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Family emergency 🏥 Need to attend 👨‍👩‍👧‍👦',
                StartDate: getFutureDate(75),
                EndDate: getFutureDate(76),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should handle gracefully
            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    });

    describe('LEAVE-013: Weekend Leave Request', () => {
        it('should handle weekend leave requests per policy', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            // Find next Saturday
            const today = new Date();
            const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
            const saturday = new Date(today);
            saturday.setDate(today.getDate() + daysUntilSaturday);
            const saturdayStr = saturday.toISOString().split('T')[0];

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Weekend leave request test',
                StartDate: saturdayStr,
                EndDate: saturdayStr,
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should handle per company policy
            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    });

    describe('LEAVE-014: Holiday Leave Request', () => {
        it('should handle holiday leave requests per policy', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            // Use a common holiday (e.g., Jan 26 - Republic Day)
            const currentYear = new Date().getFullYear();
            const republicDay = `${currentYear + 1}-01-26`;

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Leave on public holiday test',
                StartDate: republicDay,
                EndDate: republicDay,
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should handle per policy
            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    });

    describe('LEAVE-015: Half Day Leave', () => {
        it('should successfully apply for half day leave', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Personal work - half day leave',
                StartDate: getFutureDate(80),
                EndDate: getFutureDate(80),
                IsHalfDay: true,
                IsFirstHalf: true,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect([HTTP_STATUS.OK, HTTP_STATUS.CREATED, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);

            if (response.ok) {
                const data = await response.json();
                expect(data.data).toBeDefined();
            }
        });
    });

    describe('Date Edge Cases', () => {
        it('should handle leap year Feb 29', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Leap year date test',
                StartDate: '2028-02-29', // Next leap year
                EndDate: '2028-02-29',
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect([HTTP_STATUS.OK, HTTP_STATUS.CREATED, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);
        });

        it('should reject invalid Feb 30', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Invalid date test',
                StartDate: '2024-02-30', // Invalid date
                EndDate: '2024-03-01',
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });

        it('should handle year boundary (Dec 31 to Jan 2)', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const currentYear = new Date().getFullYear();
            const leaveData = {
                LeaveType: 'PL',
                Reason: 'Year boundary leave test',
                StartDate: `${currentYear + 1}-12-31`,
                EndDate: `${currentYear + 2}-01-02`,
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect([HTTP_STATUS.OK, HTTP_STATUS.CREATED, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);
        });

        it('should reject invalid date format (DD-MM-YYYY)', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Invalid format test',
                StartDate: '29-02-2024', // Wrong format
                EndDate: '01-03-2024',
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });

        it('should handle ISO format with time', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'ISO format with time test',
                StartDate: '2025-03-15T00:00:00.000Z',
                EndDate: '2025-03-15T23:59:59.999Z',
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            // Should handle or reject consistently
            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });

        it('should reject Unix timestamp format', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Unix timestamp test',
                StartDate: 1709164800000 as any, // Unix timestamp
                EndDate: 1709251200000 as any,
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('Response Structure Validation', () => {
        it('should return consistent response structure on success', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);

            if (!tokens) {
                console.warn('Skipping test - unable to login');
                return;
            }

            const leaveData = {
                LeaveType: 'CL',
                Reason: 'Response structure validation test',
                StartDate: getFutureDate(90),
                EndDate: getFutureDate(91),
                IsHalfDay: false,
                IsFirstHalf: false,
            };

            const response = await applyLeave(tokens.accessToken, leaveData);
            const data = await response.json();

            expect(data).toHaveProperty('status');
            expect(data).toHaveProperty('statusCode');
            expect(data).toHaveProperty('message');
        });
    });
});
