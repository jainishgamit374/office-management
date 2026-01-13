// lib/attendance.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const API_BASE_URL = 'https://karmyog.pythonanywhere.com';

// ============ TYPES ============
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
            // Add these for tracking both times
            PunchInTime?: string;
            PunchOutTime?: string;
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

export interface PunchResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        PunchID: number;
        PunchType: 1 | 2;
        PunchTypeName: 'IN' | 'OUT';
        PunchTime: string;
        PunchTimeISO: string;
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
        WorkingHours?: string;
        OvertimeHours?: string;
        ShiftDetails?: {
            ShiftName: string;
            StartTime: string;
            EndTime: string;
        };
    } | null;
    timestamp: string;
    requestId?: string;
}

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

export interface MissingPunchOutResponse {
    status: string;
    statusCode: number;
    message: string;
    data: Array<{
        missing_date: string;
    }>;
}

// ============ AUTH HELPER ============
const getAuthToken = async (): Promise<string> => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
        throw new Error('Authentication required. Please login again.');
    }
    return token;
};

// ============ API CALL HELPER ============
const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = await getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };

    try {
        console.log(`📡 API Call: ${options.method || 'GET'} ${endpoint}`);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const responseData = await response.json();

        console.log(`📦 Response:`, JSON.stringify(responseData, null, 2));

        if (!response.ok) {
            throw new Error(responseData.message || `HTTP Error: ${response.status}`);
        }

        return responseData;
    } catch (error) {
        console.error(`❌ API Error:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Network error. Please check your connection.');
    }
};

// ============ LOCATION FUNCTIONS ============
export const hasLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error checking location permission:', error);
        return false;
    }
};

export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

export const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    try {
        const hasPermission = await hasLocationPermission();
        if (!hasPermission) {
            const granted = await requestLocationPermission();
            if (!granted) {
                throw new Error('Location permission denied');
            }
        }

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

// ============ PUNCH STATUS API ============
export const getPunchStatus = async (): Promise<PunchStatusResponse> => {
    try {
        const response = await apiCall<PunchStatusResponse>('/dashboard-punch-status/', {
            method: 'GET',
        });

        console.log('✅ Punch status fetched:', response);
        return response;
    } catch (error) {
        console.error('❌ Failed to fetch punch status:', error);
        throw error;
    }
};

// ============ RECORD PUNCH API ============
export const recordPunch = async (
    type: 'IN' | 'OUT',
    isAway: boolean = false,
    includeLocation: boolean = true
): Promise<PunchResponse> => {
    try {
        let latitude = '0';
        let longitude = '0';

        if (includeLocation) {
            const location = await getCurrentLocation();
            if (location) {
                latitude = location.latitude.toString();
                longitude = location.longitude.toString();
            } else {
                throw new Error('Unable to get location. Please enable location services.');
            }
        }

        const punchType = type === 'IN' ? 1 : 2;

        const requestBody = {
            PunchType: punchType,
            Latitude: latitude,
            Longitude: longitude,
            IsAway: isAway,
        };

        console.log('📝 Recording punch:', requestBody);

        const response = await apiCall<PunchResponse>('/emp-punch/', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        console.log('✅ Punch recorded:', response);
        return response;
    } catch (error) {
        console.error('❌ Failed to record punch:', error);
        throw error;
    }
};

// ============ TIME VALIDATION FUNCTIONS ============
export const isLateCheckIn = (date: Date = new Date()): boolean => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours > 9 || (hours === 9 && minutes > 30);
};

export const isEarlyCheckOut = (date: Date = new Date()): boolean => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours < 18 || (hours === 18 && minutes < 30);
};

export const calculateLateMinutes = (date: Date = new Date()): number => {
    const targetTime = new Date(date);
    targetTime.setHours(9, 30, 0, 0);
    if (date <= targetTime) return 0;
    return Math.floor((date.getTime() - targetTime.getTime()) / (1000 * 60));
};

export const calculateEarlyMinutes = (date: Date = new Date()): number => {
    const targetTime = new Date(date);
    targetTime.setHours(18, 30, 0, 0);
    if (date >= targetTime) return 0;
    return Math.floor((targetTime.getTime() - date.getTime()) / (1000 * 60));
};

// ============ DATE PARSING HELPER ============
export const parseAPIDateTime = (dateString: string | null): Date | null => {
    if (!dateString) return null;

    try {
        // Try ISO format first (PunchDateTimeISO)
        if (dateString.includes('T') || dateString.includes('-') && dateString.length > 15) {
            const isoDate = new Date(dateString);
            if (!isNaN(isoDate.getTime())) {
                return isoDate;
            }
        }

        // Format: "DD-MM-YYYY HH:MM:SS AM/PM"
        const parts = dateString.split(' ');
        if (parts.length < 3) return null;

        const [datePart, timePart, period] = parts;
        const [day, month, year] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');

        let hour = parseInt(hours, 10);

        // Convert to 24-hour format
        if (period?.toUpperCase() === 'PM' && hour !== 12) {
            hour += 12;
        } else if (period?.toUpperCase() === 'AM' && hour === 12) {
            hour = 0;
        }

        const date = new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            hour,
            parseInt(minutes, 10),
            parseInt(seconds || '0', 10)
        );

        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        console.error('Error parsing date:', dateString, error);
        return null;
    }
};

export const formatTimeForDisplay = (dateString: string | null): string => {
    if (!dateString) return '--';

    const date = parseAPIDateTime(dateString);
    if (!date) return '--';

    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// ============ MISSING PUNCH-OUT API ============
export const getMissingPunchOut = async (): Promise<MissingPunchOutResponse> => {
    try {
        const response = await apiCall<MissingPunchOutResponse>('/getmissingpunchout/', {
            method: 'GET',
        });

        console.log('✅ Missing punch-out dates fetched:', response);
        return response;
    } catch (error) {
        console.error('❌ Failed to fetch missing punch-out dates:', error);
        throw error;
    }
};

// ============ UTILITY FUNCTIONS ============

/**
 * Get shift timing from response
 */
export const getShiftTiming = (response: PunchStatusResponse): { start: string; end: string } => {
    const shift = response.data?.today?.shift;
    return {
        start: shift?.StartTime || '09:30',
        end: shift?.EndTime || '18:30',
    };
};

/**
 * Check if today is a working day
 */
export const isWorkingDay = (response: PunchStatusResponse): boolean => {
    const today = response.data?.today;
    return !today?.isHoliday && !today?.isWeekend;
};

/**
 * Get remaining late check-ins allowed
 */
export const getRemainingLateCheckins = (response: PunchStatusResponse): number => {
    return response.data?.lateEarly?.remainingLateCheckins || 0;
};

/**
 * Format working hours from minutes
 */
export const formatMinutesToHours = (minutes: number): string => {
    if (!minutes || minutes <= 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};