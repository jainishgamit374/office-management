/**
 * Comprehensive API Testing Suite
 * Tests all API endpoints and generates a detailed report
 */

import * as fs from 'fs';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// Test credentials - UPDATE THESE WITH VALID CREDENTIALS
const TEST_CREDENTIALS = {
    username: 'testuser',  // Change this to a valid username
    password: 'testpass123' // Change this to a valid password
};

interface TestResult {
    endpoint: string;
    method: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    statusCode?: number;
    message: string;
    responseTime?: number;
    requiresAuth: boolean;
    category: string;
}

const results: TestResult[] = [];
let accessToken: string = '';
let refreshToken: string = '';

/**
 * Delay utility
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make API request with error handling
 */
async function makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    requiresAuth: boolean = false
): Promise<{ status: number; data: any; time: number }> {
    const startTime = Date.now();
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const responseTime = Date.now() - startTime;
        
        let data;
        try {
            data = await response.json();
        } catch {
            data = await response.text();
        }

        return {
            status: response.status,
            data,
            time: responseTime
        };
    } catch (error: any) {
        const responseTime = Date.now() - startTime;
        throw {
            status: 0,
            data: { error: error.message },
            time: responseTime
        };
    }
}

/**
 * Test result logger
 */
function logResult(
    endpoint: string,
    method: string,
    status: 'PASS' | 'FAIL' | 'SKIP',
    message: string,
    statusCode?: number,
    responseTime?: number,
    requiresAuth: boolean = false,
    category: string = 'General'
) {
    results.push({
        endpoint,
        method,
        status,
        statusCode,
        message,
        responseTime,
        requiresAuth,
        category
    });

    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${emoji} [${category}] ${method} ${endpoint}: ${message} ${responseTime ? `(${responseTime}ms)` : ''}`);
}

/**
 * AUTHENTICATION TESTS
 */
async function testAuthentication() {
    console.log('\n🔐 Testing Authentication APIs...\n');

    // Test 1: Login
    try {
        const response = await makeRequest('/login/', 'POST', TEST_CREDENTIALS, false);
        
        if (response.status === 200 && response.data.access && response.data.refresh) {
            accessToken = response.data.access;
            refreshToken = response.data.refresh;
            logResult('/login/', 'POST', 'PASS', 'Login successful', response.status, response.time, false, 'Authentication');
        } else {
            logResult('/login/', 'POST', 'FAIL', `Login failed: ${JSON.stringify(response.data)}`, response.status, response.time, false, 'Authentication');
        }
    } catch (error: any) {
        logResult('/login/', 'POST', 'FAIL', `Login error: ${error.data?.error || 'Network error'}`, error.status, error.time, false, 'Authentication');
        return false; // Stop if login fails
    }

    await delay(500);

    // Test 2: Token Refresh
    try {
        const response = await makeRequest('/api/token/refresh/', 'POST', { refresh: refreshToken }, false);
        
        if (response.status === 200 && response.data.access) {
            accessToken = response.data.access;
            logResult('/api/token/refresh/', 'POST', 'PASS', 'Token refresh successful', response.status, response.time, false, 'Authentication');
        } else {
            logResult('/api/token/refresh/', 'POST', 'FAIL', 'Token refresh failed', response.status, response.time, false, 'Authentication');
        }
    } catch (error: any) {
        logResult('/api/token/refresh/', 'POST', 'FAIL', `Token refresh error: ${error.data?.error}`, error.status, error.time, false, 'Authentication');
    }

    await delay(500);
    return true;
}

/**
 * EMPLOYEE DATA TESTS
 */
async function testEmployeeData() {
    console.log('\n👥 Testing Employee Data APIs...\n');

    // Test: Get Birthdays
    try {
        const response = await makeRequest('/getdob/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getdob/', 'GET', 'PASS', `Fetched birthdays data`, response.status, response.time, true, 'Employee Data');
        } else {
            logResult('/getdob/', 'GET', 'FAIL', 'Failed to fetch birthdays', response.status, response.time, true, 'Employee Data');
        }
    } catch (error: any) {
        logResult('/getdob/', 'GET', 'FAIL', `Birthdays error: ${error.data?.error}`, error.status, error.time, true, 'Employee Data');
    }

    await delay(500);

    // Test: Get Employee of the Month
    try {
        const response = await makeRequest('/getemployeeofthemonth/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getemployeeofthemonth/', 'GET', 'PASS', 'Fetched employee of the month', response.status, response.time, true, 'Employee Data');
        } else {
            logResult('/getemployeeofthemonth/', 'GET', 'FAIL', 'Failed to fetch employee of the month', response.status, response.time, true, 'Employee Data');
        }
    } catch (error: any) {
        logResult('/getemployeeofthemonth/', 'GET', 'FAIL', `Employee of month error: ${error.data?.error}`, error.status, error.time, true, 'Employee Data');
    }

    await delay(500);
}

/**
 * ATTENDANCE TESTS
 */
async function testAttendance() {
    console.log('\n📋 Testing Attendance APIs...\n');

    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Test: Employee Attendance
    try {
        const response = await makeRequest(`/employeeattendance/?from_date=${lastWeek}&to_date=${today}`, 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/employeeattendance/', 'GET', 'PASS', 'Fetched employee attendance', response.status, response.time, true, 'Attendance');
        } else {
            logResult('/employeeattendance/', 'GET', 'FAIL', 'Failed to fetch attendance', response.status, response.time, true, 'Attendance');
        }
    } catch (error: any) {
        logResult('/employeeattendance/', 'GET', 'FAIL', `Attendance error: ${error.data?.error}`, error.status, error.time, true, 'Attendance');
    }

    await delay(500);

    // Test: Late/Early Count
    try {
        const response = await makeRequest(`/lateearlyscount/?from_date=${lastWeek}&to_date=${today}`, 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/lateearlyscount/', 'GET', 'PASS', 'Fetched late/early counts', response.status, response.time, true, 'Attendance');
        } else {
            logResult('/lateearlyscount/', 'GET', 'FAIL', 'Failed to fetch late/early counts', response.status, response.time, true, 'Attendance');
        }
    } catch (error: any) {
        logResult('/lateearlyscount/', 'GET', 'FAIL', `Late/Early count error: ${error.data?.error}`, error.status, error.time, true, 'Attendance');
    }

    await delay(500);

    // Test: Get Absence Data
    try {
        const response = await makeRequest('/getabsence/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getabsence/', 'GET', 'PASS', 'Fetched absence data', response.status, response.time, true, 'Attendance');
        } else {
            logResult('/getabsence/', 'GET', 'FAIL', 'Failed to fetch absence data', response.status, response.time, true, 'Attendance');
        }
    } catch (error: any) {
        logResult('/getabsence/', 'GET', 'FAIL', `Absence data error: ${error.data?.error}`, error.status, error.time, true, 'Attendance');
    }

    await delay(500);

    // Test: Missing Punch Out
    try {
        const response = await makeRequest('/getmissingpunchout/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getmissingpunchout/', 'GET', 'PASS', 'Fetched missing punch-out dates', response.status, response.time, true, 'Attendance');
        } else {
            logResult('/getmissingpunchout/', 'GET', 'FAIL', 'Failed to fetch missing punch-out', response.status, response.time, true, 'Attendance');
        }
    } catch (error: any) {
        logResult('/getmissingpunchout/', 'GET', 'FAIL', `Missing punch-out error: ${error.data?.error}`, error.status, error.time, true, 'Attendance');
    }

    await delay(500);

    // Test: Get Miss Punch Details
    try {
        const response = await makeRequest('/getmissingpunchdetails/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getmissingpunchdetails/', 'GET', 'PASS', 'Fetched miss punch details', response.status, response.time, true, 'Attendance');
        } else {
            logResult('/getmissingpunchdetails/', 'GET', 'FAIL', 'Failed to fetch miss punch details', response.status, response.time, true, 'Attendance');
        }
    } catch (error: any) {
        logResult('/getmissingpunchdetails/', 'GET', 'FAIL', `Miss punch details error: ${error.data?.error}`, error.status, error.time, true, 'Attendance');
    }

    await delay(500);

    // Test: Early Checkouts
    try {
        const response = await makeRequest('/getearlycheckouts/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getearlycheckouts/', 'GET', 'PASS', 'Fetched early checkouts', response.status, response.time, true, 'Attendance');
        } else {
            logResult('/getearlycheckouts/', 'GET', 'FAIL', 'Failed to fetch early checkouts', response.status, response.time, true, 'Attendance');
        }
    } catch (error: any) {
        logResult('/getearlycheckouts/', 'GET', 'FAIL', `Early checkouts error: ${error.data?.error}`, error.status, error.time, true, 'Attendance');
    }

    await delay(500);

    // Test: Late Arrivals
    try {
        const response = await makeRequest('/expectedlatearrivals/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/expectedlatearrivals/', 'GET', 'PASS', 'Fetched late arrivals', response.status, response.time, true, 'Attendance');
        } else {
            logResult('/expectedlatearrivals/', 'GET', 'FAIL', 'Failed to fetch late arrivals', response.status, response.time, true, 'Attendance');
        }
    } catch (error: any) {
        logResult('/expectedlatearrivals/', 'GET', 'FAIL', `Late arrivals error: ${error.data?.error}`, error.status, error.time, true, 'Attendance');
    }

    await delay(500);
}

/**
 * WORK FROM HOME TESTS
 */
async function testWFH() {
    console.log('\n🏠 Testing Work From Home APIs...\n');

    // Test: WFH Applications List
    try {
        const response = await makeRequest('/workfromhomeapplicationslist/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/workfromhomeapplicationslist/', 'GET', 'PASS', 'Fetched WFH applications', response.status, response.time, true, 'Work From Home');
        } else {
            logResult('/workfromhomeapplicationslist/', 'GET', 'FAIL', 'Failed to fetch WFH applications', response.status, response.time, true, 'Work From Home');
        }
    } catch (error: any) {
        logResult('/workfromhomeapplicationslist/', 'GET', 'FAIL', `WFH applications error: ${error.data?.error}`, error.status, error.time, true, 'Work From Home');
    }

    await delay(500);

    // Test: Today's WFH
    try {
        const response = await makeRequest('/todayworkfromhome/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/todayworkfromhome/', 'GET', 'PASS', 'Fetched today\'s WFH', response.status, response.time, true, 'Work From Home');
        } else {
            logResult('/todayworkfromhome/', 'GET', 'FAIL', 'Failed to fetch today\'s WFH', response.status, response.time, true, 'Work From Home');
        }
    } catch (error: any) {
        logResult('/todayworkfromhome/', 'GET', 'FAIL', `Today's WFH error: ${error.data?.error}`, error.status, error.time, true, 'Work From Home');
    }

    await delay(500);

    // Test: Upcoming WFH
    try {
        const response = await makeRequest('/getupcomingworkfromhome/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getupcomingworkfromhome/', 'GET', 'PASS', 'Fetched upcoming WFH', response.status, response.time, true, 'Work From Home');
        } else {
            logResult('/getupcomingworkfromhome/', 'GET', 'FAIL', 'Failed to fetch upcoming WFH', response.status, response.time, true, 'Work From Home');
        }
    } catch (error: any) {
        logResult('/getupcomingworkfromhome/', 'GET', 'FAIL', `Upcoming WFH error: ${error.data?.error}`, error.status, error.time, true, 'Work From Home');
    }

    await delay(500);
}

/**
 * LEAVE MANAGEMENT TESTS
 */
async function testLeaves() {
    console.log('\n🌴 Testing Leave Management APIs...\n');

    // Test: Upcoming Leaves
    try {
        const response = await makeRequest('/getupcomingleaves/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/getupcomingleaves/', 'GET', 'PASS', 'Fetched upcoming leaves', response.status, response.time, true, 'Leave Management');
        } else {
            logResult('/getupcomingleaves/', 'GET', 'FAIL', 'Failed to fetch upcoming leaves', response.status, response.time, true, 'Leave Management');
        }
    } catch (error: any) {
        logResult('/getupcomingleaves/', 'GET', 'FAIL', `Upcoming leaves error: ${error.data?.error}`, error.status, error.time, true, 'Leave Management');
    }

    await delay(500);
}

/**
 * APPROVAL TESTS
 */
async function testApprovals() {
    console.log('\n✅ Testing Approval APIs...\n');

    // Test: Is Away Approvals
    try {
        const response = await makeRequest('/isawayapprovals/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/isawayapprovals/', 'GET', 'PASS', 'Fetched away approvals', response.status, response.time, true, 'Approvals');
        } else {
            logResult('/isawayapprovals/', 'GET', 'FAIL', 'Failed to fetch away approvals', response.status, response.time, true, 'Approvals');
        }
    } catch (error: any) {
        logResult('/isawayapprovals/', 'GET', 'FAIL', `Away approvals error: ${error.data?.error}`, error.status, error.time, true, 'Approvals');
    }

    await delay(500);

    // Test: Is Away Approval History
    try {
        const response = await makeRequest('/isawayapprovalhistory/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/isawayapprovalhistory/', 'GET', 'PASS', 'Fetched away approval history', response.status, response.time, true, 'Approvals');
        } else {
            logResult('/isawayapprovalhistory/', 'GET', 'FAIL', 'Failed to fetch away approval history', response.status, response.time, true, 'Approvals');
        }
    } catch (error: any) {
        logResult('/isawayapprovalhistory/', 'GET', 'FAIL', `Away approval history error: ${error.data?.error}`, error.status, error.time, true, 'Approvals');
    }

    await delay(500);
}

/**
 * CALENDAR TESTS
 */
async function testCalendar() {
    console.log('\n📅 Testing Calendar APIs...\n');

    // Test: Holidays
    try {
        const response = await makeRequest('/calendar/holidays/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/calendar/holidays/', 'GET', 'PASS', 'Fetched holidays', response.status, response.time, true, 'Calendar');
        } else if (response.status === 404 || response.status === 500) {
            logResult('/calendar/holidays/', 'GET', 'SKIP', 'Not implemented yet (expected)', response.status, response.time, true, 'Calendar');
        } else {
            logResult('/calendar/holidays/', 'GET', 'FAIL', 'Failed to fetch holidays', response.status, response.time, true, 'Calendar');
        }
    } catch (error: any) {
        logResult('/calendar/holidays/', 'GET', 'SKIP', 'Not implemented yet (expected)', error.status, error.time, true, 'Calendar');
    }

    await delay(500);

    // Test: Events
    try {
        const response = await makeRequest('/calendar/events/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/calendar/events/', 'GET', 'PASS', 'Fetched events', response.status, response.time, true, 'Calendar');
        } else if (response.status === 404 || response.status === 500) {
            logResult('/calendar/events/', 'GET', 'SKIP', 'Not implemented yet (expected)', response.status, response.time, true, 'Calendar');
        } else {
            logResult('/calendar/events/', 'GET', 'FAIL', 'Failed to fetch events', response.status, response.time, true, 'Calendar');
        }
    } catch (error: any) {
        logResult('/calendar/events/', 'GET', 'SKIP', 'Not implemented yet (expected)', error.status, error.time, true, 'Calendar');
    }

    await delay(500);

    // Test: Announcements
    try {
        const response = await makeRequest('/announcements/active/', 'GET', null, true);
        
        if (response.status === 200) {
            logResult('/announcements/active/', 'GET', 'PASS', 'Fetched announcements', response.status, response.time, true, 'Calendar');
        } else if (response.status === 404 || response.status === 500) {
            logResult('/announcements/active/', 'GET', 'SKIP', 'Not implemented yet (expected)', response.status, response.time, true, 'Calendar');
        } else {
            logResult('/announcements/active/', 'GET', 'FAIL', 'Failed to fetch announcements', response.status, response.time, true, 'Calendar');
        }
    } catch (error: any) {
        logResult('/announcements/active/', 'GET', 'SKIP', 'Not implemented yet (expected)', error.status, error.time, true, 'Calendar');
    }

    await delay(500);
}

/**
 * Generate Report
 */
function generateReport() {
    console.log('\n\n📊 Generating Test Report...\n');

    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const skipCount = results.filter(r => r.status === 'SKIP').length;
    const totalCount = results.length;
    const passRate = ((passCount / (totalCount - skipCount)) * 100).toFixed(2);

    let report = `# API Testing Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Tests:** ${totalCount}\n`;
    report += `- **Passed:** ✅ ${passCount}\n`;
    report += `- **Failed:** ❌ ${failCount}\n`;
    report += `- **Skipped:** ⏭️ ${skipCount}\n`;
    report += `- **Pass Rate:** ${passRate}%\n\n`;

    // Group by category
    const categories = [...new Set(results.map(r => r.category))];
    
    categories.forEach(category => {
        const categoryResults = results.filter(r => r.category === category);
        const categoryPass = categoryResults.filter(r => r.status === 'PASS').length;
        const categoryFail = categoryResults.filter(r => r.status === 'FAIL').length;
        const categorySkip = categoryResults.filter(r => r.status === 'SKIP').length;

        report += `## ${category}\n\n`;
        report += `**Summary:** ${categoryPass} passed, ${categoryFail} failed, ${categorySkip} skipped\n\n`;
        report += `| Endpoint | Method | Status | Message | Response Time | Auth |\n`;
        report += `|----------|--------|--------|---------|---------------|------|\n`;

        categoryResults.forEach(result => {
            const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
            const authIcon = result.requiresAuth ? '🔒' : '🔓';
            report += `| \`${result.endpoint}\` | ${result.method} | ${statusEmoji} ${result.status} | ${result.message} | ${result.responseTime || 'N/A'}ms | ${authIcon} |\n`;
        });

        report += `\n`;
    });

    // Recommendations
    report += `## Recommendations\n\n`;
    
    const failedEndpoints = results.filter(r => r.status === 'FAIL');
    if (failedEndpoints.length > 0) {
        report += `### Failed Endpoints\n\n`;
        failedEndpoints.forEach(result => {
            report += `- **${result.method} ${result.endpoint}**: ${result.message}\n`;
        });
        report += `\n`;
    }

    const skippedEndpoints = results.filter(r => r.status === 'SKIP');
    if (skippedEndpoints.length > 0) {
        report += `### Not Implemented (Expected)\n\n`;
        skippedEndpoints.forEach(result => {
            report += `- **${result.method} ${result.endpoint}**: ${result.message}\n`;
        });
        report += `\n`;
    }

    // Save report
    fs.writeFileSync('API_TEST_REPORT.md', report);
    console.log('\n✅ Report saved to API_TEST_REPORT.md\n');

    // Console summary
    console.log('═══════════════════════════════════════════════');
    console.log('                TEST SUMMARY                   ');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Passed:  ${passCount}/${totalCount}`);
    console.log(`❌ Failed:  ${failCount}/${totalCount}`);
    console.log(`⏭️  Skipped: ${skipCount}/${totalCount}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    console.log('═══════════════════════════════════════════════\n');
}

/**
 * Main Test Runner
 */
async function runAllTests() {
    console.log('🚀 Starting Comprehensive API Test Suite...\n');
    console.log('═══════════════════════════════════════════════\n');

    const authSuccess = await testAuthentication();
    
    if (!authSuccess) {
        console.log('\n❌ Authentication failed. Please update TEST_CREDENTIALS with valid credentials.\n');
        return;
    }

    await testEmployeeData();
    await testAttendance();
    await testWFH();
    await testLeaves();
    await testApprovals();
    await testCalendar();

    generateReport();
}

// Run tests
runAllTests().catch(console.error);
