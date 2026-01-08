/**
 * Logout API Test Suite
 * 
 * Comprehensive tests for POST /logout/ endpoint
 */

import {
    authenticatedRequest,
    loginAndGetTokens,
    unauthenticatedRequest,
} from '../../utils/testHelpers';

import {
    API_ENDPOINTS,
    HTTP_STATUS,
    TOKEN_TEST_DATA,
    VALID_TEST_DATA,
} from '../../utils/testData';

describe('Logout API Tests', () => {
    const LOGOUT_ENDPOINT = API_ENDPOINTS.LOGOUT;

    describe('Successful Logout', () => {
        it('should successfully logout with valid token', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            // First login to get tokens
            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            // Then logout
            const response = await authenticatedRequest(
                LOGOUT_ENDPOINT,
                'POST',
                tokens!.accessToken,
                { refresh_token: tokens!.refreshToken }
            );

            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.OK);
            expect(response.status).toBeLessThan(300);
        });

        it('should invalidate tokens after logout', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            // Login
            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            // Logout
            await authenticatedRequest(
                LOGOUT_ENDPOINT,
                'POST',
                tokens!.accessToken,
                { refresh_token: tokens!.refreshToken }
            );

            // Try to use the token after logout
            const profileResponse = await authenticatedRequest(
                API_ENDPOINTS.PROFILE,
                'GET',
                tokens!.accessToken
            );

            // Token should be invalid after logout
            expect(profileResponse.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });
    });

    describe('Logout Without Authentication', () => {
        it('should reject logout without token', async () => {
            const response = await unauthenticatedRequest(LOGOUT_ENDPOINT, 'POST', {
                refresh_token: 'some-token',
            });

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });
    });

    describe('Logout With Invalid Token', () => {
        it('should handle logout with invalid access token', async () => {
            const response = await authenticatedRequest(
                LOGOUT_ENDPOINT,
                'POST',
                TOKEN_TEST_DATA.invalidToken,
                { refresh_token: 'some-refresh-token' }
            );

            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.UNAUTHORIZED);
        });

        it('should handle logout with expired token', async () => {
            const response = await authenticatedRequest(
                LOGOUT_ENDPOINT,
                'POST',
                TOKEN_TEST_DATA.expiredToken,
                { refresh_token: 'some-refresh-token' }
            );

            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.UNAUTHORIZED);
        });
    });

    describe('Response Structure', () => {
        it('should return consistent response structure', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            const response = await authenticatedRequest(
                LOGOUT_ENDPOINT,
                'POST',
                tokens!.accessToken,
                { refresh_token: tokens!.refreshToken }
            );

            const data = await response.json();

            expect(data).toHaveProperty('message');
        });
    });
});
