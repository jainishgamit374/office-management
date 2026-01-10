import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface Employee {
    id: string;
    name: string;
    department: string;
    role: string;
    avatar: string;
}

export interface EmployeeListResponse {
    status: string;
    statusCode?: number;
    message?: string;
    data: Employee[];
    timestamp?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get employee list
 * GET /employees/
 */
export const getEmployeeList = async (): Promise<EmployeeListResponse> => {
    try {
        console.log('📋 Fetching employee list...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/employees/`,
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
            responseData = await response.json();
            console.log('📊 Employee list response:', responseData);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            }
            const errorMessage = responseData.message || responseData.error || 'Failed to fetch employee list';
            throw new Error(errorMessage);
        }

        console.log('✅ Employee list fetched successfully');
        return responseData;
    } catch (error: any) {
        console.error('❌ Get employee list error:', error);
        let errorMessage = 'Failed to fetch employee list';
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
    getEmployeeList,
};
