// lib/calendarEvents.ts
// Calendar events system for notifications

import { Notification } from '../components/Home/NotificationCard';

/**
 * Calendar Event Interface
 */
export interface CalendarEvent {
    id: string;
    type: 'birthday' | 'holiday' | 'announcement' | 'achievement';
    title: string;
    message: string;
    date: string;
    imageUrl?: string;
    imageLayout: 'horizontal' | 'banner';
    priority: 'high' | 'medium' | 'low';
    employeeName?: string;
    holidayName?: string;
}

/**
 * Sample calendar events data
 * In production, this would come from API endpoints
 */

// Birthday events with images
const BIRTHDAY_IMAGES = [
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80', // Birthday cake
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80', // Birthday celebration
    'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80', // Birthday balloons
];

// Holiday events with images
const HOLIDAY_IMAGES = {
    'Republic Day': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
    'Independence Day': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    'Diwali': 'https://images.unsplash.com/photo-1605641461241-f0b3f5e1e8c0?w=800&q=80',
    'Holi': 'https://images.unsplash.com/photo-1583241800698-c8e8e6e8e0c4?w=800&q=80',
    'Christmas': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80',
    'New Year': 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80',
};

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

/**
 * Get today's birthdays
 * In production, this would fetch from /employees/birthdays-today/ API
 */
export const getTodaysBirthdays = async (): Promise<CalendarEvent[]> => {
    // Sample data - replace with actual API call
    const sampleBirthdays = [
        { name: 'Rajesh Kumar', date: getTodayDate() },
        { name: 'Priya Sharma', date: getTodayDate() },
        { name: 'Amit Patel', date: getTodayDate() },
    ];

    return sampleBirthdays.map((birthday, index) => ({
        id: `birthday-${index}`,
        type: 'birthday',
        title: `🎉 Happy Birthday ${birthday.name}!`,
        message: `Wish ${birthday.name} a wonderful birthday today!`,
        date: 'Today',
        imageUrl: BIRTHDAY_IMAGES[index % BIRTHDAY_IMAGES.length],
        imageLayout: 'horizontal',
        priority: 'low', // Changed to low so birthdays appear last
        employeeName: birthday.name,
    }));
};

/**
 * Get today's holidays
 * In production, this would fetch from /calendar/holidays/ API
 */
export const getTodaysHolidays = async (): Promise<CalendarEvent[]> => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Sample holiday data - replace with actual API call
    const holidays: { [key: string]: { name: string; date: string } } = {
        '1-26': { name: 'Republic Day', date: 'January 26' },
        '8-15': { name: 'Independence Day', date: 'August 15' },
        '10-2': { name: 'Gandhi Jayanti', date: 'October 2' },
        '12-25': { name: 'Christmas', date: 'December 25' },
        '1-1': { name: 'New Year', date: 'January 1' },
    };

    const holidayKey = `${month}-${day}`;
    const todayHoliday = holidays[holidayKey];

    if (todayHoliday) {
        return [{
            id: 'holiday-today',
            type: 'holiday',
            title: `🎊 ${todayHoliday.name}`,
            message: `Happy ${todayHoliday.name}! Office is closed today. Enjoy the holiday!`,
            date: todayHoliday.date,
            imageUrl: HOLIDAY_IMAGES[todayHoliday.name as keyof typeof HOLIDAY_IMAGES] || HOLIDAY_IMAGES['Republic Day'],
            imageLayout: 'banner',
            priority: 'high',
            holidayName: todayHoliday.name,
        }];
    }

    return [];
};

/**
 * Get upcoming holidays (next 7 days)
 */
export const getUpcomingHolidays = async (): Promise<CalendarEvent[]> => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Sample upcoming holiday
    if (today.getMonth() === 0 && today.getDate() < 26) {
        return [{
            id: 'holiday-upcoming',
            type: 'holiday',
            title: '📅 Upcoming Holiday',
            message: 'Republic Day on January 26th. Office will be closed.',
            date: 'Jan 26',
            imageUrl: HOLIDAY_IMAGES['Republic Day'],
            imageLayout: 'horizontal',
            priority: 'medium',
            holidayName: 'Republic Day',
        }];
    }

    return [];
};

/**
 * Get active announcements
 * In production, this would fetch from /announcements/active/ API
 */
export const getActiveAnnouncements = async (): Promise<CalendarEvent[]> => {
    // Sample announcements - replace with actual API call
    const announcements = [
        {
            id: 'announcement-1',
            title: '📢 All-Hands Meeting',
            message: 'Quarterly review meeting tomorrow at 10 AM in Conference Room A.',
            imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
        },
        {
            id: 'announcement-2',
            title: '💼 Team Building Event',
            message: 'Join us for team building activities this Friday. RSVP by Wednesday!',
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        },
    ];

    return announcements.map(announcement => ({
        ...announcement,
        type: 'announcement',
        date: 'This Week',
        imageLayout: 'horizontal',
        priority: 'medium',
    }));
};

/**
 * Aggregate all calendar events
 * Returns events in priority order: Holidays → Announcements → Birthdays (last)
 */
export const aggregateCalendarEvents = async (): Promise<Notification[]> => {
    try {
        console.log('📅 Fetching calendar events...');

        const [birthdays, holidays, upcomingHolidays, announcements] = await Promise.all([
            getTodaysBirthdays(),
            getTodaysHolidays(),
            getUpcomingHolidays(),
            getActiveAnnouncements(),
        ]);

        // Combine all events - birthdays at the end
        const allEvents: CalendarEvent[] = [
            ...holidays,          // High priority - shown first
            ...announcements,     // Medium priority - shown second
            ...upcomingHolidays,  // Medium priority - shown third
            ...birthdays,         // Low priority - shown last
        ];

        // Convert to Notification format
        const notifications: Notification[] = allEvents.map(event => ({
            id: event.id,
            type: event.type === 'birthday' ? 'birthday' :
                event.type === 'holiday' ? 'holiday' : 'announcement',
            title: event.title,
            message: event.message,
            date: event.date,
            priority: event.priority,
            dismissible: true,
            imageUrl: event.imageUrl,
            imageLayout: event.imageLayout,
        }));

        console.log(`✅ Found ${notifications.length} calendar events`);
        return notifications;
    } catch (error) {
        console.error('❌ Error fetching calendar events:', error);
        return [];
    }
};

/**
 * Get sample events for testing
 */
export const getSampleCalendarEvents = (): Notification[] => {
    return [
        {
            id: 'sample-holiday',
            type: 'holiday',
            title: '🎊 Republic Day',
            message: 'Happy Republic Day! Office is closed today. Enjoy the holiday!',
            date: 'Jan 26',
            priority: 'high',
            dismissible: true,
            imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
            imageLayout: 'banner',
        },
        {
            id: 'sample-birthday-1',
            type: 'birthday',
            title: '🎉 Happy Birthday Rajesh!',
            message: 'Wish Rajesh Kumar a wonderful birthday today!',
            date: 'Today',
            priority: 'medium',
            dismissible: true,
            imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
            imageLayout: 'horizontal',
        },
        {
            id: 'sample-birthday-2',
            type: 'birthday',
            title: '🎉 Happy Birthday Priya!',
            message: 'Wish Priya Sharma a wonderful birthday today!',
            date: 'Today',
            priority: 'medium',
            dismissible: true,
            imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
            imageLayout: 'horizontal',
        },
        {
            id: 'sample-announcement',
            type: 'announcement',
            title: '📢 Team Meeting',
            message: 'All-hands meeting tomorrow at 10 AM in Conference Room A.',
            date: 'Tomorrow',
            priority: 'medium',
            dismissible: true,
            imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
            imageLayout: 'horizontal',
        },
    ];
};

export default {
    getTodaysBirthdays,
    getTodaysHolidays,
    getUpcomingHolidays,
    getActiveAnnouncements,
    aggregateCalendarEvents,
    getSampleCalendarEvents,
};
