// lib/dateUtils.ts
import { parseAPIDateTime } from './attendance';

/**
 * Format working hours between two times
 */
export const formatWorkingHours = (
    punchInTime: string | null,
    punchOutTime: string | null
): string => {
    if (!punchInTime) return '--';

    const inTime = parseAPIDateTime(punchInTime);
    if (!inTime) return '--';

    let endTime: Date;

    if (punchOutTime) {
        const outTime = parseAPIDateTime(punchOutTime);
        if (!outTime) return '--';
        endTime = outTime;
    } else {
        // If not punched out, calculate from now
        endTime = new Date();
    }

    const diffMs = endTime.getTime() - inTime.getTime();

    if (diffMs < 0) return '--';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
};

/**
 * Check if a date is today
 */
export const isToday = (dateString: string | null): boolean => {
    if (!dateString) return false;

    const date = parseAPIDateTime(dateString);
    if (!date) return false;

    const today = new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

/**
 * Get formatted date string
 */
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};