import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface EarlyCheckoutRequest {
    TranID: number;
    ProgramID: number;
    UpdatedDate: string;
    ApprovalStatus: number;
    EmployeeName: string;
    DateTime: string;
    Reason: string | null;
    // Keep old field for backward compatibility
    EarlyCheckoutReqMasterID?: number;
}

export interface EarlyCheckoutListResponse {
    status: string;
    approval_requests: EarlyCheckoutRequest[];
    // Optional fields for backward compatibility
    statusCode?: number;
    total_pending_approvals?: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Get early checkout approval requests list
 * GET /earlycheckoutapprovallist/
 */
export const getEarlyCheckoutList = async (): Promise<EarlyCheckoutListResponse> => {
    try {
        console.log('📊 Fetching early checkout approval list...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/earlycheckoutapprovallist/`,
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
            console.log('📊 Early checkout list data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch early checkout list';
            throw new Error(errorMessage);
        }

        console.log('✅ Early checkout list fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Early checkout list error:', error);
        let errorMessage = 'Failed to fetch early checkout list';
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
