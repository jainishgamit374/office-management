// lib/adminApi.ts
import { authApiRequest } from './api';

// ==================== TYPES ====================

export interface Employee {
    id: string | number;
    employee_id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    is_admin?: boolean;
}

export interface AttendanceRecord {
    id: string | number;
    employee_id: string;
    employee_name: string;
    date: string;
    check_in_time?: string;
    check_out_time?: string;
    status: 'present' | 'absent' | 'late' | 'wfh' | 'leave';
    late_by_minutes?: number;
}

export interface LeaveRequest {
    id: string | number;
    employee_id: string;
    employee_name: string;
    leave_type: 'PL' | 'CL' | 'SL' | 'AB';
    from_date: string;
    to_date: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    applied_date: string;
}

export interface WFHRequest {
    id: string | number;
    employee_id: string;
    employee_name: string;
    date: string;
    is_full_day: boolean;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    applied_date: string;
}

export interface MissPunchRequest {
    id: string | number;
    employee_id: string;
    employee_name: string;
    date: string;
    punch_type: 'check_in' | 'check_out';
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface EarlyCheckoutRequest {
    id: string | number;
    employee_id: string;
    employee_name: string;
    date: string;
    request_type: 'early_checkout' | 'late_checkin';
    time: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface LeaveBalance {
    employee_id: string;
    employee_name: string;
    PL: number;
    CL: number;
    SL: number;
    AB: number;
    total_leaves: number;
}

export interface Birthday {
    employee_id: string;
    employee_name: string;
    date_of_birth: string;
    age?: number;
    days_until_birthday: number;
}

export interface PerformanceMetric {
    employee_id: string;
    employee_name: string;
    department?: string;
    designation?: string;
    tasks_completed: number;
    tasks_total: number;
    completion_rate: number;
    performance_score: number;
    improvement_trend: 'improving' | 'stable' | 'declining';
}

export interface Task {
    id: string | number;
    title: string;
    description: string;
    assignedTo: string;
    assignedBy?: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: string;
    createdDate?: string;
    progress?: number;
}

export interface DashboardStats {
    leave_requests_pending: number;
    early_checkout_today: number;
    miss_punch_alerts: number;
    late_checkin_count: number;
    wfh_requests_active: number;
    pending_approvals_total: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Get all employees data
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
    try {
        const response = await authApiRequest<{ employees: Employee[] }>('/api/admin/employees/', {
            method: 'GET',
        });
        return response.employees || [];
    } catch (error: any) {
        console.error('Get all employees error:', error);
        throw new Error(error.message || 'Failed to fetch employees');
    }
};

/**
 * Get attendance records with optional filters
 */
export const getAttendanceRecords = async (filters?: {
    employee_id?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
}): Promise<AttendanceRecord[]> => {
    try {
        const queryParams = new URLSearchParams();
        if (filters?.employee_id) queryParams.append('employee_id', filters.employee_id);
        if (filters?.from_date) queryParams.append('from_date', filters.from_date);
        if (filters?.to_date) queryParams.append('to_date', filters.to_date);
        if (filters?.status) queryParams.append('status', filters.status);

        const endpoint = `/api/admin/attendance/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await authApiRequest<{ records: AttendanceRecord[] }>(endpoint, {
            method: 'GET',
        });
        return response.records || [];
    } catch (error: any) {
        console.error('Get attendance records error:', error);
        throw new Error(error.message || 'Failed to fetch attendance records');
    }
};

/**
 * Get leave requests by status
 */
export const getLeaveRequests = async (status?: 'pending' | 'approved' | 'rejected'): Promise<LeaveRequest[]> => {
    try {
        const endpoint = status ? `/api/admin/leave-requests/?status=${status}` : '/api/admin/leave-requests/';
        const response = await authApiRequest<{ requests: LeaveRequest[] }>(endpoint, {
            method: 'GET',
        });
        return response.requests || [];
    } catch (error: any) {
        console.error('Get leave requests error:', error);
        throw new Error(error.message || 'Failed to fetch leave requests');
    }
};

/**
 * Get WFH requests
 */
export const getWFHRequests = async (status?: 'pending' | 'approved' | 'rejected'): Promise<WFHRequest[]> => {
    try {
        const endpoint = status ? `/api/admin/wfh-requests/?status=${status}` : '/api/admin/wfh-requests/';
        const response = await authApiRequest<{ requests: WFHRequest[] }>(endpoint, {
            method: 'GET',
        });
        return response.requests || [];
    } catch (error: any) {
        console.error('Get WFH requests error:', error);
        throw new Error(error.message || 'Failed to fetch WFH requests');
    }
};

/**
 * Get miss punch requests
 */
export const getMissPunchRequests = async (): Promise<MissPunchRequest[]> => {
    try {
        const response = await authApiRequest<{ requests: MissPunchRequest[] }>('/api/admin/miss-punch-requests/', {
            method: 'GET',
        });
        return response.requests || [];
    } catch (error: any) {
        console.error('Get miss punch requests error:', error);
        throw new Error(error.message || 'Failed to fetch miss punch requests');
    }
};

/**
 * Get early checkout/late check-in requests
 */
export const getEarlyCheckoutRequests = async (): Promise<EarlyCheckoutRequest[]> => {
    try {
        const response = await authApiRequest<{ requests: EarlyCheckoutRequest[] }>('/api/admin/early-checkout-requests/', {
            method: 'GET',
        });
        return response.requests || [];
    } catch (error: any) {
        console.error('Get early checkout requests error:', error);
        throw new Error(error.message || 'Failed to fetch early checkout requests');
    }
};

/**
 * Get late check-in records for today
 */
export const getLateCheckInRecords = async (): Promise<AttendanceRecord[]> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        return await getAttendanceRecords({
            from_date: today,
            to_date: today,
            status: 'late',
        });
    } catch (error: any) {
        console.error('Get late check-in records error:', error);
        throw new Error(error.message || 'Failed to fetch late check-in records');
    }
};

/**
 * Get all employee leave balances
 */
export const getAllLeaveBalances = async (): Promise<LeaveBalance[]> => {
    try {
        const response = await authApiRequest<{ balances: LeaveBalance[] }>('/api/admin/leave-balances/', {
            method: 'GET',
        });
        return response.balances || [];
    } catch (error: any) {
        console.error('Get leave balances error:', error);
        throw new Error(error.message || 'Failed to fetch leave balances');
    }
};

/**
 * Get upcoming birthdays
 */
export const getUpcomingBirthdays = async (days: number = 30): Promise<Birthday[]> => {
    try {
        const response = await authApiRequest<{ birthdays: Birthday[] }>(`/api/admin/birthdays/?days=${days}`, {
            method: 'GET',
        });
        return response.birthdays || [];
    } catch (error: any) {
        console.error('Get upcoming birthdays error:', error);
        throw new Error(error.message || 'Failed to fetch upcoming birthdays');
    }
};

/**
 * Get employee performance metrics
 */
export const getEmployeePerformance = async (): Promise<PerformanceMetric[]> => {
    try {
        console.log('🌐 API Request: GET https://karmyog.pythonanywhere.com/api/admin/performance/');

        const response = await authApiRequest<{ performance: PerformanceMetric[] }>('/api/admin/performance/', {
            method: 'GET',
        });

        return response.performance || [];
    } catch (error: any) {
        console.error('Get employee performance error:', error);

        // Return empty array instead of throwing error
        // This allows the dashboard to load even if performance API fails
        console.log('⚠️ Performance API unavailable, returning empty data');
        return [];
    }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await authApiRequest<DashboardStats>('/api/admin/dashboard-stats/', {
            method: 'GET',
        });
        return response;
    } catch (error: any) {
        console.error('Get dashboard stats error:', error);
        // Return default stats if API fails
        return {
            leave_requests_pending: 0,
            early_checkout_today: 0,
            miss_punch_alerts: 0,
            late_checkin_count: 0,
            wfh_requests_active: 0,
            pending_approvals_total: 0,
        };
    }
};

/**
 * Approve a request (leave, WFH, miss punch, etc.)
 */
export const approveRequest = async (requestType: string, requestId: string | number): Promise<{ message: string }> => {
    try {
        const response = await authApiRequest<{ message: string }>(`/api/admin/${requestType}/${requestId}/approve/`, {
            method: 'POST',
        });
        return response;
    } catch (error: any) {
        console.error('Approve request error:', error);
        throw new Error(error.message || 'Failed to approve request');
    }
};

/**
 * Reject a request with reason
 */
export const rejectRequest = async (
    requestType: string,
    requestId: string | number,
    reason: string
): Promise<{ message: string }> => {
    try {
        const response = await authApiRequest<{ message: string }>(`/api/admin/${requestType}/${requestId}/reject/`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
        return response;
    } catch (error: any) {
        console.error('Reject request error:', error);
        throw new Error(error.message || 'Failed to reject request');
    }
};

// ==================== EMPLOYEE TASK FUNCTIONS ====================

/**
 * Get tasks for a specific employee
 */
export const getEmployeeTasks = async (employeeName: string): Promise<Task[]> => {
    try {
        const response = await authApiRequest<{ tasks: Task[] }>(`/api/employee/tasks/?assigned_to=${employeeName}`, {
            method: 'GET',
        });
        return response.tasks || [];
    } catch (error: any) {
        console.error('Get employee tasks error:', error);
        throw new Error(error.message || 'Failed to fetch employee tasks');
    }
};

/**
 * Get task by ID
 */
export const getTaskById = async (taskId: string | number): Promise<Task> => {
    try {
        const response = await authApiRequest<{ task: Task }>(`/api/tasks/${taskId}/`, {
            method: 'GET',
        });
        return response.task;
    } catch (error: any) {
        console.error('Get task by ID error:', error);
        throw new Error(error.message || 'Failed to fetch task');
    }
};

/**
 * Update task status
 */
export const updateTaskStatus = async (
    taskId: string | number,
    status: 'Pending' | 'In Progress' | 'Completed'
): Promise<{ message: string }> => {
    try {
        const response = await authApiRequest<{ message: string }>(`/api/tasks/${taskId}/status/`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return response;
    } catch (error: any) {
        console.error('Update task status error:', error);
        throw new Error(error.message || 'Failed to update task status');
    }
};

/**
 * Add comment/note to task
 */
export const addTaskComment = async (
    taskId: string | number,
    comment: string
): Promise<{ message: string }> => {
    try {
        const response = await authApiRequest<{ message: string }>(`/api/tasks/${taskId}/comments/`, {
            method: 'POST',
            body: JSON.stringify({ comment }),
        });
        return response;
    } catch (error: any) {
        console.error('Add task comment error:', error);
        throw new Error(error.message || 'Failed to add task comment');
    }
};
