import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface WFHApprovalRequest {
    TranID: number;
    ProgramID: number;
    ApprovalStatus: string;
    EmployeeName: string;
    DateTime: string;
    Reason: string;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
}

export interface WFHApprovalHistoryResponse {
    status: string;
    approval_requests: WFHApprovalRequest[];
}

export interface WFHRequest {
    WorkFromHomeReqMasterID: number;
    EmployeeID: number;
    ApprovalStatusID: number;
    ApprovalStatus: string;
    Reason: string;
    DateTime: string;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
    workflow_list: any[];
}

export interface WFHListResponse {
    status: string;
    statusCode: number;
    data: WFHRequest[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get work from home approval history
 * GET /workfromhomeapprovalhistory/
 */
export const getWFHApprovalHistory = async (): Promise<WFHApprovalHistoryResponse> => {
    try {
        console.log('📊 Fetching WFH approval history...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/workfromhomeapprovalhistory/`,
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
            console.log('📊 WFH approval history data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch WFH approval history';
            throw new Error(errorMessage);
        }

        console.log('✅ WFH approval history fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ WFH approval history error:', error);
        let errorMessage = 'Failed to fetch WFH approval history';
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
 * Get work from home applications list
 * GET /workfromhomeapplicationslist/
 */
export const getWFHApplicationsList = async (): Promise<WFHListResponse> => {
    try {
        console.log('📊 Fetching WFH applications list...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/workfromhomeapplicationslist/`,
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
            console.log('📊 WFH applications list data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch WFH applications list';
            throw new Error(errorMessage);
        }

        console.log('✅ WFH applications list fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ WFH applications list error:', error);
        let errorMessage = 'Failed to fetch WFH applications list';
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
