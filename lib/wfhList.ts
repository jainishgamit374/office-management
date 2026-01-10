import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface WFHEmployee {
    id: string;
    employeeName: string;
    employeeId: string;
    department: string;
    date: string;
    isHalfDay: boolean;
    reason: string;
    approvalStatus: 'Approved' | 'Pending' | 'Rejected';
    approvedBy?: string;
}

export interface WFHListResponse {
    status: string;
    statusCode?: number;
    message?: string;
    data: WFHEmployee[];
    timestamp?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get WFH employee list
 * GET /wfhlist/
 */
export const getWFHList = async (): Promise<WFHListResponse> => {
    try {
        console.log('📋 Fetching WFH list...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/wfhlist/`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('📡 Response status:', response.status);

        let responseData;
        try {
            responseData = await response.json();
            console.log('📊 WFH list response:', responseData);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            }
            const errorMessage = responseData.message || responseData.error || 'Failed to fetch WFH list';
            throw new Error(errorMessage);
        }

        console.log('✅ WFH list fetched successfully');
        return responseData;
    } catch (error: any) {
        console.error('❌ Get WFH list error:', error);
        let errorMessage = 'Failed to fetch WFH list';
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

export default {
    getWFHList,
};
