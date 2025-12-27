// lib/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://karmyog.pythonanywhere.com';

// Storage Keys
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';

export interface ApiResponse<T = any> {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
    detail?: string;
}

// Get stored access token
export const getAccessToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

// Get stored refresh token
export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

// Store tokens
export const storeTokens = async (accessToken: string, refreshToken?: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    } catch (error) {
        console.error('Error storing tokens:', error);
    }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

// Refresh access token
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return null;
        }

        const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            await clearAuthData();
            return null;
        }

        const data = await response.json();

        if (data.access) {
            await AsyncStorage.setItem(TOKEN_KEY, data.access);
            return data.access;
        }

        return null;
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
};

// Main API request function with JWT handling
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
): Promise<T> => {
    const url = `${BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add Authorization header if required
    if (requiresAuth) {
        let accessToken = await getAccessToken();

        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
        if (options.body) {
            console.log('📦 Request Body:', options.body);
        }

        let response = await fetch(url, config);

        // Handle 401 Unauthorized - Try to refresh token
        if (response.status === 401 && requiresAuth) {
            console.log('🔄 Token expired, attempting refresh...');

            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
                // Retry request with new token
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${newAccessToken}`,
                };

                response = await fetch(url, config);
            } else {
                throw new Error('Session expired. Please login again.');
            }
        }

        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('❌ Failed to parse JSON response');
            console.error('JSON Parse Error:', jsonError);
            throw new Error('Server returned invalid response. Please check the API endpoint.');
        }

        console.log('📥 Response Status:', response.status);
        console.log('📥 Response Data:', data);

        if (!response.ok) {
            // Handle different error formats from Django
            const errorMessage =
                data.detail ||
                data.message ||
                data.error ||
                (data.email && data.email[0]) ||
                (data.password && data.password[0]) ||
                (data.non_field_errors && data.non_field_errors[0]) ||
                `Request failed with status ${response.status}`;

            throw new Error(errorMessage);
        }

        return data;
    } catch (error: any) {
        console.error('❌ API Error:', error);

        if (error.name === 'TypeError' && error.message === 'Network request failed') {
            throw new Error('Network error. Please check your internet connection.');
        }

        throw error;
    }
};

// API request without auth (for public endpoints)
export const publicApiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    return apiRequest<T>(endpoint, options, false);
};

// API request with auth (for protected endpoints)
export const authApiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    return apiRequest<T>(endpoint, options, true);
};