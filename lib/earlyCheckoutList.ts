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

// Interface for /earlycheckoutdetails/
export interface EarlyCheckoutWorkflow {
    Approve_name: string;
    Priority: number;
    status: string;
}

export interface EarlyCheckoutDetail {
    EarlyCheckoutReqMasterID: number;
    ApprovalStatusMasterID: number;
    datetime: string;
    Reason: string;
    approval_status: string;
    workflow_list: EarlyCheckoutWorkflow[];
}

export interface EarlyCheckoutDetailsResponse {
    status: string;
    data: EarlyCheckoutDetail[];
}

// Interface for /createearlycheckout/
export interface CreateEarlyCheckoutPayload {
    DateTime: string;
    Reason: string;
}

export interface CreateEarlyCheckoutResponse {
    status: string;
    statusCode: number;
    message: string;
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
            // Handle known "not found" messages gracefully
            const msg = data.message || data.error || '';
            if (msg.includes('No early checkout requests found')) {
                return { status: 'Success', approval_requests: [] };
            }
            throw new Error(msg || 'Failed to fetch early checkout list');
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
        }

        // Return empty list on specific error messages too, if caught here
        if (errorMessage.includes('No early checkout requests found')) {
            return { status: 'Success', approval_requests: [] };
        }

        throw new Error(errorMessage);
    }
};

/**
 * Get my early checkout requests details
 * GET /earlycheckoutdetails/
 */
export const getEarlyCheckoutDetails = async (): Promise<EarlyCheckoutDetailsResponse> => {
    try {
        console.log('📊 Fetching early checkout details...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/earlycheckoutdetails/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const data = await response.json();
        console.log('📦 Early checkout details:', data);

        if (!response.ok) {
            const msg = data.message || '';
            if (msg.includes('No early checkout requests found') || msg.includes('Not found')) {
                return { status: 'Success', data: [] };
            }
            throw new Error(msg || 'Failed to fetch early checkout details');
        }

        return data;
    } catch (error: any) {
        console.error('❌ Error fetching early checkout details:', error);

        // Handle case where it might have thrown above
        if (error.message && (error.message.includes('No early checkout requests found'))) {
            return { status: 'Success', data: [] };
        }

        throw error;
    }
};

/**
 * Create a new early checkout request
 * POST /createearlycheckout/
 */
export const createEarlyCheckoutRequest = async (payload: CreateEarlyCheckoutPayload): Promise<CreateEarlyCheckoutResponse> => {
    try {
        console.log('📝 Creating early checkout request:', payload);

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/createearlycheckout/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();
        console.log('✅ Early checkout created:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create early checkout request');
        }

        return data;
    } catch (error) {
        console.error('❌ Error creating early checkout request:', error);
        throw error;
    }
};
