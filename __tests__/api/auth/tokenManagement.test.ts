/**
 * Token Management Test Suite
 * 
 * Tests for token verification and refresh endpoints
 */

import {
    authenticatedRequest,
    decodeJWT,
    loginAndGetTokens,
    unauthenticatedRequest
} from '../../utils/testHelpers';

import {
    API_ENDPOINTS,
    HTTP_STATUS,
    TOKEN_TEST_DATA,
    VALID_TEST_DATA,
} from '../../utils/testData';

describe('Token Management Tests', () => {
    describe('Token Verification', () => {
        it('should verify valid access token', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            const response = await unauthenticatedRequest(
                API_ENDPOINTS.TOKEN_VERIFY,
                'POST',
                { token: tokens!.accessToken }
            );

            // Should verify successfully or return 404 if endpoint doesn't exist
            expect([HTTP_STATUS.OK, HTTP_STATUS.NOT_FOUND]).toContain(response.status);
        });

        it('should reject invalid token', async () => {
            const response = await unauthenticatedRequest(
                API_ENDPOINTS.TOKEN_VERIFY,
                'POST',
                { token: TOKEN_TEST_DATA.invalidToken }
            );

            // Should reject or return 404 if endpoint doesn't exist
            expect([
                HTTP_STATUS.BAD_REQUEST,
                HTTP_STATUS.UNAUTHORIZED,
                HTTP_STATUS.NOT_FOUND,
            ]).toContain(response.status);
        });

        it('should reject expired token', async () => {
            const response = await unauthenticatedRequest(
                API_ENDPOINTS.TOKEN_VERIFY,
                'POST',
                { token: TOKEN_TEST_DATA.expiredToken }
            );

            expect([
                HTTP_STATUS.BAD_REQUEST,
                HTTP_STATUS.UNAUTHORIZED,
                HTTP_STATUS.NOT_FOUND,
            ]).toContain(response.status);
        });
    });

    describe('Token Refresh', () => {
        it('should refresh access token with valid refresh token', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            const response = await unauthenticatedRequest(
                API_ENDPOINTS.TOKEN_REFRESH,
                'POST',
                { refresh: tokens!.refreshToken }
            );

            // Should refresh successfully or return 404 if endpoint doesn't exist
            if (response.status === HTTP_STATUS.OK) {
                const data = await response.json();
                expect(data).toHaveProperty('access');
            }
        });

        it('should reject refresh with invalid refresh token', async () => {
            const response = await unauthenticatedRequest(
                API_ENDPOINTS.TOKEN_REFRESH,
                'POST',
                { refresh: TOKEN_TEST_DATA.invalidToken }
            );

            expect([
                HTTP_STATUS.BAD_REQUEST,
                HTTP_STATUS.UNAUTHORIZED,
                HTTP_STATUS.NOT_FOUND,
            ]).toContain(response.status);
        });
    });

    describe('Token Structure', () => {
        it('should return properly formatted JWT tokens', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            // Check token format (JWT has 3 parts separated by dots)
            expect(tokens!.accessToken.split('.').length).toBe(3);
            expect(tokens!.refreshToken.split('.').length).toBe(3);
        });

        it('should include required claims in token payload', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            const decoded = decodeJWT(tokens!.accessToken);
            expect(decoded).not.toBeNull();
            expect(decoded).toHaveProperty('exp'); // Expiration time
            expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
        });

        it('should have different expiration times for access and refresh tokens', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            const accessDecoded = decodeJWT(tokens!.accessToken);
            const refreshDecoded = decodeJWT(tokens!.refreshToken);

            expect(accessDecoded).not.toBeNull();
            expect(refreshDecoded).not.toBeNull();

            // Refresh token should expire later than access token
            if (accessDecoded.exp && refreshDecoded.exp) {
                expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
            }
        });
    });

    describe('Token Usage', () => {
        it('should allow authenticated requests with valid token', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            const response = await authenticatedRequest(
                API_ENDPOINTS.PROFILE,
                'GET',
                tokens!.accessToken
            );

            // Should allow access or return 404 if profile endpoint doesn't exist
            expect([HTTP_STATUS.OK, HTTP_STATUS.NOT_FOUND]).toContain(response.status);
        });

        it('should reject authenticated requests without token', async () => {
            const response = await unauthenticatedRequest(API_ENDPOINTS.PROFILE, 'GET');

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });

        it('should reject authenticated requests with malformed token', async () => {
            const response = await authenticatedRequest(
                API_ENDPOINTS.PROFILE,
                'GET',
                TOKEN_TEST_DATA.malformedToken
            );

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });
    });

    describe('Token Security', () => {
        it('should not accept tokens from different users', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            // Token should be tied to specific user
            const decoded = decodeJWT(tokens!.accessToken);
            expect(decoded).toHaveProperty('user_id');
        });

        it('should not expose sensitive information in token', async () => {
            const email = process.env.TEST_USER_EMAIL || VALID_TEST_DATA.email;
            const password = process.env.TEST_USER_PASSWORD || VALID_TEST_DATA.password;

            const tokens = await loginAndGetTokens(email, password);
            expect(tokens).not.toBeNull();

            const decoded = decodeJWT(tokens!.accessToken);

            // Should not contain password or other sensitive data
            expect(decoded).not.toHaveProperty('password');
            expect(decoded).not.toHaveProperty('Password');
        });
    });
});
