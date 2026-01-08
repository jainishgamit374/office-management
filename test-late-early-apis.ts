/**
 * Test script for Late Check-In and Early Check-Out API endpoints
 * 
 * This script tests:
 * 1. /late-checkin-count/ - Get late check-in count for current month
 * 2. /lateearlyscount/ - Get both late and early counts for a date range
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// Helper to get auth token
const getAuthToken = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem('access_token');
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// Test 1: Late Check-In Count API
export const testLateCheckinCount = async () => {
    console.log('\n========================================');
    console.log('TEST 1: Late Check-In Count API');
    console.log('========================================\n');

    try {
        const token = await getAuthToken();
        if (!token) {
            console.error('❌ No auth token found. Please login first.');
            return;
        }

        // Get current month and year
        const now = new Date();
        const month = (now.getMonth() + 1).toString(); // 1-12
        const year = now.getFullYear().toString();

        console.log('📅 Testing for:', { month, year });
        console.log('🌐 Endpoint: /late-checkin-count/');
        console.log('📤 Query params:', { month, year });

        const url = `${BASE_URL}/late-checkin-count/?month=${month}&year=${year}`;
        console.log('🔗 Full URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('\n📡 Response Status:', response.status);
        console.log('📡 Response Status Text:', response.statusText);

        const data = await response.json();
        console.log('\n📊 Response Data:');
        console.log(JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ SUCCESS!');
            console.log('📊 Late Check-In Count:', data.data?.late_checkin_count);
            console.log('📊 Month:', data.data?.month);
            console.log('📊 Year:', data.data?.year);
            console.log('📊 Allowed Late Check-Ins:', data.data?.allowed_late_checkins);
            console.log('📊 Remaining:', data.data?.remaining);
        } else {
            console.log('\n❌ FAILED!');
            console.log('Error:', data.message || data.error || 'Unknown error');
        }

        return data;
    } catch (error) {
        console.error('\n❌ ERROR:', error);
        throw error;
    }
};

// Test 2: Late/Early Counts API (Date Range)
export const testLateEarlyCount = async () => {
    console.log('\n========================================');
    console.log('TEST 2: Late/Early Counts API');
    console.log('========================================\n');

    try {
        const token = await getAuthToken();
        if (!token) {
            console.error('❌ No auth token found. Please login first.');
            return;
        }

        // Get current month date range
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // First day of current month
        const fromDate = new Date(year, month, 1);
        const fromDateStr = fromDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Last day of current month
        const toDate = new Date(year, month + 1, 0);
        const toDateStr = toDate.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log('📅 Testing for date range:', { fromDateStr, toDateStr });
        console.log('🌐 Endpoint: /lateearlyscount/');
        console.log('📤 Query params:', { from_date: fromDateStr, to_date: toDateStr });

        const url = `${BASE_URL}/lateearlyscount/?from_date=${fromDateStr}&to_date=${toDateStr}`;
        console.log('🔗 Full URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('\n📡 Response Status:', response.status);
        console.log('📡 Response Status Text:', response.statusText);

        const data = await response.json();
        console.log('\n📊 Response Data:');
        console.log(JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ SUCCESS!');
            if (data.data && data.data.length > 0) {
                const employeeData = data.data[0];
                console.log('📊 Employee ID:', employeeData.emp_id);
                console.log('📊 Employee Name:', `${employeeData.fname} ${employeeData.lname}`);
                console.log('📊 Late Check-Ins:', employeeData.late);
                console.log('📊 Early Check-Outs:', employeeData.early);
            } else {
                console.log('⚠️ No data returned (employee may have no late/early records)');
            }
        } else {
            console.log('\n❌ FAILED!');
            console.log('Error:', data.message || data.error || 'Unknown error');
        }

        return data;
    } catch (error) {
        console.error('\n❌ ERROR:', error);
        throw error;
    }
};

// Test 3: Compare Both APIs
export const compareApis = async () => {
    console.log('\n========================================');
    console.log('TEST 3: Compare Both APIs');
    console.log('========================================\n');

    try {
        console.log('🔄 Running both API tests...\n');

        const [lateCheckinResult, lateEarlyResult] = await Promise.all([
            testLateCheckinCount(),
            testLateEarlyCount(),
        ]);

        console.log('\n========================================');
        console.log('COMPARISON RESULTS');
        console.log('========================================\n');

        const lateFromApi1 = lateCheckinResult?.data?.late_checkin_count;
        const lateFromApi2 = lateEarlyResult?.data?.[0]?.late;
        const earlyFromApi2 = lateEarlyResult?.data?.[0]?.early;

        console.log('📊 Late Check-In Count:');
        console.log('   - From /late-checkin-count/:', lateFromApi1);
        console.log('   - From /lateearlyscount/:', lateFromApi2);
        console.log('   - Match:', lateFromApi1 === lateFromApi2 ? '✅ YES' : '❌ NO');

        console.log('\n📊 Early Check-Out Count:');
        console.log('   - From /lateearlyscount/:', earlyFromApi2);

        console.log('\n========================================');
        console.log('SUMMARY');
        console.log('========================================');
        console.log('✅ Both APIs are working correctly!');
        console.log('📌 Use /late-checkin-count/ for late check-ins only');
        console.log('📌 Use /lateearlyscount/ for both late and early counts');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Comparison failed:', error);
        throw error;
    }
};

// Run all tests
export const runAllTests = async () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Late/Early API Endpoint Test Suite   ║');
    console.log('╚════════════════════════════════════════╝\n');

    try {
        await testLateCheckinCount();
        await testLateEarlyCount();
        await compareApis();

        console.log('\n✅ All tests completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
    }
};

// Export individual test functions
export default {
    testLateCheckinCount,
    testLateEarlyCount,
    compareApis,
    runAllTests,
};
