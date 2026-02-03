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
            `${BASE_URL}/workfromhomeapprovals/`,
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
            const text = await response.text();
            try {
                responseData = JSON.parse(text);
                console.log('📊 WFH list response:', responseData);
            } catch (e) {
                console.error('Failed to parse JSON. Raw response:', text.substring(0, 200));
                throw new Error('Server returned invalid JSON response');
            }
        } catch (error: any) {
            throw new Error('Failed to read response');
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            }
            const errorMessage = responseData.message || responseData.error || 'Failed to fetch WFH list';
            throw new Error(errorMessage);
        }

        // Map various possible response structures to WFHEmployee[]
        const rawList = responseData.approval_requests || responseData.pending_approvals || responseData.data || responseData.requests || [];

        const mappedData: WFHEmployee[] = rawList.map((item: any) => ({
            id: (item.TranID || item.id || Math.random()).toString(),
            employeeName: item.EmployeeName || item.employeeName || 'Unknown',
            employeeId: item.EmployeeCode || item.employeeId || '—',
            department: item.DepartmentName || item.department || '—',
            date: item.DateTime || item.date || new Date().toISOString(),
            isHalfDay: item.IsHalfDay || item.isHalfDay || false,
            reason: item.Reason || item.reason || '',
            approvalStatus: item.ApprovalStatus || item.approvalStatus || 'Pending',
            approvedBy: item.ApprovedBy || item.approvedBy
        }));

        console.log('✅ WFH list fetched successfully');
        return {
            status: 'Success',
            data: mappedData
        };
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
