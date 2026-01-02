import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTENDANCE_STORAGE_KEY = '@attendance_records';

export interface LocalAttendanceRecord {
    id: string;
    date: string; // YYYY-MM-DD
    punchInTime?: string; // ISO timestamp
    punchOutTime?: string; // ISO timestamp
    punchInLocation?: {
        latitude: number;
        longitude: number;
    };
    punchOutLocation?: {
        latitude: number;
        longitude: number;
    };
    workingHours?: string;
    isLateCheckIn?: boolean;
    isEarlyCheckOut?: boolean;
    status: 'present' | 'absent' | 'half-day';
}

/**
 * Check if a punch-in time is late (after 9:30 AM IST)
 */
export const isLateCheckIn = (punchInTime: string): boolean => {
    try {
        const punchDate = new Date(punchInTime);
        const hours = punchDate.getHours();
        const minutes = punchDate.getMinutes();

        // Late if after 9:30 AM (9 hours 30 minutes)
        return hours > 9 || (hours === 9 && minutes > 30);
    } catch (error) {
        console.error('Error checking late check-in:', error);
        return false;
    }
};

/**
 * Check if a punch-out time is early (before 6:30 PM IST)
 */
export const isEarlyCheckOut = (punchOutTime: string): boolean => {
    try {
        const punchDate = new Date(punchOutTime);
        const hours = punchDate.getHours();
        const minutes = punchDate.getMinutes();

        // Early if before 6:30 PM (18 hours 30 minutes)
        return hours < 18 || (hours === 18 && minutes < 30);
    } catch (error) {
        console.error('Error checking early check-out:', error);
        return false;
    }
};

/**
 * Calculate working hours between punch-in and punch-out
 */
export const calculateWorkingHours = (punchInTime: string, punchOutTime: string): string => {
    try {
        const punchIn = new Date(punchInTime);
        const punchOut = new Date(punchOutTime);

        const diffMs = punchOut.getTime() - punchIn.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHours}h ${diffMinutes}m`;
    } catch (error) {
        console.error('Error calculating working hours:', error);
        return '0h 0m';
    }
};

/**
 * Save an attendance record to local storage
 */
export const saveAttendanceRecord = async (
    date: string,
    punchType: 'IN' | 'OUT',
    timestamp: string,
    location?: { latitude: number; longitude: number }
): Promise<void> => {
    try {
        // Get existing records
        const records = await getLocalAttendanceRecords();

        // Find or create record for this date
        let recordIndex = records.findIndex(r => r.date === date);
        let record: LocalAttendanceRecord;

        if (recordIndex === -1) {
            // Create new record
            record = {
                id: `local_${date}_${Date.now()}`,
                date,
                status: 'present',
            };
            records.push(record);
            recordIndex = records.length - 1;
        } else {
            record = records[recordIndex];
        }

        // Update record based on punch type
        if (punchType === 'IN') {
            record.punchInTime = timestamp;
            record.punchInLocation = location;
            record.isLateCheckIn = isLateCheckIn(timestamp);
        } else {
            record.punchOutTime = timestamp;
            record.punchOutLocation = location;
            if (record.punchInTime) {
                record.workingHours = calculateWorkingHours(record.punchInTime, timestamp);
                record.isEarlyCheckOut = isEarlyCheckOut(timestamp);
            }
        }

        // Update the record in the array
        records[recordIndex] = record;

        // Save back to storage
        await AsyncStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
        console.log('✅ Attendance record saved locally:', record);
    } catch (error) {
        console.error('❌ Error saving attendance record:', error);
        throw error;
    }
};

/**
 * Get all local attendance records
 */
export const getLocalAttendanceRecords = async (): Promise<LocalAttendanceRecord[]> => {
    try {
        const data = await AsyncStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error loading local attendance records:', error);
        return [];
    }
};

/**
 * Get local records for a specific date range
 */
export const getLocalRecordsByDateRange = async (
    startDate: string,
    endDate: string
): Promise<LocalAttendanceRecord[]> => {
    try {
        const allRecords = await getLocalAttendanceRecords();
        const start = new Date(startDate);
        const end = new Date(endDate);

        return allRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });
    } catch (error) {
        console.error('❌ Error filtering local records:', error);
        return [];
    }
};

/**
 * Merge local records with API records (API takes precedence)
 */
export const mergeAttendanceRecords = (
    localRecords: LocalAttendanceRecord[],
    apiRecords: any[]
): any[] => {
    try {
        // Create a map of API records by date
        const apiRecordMap = new Map();
        apiRecords.forEach(record => {
            apiRecordMap.set(record.date, record);
        });

        // Add local records that don't exist in API
        const mergedRecords = [...apiRecords];

        localRecords.forEach(localRecord => {
            if (!apiRecordMap.has(localRecord.date)) {
                // Convert local record to API format
                const dateObj = new Date(localRecord.date);
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                mergedRecords.push({
                    id: localRecord.id,
                    date: localRecord.date,
                    day: dateObj.getDate().toString().padStart(2, '0'),
                    month: months[dateObj.getMonth()],
                    dayName: days[dateObj.getDay()],
                    punchIn: localRecord.punchInTime ? formatTime(localRecord.punchInTime) : '--',
                    punchOut: localRecord.punchOutTime ? formatTime(localRecord.punchOutTime) : '--',
                    workingHours: localRecord.workingHours || '--',
                    status: localRecord.status,
                    isLateCheckIn: localRecord.isLateCheckIn,
                    isEarlyCheckOut: localRecord.isEarlyCheckOut,
                    isLocal: true, // Flag to indicate this is from local storage
                });
            }
        });

        // Sort by date descending
        return mergedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error('❌ Error merging records:', error);
        return apiRecords;
    }
};

/**
 * Format ISO timestamp to readable time (HH:MM AM/PM)
 */
const formatTime = (isoTimestamp: string): string => {
    try {
        const date = new Date(isoTimestamp);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return '--';
    }
};

/**
 * Clear all local attendance records (for testing/debugging)
 */
export const clearLocalAttendanceRecords = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ATTENDANCE_STORAGE_KEY);
        console.log('✅ Local attendance records cleared');
    } catch (error) {
        console.error('❌ Error clearing local records:', error);
        throw error;
    }
};
