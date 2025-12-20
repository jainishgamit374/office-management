import { apiRequest } from './api';

// 👤 User Profile Operations (Protected APIs)

// Get user profile
export const getUserProfile = async () => {
    return await apiRequest('/profile', {
        method: 'GET',
    });
};

// Update user profile
export const updateUserProfile = async (data: {
    name?: string;
    phone?: string;
    email?: string;
}) => {
    return await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Get user settings
export const getUserSettings = async () => {
    return await apiRequest('/settings', {
        method: 'GET',
    });
};

// Update user settings
export const updateUserSettings = async (settings: any) => {
    return await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    });
};

// Example: Get user's attendance records
export const getAttendanceRecords = async () => {
    return await apiRequest('/attendance', {
        method: 'GET',
    });
};

// Example: Submit leave request
export const submitLeaveRequest = async (data: {
    startDate: string;
    endDate: string;
    reason: string;
    leaveType: string;
}) => {
    return await apiRequest('/leave/request', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// Example: Get leave balance
export const getLeaveBalance = async () => {
    return await apiRequest('/leave/balance', {
        method: 'GET',
    });
};
