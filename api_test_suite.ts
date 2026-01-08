#!/usr/bin/env ts-node
/**
 * Comprehensive API Testing Suite
 * Tests all 44 endpoints to verify they are properly configured
 */

import * as readline from 'readline';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

interface TestResult {
    endpoint: string;
    method: string;
    status: 'success' | 'failed' | 'not_implemented';
    statusCode?: number;
    message: string;
    responseTime?: number;
    requiresAuth: boolean;
}

interface EndpointTest {
    endpoint: string;
    method: string;
    requiresAuth: boolean;
    category: string;
    testData?: any;
    description: string;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

// All 44 endpoints to test
const endpoints: EndpointTest[] = [
    // 1. Authentication & Registration
    { endpoint: '/register/', method: 'POST', requiresAuth: false, category: 'Authentication', description: 'User registration', testData: null },
    { endpoint: '/', method: 'GET', requiresAuth: false, category: 'Authentication', description: 'Root endpoint' },

    // 2. Attendance & Punch
    { endpoint: '/emp-punch/', method: 'GET', requiresAuth: true, category: 'Attendance', description: 'Get punch records' },
    { endpoint: '/emp-punch/', method: 'POST', requiresAuth: true, category: 'Attendance', description: 'Record punch in/out' },
    { endpoint: '/dashboard-punch-status/', method: 'GET', requiresAuth: true, category: 'Attendance', description: 'Get punch status' },
    { endpoint: '/early-late-punch/', method: 'GET', requiresAuth: true, category: 'Attendance', description: 'Get early/late punch records' },
    { endpoint: '/late-checkin-count/', method: 'GET', requiresAuth: true, category: 'Attendance', description: 'Get late check-in count' },

    // 3. Early Checkout & Late Requests
    { endpoint: '/late-checkin-request/', method: 'POST', requiresAuth: true, category: 'Early/Late Requests', description: 'Submit late check-in request' },
    { endpoint: '/createearlycheckout/', method: 'POST', requiresAuth: true, category: 'Early/Late Requests', description: 'Create early checkout request' },
    { endpoint: '/earlycheckoutdetails/', method: 'GET', requiresAuth: true, category: 'Early/Late Requests', description: 'Get early checkout details' },
    { endpoint: '/earlycheckoutlist/', method: 'GET', requiresAuth: true, category: 'Early/Late Requests', description: 'List early checkout requests' },

    // 4. Leave Management
    { endpoint: '/leaveapplications/', method: 'GET', requiresAuth: true, category: 'Leave Management', description: 'Get leave applications' },
    { endpoint: '/leaveapplications/', method: 'POST', requiresAuth: true, category: 'Leave Management', description: 'Submit leave application' },
    { endpoint: '/leaveapplications-list/', method: 'GET', requiresAuth: true, category: 'Leave Management', description: 'List leave applications' },
    { endpoint: '/getemployeeleavebalance/', method: 'GET', requiresAuth: true, category: 'Leave Management', description: 'Get leave balance' },
    { endpoint: '/getemployeeleavedataview/', method: 'GET', requiresAuth: true, category: 'Leave Management', description: 'View leave data' },
    { endpoint: '/leaveapprovals/', method: 'GET', requiresAuth: true, category: 'Leave Management', description: 'Leave approval management' },

    // 5. Work From Home
    { endpoint: '/workfromhomereq/', method: 'POST', requiresAuth: true, category: 'Work From Home', description: 'Submit WFH request' },
    { endpoint: '/workfromhomeapplicationslist/', method: 'GET', requiresAuth: true, category: 'Work From Home', description: 'List WFH applications' },
    { endpoint: '/workfromhomeapproval/', method: 'GET', requiresAuth: true, category: 'Work From Home', description: 'WFH approval management' },
    { endpoint: '/workfromhomeapprovalhistory/', method: 'GET', requiresAuth: true, category: 'Work From Home', description: 'WFH approval history' },

    // 6. Miss Punch
    { endpoint: '/misspunch/', method: 'POST', requiresAuth: true, category: 'Miss Punch', description: 'Submit miss punch request' },
    { endpoint: '/getmissingpunchout/', method: 'GET', requiresAuth: true, category: 'Miss Punch', description: 'Get missing punch out' },
    { endpoint: '/getmissingpunchdetails/', method: 'GET', requiresAuth: true, category: 'Miss Punch', description: 'Get miss punch details' },
    { endpoint: '/misspunchapprovallist/', method: 'GET', requiresAuth: true, category: 'Miss Punch', description: 'Miss punch approval list' },

    // 7. Workflow & Approvals
    { endpoint: '/workflowapproval/', method: 'GET', requiresAuth: true, category: 'Workflow & Approvals', description: 'Workflow approval' },
    { endpoint: '/approvalhistory/', method: 'GET', requiresAuth: true, category: 'Workflow & Approvals', description: 'Approval history' },
    { endpoint: '/allapprove/', method: 'POST', requiresAuth: true, category: 'Workflow & Approvals', description: 'Approve all' },
    { endpoint: '/alldisapprove/', method: 'POST', requiresAuth: true, category: 'Workflow & Approvals', description: 'Disapprove all' },
    { endpoint: '/isawayapprovals/', method: 'GET', requiresAuth: true, category: 'Workflow & Approvals', description: 'Is away approvals' },
    { endpoint: '/approvedisapprovedlist/', method: 'GET', requiresAuth: true, category: 'Workflow & Approvals', description: 'Approve/disapprove list' },
    { endpoint: '/isawayapprovalhistory/', method: 'GET', requiresAuth: true, category: 'Workflow & Approvals', description: 'Is away approval history' },
    { endpoint: '/earlycheckoutapprovallist/', method: 'GET', requiresAuth: true, category: 'Workflow & Approvals', description: 'Early checkout approval list' },

    // 8. Dashboard & Reports
    { endpoint: '/expectedlatearrivals/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Expected late arrivals' },
    { endpoint: '/getearlycheckouts/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Get early checkouts' },
    { endpoint: '/todayleaves/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: "Today's leaves" },
    { endpoint: '/todayworkfromhome/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: "Today's WFH" },
    { endpoint: '/getemployeeofthemonth/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Employee of the month' },
    { endpoint: '/getdob/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Get birthdays' },
    { endpoint: '/getabsence/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Get absences' },
    { endpoint: '/approvedearlycheckoutdetails/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Approved early checkout details' },
    { endpoint: '/employeeattendance/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Employee attendance' },
    { endpoint: '/lateearlyscount/', method: 'GET', requiresAuth: true, category: 'Dashboard & Reports', description: 'Late/early counts' },

    // 9. Upcoming Events
    { endpoint: '/getupcomingleaves/', method: 'GET', requiresAuth: true, category: 'Upcoming Events', description: 'Upcoming leaves' },
    { endpoint: '/getupcomingworkfromhome/', method: 'GET', requiresAuth: true, category: 'Upcoming Events', description: 'Upcoming WFH' },

    // 10. Miss Checkout
    { endpoint: '/getmisscheckout/', method: 'GET', requiresAuth: true, category: 'Miss Checkout', description: 'Get miss checkout' },
];

// Helper function to prompt user for input
function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Login to get access token
async function login(): Promise<boolean> {
    console.log(`\n${colors.cyan}=== Authentication ===${colors.reset}\n`);

    const username = await prompt('Enter your username/email: ');
    const password = await prompt('Enter your password: ');

    try {
        console.log(`\n${colors.gray}Attempting login...${colors.reset}`);

        const response = await fetch(`${BASE_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && (data.access || data.tokens?.access)) {
            accessToken = data.access || data.tokens?.access;
            refreshToken = data.refresh || data.tokens?.refresh;
            console.log(`${colors.green}✓ Login successful!${colors.reset}\n`);
            return true;
        } else {
            console.log(`${colors.red}✗ Login failed: ${data.message || data.detail || 'Unknown error'}${colors.reset}\n`);
            return false;
        }
    } catch (error: any) {
        console.log(`${colors.red}✗ Login error: ${error.message}${colors.reset}\n`);
        return false;
    }
}

// Test a single endpoint
async function testEndpoint(test: EndpointTest): Promise<TestResult> {
    const startTime = Date.now();

    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (test.requiresAuth && accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const config: RequestInit = {
            method: test.method,
            headers,
        };

        // Add test data for POST requests if needed
        if (test.method === 'POST' && test.testData) {
            config.body = JSON.stringify(test.testData);
        }

        const response = await fetch(`${BASE_URL}${test.endpoint}`, config);
        const responseTime = Date.now() - startTime;

        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (response.ok || response.status === 200 || response.status === 201) {
            return {
                endpoint: test.endpoint,
                method: test.method,
                status: 'success',
                statusCode: response.status,
                message: data?.message || 'OK',
                responseTime,
                requiresAuth: test.requiresAuth,
            };
        } else if (response.status === 404) {
            return {
                endpoint: test.endpoint,
                method: test.method,
                status: 'not_implemented',
                statusCode: response.status,
                message: 'Endpoint not found',
                responseTime,
                requiresAuth: test.requiresAuth,
            };
        } else if (response.status === 401 && test.requiresAuth) {
            return {
                endpoint: test.endpoint,
                method: test.method,
                status: 'failed',
                statusCode: response.status,
                message: 'Authentication required',
                responseTime,
                requiresAuth: test.requiresAuth,
            };
        } else {
            return {
                endpoint: test.endpoint,
                method: test.method,
                status: 'failed',
                statusCode: response.status,
                message: data?.message || data?.detail || data?.error || `HTTP ${response.status}`,
                responseTime,
                requiresAuth: test.requiresAuth,
            };
        }
    } catch (error: any) {
        const responseTime = Date.now() - startTime;
        return {
            endpoint: test.endpoint,
            method: test.method,
            status: 'failed',
            message: error.message || 'Network error',
            responseTime,
            requiresAuth: test.requiresAuth,
        };
    }
}

// Run all tests
async function runTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    console.log(`\n${colors.cyan}=== Running API Tests ===${colors.reset}\n`);
    console.log(`Testing ${endpoints.length} endpoints...\n`);

    for (let i = 0; i < endpoints.length; i++) {
        const test = endpoints[i];
        const progress = `[${i + 1}/${endpoints.length}]`;

        process.stdout.write(`${colors.gray}${progress} Testing ${test.method} ${test.endpoint}...${colors.reset}`);

        const result = await testEndpoint(test);
        results.push(result);

        // Clear the line and show result
        process.stdout.write('\r');

        const statusIcon = result.status === 'success' ? `${colors.green}✓${colors.reset}` :
            result.status === 'not_implemented' ? `${colors.yellow}⚠${colors.reset}` :
                `${colors.red}✗${colors.reset}`;

        const timeStr = result.responseTime ? `${result.responseTime}ms` : '';
        console.log(`${statusIcon} ${progress} ${test.method} ${test.endpoint} ${colors.gray}${timeStr}${colors.reset}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
}

// Generate markdown report
function generateReport(results: TestResult[]): string {
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const notImplementedCount = results.filter(r => r.status === 'not_implemented').length;

    const categories = [...new Set(endpoints.map(e => e.category))];

    let report = `# API Testing Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Endpoints:** ${results.length}\n`;
    report += `- **✅ Successful:** ${successCount}\n`;
    report += `- **❌ Failed:** ${failedCount}\n`;
    report += `- **⚠️ Not Implemented:** ${notImplementedCount}\n`;
    report += `- **Success Rate:** ${((successCount / results.length) * 100).toFixed(1)}%\n\n`;

    // Group by category
    for (const category of categories) {
        const categoryEndpoints = endpoints.filter(e => e.category === category);
        const categoryResults = results.filter(r =>
            categoryEndpoints.some(e => e.endpoint === r.endpoint && e.method === r.method)
        );

        report += `## ${category}\n\n`;
        report += `| Endpoint | Method | Status | Code | Message | Time |\n`;
        report += `|----------|--------|--------|------|---------|------|\n`;

        for (const endpoint of categoryEndpoints) {
            const result = categoryResults.find(r =>
                r.endpoint === endpoint.endpoint && r.method === endpoint.method
            );

            if (result) {
                const statusIcon = result.status === 'success' ? '✅' :
                    result.status === 'not_implemented' ? '⚠️' : '❌';
                const code = result.statusCode || '-';
                const time = result.responseTime ? `${result.responseTime}ms` : '-';

                report += `| ${endpoint.endpoint} | ${endpoint.method} | ${statusIcon} ${result.status} | ${code} | ${result.message} | ${time} |\n`;
            }
        }

        report += `\n`;
    }

    // Detailed failures
    const failures = results.filter(r => r.status === 'failed');
    if (failures.length > 0) {
        report += `## ❌ Failed Endpoints\n\n`;
        for (const failure of failures) {
            report += `### ${failure.method} ${failure.endpoint}\n`;
            report += `- **Status Code:** ${failure.statusCode || 'N/A'}\n`;
            report += `- **Error:** ${failure.message}\n`;
            report += `- **Requires Auth:** ${failure.requiresAuth ? 'Yes' : 'No'}\n\n`;
        }
    }

    // Not implemented
    const notImplemented = results.filter(r => r.status === 'not_implemented');
    if (notImplemented.length > 0) {
        report += `## ⚠️ Not Implemented Endpoints\n\n`;
        for (const endpoint of notImplemented) {
            report += `- ${endpoint.method} ${endpoint.endpoint}\n`;
        }
        report += `\n`;
    }

    return report;
}

// Main function
async function main() {
    console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║   API Testing Suite                    ║${colors.reset}`);
    console.log(`${colors.cyan}║   Testing ${endpoints.length} endpoints                  ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);

    // Login
    const loggedIn = await login();
    if (!loggedIn) {
        console.log(`${colors.yellow}⚠ Continuing without authentication. Only public endpoints will be tested.${colors.reset}\n`);
    }

    // Run tests
    const results = await runTests();

    // Generate report
    const report = generateReport(results);

    // Save report
    const { writeFileSync } = await import('fs');
    const reportPath = 'api_test_report.md';
    writeFileSync(reportPath, report);

    // Print summary
    console.log(`\n${colors.cyan}=== Test Summary ===${colors.reset}\n`);
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const notImplementedCount = results.filter(r => r.status === 'not_implemented').length;

    console.log(`${colors.green}✓ Successful: ${successCount}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failedCount}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Not Implemented: ${notImplementedCount}${colors.reset}`);
    console.log(`\n${colors.cyan}Report saved to: ${reportPath}${colors.reset}\n`);
}

// Run the tests
main().catch(console.error);
