import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import NotificationCard, { Notification } from './NotificationCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64;
const AUTO_SLIDE_INTERVAL = 3000; // 3 seconds

// Sample notifications - replace with API data
const SAMPLE_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'half_day',
        title: 'Half Day Notice',
        message: 'Office will close at 2:00 PM today for maintenance work.',
        date: 'Today',
        priority: 'high',
        dismissible: true,
    },
    {
        id: '2',
        type: 'holiday',
        title: 'Upcoming Holiday',
        message: 'Republic Day - Office will be closed on 26th January.',
        date: 'Jan 26',
        priority: 'medium',
        dismissible: true,
    },
    {
        id: '3',
        type: 'birthday',
        title: '🎉 Birthday Today!',
        message: 'Wish John Doe a happy birthday! Join us for cake at 4 PM.',
        date: 'Today',
        priority: 'low',
        dismissible: true,
    },
    {
        id: '4',
        type: 'announcement',
        title: 'Team Meeting',
        message: 'All-hands meeting scheduled for tomorrow at 10:00 AM in Conference Room A.',
        date: 'Tomorrow',
        priority: 'medium',
        dismissible: true,
    },
];

const NotificationBanner: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Load notifications - replace with API call
        setNotifications(SAMPLE_NOTIFICATIONS);
    }, []);

    // Auto-slide functionality
    useEffect(() => {
        if (notifications.length <= 1) return;

        // Clear existing timer
        if (autoSlideTimer.current) {
            clearInterval(autoSlideTimer.current);
        }

        // Start auto-sliding
        autoSlideTimer.current = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % notifications.length;

                // Scroll to next card
                scrollViewRef.current?.scrollTo({
                    x: nextIndex * CARD_WIDTH + (nextIndex > 0 ? nextIndex * 16 : 0), // Account for gap
                    animated: true,
                });

                return nextIndex;
            });
        }, AUTO_SLIDE_INTERVAL);

        // Cleanup on unmount
        return () => {
            if (autoSlideTimer.current) {
                clearInterval(autoSlideTimer.current);
            }
        };
    }, [notifications.length]);

    const handleDismiss = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // Reset index if needed
        if (currentIndex >= notifications.length - 1) {
            setCurrentIndex(0);
        }
    };

    const handlePress = (notification: Notification) => {
        console.log('Notification pressed:', notification);
        // Handle notification press - navigate to details, etc.
    };

    const handleScrollBeginDrag = () => {
        // Pause auto-slide when user manually scrolls
        if (autoSlideTimer.current) {
            clearInterval(autoSlideTimer.current);
        }
    };

    const handleScrollEndDrag = () => {
        // Resume auto-slide after user stops scrolling
        if (notifications.length > 1) {
            autoSlideTimer.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % notifications.length;
                    scrollViewRef.current?.scrollTo({
                        x: nextIndex * CARD_WIDTH + (nextIndex > 0 ? nextIndex * 16 : 0),
                        animated: true,
                    });
                    return nextIndex;
                });
            }, AUTO_SLIDE_INTERVAL);
        }
    };

    if (notifications.length === 0) return null;

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                pagingEnabled={false}
                snapToInterval={CARD_WIDTH + 16} // Card width + gap
                snapToAlignment="start"
                decelerationRate="fast"
                scrollEventThrottle={16}
                bounces={true}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
            >
                {notifications.map((notification) => (
                    <View key={notification.id} style={styles.cardWrapper}>
                        <NotificationCard
                            notification={notification}
                            onDismiss={handleDismiss}
                            onPress={handlePress}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingRight: 32, // Extra space at the end for last card
        gap: 16,
    },
    cardWrapper: {
        width: CARD_WIDTH,
        marginRight: 0,
    },
});

export default NotificationBanner;
