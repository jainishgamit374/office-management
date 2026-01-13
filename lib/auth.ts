// lib/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    authApiRequest,
    clearAuthData,
    getAccessToken,
    getRefreshToken,
    publicApiRequest,
    storeTokens,
    USER_KEY
} from './api';

// Re-export commonly used functions
export { getAccessToken, getRefreshToken };

// ==================== TYPES ====================

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string; // Format: YYYY-MM-DD
    joining_date: string; // Format: YYYY-MM-DD
    password: string;
    confirm_password: string;
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
    is_admin?: boolean; // Admin role flag
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
        console.log('🔵 Starting registration process...');
        console.log('📋 User data received:', {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            date_of_birth: userData.date_of_birth,
            joining_date: userData.joining_date,
        });

        // Create JSON payload for application/json
        const requestBody = {
            FName: userData.first_name,
            LName: userData.last_name,
            Email: userData.email,
            DOB: userData.date_of_birth,
            JoiningDate: userData.joining_date,
            Password: userData.password,
            ConfirmPassword: userData.confirm_password,
        };

        console.log('📤 Sending request to API...');
        console.log('🔗 URL: https://karmyog.pythonanywhere.com/register/');
        console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://karmyog.pythonanywhere.com/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log('📡 Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
        });

        const contentType = response.headers.get('content-type');
        console.log('📄 Content-Type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Server returned non-JSON response:', text.slice(0, 200));
            throw new Error(`Server returned HTML instead of JSON: ${text.slice(0, 200)}`);
        }

        const data = await response.json();
        console.log('📊 Response data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('❌ Registration failed with status:', response.status);
            console.error('❌ Error data:', data);

            // Handle validation errors
            if (data.errors && typeof data.errors === 'object') {
                const errorMessages = Object.entries(data.errors)
                    .map(([field, messages]) => {
                        const msgArray = Array.isArray(messages) ? messages : [messages];
                        return `${field}: ${msgArray.join(', ')}`;
                    })
                    .join('\n');
                throw new Error(errorMessages || data.message || 'Validation failed');
            }

            const errorMessage = data.message || `Registration failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        console.log('✅ Registration API call successful');

        // Store tokens if registration is successful
        if (data.status === 'Success' && data.data) {
            console.log('💾 Storing user data...');

            // Extract user data from response
            const userDataToStore = {
                id: data.data.UserID,
                employee_id: data.data.EmpMasterID,
                email: data.data.Email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                name: `${userData.first_name} ${userData.last_name}`,
                date_of_birth: userData.date_of_birth,
                joining_date: userData.joining_date,
            };
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userDataToStore));
            console.log('✅ User data stored in AsyncStorage');
            console.log('🆔 Employee ID:', data.data.EmpMasterID);
        } else {
            console.warn('⚠️ No user data in response');
        }

        console.log('🎉 Registration process completed successfully');
        return {
            success: data.status === 'Success',
            message: data.message,
        };
    } catch (error: any) {
        console.error('❌ Registration error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        throw new Error(error.message || 'Registration failed. Please try again.');
    }
};

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginData): Promise<LoginResponse> => {
    try {
        const requestBody = {
            Email: credentials.username, // username field contains email
            Password: credentials.password,
        };

        console.log('🔐 Login attempt with:', {
            email: credentials.username
        });

        const response = await fetch('https://karmyog.pythonanywhere.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
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

            // Handle specific error status codes
            if (response.status === 423) {
                throw new Error(data.message || 'Account locked due to too many failed attempts. Try again later.');
            }

            const errorMessage = data.message || data.error || `Login failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        // Check for successful response structure
        console.log('✅ Login successful, checking response structure...');
        console.log('Response structure:', {
            hasStatus: 'status' in data,
            hasData: 'data' in data,
            hasAccessToken: data.data ? 'access_token' in data.data : false,
            hasRefreshToken: data.data ? 'refresh_token' in data.data : false,
        });

        // Store JWT tokens and user data
        if (data.status === 'Success' && data.data && data.data.access_token) {
            await storeTokens(data.data.access_token, data.data.refresh_token);
            console.log('✅ JWT tokens stored successfully');

            // Generate unique employee ID
            const { ensureEmployeeId } = await import('./employeeId');
            const employeeId = await ensureEmployeeId(data.data.Email);

            // Extract and store user data from response
            const userDataToStore = {
                id: data.data.UserID,
                employee_id: data.data.EmpMasterID,
                employeeId: employeeId, // Add generated employee ID
                email: data.data.Email,
                first_name: data.data.FirstName,
                last_name: data.data.LastName,
                name: `${data.data.FirstName} ${data.data.LastName}`,
                profile_image: data.data.ProfileImage,
            };
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userDataToStore));
            console.log('✅ User data stored successfully');
            console.log('🆔 Employee ID:', employeeId);

            // Store user email separately for attendance tracking
            await AsyncStorage.setItem('@user_email', data.data.Email);
            console.log('✅ User email stored for attendance tracking');

            return {
                access: data.data.access_token,
                refresh: data.data.refresh_token,
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
 * Logout user - invalidate tokens and clear all stored data
 */
export const logout = async (): Promise<void> => {
    try {
        // Get tokens before clearing
        const refreshToken = await getRefreshToken();
        const accessToken = await getAccessToken();

        // Call logout endpoint to invalidate tokens on server
        if (refreshToken && accessToken) {
            console.log('🔐 Calling logout API to invalidate tokens...');

            try {
                const response = await fetch('https://karmyog.pythonanywhere.com/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        refresh_token: refreshToken,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('✅ Server logout successful:', data.message);
                } else {
                    console.warn('⚠️ Server logout failed, but continuing with local cleanup:', data.message);
                }
            } catch (apiError) {
                console.warn('⚠️ Logout API call failed, but continuing with local cleanup:', apiError);
            }
        } else {
            console.log('⚠️ No tokens found, skipping API call');
        }

        // Always clear local data regardless of API call result
        await clearAuthData();
        console.log('✅ User logged out successfully - local data cleared');
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