import { aggregateCalendarEvents, getSampleCalendarEvents } from '@/lib/calendarEvents';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import NotificationCard, { Notification } from './NotificationCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NotificationBanner: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCalendarEvents();
    }, []);

    const loadCalendarEvents = async () => {
        try {
            setIsLoading(true);
            console.log('📅 Loading calendar events...');

            // Fetch calendar events
            const events = await aggregateCalendarEvents();

            // If no events, use sample events for demonstration
            if (events.length === 0) {
                console.log('ℹ️ No calendar events found, using sample events');
                setNotifications(getSampleCalendarEvents());
            } else {
                console.log(`✅ Loaded ${events.length} calendar events`);
                setNotifications(events);
            }
        } catch (error) {
            console.error('❌ Error loading calendar events:', error);
            // Fallback to sample events on error
            setNotifications(getSampleCalendarEvents());
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = (id: string) => {
        // Add notification ID to dismissed set
        setDismissedIds((prev) => new Set(prev).add(id));
    };

    const handlePress = (notification: Notification) => {
        console.log('Notification pressed:', notification);
        // Handle notification press - navigate to details, etc.
    };

    // Filter out dismissed notifications
    const visibleNotifications = notifications.filter((n) => !dismissedIds.has(n.id));

    if (visibleNotifications.length === 0) return null;

    // Generate a unique key for the carousel based on visible notifications
    // This forces the carousel to re-render when notifications are dismissed
    const carouselKey = visibleNotifications.map(n => n.id).join('-');

    return (
        <View style={styles.container}>
            <Carousel
                key={carouselKey} // Force re-render when notifications change
                loop={false} // Disable infinite scrolling
                width={SCREEN_WIDTH}
                height={120}
                autoPlay={false} // Disable auto-play
                data={visibleNotifications}
                scrollAnimationDuration={500}
                snapEnabled={true}
                pagingEnabled={true}
                overscrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <NotificationCard
                            notification={item}
                            onDismiss={handleDismiss}
                            onPress={handlePress}
                            enableSwipe={false}
                        />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 100,
        justifyContent: 'center',
        paddingVertical: 8,
    },
    cardWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
        marginHorizontal: 4,
    },
});

export default NotificationBanner;