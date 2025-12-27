import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token'; // Match the key used in lib/api.ts

/**
 * Get access token from storage
 */
const getAccessToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
};

// ==================== EARLY/LATE PUNCH ====================

export interface EarlyLatePunchRequest {
    DateTime: string; // ISO format: "2025-01-10T10:30:00"
    CheckoutType: 'Early' | 'Late';
    Reason: string;
}

export interface EarlyLatePunchResponse {
    status: string;
    message: string;
}

/**
 * Record early checkout or late arrival
 */
export const recordEarlyLatePunch = async (
    dateTime: string,
    checkoutType: 'Early' | 'Late',
    reason: string
): Promise<EarlyLatePunchResponse> => {
    try {
        console.log('📝 Recording early/late punch...');

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const requestBody: EarlyLatePunchRequest = {
            DateTime: dateTime,
            CheckoutType: checkoutType,
            Reason: reason,
        };

        console.log('📤 Request:', requestBody);

        const response = await fetch(
            'https://karmyog.pythonanywhere.com/early-late-punch/',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
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
            const errorMessage = data.message || data.error || 'Failed to record early/late punch';
            throw new Error(errorMessage);
        }

        console.log('✅ Early/late punch recorded successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Early/late punch error:', error);
        throw new Error(error.message || 'Failed to record early/late punch');
    }
};

// ==================== LEAVE BALANCE ====================

export interface LeaveBalance {
    Leavename: string;
    count: number;
}

export interface LeaveBalanceResponse {
    status: string;
    statusCode: number;
    message: string;
    data: LeaveBalance[];
}

/**
 * Get employee leave balance
 */
export const getEmployeeLeaveBalance = async (): Promise<LeaveBalanceResponse> => {
    try {
        console.log('📊 Fetching leave balance...');

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            'https://karmyog.pythonanywhere.com/getemployeeleavebalance/',
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
            console.log('📊 Leave balance data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch leave balance';
            throw new Error(errorMessage);
        }

        console.log('✅ Leave balance fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Leave balance error:', error);
        throw new Error(error.message || 'Failed to fetch leave balance');
    }
};
