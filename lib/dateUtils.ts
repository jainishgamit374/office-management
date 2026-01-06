// lib/dateUtils.ts

/**
 * Convert a Date object or date string to backend format
 * Backend expects: "YYYY-MM-DDTHH:mm:ss" (ISO 8601 without Z)
 */
export const toBackendDateFormat = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Convert a date string in YYYY-MM-DD format to backend format with time
 * Defaults to 00:00:00 for time
 */
export const dateStringToBackendFormat = (dateString: string): string => {
    // If already in correct format, return as is
    if (dateString.includes('T')) {
        return dateString;
    }

    // Add time component (00:00:00)
    return `${dateString}T00:00:00`;
};

/**
 * Calculate working hours between check-in and check-out times
 * Returns format: "Xh Ym Zs" including seconds
 */
export const formatWorkingHours = (checkInTime: string | null, checkOutTime: string | null): string => {
    if (!checkInTime || !checkOutTime) {
        return '--';
    }

    try {
        const checkIn = new Date(checkInTime);
        const checkOut = new Date(checkOutTime);

        // Calculate difference in milliseconds
        const diffMs = checkOut.getTime() - checkIn.getTime();

        if (diffMs < 0) {
            return '--';
        }

        // Convert to seconds
        const totalSeconds = Math.floor(diffMs / 1000);

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    } catch (error) {
        console.error('Error calculating working hours:', error);
        return '--';
    }
};
