// 🧪 API Test Script - Run this to test the API directly
// This helps debug what the API expects and returns

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// Test 1: Check if API is reachable
async function testAPIReachability() {
    console.log('\n🧪 Test 1: API Reachability');
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'OPTIONS',
        });
        console.log('✅ API is reachable');
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
    } catch (error) {
        console.error('❌ API not reachable:', error);
    }
}

// Test 2: Try registration with minimal data
async function testMinimalRegistration() {
    console.log('\n🧪 Test 2: Minimal Registration');
    try {
        const formData = new URLSearchParams({
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password123',
            password2: 'password123',
        });

        const response = await fetch(`${BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: formData.toString(),
        });

        console.log('Status:', response.status, response.statusText);
        const text = await response.text();
        console.log('Response:', text);

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Not JSON response');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Test 3: Try with different field names
async function testAlternativeFields() {
    console.log('\n🧪 Test 3: Alternative Field Names');

    const variations = [
        { username: 'testuser', email: 'test@example.com', password: 'password123' },
        { name: 'Test User', email: 'test@example.com', password: 'password123', password_confirmation: 'password123' },
        { full_name: 'Test User', email: 'test@example.com', password: 'password123' },
    ];

    for (const data of variations) {
        console.log('\nTrying:', Object.keys(data));
        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const text = await response.text();
            console.log('Status:', response.status);
            console.log('Response:', text.substring(0, 200));
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

// Run all tests
export async function runAPITests() {
    console.log('🚀 Starting API Tests...\n');
    await testAPIReachability();
    await testMinimalRegistration();
    await testAlternativeFields();
    console.log('\n✅ Tests Complete');
}

// Usage: Import and call runAPITests() in your component
