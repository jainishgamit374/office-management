import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface WorkflowApprovalRequest {
    // Define fields based on usage. 
    // Assuming standard fields for now, will refine when response is known or usage is found.
    id: number;
    request_type: string;
    employee_name: string;
    date: string;
    status: string;
    details?: string;
}

export interface WorkflowApprovalResponse {
    status: string;
    total_approvals: number;
    pending_approval_count: number;
    approved_count: number;
    disapproved_count: number;
    misscheckout_pending_approval_count: number;
    earlycheckout_pending_approval_count: number;
    IsAway_pending_approval_count: number;
    workfromhome_pending_approval_count: number;
}

export interface ApprovalHistoryItem {
    TranID: number;
    ProgramID: number;
    ApprovalStatus: string;
    EmpName: string;
    UpdatedBy: number;
    UpdatedDate: string;
    CreatedBy: number;
    CreatedDate: string;
}

export interface ApprovalHistoryResponse {
    status: string;
    history: ApprovalHistoryItem[];
    message?: string;
}

export interface BulkActionResponse {
    status: string;
    message: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get workflow approval requests
 * GET /workflowapproval/
 */
export const getWorkflowApproval = async (): Promise<WorkflowApprovalResponse> => {
    try {
        console.log('📊 Fetching workflow approvals...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/workflowapproval/`,
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
            console.log('📊 Workflow approvals data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch workflow approvals';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error: any) {
        console.error('❌ Workflow approvals error:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
};

/**
 * Get approval history
 * GET /approvalhistory/
 */
export const getApprovalHistory = async (tranId?: number, progId?: number): Promise<ApprovalHistoryResponse> => {
    try {
        console.log(`📊 Fetching approval history for tranId: ${tranId}, progId: ${progId}...`);

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const queryParams = new URLSearchParams();
        if (tranId !== undefined) queryParams.append('tran_id', tranId.toString());
        if (progId !== undefined) queryParams.append('prog_id', progId.toString());

        const queryString = queryParams.toString();
        const url = `${BASE_URL}/approvalhistory/${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(
            url,
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
            console.log('📊 Approval history data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch approval history';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error: any) {
        console.error('❌ Approval history error:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
};

/**
 * Approve all pending requests
 * POST /allapprove/
 */
export const approveAll = async (payload: any = {}): Promise<BulkActionResponse> => {
    try {
        console.log('✅ Approving all requests...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/allapprove/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        );

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to approve all requests';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error: any) {
        console.error('❌ Approve all error:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
};

/**
 * Disapprove a specific request or all requests
 * POST /alldisapprove/
 */
interface DisapprovePayload {
    ProgramID?: number;
    TranID?: number;
    // Allow other potential keys for bulk actions if needed, though specific IDs are preferred
    [key: string]: any;
}

export const disapproveAll = async (payload: DisapprovePayload = {}): Promise<BulkActionResponse> => {
    try {
        console.log('❌ Disapproving requests with payload:', payload);

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/alldisapprove/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        );

        let data;
        try {
            data = await response.json();
            console.log('❌ Disapprove response:', data);
        } catch (jsonError) {
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to disapprove requests';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error: any) {
        console.warn('⚠️ Disapprove error:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
};
