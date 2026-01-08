/**
 * Registration API Test Suite
 * 
 * Comprehensive tests for POST /register/ endpoint
 */

import {
    generateRandomEmail,
    unauthenticatedRequest
} from '../../utils/testHelpers';

import {
    API_ENDPOINTS,
    HTTP_STATUS,
    INVALID_EMAILS,
    SQL_INJECTION_PAYLOADS,
    XSS_PAYLOADS
} from '../../utils/testData';

describe('Registration API Tests', () => {
    const REGISTER_ENDPOINT = API_ENDPOINTS.REGISTER;

    const registerRequest = async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        dateOfBirth: string;
        joiningDate: string;
        password: string;
        confirmPassword: string;
    }) => {
        return unauthenticatedRequest(REGISTER_ENDPOINT, 'POST', {
            FName: userData.firstName,
            LName: userData.lastName,
            Email: userData.email,
            DOB: userData.dateOfBirth,
            JoiningDate: userData.joiningDate,
            Password: userData.password,
            ConfirmPassword: userData.confirmPassword,
        });
    };

    describe('Valid Registration', () => {
        it('should successfully register a new user with valid data', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: generateRandomEmail(),
                dateOfBirth: '1990-01-01',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const response = await registerRequest(userData);
            const data = await response.json();

            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.OK);
            expect(response.status).toBeLessThan(300);

            if (data.status === 'Success') {
                expect(data.message).toBeDefined();
            }
        });

        it('should validate all required fields are present', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: generateRandomEmail(),
                dateOfBirth: '1990-01-01',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const response = await registerRequest(userData);

            expect(response.status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    });

    describe('Email Validation', () => {
        it.each(INVALID_EMAILS.slice(0, 5))(
            'should reject invalid email format: %s',
            async (invalidEmail) => {
                const userData = {
                    firstName: 'Test',
                    lastName: 'User',
                    email: invalidEmail,
                    dateOfBirth: '1990-01-01',
                    joiningDate: '2024-01-01',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                };

                const response = await registerRequest(userData);

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            }
        );

        it('should prevent duplicate email registration', async () => {
            const email = generateRandomEmail();
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: email,
                dateOfBirth: '1990-01-01',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            // First registration
            await registerRequest(userData);

            // Attempt duplicate registration
            const duplicateResponse = await registerRequest(userData);

            // Should reject duplicate (either 400 or 409 Conflict)
            expect(duplicateResponse.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('Password Validation', () => {
        it('should reject when passwords do not match', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: generateRandomEmail(),
                dateOfBirth: '1990-01-01',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'DifferentPass123!',
            };

            const response = await registerRequest(userData);
            const data = await response.json();

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.status).not.toBe('Success');
        });

        it('should enforce password strength requirements', async () => {
            const weakPasswords = ['123', 'password', 'abc', 'test'];

            for (const weakPassword of weakPasswords) {
                const userData = {
                    firstName: 'Test',
                    lastName: 'User',
                    email: generateRandomEmail(),
                    dateOfBirth: '1990-01-01',
                    joiningDate: '2024-01-01',
                    password: weakPassword,
                    confirmPassword: weakPassword,
                };

                const response = await registerRequest(userData);

                // Should reject weak passwords
                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            }
        });
    });

    describe('Date Validation', () => {
        it('should reject invalid date of birth format', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: generateRandomEmail(),
                dateOfBirth: 'invalid-date',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const response = await registerRequest(userData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });

        it('should reject future date of birth', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const futureDateString = futureDate.toISOString().split('T')[0];

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: generateRandomEmail(),
                dateOfBirth: futureDateString,
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const response = await registerRequest(userData);

            expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('Security Tests', () => {
        it.each(SQL_INJECTION_PAYLOADS.slice(0, 3))(
            'should prevent SQL injection in email: %s',
            async (payload) => {
                const userData = {
                    firstName: 'Test',
                    lastName: 'User',
                    email: payload,
                    dateOfBirth: '1990-01-01',
                    joiningDate: '2024-01-01',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                };

                const response = await registerRequest(userData);

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            }
        );

        it.each(XSS_PAYLOADS.slice(0, 3))(
            'should sanitize XSS in name fields: %s',
            async (payload) => {
                const userData = {
                    firstName: payload,
                    lastName: 'User',
                    email: generateRandomEmail(),
                    dateOfBirth: '1990-01-01',
                    joiningDate: '2024-01-01',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                };

                const response = await registerRequest(userData);

                expect(response.status).toBeGreaterThanOrEqual(HTTP_STATUS.BAD_REQUEST);
            }
        );
    });

    describe('Required Fields', () => {
        it('should reject registration with missing first name', async () => {
            const userData = {
                firstName: '',
                lastName: 'User',
                email: generateRandomEmail(),
                dateOfBirth: '1990-01-01',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const response = await registerRequest(userData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });

        it('should reject registration with missing last name', async () => {
            const userData = {
                firstName: 'Test',
                lastName: '',
                email: generateRandomEmail(),
                dateOfBirth: '1990-01-01',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const response = await registerRequest(userData);

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe('Response Structure', () => {
        it('should return consistent response structure', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: generateRandomEmail(),
                dateOfBirth: '1990-01-01',
                joiningDate: '2024-01-01',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const response = await registerRequest(userData);
            const data = await response.json();

            expect(data).toHaveProperty('status');
            expect(data).toHaveProperty('message');
        });
    });
});
