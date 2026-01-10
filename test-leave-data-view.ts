/**
 * Test script for Leave Data View API
 * Run this to verify the API is working
 */

import { getEmployeeLeaveDataView } from './lib/leaves';

async function testLeaveDataViewAPI() {
    console.log('🧪 Testing Leave Data View API...\n');

    try {
        console.log('📡 Calling getEmployeeLeaveDataView()...');
        const response = await getEmployeeLeaveDataView();

        console.log('\n✅ API Response:');
        console.log(JSON.stringify(response, null, 2));

        if (response.status === 'Success') {
            console.log('\n📊 Leave Statistics:');
            console.log(`   Applied Count: ${response.data.applied_count}`);
            console.log(`   Approved Count: ${response.data.approved_count}`);

            if (response.data.applied_count > 0) {
                const approvalRate = Math.round((response.data.approved_count / response.data.applied_count) * 100);
                console.log(`   Approval Rate: ${approvalRate}%`);
            }

            console.log('\n✅ TEST PASSED: API is working correctly!');
        } else {
            console.log('\n❌ TEST FAILED: API returned error status');
        }
    } catch (error: any) {
        console.log('\n❌ TEST FAILED: Error occurred');
        console.error('Error:', error.message);

        if (error.message.includes('session has expired')) {
            console.log('\n💡 Tip: You need to login first');
        } else if (error.message.includes('No access token')) {
            console.log('\n💡 Tip: Authentication required - please login');
        }
    }
}

// Run the test
testLeaveDataViewAPI();
