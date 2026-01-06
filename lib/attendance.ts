// lib/attendance.ts
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { getAccessToken } from './api';

// ==================== TYPES ====================

export type PunchType = 'IN' | 'OUT';

export interface DeviceInfo {
    device_id: string;
    device_name: string;
    os_version: string;
}

export interface PunchRequest {
    punch_type: PunchType;
    latitude: number;
    longitude: number;
    is_remote: boolean;
    device_info?: DeviceInfo;
}

export interface PunchResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        PunchID: number;
        PunchType: 1 | 2;
        PunchTypeName: 'IN' | 'OUT';
        PunchTime: string; // Formatted time: "2025-12-24 11:49:46 AM"
        PunchTimeISO: string; // ISO 8601: "2025-12-24T11:49:46Z"
        Location: {
            Latitude: string;
            Longitude: string;
            Address?: string;
            Accuracy?: number;
        };
        IsAway: boolean;
        IsLate: boolean;
        LateByMinutes: number;
        IsEarly: boolean;
        EarlyByMinutes: number;
        ExpectedTime: string;
        ShiftDetails?: {
            ShiftName: string;
            StartTime: string;
            EndTime: string;
        };
    } | null;
    timestamp: string;
    requestId?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get device information for security tracking
 */
export const getDeviceInfo = async (): Promise<string> => {
    try {
        const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
        const osVersion = Platform.OS === 'ios'
            ? `iOS ${Device.osVersion}`
            : `Android ${Device.osVersion}`;

        // Format: "Device Name | OS Version"
        // Example: "Samsung S24 | Android 14"
        return `${deviceName} | ${osVersion}`;
    } catch (error) {
        console.error('Error getting device info:', error);
        return `Unknown Device | ${Platform.OS} Unknown`;
    }
};

/**
 * Check if current time is after 9:30 AM (late check-in threshold)
 * @param date - Date object to check (defaults to current time)
 * @returns true if time is after 9:30 AM IST
 */
export const isLateCheckIn = (date: Date = new Date()): boolean => {
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + istOffset);

    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();

    // Check if time is after 9:30 AM (09:30)
    return hours > 9 || (hours === 9 && minutes > 30);
};

/**
 * Check if current time is before 6:30 PM (early check-out threshold)
 * @param date - Date object to check (defaults to current time)
 * @returns true if time is before 6:30 PM IST
 */
export const isEarlyCheckOut = (date: Date = new Date()): boolean => {
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + istOffset);

    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();

    // Check if time is before 6:30 PM (18:30)
    return hours < 18 || (hours === 18 && minutes < 30);
};

/**
 * Get minutes late for check-in (after 9:30 AM)
 * @param date - Date object to check (defaults to current time)
 * @returns number of minutes late, or 0 if not late
 */
export const getMinutesLate = (date: Date = new Date()): number => {
    if (!isLateCheckIn(date)) return 0;

    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);

    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();

    // Calculate minutes after 9:30 AM
    const currentMinutes = hours * 60 + minutes;
    const thresholdMinutes = 9 * 60 + 30; // 9:30 AM

    return currentMinutes - thresholdMinutes;
};

/**
 * Get minutes early for check-out (before 6:30 PM)
 * @param date - Date object to check (defaults to current time)
 * @returns number of minutes early, or 0 if not early
 */
export const getMinutesEarly = (date: Date = new Date()): number => {
    if (!isEarlyCheckOut(date)) return 0;

    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);

    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();

    // Calculate minutes before 6:30 PM
    const currentMinutes = hours * 60 + minutes;
    const thresholdMinutes = 18 * 60 + 30; // 6:30 PM

    return thresholdMinutes - currentMinutes;
};

/**
 * Request location permissions and get current location
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number; accuracy: number } | null> => {
    try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            console.error('Location permission denied');
            return null;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
};

// ==================== API FUNCTIONS ====================

/**
 * Record employee punch in or punch out
 */
export const recordPunch = async (
    punchType: PunchType,
    isRemote: boolean = false,
    includeDeviceInfo: boolean = true
): Promise<PunchResponse> => {
    try {
        console.log(`🕐 Recording ${punchType} punch...`);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login with your employee account (not admin) to use punch features.');
        }

        // Get current location
        const location = await getCurrentLocation();
        if (!location) {
            throw new Error('Unable to get location. Please enable location services.');
        }

        // Get device info
        const deviceInfo = includeDeviceInfo ? await getDeviceInfo() : undefined;

        // Prepare request body with correct format for API
        // PunchType: 1 = IN, 2 = OUT
        // Latitude/Longitude: as strings
        const requestBody: any = {
            PunchType: punchType === 'IN' ? 1 : 2,
            Latitude: location.latitude.toString(),
            Longitude: location.longitude.toString(),
            IsAway: isRemote,
        };

        // Add optional fields
        if (deviceInfo) {
            requestBody.DeviceInfo = deviceInfo;
        }
        if (location.accuracy) {
            requestBody.Accuracy = location.accuracy;
        }
        // IPAddress is optional for mobile apps
        requestBody.IPAddress = '';

        console.log('📤 Full request body:', JSON.stringify(requestBody, null, 2));
        console.log('📤 Punch request:', {
            PunchType: punchType === 'IN' ? 1 : 2,
            IsAway: isRemote,
            location: `${location.latitude}, ${location.longitude}`,
            accuracy: location.accuracy,
            deviceInfo,
        });



        // Make API request
        const bodyString = JSON.stringify(requestBody);
        console.log('📤 Stringified body being sent:', bodyString);

        const response = await fetch('https://karmyog.pythonanywhere.com/emp-punch/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: bodyString,
        });

        console.log('📡 Response status:', response.status);

        const data = await response.json();
        console.log('📊 Response data:', data);

        if (!response.ok) {
            // Extract error message based on status code
            let errorMessage = `Punch ${punchType} failed`;

            // Handle specific status codes
            if (response.status === 400) {
                // Already punched or invalid request
                if (data.errors && data.errors.length > 0) {
                    const error = data.errors[0];
                    if (error.code === 'ALREADY_PUNCHED') {
                        errorMessage = error.message || 'Already punched in for today';
                        if (data.data?.lastPunch) {
                            errorMessage += `\nLast punch: ${data.data.lastPunch.PunchTime}`;
                        }
                    } else {
                        errorMessage = error.message || data.message;
                    }
                } else {
                    errorMessage = data.message || 'Invalid punch request';
                }
            } else if (response.status === 403) {
                // Location not allowed
                if (data.errors && data.errors.length > 0) {
                    const error = data.errors[0];
                    if (error.code === 'OUT_OF_RANGE') {
                        errorMessage = error.message || 'You are outside the allowed punch location';
                        if (data.data?.distanceFromOffice && data.data?.allowedRadius) {
                            errorMessage += `\n\nDistance: ${data.data.distanceFromOffice}m (Allowed: ${data.data.allowedRadius}m)`;
                        }
                    } else {
                        errorMessage = error.message || data.message;
                    }
                } else {
                    errorMessage = data.message || 'Punch not allowed from this location';
                }
            } else if (response.status === 401) {
                // Unauthorized - token expired
                errorMessage = 'Your session has expired. Please login again.';
            } else {
                // Generic error handling
                if (typeof data.message === 'string') {
                    errorMessage = data.message;
                } else if (typeof data.error === 'string') {
                    errorMessage = data.error;
                } else if (data.errors && data.errors.length > 0) {
                    errorMessage = data.errors[0].message || data.message;
                }
            }

            console.log('Extracted error message:', errorMessage);
            throw new Error(errorMessage);
        }

        console.log(`✅ Punch ${punchType} recorded successfully`);
        return data;
    } catch (error: any) {
        console.error(`❌ Punch ${punchType} error:`, error);
        // Extract meaningful error message
        let errorMessage = `Failed to record punch ${punchType}`;
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

/**
 * Punch IN - Record employee check-in
 */
export const punchIn = async (isRemote: boolean = false): Promise<PunchResponse> => {
    return recordPunch('IN', isRemote);
};

/**
 * Punch OUT - Record employee check-out
 */
export const punchOut = async (isRemote: boolean = false): Promise<PunchResponse> => {
    return recordPunch('OUT', isRemote);
};

/**
 * Check if location permissions are granted
 */
export const hasLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error checking location permission:', error);
        return false;
    }
};

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

// ==================== GEOFENCING ====================

// Office location coordinates (replace with actual office coordinates)
const OFFICE_LOCATION = {
    latitude: 23.0352554,  // Replace with your office latitude
    longitude: 72.5616832, // Replace with your office longitude
};

// Allowed radius in meters (200-300m)
const ALLOWED_RADIUS_METERS = 250; // 250 meters

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Check if current location is within allowed radius of office
 */
export const isWithinOfficeRadius = async (): Promise<{
    isWithin: boolean;
    distance: number;
    message: string;
}> => {
    try {
        const currentLocation = await getCurrentLocation();

        if (!currentLocation) {
            return {
                isWithin: false,
                distance: 0,
                message: 'Unable to get current location',
            };
        }

        const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
        );

        const isWithin = distance <= ALLOWED_RADIUS_METERS;

        return {
            isWithin,
            distance: Math.round(distance),
            message: isWithin
                ? `You are ${Math.round(distance)}m from office`
                : `You are ${Math.round(distance)}m away. Must be within ${ALLOWED_RADIUS_METERS}m of office to punch in/out`,
        };
    } catch (error) {
        console.error('Error checking office radius:', error);
        return {
            isWithin: false,
            distance: 0,
            message: 'Error checking location',
        };
    }
};

/**
 * Punch IN with location validation
 */
export const punchInWithValidation = async (isRemote: boolean = false): Promise<PunchResponse> => {
    // Skip location check if remote work
    if (!isRemote) {
        const locationCheck = await isWithinOfficeRadius();
        if (!locationCheck.isWithin) {
            throw new Error(locationCheck.message);
        }
    }

    return punchIn(isRemote);
};

/**
 * Punch OUT with location validation
 */
export const punchOutWithValidation = async (isRemote: boolean = false): Promise<PunchResponse> => {
    // Skip location check if remote work
    if (!isRemote) {
        const locationCheck = await isWithinOfficeRadius();
        if (!locationCheck.isWithin) {
            throw new Error(locationCheck.message);
        }
    }

    return punchOut(isRemote);
};

// ==================== ATTENDANCE HISTORY ====================

export interface AttendanceRecord {
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
    isLocal?: boolean; // Flag to indicate if record is from local storage
    latitude?: string;
    longitude?: string;
    address?: string;
    lateByMinutes?: number;
    earlyByMinutes?: number;
}

export interface AttendanceHistoryResponse {
    success: boolean;
    status_code: number;
    message: string;
    data: {
        records: AttendanceRecord[];
        total_count: number;
        present_days: number;
        absent_days: number;
        total_hours: string;
    } | null;
    timestamp: string;
}

/**
 * Fetch attendance history for a date range
 */
export const getAttendanceHistory = async (
    startDate: string,
    endDate: string
): Promise<AttendanceHistoryResponse> => {
    try {
        console.log('📅 Fetching attendance history...');
        console.log('Date range:', startDate, 'to', endDate);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request to fetch punch records
        const response = await fetch(
            `https://karmyog.pythonanywhere.com/emp-punch/?start_date=${startDate}&end_date=${endDate}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
            console.log('📊 Response data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch attendance history';
            throw new Error(errorMessage);
        }

        // Handle empty or missing data gracefully
        if (!data.data) {
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

        console.log('✅ Attendance history fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Attendance history error:', error);
        // Extract meaningful error message
        let errorMessage = 'Failed to fetch attendance history';
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

// ==================== PUNCH STATUS ====================

export interface PunchStatusResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        employee: {
            EmployeeID: number;
            FullName: string;
            Email: string;
            Department: string;
            Designation: string;
            ProfileImage: string | null;
        };
        punch: {
            PunchType: 0 | 1 | 2;  // 0 = Not In/Out, 1 = IN, 2 = OUT
            PunchTypeName: string;
            PunchDateTime: string;
            PunchDateTimeISO: string;
            WorkingHours?: string;
            WorkingMinutes?: number;
            ExpectedCheckout?: string;
            OvertimeHours?: string;
            OvertimeMinutes?: number;
            BreaksTaken?: number;
            TotalBreakTime?: string;
        };
        today: {
            date: string;
            dateFormatted: string;
            dayName: string;
            isHoliday: boolean;
            isWeekend: boolean;
            holidayName: string | null;
            isOptionalHoliday: boolean;
            shift: {
                ShiftID: number;
                ShiftName: string;
                StartTime: string;
                EndTime: string;
                BreakDuration: string;
                TotalWorkingHours: string;
            };
        };
        attendance: {
            thisWeek: {
                present: number;
                absent: number;
                leaves: number;
                workFromHome: number;
            };
            thisMonth: {
                present: number;
                absent: number;
                leaves: number;
                holidays: number;
                weekends: number;
                workFromHome: number;
                totalWorkingDays: number;
                attendancePercentage: number;
            };
        };
        lateEarly: {
            lateCheckins: number;
            earlyCheckouts: number;
            allowedLateCheckins: number;
            remainingLateCheckins: number;
        };
        pendingRequests: {
            total: number;
            leaveRequests: number;
            lateCheckinRequests: number;
            earlyCheckoutRequests: number;
        };
        leaveBalance: {
            [key: string]: {
                name: string;
                total: number;
                used: number;
                pending: number;
                available: number;
            };
        };
        upcomingHolidays: Array<{
            date: string;
            name: string;
            isOptional: boolean;
        }>;
        announcements: Array<{
            id: number;
            title: string;
            message: string;
            date: string;
            priority: string;
        }>;
    };
    timestamp: string;
    requestId?: string;
}

/**
 * Get current punch status
 * 0 = Not In / Not Out
 * 1 = IN (currently punched in)
 * 2 = OUT (punched out for the day)
 */
export const getPunchStatus = async (): Promise<PunchStatusResponse> => {
    try {
        console.log('📊 Fetching punch status...');

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(
            'https://karmyog.pythonanywhere.com/dashboard-punch-status/',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
            console.log('📊 Punch status data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch punch status';
            throw new Error(errorMessage);
        }

        console.log('✅ Punch status fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Punch status error:', error);
        // Extract meaningful error message
        let errorMessage = 'Failed to fetch punch status';
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

// ==================== MISSING PUNCH-OUT ====================

export interface MissingPunchOutResponse {
    status: string;
    statusCode: number;
    message: string;
    data: Array<{
        missing_date: string;
    }>;
}

/**
 * Get missing punch-out dates
 * Returns dates where employee punched in but didn't punch out
 */
export const getMissingPunchOut = async (): Promise<MissingPunchOutResponse> => {
    try {
        console.log('📊 Fetching missing punch-out dates...');

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(
            'https://karmyog.pythonanywhere.com/getmissingpunchout/',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
            console.log('📊 Missing punch-out data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch missing punch-out dates';
            throw new Error(errorMessage);
        }

        console.log('✅ Missing punch-out dates fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Missing punch-out error:', error);
        // Extract meaningful error message
        let errorMessage = 'Failed to fetch missing punch-out dates';
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

