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
    success: boolean;
    status_code: number;
    message: string;
    data: {
        punch_id: number;
        punch_type: PunchType;
        punch_time: string;
        location: {
            latitude: number;
            longitude: number;
        };
        is_remote: boolean;
    } | null;
    timestamp: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get device information for security tracking
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
    try {
        const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
        const osVersion = Platform.OS === 'ios'
            ? `iOS ${Device.osVersion}`
            : `Android ${Device.osVersion}`;

        // Generate a unique device ID (you might want to use a more persistent method)
        const deviceId = Device.osBuildId || `${Platform.OS}-${Date.now()}`;

        return {
            device_id: deviceId,
            device_name: deviceName,
            os_version: osVersion,
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            device_id: `${Platform.OS}-unknown`,
            device_name: 'Unknown Device',
            os_version: `${Platform.OS} Unknown`,
        };
    }
};

/**
 * Request location permissions and get current location
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
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

        // Get device info if requested
        let deviceInfo: DeviceInfo | undefined;
        if (includeDeviceInfo) {
            deviceInfo = await getDeviceInfo();
        }

        // Prepare request body with correct field names for API
        const requestBody = {
            punch_type: punchType,  // API expects snake_case
            latitude: location.latitude,
            longitude: location.longitude,
            is_remote: isRemote,
            ...(deviceInfo && { device_info: deviceInfo }),
        };

        console.log('📤 Punch request:', {
            punch_type: punchType,
            is_remote: isRemote,
            location: `${location.latitude}, ${location.longitude}`,
        });


        // Make API request
        const response = await fetch('http://karmyog.pythonanywhere.com/emp-punch/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        console.log('📡 Response status:', response.status);

        const data = await response.json();
        console.log('📊 Response data:', data);

        if (!response.ok) {
            // Extract error message, handling various response formats
            let errorMessage = `Punch ${punchType} failed`;

            if (typeof data.message === 'string') {
                errorMessage = data.message;
            } else if (typeof data.error === 'string') {
                errorMessage = data.error;
            } else if (data.message && typeof data.message === 'object') {
                errorMessage = JSON.stringify(data.message);
            } else if (data.error && typeof data.error === 'object') {
                errorMessage = JSON.stringify(data.error);
            } else if (typeof data === 'string') {
                errorMessage = data;
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

        // Make API request
        const response = await fetch(
            `http://karmyog.pythonanywhere.com/attendance-history/?start_date=${startDate}&end_date=${endDate}`,
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
    data: {
        PunchType: 0 | 1 | 2;  // 0 = Not In/Out, 1 = IN, 2 = OUT
        PunchDateTime: string;
    };
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
