// lib/dailyEvents.ts
// Daily events system with rotating notifications

import { Notification } from '../components/Home/NotificationCard';

/**
 * Get day of year (1-365/366)
 */
const getDayOfYear = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

/**
 * Daily events pool - rotates based on day of year
 * Images from Unsplash (free to use)
 */
export const DAILY_EVENTS: Notification[] = [
    // Birthday Celebrations - Multiple unique messages
    {
        id: 'event-1',
        type: 'birthday',
        title: '🎉 Birthday Celebration!',
        message: 'Join us in celebrating team birthdays today at 4 PM in the cafeteria!',
        date: 'Today',
        priority: 'medium',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
        imageLayout: 'banner',
    },
    {
        id: 'event-2',
        type: 'birthday',
        title: '🎂 Happy Birthday!',
        message: 'Wishing our amazing team members a wonderful birthday. Cake cutting at 3 PM!',
        date: 'Today',
        priority: 'low',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
        imageLayout: 'horizontal',
    },
    {
        id: 'event-birthday-3',
        type: 'birthday',
        title: '🎈 Special Birthday Wishes!',
        message: 'May this special day bring you endless joy and wonderful memories. Celebrate with us at 5 PM!',
        date: 'Today',
        priority: 'medium',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
        imageLayout: 'banner',
    },
    {
        id: 'event-birthday-4',
        type: 'birthday',
        title: '🎊 Birthday Bash!',
        message: 'Another year older, another year wiser! Join the birthday celebration in the lounge at 2:30 PM.',
        date: 'Today',
        priority: 'low',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80',
        imageLayout: 'horizontal',
    },
    {
        id: 'event-birthday-5',
        type: 'birthday',
        title: '🥳 Cheers to Another Year!',
        message: 'Celebrating the wonderful people who make our team special. Birthday treats at 4:30 PM!',
        date: 'Today',
        priority: 'medium',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80',
        imageLayout: 'banner',
    },
    {
        id: 'event-birthday-6',
        type: 'birthday',
        title: '🎁 Birthday Surprise!',
        message: 'Wishing you a fantastic birthday filled with laughter and happiness. Party starts at 3:30 PM!',
        date: 'Today',
        priority: 'low',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80',
        imageLayout: 'horizontal',
    },

    // Holidays & Celebrations
    {
        id: 'event-3',
        type: 'holiday',
        title: '🎊 Upcoming Holiday',
        message: 'Office will be closed on Republic Day (Jan 26). Enjoy the long weekend!',
        date: 'Jan 26',
        priority: 'high',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
        imageLayout: 'banner',
    },
    {
        id: 'event-4',
        type: 'holiday',
        title: '🌸 Festival Celebration',
        message: 'Join us for Diwali celebrations! Traditional dress code encouraged.',
        date: 'Tomorrow',
        priority: 'medium',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1605641461241-f0b3f5e1e8c0?w=800&q=80',
        imageLayout: 'banner',
    },

    // Announcements & Meetings
    {
        id: 'event-5',
        type: 'announcement',
        title: '📢 All-Hands Meeting',
        message: 'Quarterly review meeting scheduled for tomorrow at 10 AM in Conference Room A.',
        date: 'Tomorrow',
        priority: 'high',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
        imageLayout: 'horizontal',
    },
    {
        id: 'event-6',
        type: 'announcement',
        title: '💼 Team Building Event',
        message: 'Join us for a fun team building activity this Friday. RSVP by Wednesday!',
        date: 'Friday',
        priority: 'medium',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        imageLayout: 'banner',
    },

    // Achievements & Milestones
    {
        id: 'event-7',
        type: 'announcement',
        title: '🏆 Milestone Achieved!',
        message: 'Congratulations! Our team has successfully completed 100 projects this year!',
        date: 'Today',
        priority: 'high',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        imageLayout: 'banner',
    },
    {
        id: 'event-8',
        type: 'announcement',
        title: '⭐ Employee of the Month',
        message: 'Congratulations to Sarah Johnson for being our Employee of the Month!',
        date: 'Today',
        priority: 'medium',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
        imageLayout: 'horizontal',
    },

    // Work Updates
    {
        id: 'event-9',
        type: 'half_day',
        title: '⏰ Half Day Notice',
        message: 'Office will close at 2:00 PM today for system maintenance. Plan accordingly!',
        date: 'Today',
        priority: 'high',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
        imageLayout: 'horizontal',
    },
    {
        id: 'event-10',
        type: 'announcement',
        title: '🔧 System Upgrade',
        message: 'Our attendance system will be upgraded tonight. Expect brief downtime.',
        date: 'Tonight',
        priority: 'medium',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
        imageLayout: 'banner',
    },

    // Wellness & Tips
    {
        id: 'event-11',
        type: 'announcement',
        title: '💪 Wellness Wednesday',
        message: 'Join our yoga session at 5 PM. Take care of your health and well-being!',
        date: 'Today 5 PM',
        priority: 'low',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
        imageLayout: 'banner',
    },
    {
        id: 'event-12',
        type: 'announcement',
        title: '☕ Coffee Break Reminder',
        message: 'Remember to take regular breaks! A fresh mind is a productive mind.',
        date: 'Today',
        priority: 'low',
        dismissible: true,
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
        imageLayout: 'horizontal',
    },
];

/**
 * Get today's event based on day of year
 * Rotates through the events pool
 */
export const getTodaysEvent = (): Notification => {
    const dayOfYear = getDayOfYear();
    const eventIndex = dayOfYear % DAILY_EVENTS.length;
    return DAILY_EVENTS[eventIndex];
};

/**
 * Get multiple events for the banner (today's + next 2)
 */
export const getBannerEvents = (count: number = 3): Notification[] => {
    const dayOfYear = getDayOfYear();
    const events: Notification[] = [];

    for (let i = 0; i < count; i++) {
        const eventIndex = (dayOfYear + i) % DAILY_EVENTS.length;
        events.push(DAILY_EVENTS[eventIndex]);
    }

    return events;
};

/**
 * Get events by type
 */
export const getEventsByType = (type: Notification['type']): Notification[] => {
    return DAILY_EVENTS.filter(event => event.type === type);
};

/**
 * Get random event
 */
export const getRandomEvent = (): Notification => {
    const randomIndex = Math.floor(Math.random() * DAILY_EVENTS.length);
    return DAILY_EVENTS[randomIndex];
};

export default {
    DAILY_EVENTS,
    getTodaysEvent,
    getBannerEvents,
    getEventsByType,
    getRandomEvent,
};
