// utils/resetData.ts
// Utility functions for resetting app data during development

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear ALL AsyncStorage data
 * Use with caution - this will log out the user!
 */
export const clearAllData = async (): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('📋 Found storage keys:', keys);

        await AsyncStorage.clear();
        console.log('✅ All data cleared successfully!');
    } catch (error) {
        console.error('❌ Error clearing all data:', error);
        throw error;
    }
};

/**
 * Clear only attendance-related data
 * Keeps user logged in but resets check-in state
 */
export const clearAttendanceData = async (): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();

        const attendanceKeys = keys.filter(key =>
            key.includes('checkInCardState') ||
            key.includes('lastResetDate') ||
            key.includes('attendance_records') ||
            key.includes('lastLunchAlert') ||
            key.includes('forceResetMode')
        );

        console.log('📋 Clearing attendance keys:', attendanceKeys);

        if (attendanceKeys.length > 0) {
            await AsyncStorage.multiRemove(attendanceKeys);
            console.log('✅ Attendance data cleared successfully!');
        } else {
            console.log('ℹ️ No attendance data found to clear');
        }
    } catch (error) {
        console.error('❌ Error clearing attendance data:', error);
        throw error;
    }
};

/**
 * Clear data for a specific user
 * @param userId - The user ID to clear data for
 */
export const clearUserData = async (userId: string): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();

        const userKeys = keys.filter(key => key.includes(`_${userId}`));

        console.log(`📋 Clearing data for user ${userId}:`, userKeys);

        if (userKeys.length > 0) {
            await AsyncStorage.multiRemove(userKeys);
            console.log(`✅ Data cleared for user ${userId}!`);
        } else {
            console.log(`ℹ️ No data found for user ${userId}`);
        }
    } catch (error) {
        console.error(`❌ Error clearing data for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Force reset check-in state on next app load
 * Useful for testing the reset functionality
 */
export const forceResetOnNextLoad = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem('forceResetMode', 'true');
        console.log('✅ Force reset flag set - app will reset on next load');
    } catch (error) {
        console.error('❌ Error setting force reset flag:', error);
        throw error;
    }
};

/**
 * List all storage keys (for debugging)
 */
export const listAllKeys = async (): Promise<string[]> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('📋 All storage keys:', keys);
        return keys;
    } catch (error) {
        console.error('❌ Error listing keys:', error);
        throw error;
    }
};

/**
 * Get all storage data (for debugging)
 */
export const getAllData = async (): Promise<Record<string, string | null>> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const data: Record<string, string | null> = {};

        for (const key of keys) {
            data[key] = await AsyncStorage.getItem(key);
        }

        console.log('📊 All storage data:', data);
        return data;
    } catch (error) {
        console.error('❌ Error getting all data:', error);
        throw error;
    }
};

/**
 * Reset punch in/out state and delete all attendance data
 * This is a comprehensive reset that clears:
 * - Check-in/out state
 * - Punch times
 * - Attendance records
 * - Last reset date
 * - Force reset flags
 */
export const resetPunchAndAttendance = async (): Promise<void> => {
    try {
        console.log('🔄 Starting comprehensive punch and attendance reset...');

        const keys = await AsyncStorage.getAllKeys();

        // Find all attendance-related keys
        const keysToRemove = keys.filter(key =>
            key.includes('checkInCardState') ||
            key.includes('lastResetDate') ||
            key.includes('attendance_records') ||
            key.includes('@attendance_records') ||
            key.includes('lastLunchAlert') ||
            key.includes('forceResetMode') ||
            key.includes('punchInTime') ||
            key.includes('punchOutTime') ||
            key.includes('workingHours')
        );

        console.log('📋 Keys to remove:', keysToRemove);

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            console.log(`✅ Removed ${keysToRemove.length} attendance-related keys`);
        }

        // Set force reset flag for next load
        await AsyncStorage.setItem('forceResetMode', 'true');

        console.log('✅ Punch and attendance data reset complete!');
        console.log('ℹ️  Please reload the app to see changes');
    } catch (error) {
        console.error('❌ Error resetting punch and attendance:', error);
        throw error;
    }
};


// Export a convenience object with all functions
export const DevUtils = {
    clearAllData,
    clearAttendanceData,
    clearUserData,
    forceResetOnNextLoad,
    listAllKeys,
    getAllData,
    resetPunchAndAttendance,
};

export default DevUtils;
