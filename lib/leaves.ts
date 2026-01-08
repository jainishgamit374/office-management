import { getAccessToken } from './api';

const API_BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface LeaveApplicationData {
    LeaveType: 'CL' | 'SL' | 'PL';
    Reason: string;
    StartDate: string; // Format: YYYY-MM-DD
    EndDate: string; // Format: YYYY-MM-DD
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
    ContactNumber?: string;
    EmergencyContact?: string;
    Attachments?: string[];
}

export interface LeaveApplicationResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        LeaveApplicationMasterID: number;
        EmployeeID: number;
        EmployeeName: string;
        LeaveType: string;
        LeaveTypeName: string;
        StartDate: string;
        StartDateFormatted: string;
        EndDate: string;
        EndDateFormatted: string;
        TotalDays: number;
        IsHalfDay: boolean;
        IsFirstHalf: boolean;
        Reason: string;
        ApprovalStatus: string;
        ApprovalStatusID: number;
        CreatedAt: string;
        LeaveBalanceAfterApproval?: {
            [key: string]: {
                current: number;
                afterApproval: number;
            };
        };
        Approvers?: Array<{
            ApproverID: number;
            ApproverName: string;
            Priority: number;
            Status: string;
        }>;
    };
    timestamp: string;
    requestId?: string;
}

export interface LeaveApplicationDetails {
    LeaveApplicationMasterID: number;
    EmployeeID: number;
    EmployeeName: string;
    EmployeeEmail: string;
    Department: string;
    Designation: string;
    LeaveType: string;
    LeaveTypeCode: string;
    ApprovalStatusID: number;
    ApprovalStatus: string;
    ApprovalUsername: string;
    Reason: string;
    StartDate: string;
    StartDateFormatted: string;
    StartDayName: string;
    EndDate: string;
    EndDateFormatted: string;
    EndDayName: string;
    TotalDays: number;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
    HalfDayType: string | null;
    ContactNumber: string;
    EmergencyContact: string;
    Attachments: string[];
    CreatedAt: string;
    UpdatedAt: string;
    CanCancel: boolean;
    CanEdit: boolean;
    CancellationDeadline: string;
    ApprovalWorkflow: Array<{
        ApproverID: number;
        ApproverName: string;
        ApproverEmail: string;
        Priority: number;
        Status: string;
        ActionDate: string | null;
        Comments: string | null;
    }>;
    LeaveBalanceInfo: {
        BeforeApplication: number;
        AfterApproval: number;
        LeaveType: string;
    };
}

export interface GetLeaveApplicationResponse {
    status: string;
    statusCode: number;
    message: string;
    data: LeaveApplicationDetails;
    timestamp: string;
    requestId?: string;
}

export interface LeaveApplicationListResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        applications: LeaveApplicationDetails[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalRecords: number;
            recordsPerPage: number;
        };
    };
    timestamp: string;
    requestId?: string;
}

export interface CancelLeaveResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        LeaveApplicationMasterID: number;
        Status: string;
        CancelledAt: string;
    };
    timestamp: string;
    requestId?: string;
}

export interface WorkflowItem {
    Approve_name: string;
    Priority: number;
    status: string;
}

export interface LeaveApplicationSummary {
    LeaveApplicationMasterID: number;
    LeaveType: string;
    ShortName: string;
    ApprovalStatus: string;
    workflow_list: WorkflowItem[];
}

export interface LeaveApplicationsListParams {
    page?: number;
    limit?: number;
    leaveType?: 'CL' | 'SL' | 'PL' | 'All';
    status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'All';
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    year?: number;
    sortBy?: 'StartDate' | 'CreatedDate' | 'LeaveType' | 'TotalDays';
    sortOrder?: 'asc' | 'desc';
}

export interface LeaveApplicationsListResponse {
    status: string;
    statusCode: number;
    message?: string;
    data: LeaveApplicationSummary[] | LeaveApplicationDetails[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        recordsPerPage: number;
    };
    timestamp?: string;
    requestId?: string;
}

export interface LeaveBalanceItem {
    Leavename: string;
    count: number;
}

export interface LeaveBalanceResponse {
    status: string;
    statusCode: number;
    message: string;
    data: LeaveBalanceItem[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get employee leave balance
 * GET /getemployeeleavebalance/
 */
export const getEmployeeLeaveBalance = async (): Promise<LeaveBalanceResponse> => {
    try {
        console.log('📊 Fetching employee leave balance...');

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(`${API_BASE_URL}/getemployeeleavebalance/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('📡 Response status:', response.status);

        // Parse response
        const data = await response.json();
        console.log('📡 Response data:', data);

        // Handle error responses
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            } else {
                throw new Error(data.message || 'Failed to fetch leave balance');
            }
        }

        console.log('✅ Leave balance fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Get leave balance error:', error);
        throw new Error(error.message || 'Failed to fetch leave balance');
    }
};

/**
 * Get access token from AsyncStorage
 */
/**
 * Submit a leave application
 */
export const applyLeave = async (leaveData: LeaveApplicationData): Promise<LeaveApplicationResponse> => {
    try {
        console.log('📝 Submitting leave application...');
        console.log('Leave data:', leaveData);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(`${API_BASE_URL}/leaveapplications/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(leaveData),
        });

        console.log('📡 Response status:', response.status);

        // Parse response
        const data = await response.json();
        console.log('📡 Response data:', data);

        // Handle error responses
        if (!response.ok) {
            // Handle specific error codes
            if (response.status === 400) {
                // Validation error
                if (data.errors && data.errors.length > 0) {
                    const error = data.errors[0];
                    if (error.code === 'INSUFFICIENT_BALANCE') {
                        throw new Error(error.message || 'Insufficient leave balance');
                    }
                    throw new Error(error.message || data.message);
                }
                throw new Error(data.message || 'Validation failed');
            } else if (response.status === 409) {
                // Overlapping leave
                if (data.errors && data.errors.length > 0) {
                    const error = data.errors[0];
                    throw new Error(error.message || 'Leave already applied for these dates');
                }
                throw new Error(data.message || 'Leave application failed');
            } else if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            } else {
                throw new Error(data.message || 'Failed to submit leave application');
            }
        }

        console.log('✅ Leave application submitted successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Leave application error:', error);
        throw new Error(error.message || 'Failed to submit leave application');
    }
};

/**
 * Get leave application details by ID
 */
export const getLeaveApplication = async (id: number): Promise<GetLeaveApplicationResponse> => {
    try {
        console.log('📋 Fetching leave application details...');
        console.log('Leave Application ID:', id);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(`${API_BASE_URL}/leaveapplications/?id=${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('📡 Response status:', response.status);

        // Parse response
        const data = await response.json();
        console.log('📡 Response data:', data);

        // Handle error responses
        if (!response.ok) {
            // Handle specific error codes
            if (response.status === 404) {
                throw new Error(data.message || 'Leave application not found');
            } else if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            } else {
                throw new Error(data.message || 'Failed to fetch leave application');
            }
        }

        console.log('✅ Leave application fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Get leave application error:', error);
        throw new Error(error.message || 'Failed to fetch leave application');
    }
};

/**
 * Get all leave applications (paginated)
 */
export const getLeaveApplications = async (page: number = 1, limit: number = 10): Promise<LeaveApplicationListResponse> => {
    try {
        console.log('📋 Fetching leave applications...');
        console.log('Page:', page, 'Limit:', limit);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(`${API_BASE_URL}/leaveapplications/?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('📡 Response status:', response.status);

        // Parse response
        const data = await response.json();
        console.log('📡 Response data:', data);

        // Handle error responses
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            } else {
                throw new Error(data.message || 'Failed to fetch leave applications');
            }
        }

        console.log('✅ Leave applications fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Get leave applications error:', error);
        throw new Error(error.message || 'Failed to fetch leave applications');
    }
};

/**
 * Get leave applications list with filters (new endpoint)
 */
export const getLeaveApplicationsList = async (params: LeaveApplicationsListParams = {}): Promise<LeaveApplicationsListResponse> => {
    try {
        console.log('📋 Fetching leave applications list with filters...');
        console.log('Params:', params);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Build query string
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.leaveType && params.leaveType !== 'All') queryParams.append('leaveType', params.leaveType);
        if (params.status && params.status !== 'All') queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.year) queryParams.append('year', params.year.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/leaveapplications-list/${queryString ? `?${queryString}` : ''}`;

        console.log('📡 Request URL:', url);

        // Make API request
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('📡 Response status:', response.status);

        // Parse response
        const data = await response.json();
        console.log('📡 Response data:', data);

        // Handle error responses
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            } else {
                throw new Error(data.message || 'Failed to fetch leave applications');
            }
        }

        console.log('✅ Leave applications list fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Get leave applications list error:', error);
        throw new Error(error.message || 'Failed to fetch leave applications list');
    }
};

/**
 * Cancel a leave application
 */
export const cancelLeaveApplication = async (id: number): Promise<CancelLeaveResponse> => {
    try {
        console.log('🚫 Cancelling leave application...');
        console.log('Leave Application ID:', id);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Make API request
        const response = await fetch(`${API_BASE_URL}/leaveapplications/${id}/cancel/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('📡 Response status:', response.status);

        // Parse response
        const data = await response.json();
        console.log('📡 Response data:', data);

        // Handle error responses
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error(data.message || 'Cannot cancel this leave application');
            } else if (response.status === 404) {
                throw new Error('Leave application not found');
            } else if (response.status === 401) {
                throw new Error('Your session has expired. Please login again.');
            } else {
                throw new Error(data.message || 'Failed to cancel leave application');
            }
        }

        console.log('✅ Leave application cancelled successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Cancel leave application error:', error);
        throw new Error(error.message || 'Failed to cancel leave application');
    }
};

/**
 * Validate leave application data
 */
export const validateLeaveApplication = (data: Partial<LeaveApplicationData>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Leave type validation
    if (!data.LeaveType) {
        errors.push('Leave type is required');
    } else if (!['CL', 'SL', 'PL'].includes(data.LeaveType)) {
        errors.push('Leave type must be CL, SL, or PL');
    }

    // Reason validation
    if (!data.Reason || data.Reason.trim().length === 0) {
        errors.push('Reason is required');
    } else if (data.Reason.trim().length < 10) {
        errors.push('Reason must be at least 10 characters');
    } else if (data.Reason.length > 500) {
        errors.push('Reason cannot exceed 500 characters');
    }

    // Start date validation
    if (!data.StartDate) {
        errors.push('Start date is required');
    } else {
        const startDate = new Date(data.StartDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
            errors.push('Start date cannot be in the past');
        }
    }

    // End date validation
    if (!data.EndDate) {
        errors.push('End date is required');
    } else if (data.StartDate) {
        const startDate = new Date(data.StartDate);
        const endDate = new Date(data.EndDate);
        if (endDate < startDate) {
            errors.push('End date cannot be before start date');
        }
    }

    // Contact number validation (if provided)
    if (data.ContactNumber && !/^[0-9]{10}$/.test(data.ContactNumber)) {
        errors.push('Contact number must be 10 digits');
    }

    // Emergency contact validation (if provided)
    if (data.EmergencyContact && !/^[0-9]{10}$/.test(data.EmergencyContact)) {
        errors.push('Emergency contact must be 10 digits');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Calculate total leave days
 */
export const calculateLeaveDays = (startDate: string, endDate: string, isHalfDay: boolean): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // If half day, return 0.5, otherwise return full days
    return isHalfDay ? 0.5 : diffDays;
};

export default {
    applyLeave,
    getLeaveApplication,
    getLeaveApplications,
    getLeaveApplicationsList,
    cancelLeaveApplication,
    validateLeaveApplication,
    calculateLeaveDays,
};
