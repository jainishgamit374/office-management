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
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    password2?: string; // Confirm password (optional, will default to password)
    phone?: string;
    designation?: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface User {
    id: string | number;
    name?: string;
    username?: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
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

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique Employee ID from JWT token
 * Format: EMP-YYYYMM-XXXXX (e.g., EMP-202412-00042)
 */
export const generateEmployeeId = (token: string): string => {
    try {
        // Decode the JWT token to get payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);

        // Extract user_id from payload (Django JWT typically uses 'user_id')
        const userId = payload.user_id || payload.sub || payload.id || Date.now();

        // Get current date for the Employee ID
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // Create padded user ID (5 digits)
        const paddedId = String(userId).padStart(5, '0');

        // Generate Employee ID: EMP-YYYYMM-XXXXX
        return `EMP-${year}${month}-${paddedId}`;
    } catch (error) {
        console.error('Error generating Employee ID:', error);
        // Fallback: Generate based on timestamp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const randomId = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
        return `EMP-${year}${month}-${randomId}`;
    }
};

// ==================== AUTH FUNCTIONS ====================

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
    try {
        // Create form data for application/x-www-form-urlencoded
        const formData = new URLSearchParams({
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            password2: userData.password2 || userData.password,
            ...(userData.phone && { phone: userData.phone }),
            ...(userData.designation && { designation: userData.designation }),
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

            // Generate unique Employee ID from JWT token
            const employeeId = generateEmployeeId(data.token.access);

            // Extract and store user data
            const userDataToStore = {
                id: data.user?.id || data.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                email: userData.email,
                name: `${userData.first_name} ${userData.last_name}`,
                phone: userData.phone,
                designation: userData.designation,
                employeeId: employeeId,
            };
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userDataToStore));
            console.log('✅ Employee ID generated:', employeeId);

            // Try to sync Employee ID and profile data to the server
            try {
                await fetch('https://karmyog.pythonanywhere.com/api/profile/', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${data.token.access}`,
                    },
                    body: JSON.stringify({
                        employee_id: employeeId,
                        phone: userData.phone,
                        designation: userData.designation,
                    }),
                });
                console.log('✅ Profile data synced to server');
            } catch (syncError) {
                // Profile sync is optional, don't fail registration if it fails
                console.log('⚠️ Profile sync to server failed (optional):', syncError);
            }
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
        // Create form data for application/x-www-form-urlencoded
        const formData = new URLSearchParams({
            username: credentials.username,
            password: credentials.password,
        });

        console.log('🔐 Login attempt with:', {
            username: credentials.username
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

            // Get existing user data from storage (may have been set during registration)
            const existingUserData = await AsyncStorage.getItem(USER_KEY);
            const existingUser = existingUserData ? JSON.parse(existingUserData) : {};

            // Generate Employee ID if not present (for users who registered before this feature)
            const employeeId = data.user?.employeeId ||
                data.user?.employee_id ||
                existingUser.employeeId ||
                generateEmployeeId(data.token.access);

            // Extract and store user data from response - merge with existing data
            const userDataToStore = {
                id: data.user?.id || data.id || existingUser.id,
                username: data.user?.username || credentials.username || existingUser.username,
                email: data.user?.email || existingUser.email,
                first_name: data.user?.first_name || existingUser.first_name,
                last_name: data.user?.last_name || existingUser.last_name,
                name: data.user?.name ||
                    (data.user?.first_name && data.user?.last_name ? `${data.user.first_name} ${data.user.last_name}` : null) ||
                    existingUser.name ||
                    (existingUser.first_name && existingUser.last_name ? `${existingUser.first_name} ${existingUser.last_name}` : null) ||
                    credentials.username,
                phone: data.user?.phone || existingUser.phone,
                department: data.user?.department || existingUser.department,
                designation: data.user?.designation || existingUser.designation,
                employeeId: employeeId,
            };
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userDataToStore));
            console.log('✅ User data stored successfully with Employee ID:', employeeId);

            return {
                access: data.token.access,
                refresh: data.token.refresh,
                user: userDataToStore,
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
                username: credentials.username,
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

        // Normalize some fields if backend uses different keys
        const normalized: User = {
            id: (response as any).id ?? (response as any).pk ?? (response as any).user_id,
            name: (response as any).name ?? (response as any).full_name ?? (response as any).first_name,
            username: (response as any).username,
            email: (response as any).email,
            phone: (response as any).phone ?? (response as any).mobile,
            department: (response as any).department,
            designation: (response as any).designation,
            employeeId: (response as any).employeeId ?? (response as any).employee_id,
            first_name: (response as any).first_name,
            last_name: (response as any).last_name,
        };

        // Store updated user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized));

        return normalized;
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

        // Normalize and update stored user data
        const normalized: User = {
            id: (response as any).id ?? (response as any).pk ?? (response as any).user_id,
            name: (response as any).name ?? (response as any).full_name ?? (response as any).first_name,
            username: (response as any).username,
            email: (response as any).email,
            phone: (response as any).phone ?? (response as any).mobile,
            department: (response as any).department,
            designation: (response as any).designation,
            employeeId: (response as any).employeeId ?? (response as any).employee_id,
            first_name: (response as any).first_name,
            last_name: (response as any).last_name,
        };

        await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized));

        return normalized;
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