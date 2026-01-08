import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface MissPunchRequest {
    TranID: number;
    ProgramID: number;
    UpdatedDate: string;
    ApprovalStatus: number;
    EmployeeName: string;
    DateTime: string;
    Reason: string | null;
}

export interface MissPunchListResponse {
    status: string;
    approval_requests: MissPunchRequest[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get missed punch approval requests list
 * GET /misspunchapprovallist/
 */
export const getMissPunchList = async (): Promise<MissPunchListResponse> => {
    try {
        console.log('📊 Fetching missed punch approval list...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/misspunchapprovallist/`,
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
            console.log('📊 Missed punch list data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch missed punch list';
            throw new Error(errorMessage);
        }

        console.log('✅ Missed punch list fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Missed punch list error:', error);
        let errorMessage = 'Failed to fetch missed punch list';
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
