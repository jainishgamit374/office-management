// lib/calendarApi.ts
// API functions for calendar events (holidays, announcements, events)

import { authApiRequest } from './api';

// ==================== HOLIDAYS ====================

export interface Holiday {
    id: number;
    name: string;
    date: string;
    description?: string;
    is_optional?: boolean;
}

export interface HolidaysResponse {
    status: string;
    statusCode: number;
    data: Holiday[];
}

/**
 * Get all holidays for the current year
 */
export const getHolidays = async (): Promise<HolidaysResponse> => {
    try {
        const response = await authApiRequest<HolidaysResponse>(
            '/calendar/holidays/',
            { method: 'GET' },
            true // silent mode - don't log errors for unimplemented endpoint
        );

        return response;
    } catch (error: any) {
        // Silently handle - this endpoint is not implemented yet
        // Fallback to local configuration will be used
        return {
            status: 'Error',
            statusCode: 500,
            data: [],
        };
    }
};

/**
 * Get today's holidays
 */
export const getTodaysHolidaysFromAPI = async (): Promise<Holiday[]> => {
    try {
        const response = await getHolidays();
        const today = new Date().toISOString().split('T')[0];

        if (response.data) {
            return response.data.filter(holiday => holiday.date === today);
        }

        return [];
    } catch (error) {
        console.error('❌ Error fetching today\'s holidays:', error);
        return [];
    }
};

// ==================== ANNOUNCEMENTS ====================

export interface Announcement {
    id: number;
    title: string;
    message: string;
    created_date: string;
    is_active: boolean;
    priority?: 'high' | 'medium' | 'low';
    image_url?: string;
}

export interface AnnouncementsResponse {
    status: string;
    statusCode: number;
    data: Announcement[];
}

/**
 * Get active announcements
 */
export const getAnnouncements = async (): Promise<AnnouncementsResponse> => {
    try {
        const response = await authApiRequest<AnnouncementsResponse>(
            '/announcements/active/',
            { method: 'GET' },
            true // silent mode - don't log errors for unimplemented endpoint
        );

        return response;
    } catch (error: any) {
        // Silently handle - this endpoint is not implemented yet
        // No announcements will be displayed
        return {
            status: 'Error',
            statusCode: 500,
            data: [],
        };
    }
};

// ==================== EVENTS ====================

export interface Event {
    id: number;
    title: string;
    description: string;
    event_date: string;
    event_type: 'meeting' | 'celebration' | 'training' | 'other';
    location?: string;
    image_url?: string;
}

export interface EventsResponse {
    status: string;
    statusCode: number;
    data: Event[];
}

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (days: number = 7): Promise<EventsResponse> => {
    try {
        console.log('📆 Fetching upcoming events...');

        const response = await authApiRequest<EventsResponse>(`/calendar/events/?days=${days}`, {
            method: 'GET',
        });

        console.log('✅ Events fetched successfully');
        return response;
    } catch (error: any) {
        console.error('❌ Events error:', error);
        // Return empty data if API fails
        return {
            status: 'Error',
            statusCode: 500,
            data: [],
        };
    }
};

export default {
    getHolidays,
    getTodaysHolidaysFromAPI,
    getAnnouncements,
    getUpcomingEvents,
};
