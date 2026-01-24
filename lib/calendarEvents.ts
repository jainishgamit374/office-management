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
    'Dhuleti': 'https://images.unsplash.com/photo-1583241800698-c8e8e6e8e0c4?w=800&q=80', // Same as Holi
    'Christmas': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80',
    'New Year': 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80',
    'Uttarayan': 'https://images.unsplash.com/photo-1516361839211-1c36b85d9284?w=800&q=80', // Kite festival image
    'Uttarayan (Vasi)': 'https://images.unsplash.com/photo-1516361839211-1c36b85d9284?w=800&q=80',
    'Maha Shivaratri': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80', // Temple/spiritual image
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
        '1-14': { name: 'Uttarayan', date: 'January 14' },
        '1-15': { name: 'Uttarayan (Vasi)', date: 'January 15' },
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
 * Get upcoming holidays (current month and next month only)
 * Filters out events that have already passed
 */
export const getUpcomingHolidays = async (): Promise<CalendarEvent[]> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Calculate the end of next month
    const nextMonth = (currentMonth + 1) % 12;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const endOfNextMonth = new Date(nextMonthYear, nextMonth + 1, 0, 23, 59, 59); // Last day of next month

    const events: CalendarEvent[] = [];

    // Comprehensive list of holidays throughout the year
    const allHolidays = [
        { name: 'New Year', month: 0, day: 1, dateStr: 'Jan 1' },
        { name: 'Uttarayan', month: 0, day: 14, dateStr: 'Jan 14' },
        { name: 'Uttarayan (Vasi)', month: 0, day: 15, dateStr: 'Jan 15' },
        { name: 'Republic Day', month: 0, day: 26, dateStr: 'Jan 26' },
        { name: 'Maha Shivaratri', month: 1, day: 26, dateStr: 'Feb 26' },
        { name: 'Holi', month: 2, day: 14, dateStr: 'Mar 14' },
        { name: 'Dhuleti', month: 2, day: 15, dateStr: 'Mar 15' },
        { name: 'Good Friday', month: 3, day: 18, dateStr: 'Apr 18' },
        { name: 'Ambedkar Jayanti', month: 3, day: 14, dateStr: 'Apr 14' },
        { name: 'May Day', month: 4, day: 1, dateStr: 'May 1' },
        { name: 'Eid ul-Fitr', month: 4, day: 2, dateStr: 'May 2' },
        { name: 'Rath Yatra', month: 6, day: 7, dateStr: 'Jul 7' },
        { name: 'Independence Day', month: 7, day: 15, dateStr: 'Aug 15' },
        { name: 'Raksha Bandhan', month: 7, day: 19, dateStr: 'Aug 19' },
        { name: 'Janmashtami', month: 7, day: 26, dateStr: 'Aug 26' },
        { name: 'Ganesh Chaturthi', month: 8, day: 7, dateStr: 'Sep 7' },
        { name: 'Gandhi Jayanti', month: 9, day: 2, dateStr: 'Oct 2' },
        { name: 'Navratri', month: 9, day: 3, dateStr: 'Oct 3' },
        { name: 'Dussehra', month: 9, day: 12, dateStr: 'Oct 12' },
        { name: 'Diwali', month: 10, day: 1, dateStr: 'Nov 1' },
        { name: 'Bhai Dooj', month: 10, day: 3, dateStr: 'Nov 3' },
        { name: 'Guru Nanak Jayanti', month: 10, day: 15, dateStr: 'Nov 15' },
        { name: 'Christmas', month: 11, day: 25, dateStr: 'Dec 25' },
    ];

    allHolidays.forEach(holiday => {
        // Create date object for this holiday in current year
        let holidayDate = new Date(currentYear, holiday.month, holiday.day);
        holidayDate.setHours(0, 0, 0, 0);

        // If date has passed this year, check next year
        if (holidayDate < today) {
            holidayDate = new Date(currentYear + 1, holiday.month, holiday.day);
        }

        // Only include if:
        // 1. The event hasn't passed (is today or in the future)
        // 2. The event is within current month or next month
        if (holidayDate >= today && holidayDate <= endOfNextMonth) {
            const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[holidayDate.getDay()];
            const year = holidayDate.getFullYear();
            
            let timeMessage: string;
            if (daysUntil === 0) {
                timeMessage = 'today';
            } else if (daysUntil === 1) {
                timeMessage = 'tomorrow';
            } else if (daysUntil < 7) {
                timeMessage = `in ${daysUntil} days`;
            } else {
                timeMessage = `on ${holiday.dateStr}`;
            }

            events.push({
                id: `holiday-${holiday.name.replace(/\s+/g, '-').toLowerCase()}`,
                type: 'holiday',
                title: daysUntil === 0 ? `🎊 ${holiday.name}` : `📅 ${holiday.name}`,
                message: daysUntil === 0 
                    ? `Happy ${holiday.name}! Enjoy the holiday!`
                    : `${holiday.name} is coming up ${timeMessage}. Plan your schedule accordingly!`,
                date: `${dayName}, ${holiday.dateStr}, ${year}`,
                imageUrl: HOLIDAY_IMAGES[holiday.name as keyof typeof HOLIDAY_IMAGES] || HOLIDAY_IMAGES['Republic Day'],
                imageLayout: daysUntil === 0 ? 'banner' : 'horizontal',
                priority: daysUntil === 0 ? 'high' : 'medium',
                holidayName: holiday.name,
            });
        }
    });

    // Sort by date (closest first)
    events.sort((a, b) => {
        const dateA = new Date(currentYear, getMonthIndex(a.date), parseInt(a.date.split(' ')[1]));
        const dateB = new Date(currentYear, getMonthIndex(b.date), parseInt(b.date.split(' ')[1]));
        return dateA.getTime() - dateB.getTime();
    });

    return events;
};

/**
 * Helper function to get month index from date string
 */
const getMonthIndex = (dateStr: string): number => {
    const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const monthStr = dateStr.split(' ')[0];
    return months[monthStr] || 0;
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
 * Get new employee notifications
 * In production, this would fetch from /employees/recent-joiners/ API
 */
export const getNewEmployeeNotifications = async (): Promise<CalendarEvent[]> => {
    // Sample new employees - replace with actual API call
    // This would typically fetch employees who joined in the last 7 days
    const newEmployees = [
        {
            name: 'Sneha Desai',
            department: 'Engineering',
            joinDate: 'Jan 20, 2026',
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
        },
        {
            name: 'Karan Mehta',
            department: 'Marketing',
            joinDate: 'Jan 18, 2026',
            imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
        },
    ];

    return newEmployees.map((employee, index) => ({
        id: `new-employee-${index}`,
        type: 'announcement',
        title: `👋 Welcome ${employee.name}!`,
        message: `${employee.name} joined the ${employee.department} team on ${employee.joinDate}. Let's give them a warm welcome!`,
        date: employee.joinDate,
        imageUrl: employee.imageUrl,
        imageLayout: 'horizontal',
        priority: 'medium',
        employeeName: employee.name,
    }));
};

/**
 * Aggregate all calendar events
 * Returns events in priority order: Holidays → Announcements → Birthdays (last)
 */
export const aggregateCalendarEvents = async (): Promise<Notification[]> => {
    try {
        console.log('📅 Fetching calendar events...');

        const [birthdays, holidays, upcomingHolidays, announcements, newEmployees] = await Promise.all([
            getTodaysBirthdays(),
            getTodaysHolidays(),
            getUpcomingHolidays(),
            getActiveAnnouncements(),
            getNewEmployeeNotifications(),
        ]);

        // Combine all events (excluding birthdays - shown in separate section)
        const allEvents: CalendarEvent[] = [
            ...holidays,          // High priority - shown first
            ...newEmployees,      // Medium priority - new employees
            ...announcements,     // Medium priority - shown second
            ...upcomingHolidays,  // Medium priority - shown third
            // Birthdays removed - displayed in dedicated AllBirthdays section
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
 * Dynamically generates events based on current date - only shows current and next month events
 */
export const getSampleCalendarEvents = (): Notification[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Calculate end of next month
    const nextMonth = (currentMonth + 1) % 12;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const endOfNextMonth = new Date(nextMonthYear, nextMonth + 1, 0, 23, 59, 59);

    // Define all sample holidays with their dates
    const sampleHolidays = [
        { id: 'sample-holiday-newyear', name: 'New Year', month: 0, day: 1, emoji: '🎉' },
        { id: 'sample-holiday-uttarayan', name: 'Uttarayan', month: 0, day: 14, emoji: '🪁' },
        { id: 'sample-holiday-republic', name: 'Republic Day', month: 0, day: 26, emoji: '🇮🇳' },
        { id: 'sample-holiday-shivaratri', name: 'Maha Shivaratri', month: 1, day: 26, emoji: '🙏' },
        { id: 'sample-holiday-holi', name: 'Holi', month: 2, day: 14, emoji: '🎨' },
        { id: 'sample-holiday-dhuleti', name: 'Dhuleti', month: 2, day: 15, emoji: '🔥' },
        { id: 'sample-holiday-goodfriday', name: 'Good Friday', month: 3, day: 18, emoji: '✝️' },
        { id: 'sample-holiday-mayday', name: 'May Day', month: 4, day: 1, emoji: '👷' },
        { id: 'sample-holiday-eid', name: 'Eid ul-Fitr', month: 4, day: 2, emoji: '🌙' },
        { id: 'sample-holiday-independence', name: 'Independence Day', month: 7, day: 15, emoji: '🇮🇳' },
        { id: 'sample-holiday-raksha', name: 'Raksha Bandhan', month: 7, day: 19, emoji: '🎀' },
        { id: 'sample-holiday-janmashtami', name: 'Janmashtami', month: 7, day: 26, emoji: '🪈' },
        { id: 'sample-holiday-ganesh', name: 'Ganesh Chaturthi', month: 8, day: 7, emoji: '🐘' },
        { id: 'sample-holiday-gandhi', name: 'Gandhi Jayanti', month: 9, day: 2, emoji: '🕊️' },
        { id: 'sample-holiday-navratri', name: 'Navratri', month: 9, day: 3, emoji: '💃' },
        { id: 'sample-holiday-dussehra', name: 'Dussehra', month: 9, day: 12, emoji: '🏹' },
        { id: 'sample-holiday-diwali', name: 'Diwali', month: 10, day: 1, emoji: '🪔' },
        { id: 'sample-holiday-christmas', name: 'Christmas', month: 11, day: 25, emoji: '🎄' },
    ];

    const notifications: Notification[] = [];

    sampleHolidays.forEach(holiday => {
        let holidayDate = new Date(currentYear, holiday.month, holiday.day);
        holidayDate.setHours(0, 0, 0, 0);

        // If date has passed this year, check next year
        if (holidayDate < today) {
            holidayDate = new Date(currentYear + 1, holiday.month, holiday.day);
        }

        // Only include if event is today or in the future AND within current/next month
        if (holidayDate >= today && holidayDate <= endOfNextMonth) {
            const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dayName = dayNames[holidayDate.getDay()];
            const year = holidayDate.getFullYear();
            const dateStr = `${dayName}, ${monthNames[holiday.month]} ${holiday.day}, ${year}`;
            
            const isToday = daysUntil === 0;

            notifications.push({
                id: holiday.id,
                type: 'holiday',
                title: isToday ? `${holiday.emoji} ${holiday.name}` : `📅 ${holiday.name}`,
                message: isToday 
                    ? `Happy ${holiday.name}! Enjoy the holiday!`
                    : `${holiday.name} is coming up ${daysUntil === 1 ? 'tomorrow' : daysUntil < 7 ? `in ${daysUntil} days` : `on ${dateStr}`}. Plan your schedule accordingly!`,
                date: dateStr,
                priority: isToday ? 'high' : 'medium',
                dismissible: true,
                imageUrl: HOLIDAY_IMAGES[holiday.name as keyof typeof HOLIDAY_IMAGES] || HOLIDAY_IMAGES['Republic Day'],
                imageLayout: isToday ? 'banner' : 'horizontal',
            });
        }
    });

    return notifications;
};

export default {
    getTodaysBirthdays,
    getTodaysHolidays,
    getUpcomingHolidays,
    getActiveAnnouncements,
    getNewEmployeeNotifications,
    aggregateCalendarEvents,
    getSampleCalendarEvents,
};
