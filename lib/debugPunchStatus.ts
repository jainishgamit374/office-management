// Debug helper to check punch status API response
// Add this temporarily to see what the backend is returning

import { getPunchStatus } from '@/lib/attendance';

export const debugPunchStatus = async () => {
    try {
        console.log('🔍 DEBUG: Fetching punch status...');
        const response = await getPunchStatus();

        console.log('🔍 DEBUG: Full Response:', JSON.stringify(response, null, 2));
        console.log('🔍 DEBUG: Response.data:', JSON.stringify(response.data, null, 2));
        console.log('🔍 DEBUG: PunchType:', response.data?.PunchType);
        console.log('🔍 DEBUG: PunchTypeName:', response.data?.punch?.PunchTypeName);

        // Check if response has nested structure
        if (response.data?.punch) {
            console.log('🔍 DEBUG: Nested punch object found:', response.data.punch);
        }

        return response;
    } catch (error) {
        console.error('🔍 DEBUG: Error:', error);
        throw error;
    }
};
