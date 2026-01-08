import { getAccessToken } from './api';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// ==================== TYPES ====================

export interface AttendanceIrregularity {
    attdate: string;
    intime: string;
    outtime: string;
    earlyout?: string;
    latein?: string;
}

export interface AttendanceIrregularitiesResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        late_checkins: AttendanceIrregularity[];
        early_checkouts: AttendanceIrregularity[];
        half_days: AttendanceIrregularity[];
    };
}

// ==================== API FUNCTIONS ====================

/**
 * Get approved early checkout details and attendance irregularities
 * GET /approvedearlycheckoutdetails/
 */
export const getApprovedEarlyCheckoutDetails = async (): Promise<AttendanceIrregularitiesResponse> => {
    try {
        console.log('📊 Fetching attendance irregularities...');

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(
            `${BASE_URL}/approvedearlycheckoutdetails/`,
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
            console.log('📊 Attendance irregularities data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Failed to fetch attendance irregularities';
            throw new Error(errorMessage);
        }

        console.log('✅ Attendance irregularities fetched successfully');
        return data;
    } catch (error: any) {
        console.error('❌ Attendance irregularities error:', error);
        let errorMessage = 'Failed to fetch attendance irregularities';
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
