// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(() => {
    console.log('🧪 Starting test suite...');
});

afterAll(() => {
    console.log('✅ Test suite completed');
});
