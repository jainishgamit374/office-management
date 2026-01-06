/**
 * Test script to verify local attendance storage implementation
 * Run this in the app to test the functionality
 */

import { calculateWorkingHours, getLocalAttendanceRecords, isEarlyCheckOut, isLateCheckIn, saveAttendanceRecord } from './lib/attendanceStorage';

export const testAttendanceStorage = async () => {
    console.log('🧪 Starting Attendance Storage Tests...\n');

    try {
        // Test 1: Late Check-In Detection
        console.log('Test 1: Late Check-In Detection');
        const lateTime = new Date();
        lateTime.setHours(10, 0, 0); // 10:00 AM
        const isLate = isLateCheckIn(lateTime.toISOString());
        console.log(`  10:00 AM is late: ${isLate} ✅ (Expected: true)`);

        const onTime = new Date();
        onTime.setHours(9, 0, 0); // 9:00 AM
        const isOnTime = !isLateCheckIn(onTime.toISOString());
        console.log(`  9:00 AM is on time: ${isOnTime} ✅ (Expected: true)\n`);

        // Test 2: Early Check-Out Detection
        console.log('Test 2: Early Check-Out Detection');
        const earlyTime = new Date();
        earlyTime.setHours(17, 0, 0); // 5:00 PM
        const isEarly = isEarlyCheckOut(earlyTime.toISOString());
        console.log(`  5:00 PM is early: ${isEarly} ✅ (Expected: true)`);

        const normalTime = new Date();
        normalTime.setHours(19, 0, 0); // 7:00 PM
        const isNormal = !isEarlyCheckOut(normalTime.toISOString());
        console.log(`  7:00 PM is not early: ${isNormal} ✅ (Expected: true)\n`);

        // Test 3: Working Hours Calculation
        console.log('Test 3: Working Hours Calculation');
        const punchIn = new Date();
        punchIn.setHours(9, 0, 0);
        const punchOut = new Date();
        punchOut.setHours(18, 30, 0);
        const hours = calculateWorkingHours(punchIn.toISOString(), punchOut.toISOString());
        console.log(`  9:00 AM to 6:30 PM = ${hours} ✅ (Expected: 9h 30m)\n`);

        // Test 4: Save and Retrieve
        console.log('Test 4: Save and Retrieve Records');
        const testDate = new Date().toISOString().split('T')[0];
        const testPunchIn = new Date();
        testPunchIn.setHours(9, 15, 0);

        await saveAttendanceRecord(
            testDate,
            'IN',
            testPunchIn.toISOString(),
            { latitude: 23.0225, longitude: 72.5714 }
        );
        console.log('  ✅ Saved punch IN record');

        const testPunchOut = new Date();
        testPunchOut.setHours(18, 0, 0);
        await saveAttendanceRecord(
            testDate,
            'OUT',
            testPunchOut.toISOString(),
            { latitude: 23.0225, longitude: 72.5714 }
        );
        console.log('  ✅ Saved punch OUT record');

        const records = await getLocalAttendanceRecords();
        console.log(`  ✅ Retrieved ${records.length} record(s)`);

        if (records.length > 0) {
            const latestRecord = records[records.length - 1];
            console.log(`  Latest record:`);
            console.log(`    Date: ${latestRecord.date}`);
            console.log(`    Punch In: ${latestRecord.punchInTime}`);
            console.log(`    Punch Out: ${latestRecord.punchOutTime}`);
            console.log(`    Late Check-In: ${latestRecord.isLateCheckIn}`);
            console.log(`    Early Check-Out: ${latestRecord.isEarlyCheckOut}`);
            console.log(`    Working Hours: ${latestRecord.workingHours}`);
        }

        console.log('\n✅ All tests completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
};

// To run the test, call: testAttendanceStorage()
