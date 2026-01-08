import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface LeaveApprovalRequest {
    Leave_ID: number;
    employee_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    profile_image: string | null;
    applied_on: string;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
}

export interface LeaveApprovalsResponse {
    status: string;
    total_pending_approvals: number;
    pending_approvals: LeaveApprovalRequest[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get leave approval requests
 * GET /leaveapprovals/
 */
export const getLeaveApprovals = async (): Promise<LeaveApprovalsResponse> => {
    try {
        console.log('📊 Fetching leave approvals...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/leaveapprovals/`,
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
            console.log('📊 Leave approvals data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch leave approvals';
            throw new Error(errorMessage);
        }

        console.log('✅ Leave approvals fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Leave approvals error:', error);
        let errorMessage = 'Failed to fetch leave approvals';
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

