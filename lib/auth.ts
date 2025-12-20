// lib/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    authApiRequest,
    clearAuthData,
    getAccessToken,
    publicApiRequest,
    storeTokens,
    USER_KEY
} from './api';

// ==================== TYPES ====================

export interface RegisterData {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password2?: string; // Confirm password (required by API)
    username?: string; // Generated automatically if not provided
}

export interface LoginData {
    email: string; // Will be used as username for login
    password: string;
}

export interface User {
    id: string | number;
    name?: string;
    username?: string;
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
}

export interface JWTTokens {
    access: string;
    refresh: string;
}

export interface AuthResponse {
    success?: boolean;
    message?: string;
    user?: User;
    tokens?: JWTTokens;
    access?: string;
    refresh?: string;
    data?: any;
}

export interface RegisterResponse {
    success?: boolean;
    message?: string;
    user?: User;
    tokens?: JWTTokens;
    access?: string;
    refresh?: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user?: User;
    message?: string;
}

// ==================== AUTH FUNCTIONS ====================

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
    try {
        // Create form data for application/x-www-form-urlencoded
        const formData = new URLSearchParams({
            name: userData.name,
            username: userData.email.split('@')[0], // Generate username from email
            email: userData.email,
            phone: userData.phone || '',
            password: userData.password,
            password2: userData.password2 || userData.password,
        });

        const response = await fetch('https://karmyog.pythonanywhere.com/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: formData.toString(),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Server returned HTML instead of JSON: ${text.slice(0, 200)}`);
        }

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.errors ?
                Object.values(data.errors).flat().join(', ') :
                data.message || `Registration failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        // Store tokens if registration is successful
        if (data.status && data.token) {
            await storeTokens(data.token.access, data.token.refresh);
        }

        return {
            success: data.status,
            message: data.message,
            access: data.token?.access,
            refresh: data.token?.refresh,
        };
    } catch (error: any) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Registration failed. Please try again.');
    }
};

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginData): Promise<LoginResponse> => {
    try {
        // Extract username from email (same as registration)
        const username = credentials.email.split('@')[0];

        // Create form data for application/x-www-form-urlencoded
        const formData = new URLSearchParams({
            username: username, // Use extracted username, not full email
            password: credentials.password,
        });

        console.log('🔐 Login attempt with:', {
            email: credentials.email,
            extractedUsername: username
        });

        const response = await fetch('https://karmyog.pythonanywhere.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: formData.toString(),
        });

        console.log('📡 Response status:', response.status, response.statusText);
        console.log('📡 Response headers:', {
            contentType: response.headers.get('content-type'),
        });

        const contentType = response.headers.get('content-type');

        // Get the response text first
        const responseText = await response.text();
        console.log('📡 Raw response:', responseText.substring(0, 500));

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📡 Parsed JSON response:', JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.error('❌ Failed to parse response as JSON');
            throw new Error(`Server returned invalid JSON: ${responseText.slice(0, 200)}`);
        }

        // Check if response is not OK (4xx or 5xx)
        if (!response.ok) {
            console.error('❌ API returned error status:', response.status);
            console.error('❌ Error data:', data);

            const errorMessage = data.errors ?
                Object.values(data.errors).flat().join(', ') :
                data.message || data.error || `Login failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        // Check for successful response structure
        console.log('✅ Login successful, checking token structure...');
        console.log('Response structure:', {
            hasStatus: 'status' in data,
            hasToken: 'token' in data,
            hasAccess: data.token ? 'access' in data.token : false,
            hasRefresh: data.token ? 'refresh' in data.token : false,
        });

        // Store JWT tokens
        if (data.status && data.token && data.token.access && data.token.refresh) {
            await storeTokens(data.token.access, data.token.refresh);
            console.log('✅ JWT tokens stored successfully');

            return {
                access: data.token.access,
                refresh: data.token.refresh,
                message: data.message,
            };
        } else {
            console.error('❌ Unexpected response structure:', data);
            throw new Error('Invalid response structure from server');
        }
    } catch (error: any) {
        console.error('❌ Login error:', error);
        throw new Error(error.message || 'Invalid credentials. Please try again.');
    }
};

/**
 * Login using Simple JWT token endpoint (Django default)
 */
export const loginWithJWT = async (credentials: LoginData): Promise<LoginResponse> => {
    try {
        // Django Simple JWT default endpoint
        const response = await publicApiRequest<{ access: string; refresh: string }>('/api/token/', {
            method: 'POST',
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
            }),
        });

        if (response.access && response.refresh) {
            await storeTokens(response.access, response.refresh);

            // Fetch user profile after login
            const userProfile = await getUserProfile();

            return {
                access: response.access,
                refresh: response.refresh,
                user: userProfile || undefined,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('JWT Login error:', error);
        throw error;
    }
};

/**
 * Logout user - clear all stored data
 */
export const logout = async (): Promise<void> => {
    try {
        // Optional: Call logout endpoint if your API has one
        // await authApiRequest('/api/logout/', { method: 'POST' });

        await clearAuthData();
        console.log('✅ User logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear local data even if API call fails
        await clearAuthData();
    }
};

/**
 * Get user profile from API
 */
export const getUserProfile = async (): Promise<User | null> => {
    try {
        const response = await authApiRequest<User>('/api/profile/', {
            method: 'GET',
        });

        // Store updated user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));

        return response;
    } catch (error) {
        console.error('Get profile error:', error);
        return null;
    }
};

/**
 * Get stored user data
 */
export const getUser = async (): Promise<User | null> => {
    try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const token = await getAccessToken();
        return !!token;
    } catch (error) {
        return false;
    }
};

/**
 * Verify token is valid
 */
export const verifyToken = async (): Promise<boolean> => {
    try {
        const token = await getAccessToken();

        if (!token) {
            return false;
        }

        // Call verify endpoint if available
        await publicApiRequest('/api/token/verify/', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });

        return true;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    try {
        const response = await authApiRequest<User>('/api/profile/', {
            method: 'PUT', // or PATCH depending on your API
            body: JSON.stringify(profileData),
        });

        // Update stored user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));

        return response;
    } catch (error: any) {
        console.error('Update profile error:', error);
        throw new Error(error.message || 'Failed to update profile');
    }
};

/**
 * Change password
 */
export const changePassword = async (
    oldPassword: string,
    newPassword: string
): Promise<{ message: string }> => {
    try {
        const response = await authApiRequest<{ message: string }>('/api/change-password/', {
            method: 'POST',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
            }),
        });

        return response;
    } catch (error: any) {
        console.error('Change password error:', error);
        throw new Error(error.message || 'Failed to change password');
    }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    try {
        const response = await publicApiRequest<{ message: string }>('/api/password-reset/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        return response;
    } catch (error: any) {
        console.error('Password reset request error:', error);
        throw new Error(error.message || 'Failed to send reset email');
    }
};

/**
 * Decode JWT token to get payload (without verification)
 */
export const decodeToken = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = async (): Promise<boolean> => {
    try {
        const token = await getAccessToken();

        if (!token) {
            return true;
        }

        const decoded = decodeToken(token);

        if (!decoded || !decoded.exp) {
            return true;
        }

        // Check if token expires in less than 5 minutes
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes

        return currentTime >= expirationTime - bufferTime;
    } catch (error) {
        return true;
    }
};