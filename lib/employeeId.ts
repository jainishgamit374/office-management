import AsyncStorage from '@react-native-async-storage/async-storage';

const EMPLOYEE_ID_KEY = 'employee_id';

/**
 * Generate a unique employee ID based on email
 * Format: EMP-YYYYMM-XXXXX
 * Example: EMP-202512-12345
 */
export const generateEmployeeId = (email: string): string => {
    try {
        // Get current date
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // Create a hash from email for unique ID
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        // Convert to positive number and pad to 5 digits
        const uniqueId = String(Math.abs(hash) % 100000).padStart(5, '0');

        return `EMP-${year}${month}-${uniqueId}`;
    } catch (error) {
        console.error('Error generating employee ID:', error);
        // Fallback: Generate based on timestamp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const randomId = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
        return `EMP-${year}${month}-${randomId}`;
    }
};

/**
 * Store employee ID
 */
export const storeEmployeeId = async (employeeId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(EMPLOYEE_ID_KEY, employeeId);
        console.log('✅ Employee ID stored:', employeeId);
    } catch (error) {
        console.error('Error storing employee ID:', error);
    }
};

/**
 * Get stored employee ID
 */
export const getEmployeeId = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(EMPLOYEE_ID_KEY);
    } catch (error) {
        console.error('Error getting employee ID:', error);
        return null;
    }
};

/**
 * Generate and store employee ID if not exists
 */
export const ensureEmployeeId = async (email: string): Promise<string> => {
    try {
        // Check if employee ID already exists
        let employeeId = await getEmployeeId();

        if (!employeeId) {
            // Generate new employee ID
            employeeId = generateEmployeeId(email);
            await storeEmployeeId(employeeId);
            console.log('🆔 Generated new employee ID:', employeeId);
        }

        return employeeId;
    } catch (error) {
        console.error('Error ensuring employee ID:', error);
        // Return generated ID even if storage fails
        return generateEmployeeId(email);
    }
};
