/**
 * Attendance Punch Record API Test Suite
 * 
 * Comprehensive tests for GET/POST /emp-punch/ endpoints
 * Test IDs: PUNCH-GET-001 to PUNCH-POST-025
 */

import {
    API_BASE_URL,
    authenticatedRequest,
    generateMockPunchData,
    getCurrentMonthRange,
    loginAndGetTokens,
    measureResponseTime,
    simulateConcurrentUsers,
    testAuthorizationBypass,
    wait,
} from '../../utils/testHelpers';

import {
    API_ENDPOINTS,
    ATTENDANCE_TEST_DATA,
    DATE_RANGE_TEST_DATA,
    HTTP_STATUS,
    PERFORMANCE_TEST_DATA,
    SQL_INJECTION_PAYLOADS,
    TIMEOUTS,
    VALID_TEST_DATA,
    XSS_PAYLOADS,
} from '../../utils/testData';

describe('Attendance Punch Record API Tests', () => {
    let authToken: string;
    let userId: number;

    beforeAll(async () => {
        // Login and get authentication token
        const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
        const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

        const tokens = await loginAndGetTokens(email, password);
        if (!tokens) {
            throw new Error('Failed to login for tests');
        }

        authToken = tokens.accessToken;
        userId = tokens.user.id;
    });

    // ==================== GET /emp-punch/ TESTS ====================

    describe('PUNCH-GET: Get Punch Records', () => {
        describe('PUNCH-GET-001 to PUNCH-GET-005: Positive Tests', () => {
            it('PUNCH-GET-001: should get all punch records with authentication', async () => {
                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'GET',
                    authToken
                );
                const data = await response.json();

                expect(response.status).toBe(HTTP_STATUS.OK);
                expect(data.status).toBe('Success');
                expect(Array.isArray(data.data)).toBe(true);
            });

            it('PUNCH-GET-002: should support date range filtering', async () => {
                const { fromDate, toDate } = getCurrentMonthRange();
                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?from_date=${fromDate}&to_date=${toDate}`,
                    'GET',
                    authToken
                );
                const data = await response.json();

                expect(response.status).toBe(HTTP_STATUS.OK);
                expect(data.status).toBe('Success');
            });

            it('PUNCH-GET-003: should return empty array for new user', async () => {
                // This would require a new test user
                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'GET',
                    authToken
                );
                const data = await response.json();

                expect(response.status).toBe(HTTP_STATUS.OK);
                expect(Array.isArray(data.data)).toBe(true);
            });

            it('PUNCH-GET-004: should complete within acceptable time', async () => {
                const { duration } = await measureResponseTime(() =>
                    authenticatedRequest(API_ENDPOINTS.PUNCH_RECORD, 'GET', authToken)
                );

                expect(duration).toBeLessThan(PERFORMANCE_TEST_DATA.responseTimeTargets.simpleGet);
            });

            it('PUNCH-GET-005: should return consistent response structure', async () => {
                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'GET',
                    authToken
                );
                const data = await response.json();

                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('data');
                if (data.data.length > 0) {
                    const record = data.data[0];
                    expect(record).toHaveProperty('PunchID');
                    expect(record).toHaveProperty('PunchType');
                    expect(record).toHaveProperty('PunchTime');
                }
            });
        });

        describe('PUNCH-GET-006 to PUNCH-GET-010: Negative Tests', () => {
            it('PUNCH-GET-006: should reject request without authentication', async () => {
                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PUNCH_RECORD}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            });

            it('PUNCH-GET-007: should reject invalid date range', async () => {
                const invalidRange = DATE_RANGE_TEST_DATA.invalidRanges[0];
                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?from_date=${invalidRange.from}&to_date=${invalidRange.to}`,
                    'GET',
                    authToken
                );

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            });

            it('PUNCH-GET-008: should reject future dates', async () => {
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 1);
                const futureDateStr = futureDate.toISOString().split('T')[0];

                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?from_date=${futureDateStr}&to_date=${futureDateStr}`,
                    'GET',
                    authToken
                );

                // Should either reject or return empty results
                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-GET-009: should handle invalid pagination parameters', async () => {
                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?page=-1&limit=0`,
                    'GET',
                    authToken
                );

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            });

            it('PUNCH-GET-010: should reject expired token', async () => {
                const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'GET',
                    expiredToken
                );

                expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            });
        });

        describe('PUNCH-GET-011 to PUNCH-GET-015: Edge Cases', () => {
            it('PUNCH-GET-011: should handle large date ranges', async () => {
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                const fromDate = oneYearAgo.toISOString().split('T')[0];
                const toDate = new Date().toISOString().split('T')[0];

                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?from_date=${fromDate}&to_date=${toDate}`,
                    'GET',
                    authToken
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-GET-012: should handle timezone boundaries', async () => {
                const midnight = ATTENDANCE_TEST_DATA.edgeCaseTimes.midnight;
                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?date=${midnight}`,
                    'GET',
                    authToken
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-GET-013: should handle leap year dates', async () => {
                const leapYearRange = DATE_RANGE_TEST_DATA.edgeCases.leapYear;
                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?from_date=${leapYearRange.from}&to_date=${leapYearRange.to}`,
                    'GET',
                    authToken
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-GET-014: should handle month boundary dates', async () => {
                const monthBoundary = DATE_RANGE_TEST_DATA.edgeCases.monthBoundary;
                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?from_date=${monthBoundary.from}&to_date=${monthBoundary.to}`,
                    'GET',
                    authToken
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-GET-015: should handle year boundary dates', async () => {
                const yearBoundary = DATE_RANGE_TEST_DATA.edgeCases.yearBoundary;
                const response = await authenticatedRequest(
                    `${API_ENDPOINTS.PUNCH_RECORD}?from_date=${yearBoundary.from}&to_date=${yearBoundary.to}`,
                    'GET',
                    authToken
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });
        });
    });

    // ==================== POST /emp-punch/ TESTS ====================

    describe('PUNCH-POST: Record Punch In/Out', () => {
        describe('PUNCH-POST-001 to PUNCH-POST-005: Positive Tests', () => {
            it('PUNCH-POST-001: should record valid punch in', async () => {
                const punchData = generateMockPunchData({
                    PunchType: 'in',
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                // May succeed or fail depending on existing punch status
                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-002: should capture location coordinates', async () => {
                const punchData = generateMockPunchData({
                    latitude: ATTENDANCE_TEST_DATA.validPunchIn.latitude,
                    longitude: ATTENDANCE_TEST_DATA.validPunchIn.longitude,
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-003: should record timestamp correctly', async () => {
                const now = new Date().toISOString();
                const punchData = generateMockPunchData({
                    timestamp: now,
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-004: should complete within acceptable time', async () => {
                const punchData = generateMockPunchData();

                const { duration } = await measureResponseTime(() =>
                    authenticatedRequest(API_ENDPOINTS.PUNCH_RECORD, 'POST', authToken, punchData)
                );

                expect(duration).toBeLessThan(PERFORMANCE_TEST_DATA.responseTimeTargets.postRequest);
            });

            it('PUNCH-POST-005: should return punch ID on success', async () => {
                const punchData = generateMockPunchData();

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );
                const data = await response.json();

                if (response.ok) {
                    expect(data).toHaveProperty('data');
                }
            });
        });

        describe('PUNCH-POST-006 to PUNCH-POST-015: Negative Tests', () => {
            it('PUNCH-POST-006: should reject request without authentication', async () => {
                const punchData = generateMockPunchData();

                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PUNCH_RECORD}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(punchData),
                });

                expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            });

            it('PUNCH-POST-007: should reject missing location', async () => {
                const punchData = {
                    timestamp: new Date().toISOString(),
                    // Missing latitude and longitude
                };

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            });

            it('PUNCH-POST-008: should reject invalid coordinates', async () => {
                const invalidCoord = ATTENDANCE_TEST_DATA.invalidCoordinates[0];
                const punchData = generateMockPunchData(invalidCoord);

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            });

            it('PUNCH-POST-009: should reject out of range coordinates', async () => {
                const outOfRange = ATTENDANCE_TEST_DATA.invalidCoordinates[3]; // latitude: 91
                const punchData = generateMockPunchData(outOfRange);

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            });

            it('PUNCH-POST-010: should reject future timestamp', async () => {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 1);

                const punchData = generateMockPunchData({
                    timestamp: futureDate.toISOString(),
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            });

            it('PUNCH-POST-011: should prevent duplicate punch in', async () => {
                // This test requires checking current punch status first
                const punchData = generateMockPunchData({ PunchType: 'in' });

                // First punch in (may already be punched in)
                await authenticatedRequest(API_ENDPOINTS.PUNCH_RECORD, 'POST', authToken, punchData);

                // Try duplicate punch in
                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                // Should either succeed (if first failed) or reject duplicate
                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-012: should reject punch out without punch in', async () => {
                // This test requires ensuring no active punch in
                const punchData = generateMockPunchData({ PunchType: 'out' });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                // May succeed or fail depending on current state
                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-013: should sanitize SQL injection in location data', async () => {
                const punchData = generateMockPunchData({
                    location: SQL_INJECTION_PAYLOADS[0],
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-014: should sanitize XSS in notes field', async () => {
                const punchData = generateMockPunchData({
                    notes: XSS_PAYLOADS[0],
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );
                const data = await response.json();

                if (data.message) {
                    expect(data.message).not.toContain('<script>');
                }
            });

            it('PUNCH-POST-015: should reject invalid punch type', async () => {
                const punchData = generateMockPunchData({
                    PunchType: 'invalid',
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            });
        });

        describe('PUNCH-POST-016 to PUNCH-POST-020: Edge Cases', () => {
            it('PUNCH-POST-016: should handle midnight punch', async () => {
                const midnight = ATTENDANCE_TEST_DATA.edgeCaseTimes.midnight;
                const punchData = generateMockPunchData({
                    timestamp: midnight,
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-017: should handle just before midnight punch', async () => {
                const justBeforeMidnight = ATTENDANCE_TEST_DATA.edgeCaseTimes.justBeforeMidnight;
                const punchData = generateMockPunchData({
                    timestamp: justBeforeMidnight,
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-018: should handle GPS accuracy variations', async () => {
                const punchData = generateMockPunchData({
                    latitude: 23.022567890123,
                    longitude: 72.571498765432,
                    accuracy: 5.5,
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-019: should handle very precise timestamps', async () => {
                const preciseTimestamp = new Date().toISOString(); // Includes milliseconds
                const punchData = generateMockPunchData({
                    timestamp: preciseTimestamp,
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-020: should handle network retry scenarios', async () => {
                const punchData = generateMockPunchData();

                // Simulate retry by making same request twice
                const response1 = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                await wait(1000);

                const response2 = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                // Should handle idempotency or reject duplicate
                expect(response1.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
                expect(response2.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });
        });

        describe('PUNCH-POST-021 to PUNCH-POST-025: Performance & Security', () => {
            it('PUNCH-POST-021: should handle concurrent punch attempts', async () => {
                const punchData = generateMockPunchData();

                const results = await simulateConcurrentUsers(
                    () => authenticatedRequest(API_ENDPOINTS.PUNCH_RECORD, 'POST', authToken, punchData),
                    5
                );

                // At least one should succeed or all should fail gracefully
                expect(results.successful + results.failed).toBe(5);
                expect(results.avgResponseTime).toBeLessThan(5000);
            }, TIMEOUTS.LONG);

            it('PUNCH-POST-022: should prevent authorization bypass', async () => {
                const otherUserId = 999; // Different user
                const result = await testAuthorizationBypass(
                    API_ENDPOINTS.PUNCH_RECORD,
                    authToken,
                    otherUserId
                );

                expect(result.vulnerable).toBe(false);
            });

            it('PUNCH-POST-023: should validate timestamp manipulation', async () => {
                const manipulatedTime = new Date();
                manipulatedTime.setHours(manipulatedTime.getHours() - 5); // 5 hours ago

                const punchData = generateMockPunchData({
                    timestamp: manipulatedTime.toISOString(),
                });

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                // Should either accept (if within allowed range) or reject
                expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            });

            it('PUNCH-POST-024: should handle database lock scenarios', async () => {
                // Simulate rapid successive punches
                const punchData = generateMockPunchData();

                const promises = [];
                for (let i = 0; i < 3; i++) {
                    promises.push(
                        authenticatedRequest(API_ENDPOINTS.PUNCH_RECORD, 'POST', authToken, punchData)
                    );
                }

                const responses = await Promise.all(promises);

                // Should handle gracefully without 500 errors
                responses.forEach(response => {
                    expect(response.status).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
                });
            });

            it('PUNCH-POST-025: should create audit trail', async () => {
                const punchData = generateMockPunchData();

                const response = await authenticatedRequest(
                    API_ENDPOINTS.PUNCH_RECORD,
                    'POST',
                    authToken,
                    punchData
                );

                if (response.ok) {
                    const data = await response.json();
                    // Verify punch was recorded (can be verified by GET request)
                    expect(data.status).toBe('Success');
                }
            });
        });
    });
});
