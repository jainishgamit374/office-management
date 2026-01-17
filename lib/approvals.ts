import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

export const PROGRAM_IDS = {
    MissedPunch: 1,
    Leave: 2,
    EarlyCheckout: 3,
    IsAway: 4, // Checking valid ID
    WFH: 6,
};

// --- Types ---

export interface ApprovePayload {
    ProgramID: number;
    TranID: number;
    Reason: string;
}

export interface DisapprovePayload {
    ProgramID: number;
    TranID: number;
}

export interface ApprovalHistoryItem {
    TranID: number;
    ProgramID: number;
    ApprovalStatus: string;
    EmpName: string;
    UpdatedBy: number;
    UpdatedDate: string;
    CreatedBy: number;
    CreatedDate: string;
}

export interface WorkflowStatusResponse {
    status: string;
    total_approvals: number;
    pending_approval_count: number;
    misscheckout_pending_approval_count: number;
    earlycheckout_pending_approval_count: number;
    workfromhome_pending_approval_count: number;
    // ... other counts
}

// --- API Functions ---

/**
 * Approve a request
 * POST /allapprove/
 */
export const approveRequest = async (payload: ApprovePayload) => {
    try {
        const token = await getAccessToken();
        const response = await fetch(`${BASE_URL}/allapprove/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to approve request');
        }
        return data;
    } catch (error) {
        console.error('Approve Error:', error);
        throw error;
    }
};

/**
 * Disapprove a request
 * POST /alldisapprove/
 */
export const disapproveRequest = async (payload: DisapprovePayload) => {
    try {
        const token = await getAccessToken();
        const response = await fetch(`${BASE_URL}/alldisapprove/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to disapprove request');
        }
        return data;
    } catch (error) {
        console.error('Disapprove Error:', error);
        throw error;
    }
};

/**
 * Get Approval History
 * GET /approvalhistory/?tran_id=X&prog_id=Y
 * Note: This API seems to want specific IDs. 
 * If we want a generic "List of History", we might need to check if there's a different endpoint 
 * or if we use the specific list endpoints (like getMissPunchList) which usually return history too.
 */
export const getApprovalHistory = async (tranId: number, progId: number) => {
    try {
        const token = await getAccessToken();
        const response = await fetch(`${BASE_URL}/approvalhistory/?tran_id=${tranId}&prog_id=${progId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    } catch (e) {
        console.error(e);
        return { status: 'Failed', history: [] };
    }
}

async function postJSON<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || 'Request failed');
    return json as T;
}

export async function approveAny(payload: { ProgramID: number; TranID: number; Reason: string }) {
    return postJSON<{ status: string; message?: string }>('/allapprove/', payload);
}

export async function disapproveAny(payload: { ProgramID: number; TranID: number }) {
    return postJSON<{ status: string; message?: string }>('/alldisapprove/', payload);
}


