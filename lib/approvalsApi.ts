import { getAccessToken } from './api';

export const BASE = 'https://karmyog.pythonanywhere.com';

async function getJSON<T>(path: string): Promise<T> {
    const token = await getAccessToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        method: 'GET',
        headers,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || `GET ${path} failed`);
    return json as T;
}

async function postJSON<T>(path: string, body: any): Promise<T> {
    const token = await getAccessToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || `POST ${path} failed`);
    return json as T;
}

export async function approveAny(payload: { ProgramID: number; TranID: number; Reason: string }) {
    return postJSON<{ status: string; statusCode?: number; message?: string }>('/allapprove/', payload);
}

export async function disapproveAny(payload: { ProgramID: number; TranID: number }) {
    return postJSON<{ status: string; statusCode?: number; message?: string }>('/alldisapprove/', payload);
}

// ---- Pending approvals endpoints ----

export type LeaveApprovalsResponse = {
    status: string;
    total_pending_approvals?: number;
    pending_approvals?: Array<{
        Leave_ID: number;
        employee_name: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        reason: string;
        profile_image?: string;
        applied_on?: string;
        IsHalfDay: boolean;
        IsFirstHalf: boolean;
    }>;
};

export function getLeaveApprovals() {
    return getJSON<LeaveApprovalsResponse>('/leaveapprovals/');
}

export type MissCheckoutApprovalsResponse = {
    status: string;
    total_pending_approvals?: number;
    approval_requests?: Array<{
        MissPunchReqMasterID: number;
        EmployeeName: string;
        DateTime: string;
        Reason: string;
    }>;
};

export function getMissCheckoutApprovals() {
    return getJSON<MissCheckoutApprovalsResponse>('/getmisscheckout/');
}

export type EarlyCheckoutApprovalsResponse = {
    status: string;
    statusCode?: number;
    total_pending_approvals?: number;
    approval_requests?: Array<{
        EarlyCheckoutReqMasterID: number;
        EmployeeName: string;
        DateTime: string;
        Reason: string;
    }>;
};

export function getEarlyCheckoutApprovals() {
    return getJSON<EarlyCheckoutApprovalsResponse>('/earlycheckoutlist/');
}

export type EarlyCheckoutDetailsResponse = {
    status: string;
    data?: Array<{
        EarlyCheckoutReqMasterID: number;
        ApprovalStatusMasterID: number;
        datetime: string;
        Reason: string;
        approval_status: string;
        workflow_list?: Array<{
            Approve_name: string;
            Priority: number;
            status: string;
        }>;
    }>;
};

export function getEarlyCheckoutDetails() {
    return getJSON<EarlyCheckoutDetailsResponse>('/earlycheckoutdetails/');
}

export type WfhApprovalsResponse = {
    status: string;
    statusCode?: number;
    total_pending_approvals?: number;
    approval_requests?: Array<{
        WorkFromHomeReqMasterID: number;
        EmployeeName: string;
        DateTime: string;
        Reason: string;
        IsHalfDay: boolean;
        IsFirstHalf: boolean;
    }>;
};

export function getWfhApprovals() {
    return getJSON<WfhApprovalsResponse>('/workfromhomeapproval/');
}

// ---- Approval History endpoints (includes all statuses) ----

export type WfhApprovalHistoryResponse = {
    status: string;
    approval_requests?: Array<{
        TranID: number;
        ProgramID: number;
        ApprovalStatus: string;
        EmployeeName: string;
        DateTime: string;
        Reason: string;
        IsHalfDay: boolean;
        IsFirstHalf: boolean;
    }>;
};

export function getWfhApprovalHistory() {
    return getJSON<WfhApprovalHistoryResponse>('/workfromhomeapprovalhistory/');
}

export type MissPunchApprovalHistoryResponse = {
    status: string;
    approval_requests?: Array<{
        TranID: number;
        ProgramID: number;
        UpdatedDate: string;
        ApprovalStatus: number;
        EmployeeName: string;
        DateTime: string;
        Reason: string;
    }>;
};

export function getMissPunchApprovalHistory() {
    return getJSON<MissPunchApprovalHistoryResponse>('/misspunchapprovallist/');
}

export type EarlyCheckoutApprovalHistoryResponse = {
    status: string;
    approval_requests?: Array<{
        TranID: number;
        ProgramID: number;
        UpdatedDate: string;
        ApprovalStatus: number;
        EmployeeName: string;
        DateTime: string;
        Reason: string | null;
    }>;
};

export function getEarlyCheckoutApprovalHistory() {
    return getJSON<EarlyCheckoutApprovalHistoryResponse>('/earlycheckoutapprovallist/');
}

export type LeaveApprovalHistoryResponse = {
    status: string;
    approval_requests?: Array<{
        TranID: number;
        ProgramID: number;
        UpdatedDate: string;
        ApprovalStatus: number;
        EmployeeName: string;
        LeaveType?: string;
    }>;
};

export function getLeaveApprovalHistory() {
    return getJSON<LeaveApprovalHistoryResponse>('/approvedisapprovedlist/');
}

// ---- Is Away Approvals (Punch from outside office) ----

export type IsAwayApprovalsResponse = {
    status: string;
    statusCode?: number;
    total_pending_approvals?: number;
    approval_requests?: Array<{
        EmpPunchMasterID: number;
        Type: string; // "IN" or "OUT"
        Distance: number;
        FormatedWorkHours: string;
        EmployeeName: string;
        DateTime: string;
        Reason: string;
    }>;
};

export function getIsAwayApprovals() {
    return getJSON<IsAwayApprovalsResponse>('/isawayapprovals/');
}