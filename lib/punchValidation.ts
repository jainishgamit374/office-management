// lib/punchValidation.ts
import { getMinutesEarly, getMinutesLate, isEarlyCheckOut, isLateCheckIn } from './attendance';

export interface PunchValidationResult {
    isValid: boolean;
    warning?: string;
    isLate?: boolean;
    isEarly?: boolean;
    minutesLate?: number;
    minutesEarly?: number;
    threshold?: string;
}

/**
 * Validate punch time and return warning if late/early
 * @param punchType - 'IN' or 'OUT'
 * @param date - Date to validate (defaults to current time)
 * @returns Validation result with warning message if applicable
 */
export const validatePunchTime = (
    punchType: 'IN' | 'OUT',
    date: Date = new Date()
): PunchValidationResult => {
    if (punchType === 'IN') {
        const late = isLateCheckIn(date);
        const minutesLate = getMinutesLate(date);

        if (late) {
            return {
                isValid: true,
                isLate: true,
                minutesLate,
                threshold: '9:30 AM',
                warning: `⚠️ Late Check-In Alert\n\nYou are checking in ${minutesLate} minute${minutesLate > 1 ? 's' : ''} after 9:30 AM.\n\nThis will be marked as a late check-in and may affect your attendance record.`,
            };
        }

        return {
            isValid: true,
            isLate: false,
        };
    } else {
        const early = isEarlyCheckOut(date);
        const minutesEarly = getMinutesEarly(date);

        if (early) {
            return {
                isValid: true,
                isEarly: true,
                minutesEarly,
                threshold: '6:30 PM',
                warning: `⚠️ Early Check-Out Alert\n\nYou are checking out ${minutesEarly} minute${minutesEarly > 1 ? 's' : ''} before 6:30 PM.\n\nThis will be marked as an early check-out and may affect your attendance record.`,
            };
        }

        return {
            isValid: true,
            isEarly: false,
        };
    }
};

/**
 * Format validation warning for display
 */
export const formatValidationWarning = (validation: PunchValidationResult): string => {
    if (!validation.warning) return '';
    return validation.warning;
};

/**
 * Check if current time is within office hours (9:30 AM - 6:30 PM IST)
 */
export const isWithinOfficeHours = (date: Date = new Date()): boolean => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);

    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();
    const currentMinutes = hours * 60 + minutes;

    const startMinutes = 9 * 60 + 30; // 9:30 AM
    const endMinutes = 18 * 60 + 30; // 6:30 PM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Get current IST time formatted for display
 */
export const getCurrentISTTimeFormatted = (): string => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    return istDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};
