import { useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export type NotificationType = 'half_day' | 'holiday' | 'birthday' | 'announcement' | 'alert';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    date?: string;
    priority: 'high' | 'medium' | 'low';
    dismissible: boolean;
    imageUrl?: string;
    imageLayout?: 'horizontal' | 'banner';
}

interface NotificationCardProps {
    notification: Notification;
    onDismiss?: (id: string) => void;
    onPress?: (notification: Notification) => void;
    enableSwipe?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onDismiss,
    onPress,
    enableSwipe = true,
}) => {
    const { colors, theme } = useTheme();
    const [pan] = useState(new Animated.ValueXY());
    const [opacity] = useState(new Animated.Value(1));

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => enableSwipe && notification.dismissible,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return enableSwipe && notification.dismissible && Math.abs(gestureState.dx) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
            if (enableSwipe && notification.dismissible) {
                pan.setValue({ x: gestureState.dx, y: 0 });
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (enableSwipe && notification.dismissible && Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
                // Swipe to dismiss
                Animated.parallel([
                    Animated.timing(pan, {
                        toValue: { x: gestureState.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                    })
                ]).start(() => {
                    onDismiss?.(notification.id);
                });
            } else {
                // Snap back
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    const getNotificationConfig = (type: NotificationType) => {
        switch (type) {
            case 'half_day':
                return {
                    color: '#FF9800',
                    bgColor: theme === 'dark' ? '#3d2a1a' : '#FFF3E0',
                    icon: 'clock' as const,
                    iconBg: '#FFE0B2',
                };
            case 'holiday':
                return {
                    color: '#4CAF50',
                    bgColor: theme === 'dark' ? '#1a2e1a' : '#E8F5E9',
                    icon: 'calendar' as const,
                    iconBg: '#C8E6C9',
                };
            case 'birthday':
                return {
                    color: '#E91E63',
                    bgColor: theme === 'dark' ? '#3d1a2e' : '#FCE4EC',
                    icon: 'gift' as const,
                    iconBg: '#F8BBD0',
                };
            case 'announcement':
                return {
                    color: '#2196F3',
                    bgColor: theme === 'dark' ? '#1a2a3d' : '#E3F2FD',
                    icon: 'bell' as const,
                    iconBg: '#BBDEFB',
                };
            case 'alert':
                return {
                    color: '#F44336',
                    bgColor: theme === 'dark' ? '#3d1a1a' : '#FFEBEE',
                    icon: 'alert-circle' as const,
                    iconBg: '#FFCDD2',
                };
        }
    };

    const config = getNotificationConfig(notification.type);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(pan, {
                toValue: { x: SCREEN_WIDTH, y: 0 },
                duration: 200,
                useNativeDriver: false,
            })
        ]).start(() => {
            onDismiss?.(notification.id);
        });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: config.bgColor,
                    transform: [{ translateX: pan.x }],
                    opacity: opacity,
                },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={() => onPress?.(notification)}
                activeOpacity={0.7}
            >
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
                    <Feather name={config.icon} size={24} color={config.color} />
                </View>

                {/* Content */}
                <View style={styles.textContainer}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: config.color }]} numberOfLines={1}>
                            {notification.title}
                        </Text>
                        {notification.date && (
                            <Text style={[styles.date, { color: config.color }]}>
                                {notification.date}
                            </Text>
                        )}
                    </View>
                    <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
                        {notification.message}
                    </Text>
                </View>

                {/* Dismiss Button */}
                {notification.dismissible && (
                    <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={handleDismiss}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name="x" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {/* Priority Indicator */}
            {notification.priority === 'high' && (
                <View style={[styles.priorityIndicator, { backgroundColor: config.color }]} />
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 0,
        marginVertical: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
    },
    dismissButton: {
        padding: 4,
    },
    priorityIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
});

export default NotificationCard;