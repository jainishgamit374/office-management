// Test script to check employee attendance API
import { getEmployeeAttendance } from './lib/employeeAttendance';

async function testAttendanceAPI() {
    try {
        console.log('🧪 Testing Employee Attendance API...\n');

        // Get current month date range
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];

        console.log(`📅 Date Range: ${startDate} to ${endDate}\n`);

        const response = await getEmployeeAttendance(startDate, endDate);

        console.log('✅ API Response:');
        console.log('  - Success:', response.success);
        console.log('  - Status Code:', response.status_code);
        console.log('  - Message:', response.message);
        console.log('  - Total Records:', response.data?.total_count || 0);
        console.log('  - Present Days:', response.data?.present_days || 0);
        console.log('  - Absent Days:', response.data?.absent_days || 0);
        console.log('  - Total Hours:', response.data?.total_hours || '0h 0m');

        if (response.data?.records && response.data.records.length > 0) {
            console.log('\n📋 First Record Sample:');
            const firstRecord = response.data.records[0];
            console.log(JSON.stringify(firstRecord, null, 2));

            console.log('\n📊 All Records:');
            response.data.records.forEach((record, index) => {
                console.log(`  ${index + 1}. ${record.date} - ${record.employeeName} - ${record.punchIn} to ${record.punchOut} (${record.workingHours})`);
            });
        } else {
            console.log('\n⚠️ No records found');
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testAttendanceAPI();
