import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface TodayLeaveEmployee {
    EmployeeName: string;
    LeaveType: string;
    ApprovalStatus: number;
    ApprovalStatusName: string;
}

export interface TodayLeavesResponse {
    status: string;
    today_leaves: TodayLeaveEmployee[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get employees on leave today
 * GET /todayleaves/
 */
export const getTodayLeaves = async (): Promise<TodayLeavesResponse> => {
    try {
        console.log('📊 Fetching today\'s leaves...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/todayleaves/`,
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
            console.log('📊 Today\'s leaves data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch today\'s leaves';
            throw new Error(errorMessage);
        }

        console.log('✅ Today\'s leaves fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Today\'s leaves error:', error);
        let errorMessage = 'Failed to fetch today\'s leaves';
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
