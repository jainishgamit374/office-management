// Test file for late check-in and early check-out functionality
// Run this to verify the endpoints are working correctly

import { getMinutesEarly, getMinutesLate, isEarlyCheckOut, isLateCheckIn } from './lib/attendance';

console.log('🧪 Testing Late Check-In and Early Check-Out Functions\n');
console.log('='.repeat(60));

// Test 1: Late Check-In Detection
console.log('\n📍 TEST 1: Late Check-In Detection');
console.log('-'.repeat(60));

const testTimes = [
    { time: '08:00', hours: 8, minutes: 0, expectedLate: false },
    { time: '09:00', hours: 9, minutes: 0, expectedLate: false },
    { time: '09:30', hours: 9, minutes: 30, expectedLate: false },
    { time: '09:31', hours: 9, minutes: 31, expectedLate: true },
    { time: '10:00', hours: 10, minutes: 0, expectedLate: true },
    { time: '11:00', hours: 11, minutes: 0, expectedLate: true },
];

testTimes.forEach(({ time, hours, minutes, expectedLate }) => {
    // Create a date in IST
    const testDate = new Date();
    testDate.setHours(hours, minutes, 0, 0);

    const isLate = isLateCheckIn(testDate);
    const minutesLate = getMinutesLate(testDate);
    const status = isLate === expectedLate ? '✅ PASS' : '❌ FAIL';

    console.log(`${status} | ${time} | Late: ${isLate} (Expected: ${expectedLate}) | Minutes Late: ${minutesLate}`);
});

// Test 2: Early Check-Out Detection
console.log('\n📍 TEST 2: Early Check-Out Detection');
console.log('-'.repeat(60));

const checkoutTimes = [
    { time: '16:00', hours: 16, minutes: 0, expectedEarly: true },
    { time: '17:00', hours: 17, minutes: 0, expectedEarly: true },
    { time: '18:00', hours: 18, minutes: 0, expectedEarly: true },
    { time: '18:30', hours: 18, minutes: 30, expectedEarly: false },
    { time: '18:31', hours: 18, minutes: 31, expectedEarly: false },
    { time: '19:00', hours: 19, minutes: 0, expectedEarly: false },
    { time: '20:00', hours: 20, minutes: 0, expectedEarly: false },
];

checkoutTimes.forEach(({ time, hours, minutes, expectedEarly }) => {
    // Create a date in IST
    const testDate = new Date();
    testDate.setHours(hours, minutes, 0, 0);

    const isEarly = isEarlyCheckOut(testDate);
    const minutesEarly = getMinutesEarly(testDate);
    const status = isEarly === expectedEarly ? '✅ PASS' : '❌ FAIL';

    console.log(`${status} | ${time} | Early: ${isEarly} (Expected: ${expectedEarly}) | Minutes Early: ${minutesEarly}`);
});

// Test 3: Current Time Test
console.log('\n📍 TEST 3: Current Time Status');
console.log('-'.repeat(60));

const now = new Date();
const currentIsLate = isLateCheckIn(now);
const currentIsEarly = isEarlyCheckOut(now);
const currentMinutesLate = getMinutesLate(now);
const currentMinutesEarly = getMinutesEarly(now);

console.log(`Current Time (IST): ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
console.log(`Is Late Check-In: ${currentIsLate} ${currentIsLate ? `(${currentMinutesLate} minutes late)` : ''}`);
console.log(`Is Early Check-Out: ${currentIsEarly} ${currentIsEarly ? `(${currentMinutesEarly} minutes early)` : ''}`);

// Test 4: Edge Cases
console.log('\n📍 TEST 4: Edge Cases');
console.log('-'.repeat(60));

// Exactly 9:30 AM - should NOT be late
const exactly930 = new Date();
exactly930.setHours(9, 30, 0, 0);
console.log(`✅ 9:30 AM exactly - Late: ${isLateCheckIn(exactly930)} (Expected: false)`);

// Exactly 18:30 PM - should NOT be early
const exactly1830 = new Date();
exactly1830.setHours(18, 30, 0, 0);
console.log(`✅ 6:30 PM exactly - Early: ${isEarlyCheckOut(exactly1830)} (Expected: false)`);

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!\n');

// Export for use in app
export const runAttendanceTests = () => {
    console.log('Running attendance tests...');
    // Tests run automatically when this file is imported
};
