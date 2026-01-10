import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface Task {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: string;
}

export interface TaskListResponse {
    status: string;
    statusCode?: number;
    message?: string;
    data: Task[];
    timestamp?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get task list
 * GET /tasks/
 */
export const getTaskList = async (): Promise<TaskListResponse> => {
    try {
        console.log('📋 Fetching task list...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/tasks/`,
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
            console.log('📊 Task list response:', responseData);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            }
            const errorMessage = responseData.message || responseData.error || 'Failed to fetch task list';
            throw new Error(errorMessage);
        }

        console.log('✅ Task list fetched successfully');
        return responseData;
    } catch (error: any) {
        console.error('❌ Get task list error:', error);
        let errorMessage = 'Failed to fetch task list';
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
    getTaskList,
};
