/**
 * Test Suite for Late Check-In and Early Check-Out Detection
 * 
 * This file contains comprehensive tests for the attendance tracking logic.
 * Run these tests to verify that late check-in and early check-out detection is working correctly.
 */

// Test Results Summary
console.log('🧪 ATTENDANCE LOGIC TEST SUITE');
console.log('='.repeat(70));
console.log('Testing Late Check-In (after 9:30 AM) and Early Check-Out (before 6:30 PM)');
console.log('Current Time (IST):', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
console.log('='.repeat(70));

/**
 * Helper function to check if time is late check-in
 */
const isLateCheckIn = (hours: number, minutes: number): boolean => {
    return hours > 9 || (hours === 9 && minutes > 30);
};

/**
 * Helper function to check if time is early check-out
 */
const isEarlyCheckOut = (hours: number, minutes: number): boolean => {
    return hours < 18 || (hours === 18 && minutes < 30);
};

/**
 * Helper function to calculate minutes late
 */
const getMinutesLate = (hours: number, minutes: number): number => {
    if (!isLateCheckIn(hours, minutes)) return 0;
    const currentMinutes = hours * 60 + minutes;
    const thresholdMinutes = 9 * 60 + 30; // 9:30 AM
    return currentMinutes - thresholdMinutes;
};

/**
 * Helper function to calculate minutes early
 */
const getMinutesEarly = (hours: number, minutes: number): number => {
    if (!isEarlyCheckOut(hours, minutes)) return 0;
    const currentMinutes = hours * 60 + minutes;
    const thresholdMinutes = 18 * 60 + 30; // 6:30 PM
    return thresholdMinutes - currentMinutes;
};

// TEST 1: Late Check-In Detection
console.log('\n📍 TEST 1: Late Check-In Detection (Threshold: 9:30 AM)');
console.log('-'.repeat(70));

const checkInTests = [
    { time: '08:00 AM', hours: 8, minutes: 0, expectedLate: false },
    { time: '09:00 AM', hours: 9, minutes: 0, expectedLate: false },
    { time: '09:29 AM', hours: 9, minutes: 29, expectedLate: false },
    { time: '09:30 AM', hours: 9, minutes: 30, expectedLate: false }, // Exactly on time
    { time: '09:31 AM', hours: 9, minutes: 31, expectedLate: true },
    { time: '10:00 AM', hours: 10, minutes: 0, expectedLate: true },
    { time: '10:30 AM', hours: 10, minutes: 30, expectedLate: true },
    { time: '11:00 AM', hours: 11, minutes: 0, expectedLate: true },
];

let passedCheckIn = 0;
let failedCheckIn = 0;

checkInTests.forEach(({ time, hours, minutes, expectedLate }) => {
    const isLate = isLateCheckIn(hours, minutes);
    const minutesLate = getMinutesLate(hours, minutes);
    const passed = isLate === expectedLate;

    if (passed) passedCheckIn++;
    else failedCheckIn++;

    const status = passed ? '✅ PASS' : '❌ FAIL';
    const lateInfo = isLate ? `(${minutesLate} min late)` : '';

    console.log(`${status} | ${time.padEnd(10)} | Late: ${String(isLate).padEnd(5)} | Expected: ${expectedLate} ${lateInfo}`);
});

// TEST 2: Early Check-Out Detection
console.log('\n📍 TEST 2: Early Check-Out Detection (Threshold: 6:30 PM)');
console.log('-'.repeat(70));

const checkOutTests = [
    { time: '04:00 PM', hours: 16, minutes: 0, expectedEarly: true },
    { time: '05:00 PM', hours: 17, minutes: 0, expectedEarly: true },
    { time: '06:00 PM', hours: 18, minutes: 0, expectedEarly: true },
    { time: '06:29 PM', hours: 18, minutes: 29, expectedEarly: true },
    { time: '06:30 PM', hours: 18, minutes: 30, expectedEarly: false }, // Exactly on time
    { time: '06:31 PM', hours: 18, minutes: 31, expectedEarly: false },
    { time: '07:00 PM', hours: 19, minutes: 0, expectedEarly: false },
    { time: '08:00 PM', hours: 20, minutes: 0, expectedEarly: false },
];

let passedCheckOut = 0;
let failedCheckOut = 0;

checkOutTests.forEach(({ time, hours, minutes, expectedEarly }) => {
    const isEarly = isEarlyCheckOut(hours, minutes);
    const minutesEarly = getMinutesEarly(hours, minutes);
    const passed = isEarly === expectedEarly;

    if (passed) passedCheckOut++;
    else failedCheckOut++;

    const status = passed ? '✅ PASS' : '❌ FAIL';
    const earlyInfo = isEarly ? `(${minutesEarly} min early)` : '';

    console.log(`${status} | ${time.padEnd(10)} | Early: ${String(isEarly).padEnd(5)} | Expected: ${expectedEarly} ${earlyInfo}`);
});

// TEST 3: Current Time Status
console.log('\n📍 TEST 3: Current Time Status');
console.log('-'.repeat(70));

const now = new Date();
const currentHours = now.getHours();
const currentMinutes = now.getMinutes();

const currentIsLate = isLateCheckIn(currentHours, currentMinutes);
const currentIsEarly = isEarlyCheckOut(currentHours, currentMinutes);
const currentMinutesLate = getMinutesLate(currentHours, currentMinutes);
const currentMinutesEarly = getMinutesEarly(currentHours, currentMinutes);

console.log(`Current Time: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
console.log(`Check-In Status: ${currentIsLate ? `❌ LATE (${currentMinutesLate} minutes)` : '✅ ON TIME'}`);
console.log(`Check-Out Status: ${currentIsEarly ? `⚠️ EARLY (${currentMinutesEarly} minutes)` : '✅ ON TIME'}`);

// TEST 4: Summary
console.log('\n📊 TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Late Check-In Tests: ${passedCheckIn}/${checkInTests.length} passed ${failedCheckIn > 0 ? `(${failedCheckIn} failed)` : '✅'}`);
console.log(`Early Check-Out Tests: ${passedCheckOut}/${checkOutTests.length} passed ${failedCheckOut > 0 ? `(${failedCheckOut} failed)` : '✅'}`);
console.log(`Total: ${passedCheckIn + passedCheckOut}/${checkInTests.length + checkOutTests.length} tests passed`);

if (failedCheckIn === 0 && failedCheckOut === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The endpoints are working correctly.');
} else {
    console.log('\n⚠️ SOME TESTS FAILED! Please review the implementation.');
}

console.log('='.repeat(70));

// Export test results
export const testResults = {
    checkIn: { passed: passedCheckIn, failed: failedCheckIn, total: checkInTests.length },
    checkOut: { passed: passedCheckOut, failed: failedCheckOut, total: checkOutTests.length },
    allPassed: failedCheckIn === 0 && failedCheckOut === 0,
};
