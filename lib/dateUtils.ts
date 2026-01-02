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
