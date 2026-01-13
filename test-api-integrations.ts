/**
 * API Integration Verification Test
 * 
 * This file tests the API integrations for:
 * 1. LeaveBalanceSection - /getemployeeleavebalance/
 * 2. EarlyCheckouts - /earlycheckoutdetails/
 * 3. LateArrivals - /early-late-punch/ (CheckoutType='Late')
 * 4. AttendanceTrackingCards - /late-checkin-request/ and /early-late-punch/
 */

import { getEarlyCheckoutDetails, getEarlyLatePunchList } from './lib/earlyLatePunch';
import { getEmployeeLeaveBalance } from './lib/leaves';

console.log('🧪 Starting API Integration Tests...\n');

// Test 1: Leave Balance API
async function testLeaveBalance() {
    console.log('📊 Test 1: Leave Balance API');
    console.log('Endpoint: /getemployeeleavebalance/');
    try {
        const response = await getEmployeeLeaveBalance();
        console.log('✅ Response:', JSON.stringify(response, null, 2));

        if (response.status === 'Success') {
            console.log(`✅ Found ${response.data?.length || 0} leave types`);
            if (response.data && response.data.length > 0) {
                console.log('Sample:', response.data[0]);
            } else {
                console.log('⚠️ No leave data - will show sample data');
            }
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
    console.log('');
}

// Test 2: Early Checkout Details API
async function testEarlyCheckoutDetails() {
    console.log('📊 Test 2: Early Checkout Details API');
    console.log('Endpoint: /earlycheckoutdetails/');
    try {
        const response = await getEarlyCheckoutDetails({ limit: 5, status: 'All' });
        console.log('✅ Response:', JSON.stringify(response, null, 2));

        if (response.status === 'Success') {
            console.log(`✅ Found ${response.data?.length || 0} early checkout requests`);
            if (response.data && response.data.length > 0) {
                console.log('Sample:', response.data[0]);
            }
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
    console.log('');
}

// Test 3: Late Arrivals API
async function testLateArrivals() {
    console.log('📊 Test 3: Late Arrivals API');
    console.log('Endpoint: /early-late-punch/ (CheckoutType=Late)');
    try {
        const response = await getEarlyLatePunchList({
            checkoutType: 'Late',
            limit: 5,
            sortBy: 'DateTime',
            sortOrder: 'desc'
        });
        console.log('✅ Response:', JSON.stringify(response, null, 2));

        if (response.status === 'Success') {
            console.log(`✅ Found ${response.data?.length || 0} late arrivals`);
            if (response.data && response.data.length > 0) {
                console.log('Sample:', response.data[0]);
            }
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
    console.log('');
}

// Test 4: Early Checkouts from /early-late-punch/
async function testEarlyCheckouts() {
    console.log('📊 Test 4: Early Checkouts API');
    console.log('Endpoint: /early-late-punch/ (CheckoutType=Early)');
    try {
        const response = await getEarlyLatePunchList({
            checkoutType: 'Early',
            limit: 5,
            sortBy: 'DateTime',
            sortOrder: 'desc'
        });
        console.log('✅ Response:', JSON.stringify(response, null, 2));

        if (response.status === 'Success') {
            console.log(`✅ Found ${response.data?.length || 0} early checkouts`);
            if (response.data && response.data.length > 0) {
                console.log('Sample:', response.data[0]);
            }
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
    console.log('');
}

// Run all tests
async function runAllTests() {
    await testLeaveBalance();
    await testEarlyCheckoutDetails();
    await testLateArrivals();
    await testEarlyCheckouts();

    console.log('🎉 All API tests completed!');
    console.log('\n📝 Summary:');
    console.log('1. LeaveBalanceSection uses: getEmployeeLeaveBalance() → /getemployeeleavebalance/');
    console.log('2. EarlyCheckouts uses: getEarlyCheckoutDetails() → /earlycheckoutdetails/');
    console.log('3. LateArrivals uses: getEarlyLatePunchList({checkoutType: "Late"}) → /early-late-punch/');
    console.log('4. AttendanceTrackingCards uses:');
    console.log('   - submitLateCheckinRequest() → /late-checkin-request/');
    console.log('   - createEarlyLatePunch() → /early-late-punch/');
}

// Export for use in app
export { runAllTests };

// Auto-run if executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}
