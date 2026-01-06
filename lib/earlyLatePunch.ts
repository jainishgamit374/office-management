import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// Helper to get auth token
const getAuthToken = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem('access_token');
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// Helper for API requests
const apiRequest = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
) => {
    const token = await getAuthToken();

    if (!token) {
        throw new Error('Authentication required. Please login again.');
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const config: RequestInit = {
        method,
        headers,
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Request failed');
    }

    return data;
};

// ============================================
// EARLY/LATE PUNCH APIs
// ============================================

/**
 * Get Early/Late Punch List
 * GET /early-late-punch/
 */
export const getEarlyLatePunchList = async (params?: {
    page?: number;
    limit?: number;
    checkoutType?: 'Early' | 'Late' | 'All';
    status?: 'Pending' | 'Approved' | 'Rejected' | 'All';
    startDate?: string;
    endDate?: string;
}) => {
    let endpoint = '/early-late-punch/';

    if (params) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.checkoutType) queryParams.append('checkoutType', params.checkoutType);
        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        const queryString = queryParams.toString();
        if (queryString) {
            endpoint += `?${queryString}`;
        }
    }

    return apiRequest(endpoint, 'GET');
};

/**
 * Create Early/Late Punch Request
 * POST /early-late-punch/
 */
export const createEarlyLatePunch = async (
    dateTime: string,
    checkoutType: 'Early' | 'Late',
    reason: string
) => {
    const body = {
        DateTime: dateTime,
        CheckoutType: checkoutType,
        Reason: reason,
    };

    return apiRequest('/early-late-punch/', 'POST', body);
};

// ============================================
// LATE CHECK-IN APIs
// ============================================

/**
 * Get Late Check-in Count
 * GET /late-checkin-count/
 */
export const getLateCheckinCount = async (month?: string, year?: string) => {
    let endpoint = '/late-checkin-count/';

    const queryParams = new URLSearchParams();
    if (month) queryParams.append('month', month);
    if (year) queryParams.append('year', year);

    const queryString = queryParams.toString();
    if (queryString) {
        endpoint += `?${queryString}`;
    }

    return apiRequest(endpoint, 'GET');
};

/**
 * Submit Late Check-in Request
 * POST /late-checkin-request/
 */
export const submitLateCheckinRequest = async (
    dateTime: string,
    reason: string
) => {
    const body = {
        DateTime: dateTime,
        Reason: reason,
    };

    return apiRequest('/late-checkin-request/', 'POST', body);
};

// ============================================
// EARLY CHECKOUT APIs
// ============================================

/**
 * Submit Early Checkout Request
 * POST /createearlycheckout/
 */
export const submitEarlyCheckoutRequest = async (
    dateTime: string,
    reason: string
) => {
    const body = {
        DateTime: dateTime,
        Reason: reason,
    };

    return apiRequest('/createearlycheckout/', 'POST', body);
};

/**
 * Get Early Checkout Details
 * GET /earlycheckoutdetails/
 */
export const getEarlyCheckoutDetails = async (params?: {
    page?: number;
    limit?: number;
    status?: 'Pending' | 'Approved' | 'Rejected' | 'All';
}) => {
    let endpoint = '/earlycheckoutdetails/';

    if (params) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);

        const queryString = queryParams.toString();
        if (queryString) {
            endpoint += `?${queryString}`;
        }
    }

    return apiRequest(endpoint, 'GET');
};

// ============================================
// TYPES
// ============================================

export interface EarlyLatePunchItem {
    EarlyLatePunchMasterID: number;
    EmployeeID: number;
    DateTime: string;
    CheckoutType: 'Early' | 'Late';
    Reason: string;
    CreatedBy: number;
    UpdatedBy: number;
    CreatedDate: string;
    UpdatedDate: string;
    IsActive: boolean;
}

export interface EarlyLatePunchResponse {
    status: string;
    statusCode: number;
    data: EarlyLatePunchItem[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        perPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

export interface LateCheckinCountResponse {
    status: string;
    statusCode: number;
    data: {
        late_checkin_count: number;
        month?: string;
        year?: number;
        allowed_late_checkins?: number;
        remaining?: number;
    };
}

export interface SubmitRequestResponse {
    status: string;
    statusCode: number;
    message: string;
    request_id?: number;
}