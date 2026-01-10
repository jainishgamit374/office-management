import { aggregateCalendarEvents, getSampleCalendarEvents } from '@/lib/calendarEvents';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import NotificationCard, { Notification } from './NotificationCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64; // Keeping the same card width logic

const NotificationBanner: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load calendar events (birthdays, holidays, announcements)
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
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handlePress = (notification: Notification) => {
        console.log('Notification pressed:', notification);
        // Handle notification press - navigate to details, etc.
    };

    if (notifications.length === 0) return null;

    return (
        <View style={styles.container}>
            <Carousel
                loop
                width={SCREEN_WIDTH}
                height={160} // Adjust height as needed based on card content
                autoPlay={true}
                autoPlayInterval={5000}
                data={notifications}
                scrollAnimationDuration={1000}
                // Parallax effect config
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                }}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <NotificationCard
                            notification={item}
                            onDismiss={handleDismiss}
                            onPress={handlePress}
                            enableSwipe={false} // Disable swipe-to-dismiss in carousel to prevent gesture conflicts
                        />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 8,
        height: 100, // Match carousel height
        justifyContent: 'center',
    },
    cardWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 0, // Carousel handles spacing via modeConfig or width
        marginHorizontal: 2,
    },
});

export default NotificationBanner;
