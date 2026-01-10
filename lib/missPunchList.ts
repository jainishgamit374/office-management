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

export interface WorkflowApprover {
    Approve_name: string;
    Priority: number;
    status: string;
}

export interface MissPunchDetail {
    MissPunchReqMasterID: number;
    ApprovalStatusMasterID: number;
    datetime: string;
    reason: string;
    approval_status: string;
    PunchType: string;
    workflow_list: WorkflowApprover[];
}

export interface MissPunchDetailsResponse {
    status: string;
    statusCode?: number;
    message?: string;
    data: MissPunchDetail[];
    timestamp?: string;
    requestId?: string;
}

export interface SubmitMissPunchData {
    Date: string;        // Format: YYYY-MM-DD
    PunchType: 1 | 2;    // 1 = Punch In, 2 = Punch Out
    Reason: string;
}

export interface SubmitMissPunchResponse {
    status: string;
    statusCode: number;
    message: string;
    timestamp?: string;
    requestId?: string;
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

/**
 * Get missing punch details with workflow information
 * GET /getmissingpunchdetails/
 */
export const getMissingPunchDetails = async (): Promise<MissPunchDetailsResponse> => {
    try {
        console.log('📊 Fetching missing punch details...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/getmissingpunchdetails/`,
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
            console.log('📊 Missing punch details data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            }
            const errorMessage = data.message || data.error || 'Failed to fetch missing punch details';
            throw new Error(errorMessage);
        }

        console.log('✅ Missing punch details fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Missing punch details error:', error);
        let errorMessage = 'Failed to fetch missing punch details';
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

/**
 * Submit a miss punch request
 * POST /misspunch/
 */
export const submitMissPunch = async (data: SubmitMissPunchData): Promise<SubmitMissPunchResponse> => {
    try {
        console.log('📝 Submitting miss punch request...');
        console.log('Data:', data);

        // Validate data
        if (!data.Date || !data.Reason) {
            throw new Error('Date and Reason are required');
        }

        if (data.PunchType !== 1 && data.PunchType !== 2) {
            throw new Error('PunchType must be 1 (Punch In) or 2 (Punch Out)');
        }

        if (data.Reason.trim().length < 10) {
            throw new Error('Reason must be at least 10 characters');
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/misspunch/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(data),
            }
        );

        console.log('📡 Response status:', response.status);

        let responseData;
        try {
            responseData = await response.json();
            console.log('📊 Miss punch submission response:', responseData);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            } else if (response.status === 400) {
                throw new Error(responseData.message || 'Invalid request data');
            }
            const errorMessage = responseData.message || responseData.error || 'Failed to submit miss punch request';
            throw new Error(errorMessage);
        }

        console.log('✅ Miss punch request submitted successfully');
        return responseData;
    } catch (error: any) {
        console.error('❌ Submit miss punch error:', error);
        let errorMessage = 'Failed to submit miss punch request';
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
    getMissPunchList,
    getMissingPunchDetails,
    submitMissPunch,
};
