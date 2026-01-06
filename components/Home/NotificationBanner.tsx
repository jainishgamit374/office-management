import { aggregateCalendarEvents, getSampleCalendarEvents } from '@/lib/calendarEvents';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import NotificationCard, { Notification } from './NotificationCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64;
const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

const NotificationBanner: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);
    const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
                snapToAlignment="center"
                decelerationRate="fast"
                scrollEventThrottle={16}
                bounces={true}
                bouncesZoom={false}
                alwaysBounceHorizontal={false}
                directionalLockEnabled={true}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollEnd={(event) => {
                    // Update current index based on scroll position
                    const offsetX = event.nativeEvent.contentOffset.x;
                    const index = Math.round(offsetX / (CARD_WIDTH + 16));
                    setCurrentIndex(index);
                }}
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
