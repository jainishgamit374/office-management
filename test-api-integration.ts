// Test script to verify API integration
// Run this to test if the new PascalCase format is working

import { login, register } from './lib/auth';
import { dateStringToBackendFormat } from './lib/dateUtils';

async function testRegistration() {
    console.log('\n=== Testing Registration API ===');
    try {
        const testUser = {
            FName: 'Test',
            LName: 'User',
            Email: `test${Date.now()}@example.com`, // Unique email
            DOB: dateStringToBackendFormat('2000-01-01'),
            JoiningDate: dateStringToBackendFormat('2024-01-01'),
            Password: 'SecurePass@123',
            ConfirmPassword: 'SecurePass@123',
        };

        console.log('📤 Sending registration request with:', {
            FName: testUser.FName,
            LName: testUser.LName,
            Email: testUser.Email,
            DOB: testUser.DOB,
            JoiningDate: testUser.JoiningDate,
        });

        const response = await register(testUser);
        console.log('✅ Registration Response:', response);
        return testUser.Email;
    } catch (error: any) {
        console.error('❌ Registration Error:', error.message);
        return null;
    }
}

async function testLogin(email: string) {
    console.log('\n=== Testing Login API ===');
    try {
        const credentials = {
            Email: email,
            Password: 'SecurePass@123',
        };

        console.log('📤 Sending login request with:', { Email: credentials.Email });

        const response = await login(credentials);
        console.log('✅ Login Response:', {
            hasTokens: !!(response.access && response.refresh),
            hasUser: !!response.user,
            message: response.message,
        });
        return true;
    } catch (error: any) {
        console.error('❌ Login Error:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting API Integration Tests...\n');
    console.log('Backend URL: https://karmyog.pythonanywhere.com');
    console.log('Format: PascalCase (FName, LName, Email, DOB, etc.)\n');

    // Test 1: Registration
    const email = await testRegistration();

    if (!email) {
        console.log('\n❌ Tests failed at registration step');
        return;
    }

    // Wait a bit for the backend to process
    console.log('\n⏳ Waiting 2 seconds before login test...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Login
    const loginSuccess = await testLogin(email);

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Registration: ${email ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Login: ${loginSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('\nIf both tests passed, the API standardization is working correctly! 🎉');
}

// Export for use in app
export { runTests };
