import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface MissCheckoutRequest {
    // Define fields based on usage. 
    // Assuming standard fields similar to other requests.
    id: number;
    employee_name: string;
    date: string;
    reason: string;
    status: string;
    punch_in_time?: string;
}

export interface MissCheckoutResponse {
    status: string;
    data: MissCheckoutRequest[];
    message?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get miss checkout requests
 * GET /getmisscheckout/
 */
export const getMissCheckout = async (): Promise<MissCheckoutResponse> => {
    try {
        console.log('📊 Fetching miss checkout requests...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/getmisscheckout/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        let data;
        try {
            data = await response.json();
            console.log('📊 Miss checkout data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch miss checkout requests';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error: any) {
        console.error('❌ Miss checkout error:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
};
