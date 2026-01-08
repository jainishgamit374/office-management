// lib/employeeAttendance.ts
import { getAccessToken } from './api';

// ==================== TYPES ====================

export interface EmployeeAttendanceRecord {
    emp_id: number;
    fname: string;
    lname: string;
    attdate: string;
    intime: string | null;
    outtime: string | null;
    wrkhours: string;
    latein: string;
    earlyout: string;
    halfday: string;
}

export interface EmployeeAttendanceResponse {
    status: string;
    data: EmployeeAttendanceRecord[];
}

export interface TransformedAttendanceRecord {
    id: string;
    date: string;
    day: string;
    month: string;
    dayName: string;
    punchIn: string;
    punchOut: string;
    workingHours: string;
    status: 'present' | 'absent' | 'weekend' | 'holiday';
    isLateCheckIn?: boolean;
    isEarlyCheckOut?: boolean;
    employeeName: string;
}

export interface AttendanceHistoryData {
    records: TransformedAttendanceRecord[];
    total_count: number;
    present_days: number;
    absent_days: number;
    total_hours: string;
}

export interface AttendanceHistoryResponse {
    success: boolean;
    status_code: number;
    message: string;
    data: AttendanceHistoryData | null;
    timestamp: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch employee attendance history from /employeeattendance/ endpoint
 * This endpoint returns detailed attendance records with punch in/out times
 */
export const getEmployeeAttendance = async (
    fromDate: string,
    toDate: string
): Promise<AttendanceHistoryResponse> => {
    try {
        console.log('📅 Fetching employee attendance from /employeeattendance/...');
        console.log('Date range:', fromDate, 'to', toDate);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(
            `https://karmyog.pythonanywhere.com/employeeattendance/?from_date=${fromDate}&to_date=${toDate}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        // Parse JSON response
        let data: EmployeeAttendanceResponse;
        try {
            data = await response.json();
            console.log('📊 Raw API Response:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = (data as any).message || (data as any).error || 'Failed to fetch attendance';
            throw new Error(errorMessage);
        }

        // Transform API response
        const apiRecords = data.data || [];

        if (apiRecords.length === 0) {
            return {
                success: true,
                status_code: 200,
                message: 'No attendance records found',
                data: {
                    records: [],
                    total_count: 0,
                    present_days: 0,
                    absent_days: 0,
                    total_hours: '0h 0m',
                },
                timestamp: new Date().toISOString(),
            };
        }

        // Transform each record
        const transformedRecords: TransformedAttendanceRecord[] = apiRecords.map((record) => {
            // Parse date (format: "2026-01-01")
            const dateObj = new Date(record.attdate);
            const day = dateObj.getDate().toString();
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            // Determine status
            let status: 'present' | 'absent' | 'weekend' | 'holiday' = 'present';

            const dayOfWeek = dateObj.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                status = 'weekend';
            } else if (!record.intime || record.intime === null) {
                status = 'absent';
            }

            // Format times (API returns ISO format like "2026-01-01T04:36:27Z")
            const punchIn = record.intime || '--';
            const punchOut = record.outtime || '--';
            const workingHours = record.wrkhours || '--';

            // Check for late/early status
            const isLateCheckIn = record.latein && record.latein.toLowerCase() !== 'on time';
            const isEarlyCheckOut = record.earlyout && record.earlyout.toLowerCase() === 'early';

            // Full employee name
            const employeeName = `${record.fname} ${record.lname}`.trim();

            return {
                id: `${record.emp_id}-${record.attdate}`,
                date: record.attdate,
                day,
                month,
                dayName,
                punchIn,
                punchOut,
                workingHours,
                status,
                isLateCheckIn,
                isEarlyCheckOut,
                employeeName,
            };
        });

        // Calculate statistics
        const presentDays = transformedRecords.filter(r => r.status === 'present').length;
        const absentDays = transformedRecords.filter(r => r.status === 'absent').length;

        // Calculate total working hours
        let totalMinutes = 0;
        transformedRecords.forEach(record => {
            if (record.workingHours && record.workingHours !== '--') {
                // Parse "08:12:09" format
                const parts = record.workingHours.split(':');
                if (parts.length === 3) {
                    const hours = parseInt(parts[0]) || 0;
                    const minutes = parseInt(parts[1]) || 0;
                    totalMinutes += (hours * 60) + minutes;
                }
            }
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        const totalHoursStr = `${totalHours}h ${remainingMinutes}m`;

        const result: AttendanceHistoryResponse = {
            success: true,
            status_code: 200,
            message: 'Attendance history fetched successfully',
            data: {
                records: transformedRecords,
                total_count: transformedRecords.length,
                present_days: presentDays,
                absent_days: absentDays,
                total_hours: totalHoursStr,
            },
            timestamp: new Date().toISOString(),
        };

        console.log('✅ Employee attendance transformed:', result.data.total_count, 'records');
        return result;
    } catch (error: any) {
        console.error('❌ Employee attendance error:', error);
        let errorMessage = 'Failed to fetch employee attendance';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.message) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};
