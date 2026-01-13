// ==================== LOCAL STORAGE FOR ATTENDANCE ====================

import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTENDANCE_STORAGE_PREFIX = '@attendance_records_';
const USER_EMAIL_KEY = '@user_email';

/**
 * Convert UTC time to IST (Indian Standard Time)
 * IST = UTC + 5 hours 30 minutes
 */
export const convertToIST = (date: Date = new Date()): Date => {
    // Get UTC time in milliseconds
    const utcTime = date.getTime();

    // IST offset is +5:30 (5 hours 30 minutes = 330 minutes = 19800000 milliseconds)
    const istOffset = 5.5 * 60 * 60 * 1000; // 19800000 ms

    // Create IST date
    const istTime = new Date(utcTime + istOffset);

    return istTime;
};

/**
 * Get current time in IST formatted as HH:MM AM/PM
 */
export const getCurrentISTTime = (): string => {
    const istDate = convertToIST();
    return istDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};

export interface LocalPunchRecord {
    id: string;
    date: string;
    dayName: string;
    day: string;
    month: string;
    punchIn: string;
    punchOut: string;
    workingHours: string;
    status: 'present' | 'absent' | 'weekend';
    latitude?: number;
    longitude?: number;
    isRemote: boolean;
}

import { decodeToken, getAccessToken } from './auth';

/**
 * Get user-specific storage key
 */
export const getUserStorageKey = async (): Promise<string> => {
    try {
        // Try to get user_id from access token first (most reliable)
        const token = await getAccessToken();
        if (token) {
            const decoded = decodeToken(token);
            const userId = decoded?.user_id || decoded?.sub || decoded?.id;
            if (userId) {
                return `${ATTENDANCE_STORAGE_PREFIX}${userId}`;
            }
        }

        // Fallback to email if token/user_id not available (legacy support)
        const userEmail = await AsyncStorage.getItem(USER_EMAIL_KEY);
        if (!userEmail) {
            // If no user email, use a default key (for testing)
            return `${ATTENDANCE_STORAGE_PREFIX}default`;
        }
        return `${ATTENDANCE_STORAGE_PREFIX}${userEmail}`;
    } catch (error) {
        console.error('Error getting user storage key:', error);
        return `${ATTENDANCE_STORAGE_PREFIX}default`;
    }
};

/**
 * Check if it's a new day (past 6:00 AM)
 */
const isNewDay = (lastPunchDate: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = now.toISOString().split('T')[0];

    // If it's a different date and past 6 AM, it's a new day
    if (lastPunchDate !== currentDate && currentHour >= 6) {
        return true;
    }

    // If it's the same date but we're past 6 AM and the last punch was before 6 AM
    if (lastPunchDate === currentDate) {
        return false; // Same day, no reset needed
    }

    return false;
};

/**
 * Save punch IN locally
 */
export const savePunchInLocally = async (latitude: number, longitude: number, isRemote: boolean = false): Promise<void> => {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = getCurrentISTTime(); // Use IST time

        // Get user-specific storage key
        const storageKey = await getUserStorageKey();

        // Get existing records
        const existingData = await AsyncStorage.getItem(storageKey);
        const records: LocalPunchRecord[] = existingData ? JSON.parse(existingData) : [];

        // Check if already punched in today
        const todayRecord = records.find(r => r.date === dateStr);

        // Allow punch in if:
        // 1. No record for today exists, OR
        // 2. It's a new day (past 6 AM) and last punch was yesterday
        if (todayRecord && todayRecord.punchIn !== '--') {
            // Check if we should allow reset (past 6 AM on a new day)
            const currentHour = now.getHours();
            if (currentHour < 6 && todayRecord.punchOut !== '--') {
                // Between midnight and 6 AM, and already punched out yesterday
                // This is still considered yesterday's shift
                throw new Error('You have already completed your shift. New shift starts at 6:00 AM.');
            } else if (todayRecord.punchOut === '--') {
                // Already punched in today and haven't punched out
                throw new Error('You have already punched in today');
            }
            // If punched out and it's past 6 AM, allow new punch in (will create new record below)
        }

        // Create or update today's record
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const newRecord: LocalPunchRecord = {
            id: `${dateStr}_${Date.now()}`, // Unique ID with timestamp
            date: dateStr,
            dayName: dayNames[now.getDay()],
            day: now.getDate().toString().padStart(2, '0'),
            month: monthNames[now.getMonth()],
            punchIn: timeStr,
            punchOut: '--',
            workingHours: '--',
            status: 'present',
            latitude,
            longitude,
            isRemote,
        };

        if (todayRecord && todayRecord.punchOut === '--') {
            // Update existing incomplete record
            const index = records.findIndex(r => r.date === dateStr && r.punchOut === '--');
            if (index !== -1) {
                records[index] = newRecord;
            }
        } else {
            // Add new record (either no record exists or previous record is complete)
            records.unshift(newRecord); // Add to beginning
        }

        await AsyncStorage.setItem(storageKey, JSON.stringify(records));
        console.log('✅ Punch IN saved locally:', newRecord);
    } catch (error: any) {
        console.error('❌ Error saving punch IN locally:', error);
        throw error;
    }
};

/**
 * Convert 12-hour time string to Date object
 */
const parseTime = (dateStr: string, timeStr: string): Date => {
    // Parse time like "11:30 AM" or "02:45 PM"
    const [time, period] = timeStr.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
};

/**
 * Save punch OUT locally
 */
export const savePunchOutLocally = async (latitude: number, longitude: number, isRemote: boolean = false): Promise<void> => {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Get user-specific storage key
        const storageKey = await getUserStorageKey();

        // Get existing records
        const existingData = await AsyncStorage.getItem(storageKey);
        const records: LocalPunchRecord[] = existingData ? JSON.parse(existingData) : [];

        // Find today's record
        const todayRecord = records.find(r => r.date === dateStr);

        if (!todayRecord || todayRecord.punchIn === '--') {
            throw new Error('Please punch in first');
        }

        if (todayRecord.punchOut !== '--') {
            throw new Error('You have already punched out today');
        }

        // Calculate working hours using proper time parsing
        const punchInTime = parseTime(dateStr, todayRecord.punchIn);
        const punchOutTime = parseTime(dateStr, timeStr);
        const diffMs = punchOutTime.getTime() - punchInTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const workingHours = `${hours}h ${minutes}m`;

        // Update record
        const index = records.findIndex(r => r.date === dateStr);
        records[index] = {
            ...todayRecord,
            punchOut: timeStr,
            workingHours,
        };

        await AsyncStorage.setItem(storageKey, JSON.stringify(records));
        console.log('✅ Punch OUT saved locally:', records[index]);
    } catch (error: any) {
        console.error('❌ Error saving punch OUT locally:', error);
        throw error;
    }
};

/**
 * Get local attendance records
 */
export const getLocalAttendanceRecords = async (): Promise<LocalPunchRecord[]> => {
    try {
        const storageKey = await getUserStorageKey();
        const existingData = await AsyncStorage.getItem(storageKey);
        const records: LocalPunchRecord[] = existingData ? JSON.parse(existingData) : [];
        return records;
    } catch (error: any) {
        console.error('❌ Error getting local attendance records:', error);
        return [];
    }
};

/**
 * Get today's punch status
 */
export const getTodayPunchStatus = async (): Promise<{ isPunchedIn: boolean; isPunchedOut: boolean }> => {
    try {
        const records = await getLocalAttendanceRecords();
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = records.find(r => r.date === today);

        return {
            isPunchedIn: todayRecord ? todayRecord.punchIn !== '--' : false,
            isPunchedOut: todayRecord ? todayRecord.punchOut !== '--' : false,
        };
    } catch (error) {
        return { isPunchedIn: false, isPunchedOut: false };
    }
};

/**
 * Clear today's attendance (for testing purposes)
 * This clears both local records AND punch state
 */
export const clearTodayAttendance = async (force: boolean = false): Promise<void> => {
    try {
        console.log('🧹 Clearing today\'s attendance for testing...');

        // 1. Clear local attendance records
        const storageKey = await getUserStorageKey();
        const existingData = await AsyncStorage.getItem(storageKey);
        const records: LocalPunchRecord[] = existingData ? JSON.parse(existingData) : [];

        const today = new Date().toISOString().split('T')[0];

        // Remove today's records
        const filteredRecords = records.filter(r => r.date !== today);
        await AsyncStorage.setItem(storageKey, JSON.stringify(filteredRecords));
        console.log('✅ Local attendance records cleared for user');

        // 2. Clear punch state keys (used by CheckInCard)
        // Get user-specific keys
        const userEmail = await AsyncStorage.getItem(USER_EMAIL_KEY);
        const suffix = userEmail ? `_${userEmail}` : '';

        const keysToRemove = [
            'lastAttendanceDate',           // Legacy
            'lastAttendanceStatsDate',      // Legacy
            'punchStatus',                  // Legacy
            'isCheckedIn',                  // Legacy
            'hasCheckedOut',                // Legacy
            'hasEverCheckedIn',             // Legacy
            'checkInCardState',             // Legacy/Static

            // User specific keys
            `checkInCardState${suffix}`,
            `lastResetDate${suffix}`,
            `lastLunchAlert${suffix}`
        ];

        await AsyncStorage.multiRemove(keysToRemove);
        console.log('✅ Punch state keys cleared');

        // 3. If force mode, set a flag to ignore backend status
        if (force) {
            await AsyncStorage.setItem('forceResetMode', 'true');
            console.log('✅ Force reset mode enabled - will ignore backend status');
        }

        console.log('🎉 Today\'s attendance fully reset - you can now punch in again!');
    } catch (error: any) {
        console.error('❌ Error clearing attendance:', error);
        throw new Error('Failed to reset attendance: ' + error.message);
    }
};
