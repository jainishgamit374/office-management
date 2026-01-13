// lib/indianHolidays.ts
// Indian calendar holidays using date-holidays package

import Holidays from 'date-holidays';

/**
 * Indian Holiday Interface
 */
export interface IndianHoliday {
    date: string; // YYYY-MM-DD format
    name: string;
    type: 'public' | 'bank' | 'school' | 'optional' | 'observance';
    note?: string;
}

/**
 * Initialize holidays for India
 */
const initIndianHolidays = () => {
    const hd = new Holidays('IN'); // India country code
    return hd;
};

/**
 * Get all Indian holidays for a specific year
 */
export const getIndianHolidaysForYear = (year: number = new Date().getFullYear()): IndianHoliday[] => {
    try {
        const hd = initIndianHolidays();
        const holidays = hd.getHolidays(year);

        return holidays.map((holiday: any) => ({
            date: holiday.date.split(' ')[0], // Extract YYYY-MM-DD
            name: holiday.name,
            type: (holiday.type || 'public') as 'public' | 'bank' | 'school' | 'optional' | 'observance',
            note: holiday.note || undefined,
        }));
    } catch (error) {
        console.error('Error fetching Indian holidays:', error);
        return [];
    }
};

/**
 * Get today's Indian holidays
 */
export const getTodaysIndianHolidays = (): IndianHoliday[] => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const allHolidays = getIndianHolidaysForYear(today.getFullYear());
        return allHolidays.filter(holiday => holiday.date === todayStr);
    } catch (error) {
        console.error('Error fetching today\'s Indian holidays:', error);
        return [];
    }
};

/**
 * Check if a specific date is a holiday
 */
export const isHoliday = (date: Date): boolean => {
    try {
        const hd = initIndianHolidays();
        const holidays = hd.isHoliday(date);
        return holidays !== false && holidays.length > 0;
    } catch (error) {
        console.error('Error checking if date is holiday:', error);
        return false;
    }
};

/**
 * Get upcoming holidays (next N days)
 */
export const getUpcomingIndianHolidays = (days: number = 30): IndianHoliday[] => {
    try {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days);

        const allHolidays = getIndianHolidaysForYear(today.getFullYear());
        const todayStr = today.toISOString().split('T')[0];
        const futureStr = futureDate.toISOString().split('T')[0];

        return allHolidays.filter(holiday =>
            holiday.date >= todayStr && holiday.date <= futureStr
        );
    } catch (error) {
        console.error('Error fetching upcoming Indian holidays:', error);
        return [];
    }
};

/**
 * Get holidays for a specific month
 */
export const getHolidaysForMonth = (year: number, month: number): IndianHoliday[] => {
    try {
        const allHolidays = getIndianHolidaysForYear(year);
        const monthStr = month.toString().padStart(2, '0');

        return allHolidays.filter(holiday => {
            const holidayMonth = holiday.date.split('-')[1];
            return holidayMonth === monthStr;
        });
    } catch (error) {
        console.error('Error fetching holidays for month:', error);
        return [];
    }
};

/**
 * Get holiday name for a specific date
 */
export const getHolidayName = (date: Date): string | null => {
    try {
        const hd = initIndianHolidays();
        const holidays = hd.isHoliday(date);

        if (holidays && holidays.length > 0) {
            return holidays[0].name;
        }

        return null;
    } catch (error) {
        console.error('Error getting holiday name:', error);
        return null;
    }
};

/**
 * Get major Indian festivals and holidays
 * This includes both fixed and variable date holidays
 */
export const getMajorIndianFestivals = (year: number = new Date().getFullYear()): IndianHoliday[] => {
    try {
        const allHolidays = getIndianHolidaysForYear(year);

        // Filter for major public holidays
        return allHolidays.filter(holiday =>
            holiday.type === 'public' ||
            holiday.name.includes('Diwali') ||
            holiday.name.includes('Holi') ||
            holiday.name.includes('Dussehra') ||
            holiday.name.includes('Eid') ||
            holiday.name.includes('Christmas') ||
            holiday.name.includes('Republic Day') ||
            holiday.name.includes('Independence Day') ||
            holiday.name.includes('Gandhi Jayanti')
        );
    } catch (error) {
        console.error('Error fetching major Indian festivals:', error);
        return [];
    }
};

export default {
    getIndianHolidaysForYear,
    getTodaysIndianHolidays,
    isHoliday,
    getUpcomingIndianHolidays,
    getHolidaysForMonth,
    getHolidayName,
    getMajorIndianFestivals,
};
