// lib/timezone.ts - Timezone conversion utilities

/**
 * Convert UTC time to IST (Indian Standard Time)
 * IST = UTC + 5 hours 30 minutes
 */
export const convertUTCToIST = (utcDateString: string): Date => {
    // Parse the UTC date string
    const utcDate = new Date(utcDateString);

    // IST offset is +5:30 (5 hours 30 minutes = 330 minutes = 19800000 milliseconds)
    const istOffset = 5.5 * 60 * 60 * 1000; // 19800000 ms

    // Create IST date by adding offset
    const istTime = new Date(utcDate.getTime() + istOffset);

    return istTime;
};

/**
 * Format IST date to readable time string (HH:MM AM/PM)
 */
export const formatISTTime = (utcDateString: string): string => {
    const istDate = convertUTCToIST(utcDateString);

    return istDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};

/**
 * Format IST date to readable date string (DD MMM YYYY)
 */
export const formatISTDate = (utcDateString: string): string => {
    const istDate = convertUTCToIST(utcDateString);

    return istDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

/**
 * Format IST date and time together
 */
export const formatISTDateTime = (utcDateString: string): string => {
    const istDate = convertUTCToIST(utcDateString);

    return istDate.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};

/**
 * Get current IST time
 */
export const getCurrentIST = (): Date => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset);
};

/**
 * Get current IST time as formatted string
 */
export const getCurrentISTString = (): string => {
    return getCurrentIST().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};
