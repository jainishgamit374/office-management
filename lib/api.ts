// lib/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// Storage Keys
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';

export interface ApiResponse<T = any> {
    status: 'Success' | 'Error';
    statusCode: number;
    message: string;
    data?: T;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        perPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    errors?: Array<{
        field: string;
        code: string;
        message: string;
    }>;
    requestId?: string;
    timestamp: string;
    path?: string;
}

// Generate unique request ID for tracing
export const generateRequestId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get stored access token
export const getAccessToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

// Get stored refresh token
export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

// Store tokens
export const storeTokens = async (accessToken: string, refreshToken?: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    } catch (error) {
        console.error('Error storing tokens:', error);
    }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

// Refresh access token
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return null;
        }

        const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            await clearAuthData();
            return null;
        }

        const data = await response.json();

        if (data.access) {
            await AsyncStorage.setItem(TOKEN_KEY, data.access);
            return data.access;
        }

        return null;
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
};

// Main API request function with JWT handling
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
): Promise<T> => {
    const url = `${BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Request-ID': generateRequestId(),
    };

    // Add Authorization header if required
    if (requiresAuth) {
        let accessToken = await getAccessToken();

        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
        if (options.body) {
            console.log('📦 Request Body:', options.body);
        }

        let response = await fetch(url, config);

        // Handle 401 Unauthorized - Try to refresh token
        if (response.status === 401 && requiresAuth) {
            console.log('🔄 Token expired, attempting refresh...');

            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
                // Retry request with new token
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${newAccessToken}`,
                };

                response = await fetch(url, config);
            } else {
                throw new Error('Session expired. Please login again.');
            }
        }

        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('❌ Failed to parse JSON response');
            console.error('JSON Parse Error:', jsonError);
            throw new Error('Server returned invalid response. Please check the API endpoint.');
        }

        console.log('📥 Response Status:', response.status);
        console.log('📥 Response Data:', data);

        if (!response.ok) {
            // Handle different error formats from Django
            let errorMessage = '';

            // Log the full error structure for debugging
            console.log('🔍 Full Error Response:', JSON.stringify(data, null, 2));

            // Check for errors array first (validation errors)
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                errorMessage = data.errors.map((err: any) => err.message).join(', ');
                console.log('✅ Extracted from errors array:', errorMessage);
            }
            // Check if errors is an object with non_field_errors
            else if (data.errors && typeof data.errors === 'object') {
                if (data.errors.non_field_errors && Array.isArray(data.errors.non_field_errors)) {
                    errorMessage = data.errors.non_field_errors.join(', ');
                    console.log('✅ Extracted from errors.non_field_errors:', errorMessage);
                } else {
                    // Extract first error from any field in the errors object
                    const firstErrorField = Object.keys(data.errors)[0];
                    if (firstErrorField && Array.isArray(data.errors[firstErrorField])) {
                        errorMessage = data.errors[firstErrorField].join(', ');
                        console.log(`✅ Extracted from errors.${firstErrorField}:`, errorMessage);
                    }
                }
            }

            // Fallback to other common error fields
            if (!errorMessage) {
                errorMessage =
                    data.detail ||
                    data.message ||
                    data.error ||
                    (data.email && data.email[0]) ||
                    (data.password && data.password[0]) ||
                    (data.non_field_errors && data.non_field_errors[0]) ||
                    `Request failed with status ${response.status}`;
                console.log('✅ Extracted from other fields:', errorMessage);
            }

            throw new Error(errorMessage);
        }

        return data;
    } catch (error: any) {
        console.error('❌ API Error:', error);

        if (error.name === 'TypeError' && error.message === 'Network request failed') {
            throw new Error('Network error. Please check your internet connection.');
        }

        throw error;
    }
};

// API request without auth (for public endpoints)
export const publicApiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    return apiRequest<T>(endpoint, options, false);
};

// API request with auth (for protected endpoints)
export const authApiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    return apiRequest<T>(endpoint, options, true);
};

// ==================== WORK FROM HOME APPLICATIONS ====================

export interface WFHApplication {
    WorkFromHomeReqMasterID: number;
    EmployeeID: number;
    ApprovalStatusID: number;
    ApprovalStatus: string;
    Reason: string;
    DateTime: string;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
    workflow_list: Array<{
        Approve_name: string;
        Priority: number;
        status: string;
    }>;
}

export interface WFHApplicationsResponse {
    status: string;
    statusCode: number;
    data: WFHApplication[];
}

/**
 * Get work from home applications list
 */
export const getWFHApplications = async (): Promise<WFHApplicationsResponse> => {
    try {
        console.log('📊 Fetching WFH applications...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/workfromhomeapplicationslist/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('📊 WFH applications data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch WFH applications';
            throw new Error(errorMessage);
        }

        console.log('✅ WFH applications fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ WFH applications error:', error);
        let errorMessage = 'Failed to fetch WFH applications';
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

// ==================== MISS PUNCH REQUESTS ====================

export interface MissPunchRequest {
    MissPunchReqMasterID: number;
    ApprovalStatusMasterID: number;
    datetime: string;
    reason: string;
    approval_status: string;
    PunchType: string; // "1" = In, "2" = Out
    workflow_list: Array<{
        Approve_name: string;
        Priority: number;
        status: string;
    }>;
}

export interface MissPunchDetailsResponse {
    status: string;
    data: MissPunchRequest[];
}

/**
 * Get miss punch request details
 */
export const getMissPunchDetails = async (): Promise<MissPunchDetailsResponse> => {
    try {
        console.log('📊 Fetching miss punch details...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/getmissingpunchdetails/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('📊 Miss punch details data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch miss punch details';
            throw new Error(errorMessage);
        }

        console.log('✅ Miss punch details fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Miss punch details error:', error);
        let errorMessage = 'Failed to fetch miss punch details';
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

// ==================== EMPLOYEE OF THE MONTH ====================

export interface EmployeeOfTheMonth {
    EmployeeOfTheMonthID: number;
    EmployeeID: number;
    Name: string;
    MonthOfYear: string;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface EmployeeOfTheMonthResponse {
    status: string;
    statusCode: number;
    data: EmployeeOfTheMonth[];
}

/**
 * Get employee of the month
 */
export const getEmployeeOfTheMonth = async (): Promise<EmployeeOfTheMonthResponse> => {
    try {
        console.log('📊 Fetching employee of the month...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/getemployeeofthemonth/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('📊 Employee of the month data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch employee of the month';
            throw new Error(errorMessage);
        }

        console.log('✅ Employee of the month fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Employee of the month error:', error);
        let errorMessage = 'Failed to fetch employee of the month';
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

// ==================== BIRTHDAYS ====================

export interface BirthdayPerson {
    name: string;
    dob: string;
}

export interface BirthdaysData {
    todays_birthdays: BirthdayPerson[];
    current_month_birthdays: BirthdayPerson[];
}

export interface BirthdaysResponse {
    status: string;
    data: BirthdaysData;
}

/**
 * Get birthdays (today and current month)
 */
export const getBirthdays = async (): Promise<BirthdaysResponse> => {
    try {
        console.log('📊 Fetching birthdays...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/getdob/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('📊 Birthdays data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch birthdays';
            throw new Error(errorMessage);
        }

        console.log('✅ Birthdays fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Birthdays error:', error);
        let errorMessage = 'Failed to fetch birthdays';
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

// ==================== LATE/EARLY PUNCH COUNT ====================

export interface LateEarlyEmployee {
    emp_id: number;
    fname: string;
    lname: string;
    late: number;
    early: number;
}

export interface LateEarlyCountResponse {
    status: string;
    data: LateEarlyEmployee[];
}

/**
 * Get late and early punch counts for a date range
 */
export const getLateEarlyCount = async (fromDate: string, toDate: string): Promise<LateEarlyCountResponse> => {
    try {
        console.log('📊 Fetching late/early counts...', { fromDate, toDate });

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/lateearlyscount/?from_date=${fromDate}&to_date=${toDate}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        let data;
        try {
            data = await response.json();
            console.log('📊 Late/early counts data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch late/early counts';
            throw new Error(errorMessage);
        }

        console.log('✅ Late/early counts fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Late/early counts error:', error);
        let errorMessage = 'Failed to fetch late/early counts';
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