import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface IsAwayApprovalRequest {
    EmpPunchMasterID: number;
    Type: string; // "IN" or "OUT"
    Distance: number;
    FormatedWorkHours: string;
    EmployeeName: string;
    DateTime: string;
    Reason: string | null;
}

export interface IsAwayApprovalsResponse {
    status: string;
    statusCode: number;
    total_pending_approvals: number;
    approval_requests: IsAwayApprovalRequest[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get is away approval requests
 * GET /isawayapprovals/
 */
export const getIsAwayApprovals = async (): Promise<IsAwayApprovalsResponse> => {
    try {
        console.log('📊 Fetching is away approvals...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/isawayapprovals/`,
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
            console.log('📊 Is away approvals data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch is away approvals';
            throw new Error(errorMessage);
        }

        console.log('✅ Is away approvals fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Is away approvals error:', error);
        let errorMessage = 'Failed to fetch is away approvals';
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

