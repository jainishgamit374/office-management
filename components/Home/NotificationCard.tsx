import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    PanResponder,
    Platform,
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
    const isDark = theme === 'dark';
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
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    // Modern event configuration with 3D emoji icons
    const getEventConfig = (type: NotificationType, title?: string) => {
        // Check for specific holiday names in the title for custom icons
        const titleLower = title?.toLowerCase() || '';
        
        // Holiday-specific 3D emoji icons based on title/name
        if (type === 'holiday') {
            // Holi - colorful celebration
            if (titleLower.includes('holi') && !titleLower.includes('dhuleti')) {
                return {
                    emoji: '🎨', // Color palette for Holi
                    backgroundImage: 'https://images.unsplash.com/photo-1576334536671-c26dc1312f8d?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(45, 26, 61, 0.95)', 'rgba(31, 20, 45, 0.98)'] 
                        : ['rgba(253, 244, 255, 0.92)', 'rgba(250, 232, 255, 0.95)'],
                    accentColor: '#A855F7',
                    iconBgColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.25)',
                    titleColor: isDark ? '#C084FC' : '#9333EA',
                    dateColor: isDark ? '#D8B4FE' : '#A855F7',
                };
            }
            
            // Dhuleti - bonfire celebration
            if (titleLower.includes('dhuleti')) {
                return {
                    emoji: '🔥', // Bonfire for Dhuleti
                    backgroundImage: 'https://images.unsplash.com/photo-1475738198235-4b30fc20cff4?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 42, 26, 0.95)', 'rgba(45, 31, 20, 0.98)'] 
                        : ['rgba(255, 247, 237, 0.92)', 'rgba(255, 237, 213, 0.95)'],
                    accentColor: '#F97316',
                    iconBgColor: isDark ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.25)',
                    titleColor: isDark ? '#FB923C' : '#EA580C',
                    dateColor: isDark ? '#FDBA74' : '#F97316',
                };
            }
            
            // Republic Day / Independence Day - national flag colors
            if (titleLower.includes('republic') || titleLower.includes('independence')) {
                return {
                    emoji: '🇮🇳', // Indian flag for national days
                    backgroundImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(26, 46, 26, 0.95)', 'rgba(20, 36, 20, 0.98)'] 
                        : ['rgba(255, 247, 237, 0.92)', 'rgba(254, 243, 199, 0.95)'],
                    accentColor: '#F97316', // Saffron
                    iconBgColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)',
                    titleColor: isDark ? '#4ADE80' : '#16A34A',
                    dateColor: isDark ? '#86EFAC' : '#22C55E',
                };
            }
            
            // Diwali - celebration lights
            if (titleLower.includes('diwali')) {
                return {
                    emoji: '🪔', // Diya lamp for Diwali
                    backgroundImage: 'https://images.unsplash.com/photo-1605453583688-bb5d73d42e19?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 42, 26, 0.95)', 'rgba(45, 31, 20, 0.98)'] 
                        : ['rgba(255, 251, 235, 0.92)', 'rgba(254, 243, 199, 0.95)'],
                    accentColor: '#F59E0B',
                    iconBgColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)',
                    titleColor: isDark ? '#FBBF24' : '#D97706',
                    dateColor: isDark ? '#FCD34D' : '#F59E0B',
                };
            }
            
            // Uttarayan / Makar Sankranti - kites
            if (titleLower.includes('uttarayan') || titleLower.includes('sankranti')) {
                return {
                    emoji: '🪁', // Kite for Uttarayan
                    backgroundImage: 'https://images.unsplash.com/photo-1516361839211-1c36b85d9284?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(26, 46, 61, 0.95)', 'rgba(20, 32, 45, 0.98)'] 
                        : ['rgba(240, 249, 255, 0.92)', 'rgba(224, 242, 254, 0.95)'],
                    accentColor: '#0EA5E9',
                    iconBgColor: isDark ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.25)',
                    titleColor: isDark ? '#38BDF8' : '#0284C7',
                    dateColor: isDark ? '#7DD3FC' : '#0EA5E9',
                };
            }
            
            // Christmas - gift/tree
            if (titleLower.includes('christmas')) {
                return {
                    emoji: '🎄', // Christmas tree
                    backgroundImage: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(26, 46, 26, 0.95)', 'rgba(20, 36, 20, 0.98)'] 
                        : ['rgba(240, 253, 244, 0.92)', 'rgba(220, 252, 231, 0.95)'],
                    accentColor: '#22C55E',
                    iconBgColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)',
                    titleColor: isDark ? '#4ADE80' : '#16A34A',
                    dateColor: isDark ? '#86EFAC' : '#22C55E',
                };
            }
            
            // New Year - celebration
            if (titleLower.includes('new year')) {
                return {
                    emoji: '🎉', // Party popper for New Year
                    backgroundImage: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(30, 27, 75, 0.95)', 'rgba(23, 21, 51, 0.98)'] 
                        : ['rgba(238, 242, 255, 0.92)', 'rgba(224, 231, 255, 0.95)'],
                    accentColor: '#6366F1',
                    iconBgColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.25)',
                    titleColor: isDark ? '#A5B4FC' : '#4338CA',
                    dateColor: isDark ? '#C7D2FE' : '#6366F1',
                };
            }
            
            // Maha Shivaratri - spiritual
            if (titleLower.includes('shivaratri')) {
                return {
                    emoji: '🙏', // Prayer for Shivaratri
                    backgroundImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(30, 27, 75, 0.95)', 'rgba(23, 21, 51, 0.98)'] 
                        : ['rgba(245, 243, 255, 0.92)', 'rgba(237, 233, 254, 0.95)'],
                    accentColor: '#8B5CF6',
                    iconBgColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.25)',
                    titleColor: isDark ? '#A78BFA' : '#7C3AED',
                    dateColor: isDark ? '#C4B5FD' : '#8B5CF6',
                };
            }
            
            // Ganesh Chaturthi
            if (titleLower.includes('ganesh') || titleLower.includes('chaturthi')) {
                return {
                    emoji: '🐘', // Elephant for Ganesh
                    backgroundImage: 'https://images.unsplash.com/photo-1567591414240-e9c1a9e0e101?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 42, 26, 0.95)', 'rgba(45, 31, 20, 0.98)'] 
                        : ['rgba(255, 247, 237, 0.92)', 'rgba(255, 237, 213, 0.95)'],
                    accentColor: '#F97316',
                    iconBgColor: isDark ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.25)',
                    titleColor: isDark ? '#FB923C' : '#EA580C',
                    dateColor: isDark ? '#FDBA74' : '#F97316',
                };
            }
            
            // Raksha Bandhan
            if (titleLower.includes('raksha') || titleLower.includes('bandhan') || titleLower.includes('rakhi')) {
                return {
                    emoji: '🎀', // Ribbon for Rakhi
                    backgroundImage: 'https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 26, 46, 0.95)', 'rgba(45, 20, 34, 0.98)'] 
                        : ['rgba(253, 242, 248, 0.92)', 'rgba(252, 231, 243, 0.95)'],
                    accentColor: '#EC4899',
                    iconBgColor: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.25)',
                    titleColor: isDark ? '#F472B6' : '#DB2777',
                    dateColor: isDark ? '#FBCFE8' : '#EC4899',
                };
            }
            
            // Navratri / Durga Puja
            if (titleLower.includes('navratri') || titleLower.includes('durga')) {
                return {
                    emoji: '💃', // Dancing for Navratri
                    backgroundImage: 'https://images.unsplash.com/photo-1601933470096-0e34634ffcde?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 26, 26, 0.95)', 'rgba(45, 20, 20, 0.98)'] 
                        : ['rgba(254, 242, 242, 0.92)', 'rgba(254, 202, 202, 0.95)'],
                    accentColor: '#EF4444',
                    iconBgColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)',
                    titleColor: isDark ? '#FCA5A5' : '#DC2626',
                    dateColor: isDark ? '#FECACA' : '#EF4444',
                };
            }
            
            // Eid
            if (titleLower.includes('eid')) {
                return {
                    emoji: '🌙', // Crescent moon for Eid
                    backgroundImage: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(26, 46, 26, 0.95)', 'rgba(20, 36, 20, 0.98)'] 
                        : ['rgba(240, 253, 244, 0.92)', 'rgba(220, 252, 231, 0.95)'],
                    accentColor: '#10B981',
                    iconBgColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                    titleColor: isDark ? '#34D399' : '#059669',
                    dateColor: isDark ? '#6EE7B7' : '#10B981',
                };
            }
            
            // Default holiday config
            return {
                emoji: '🌟', // Star for general holidays
                backgroundImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
                gradientColors: isDark 
                    ? ['rgba(26, 46, 26, 0.95)', 'rgba(20, 36, 20, 0.98)'] 
                    : ['rgba(240, 253, 244, 0.92)', 'rgba(220, 252, 231, 0.95)'],
                accentColor: '#10B981',
                iconBgColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                titleColor: isDark ? '#34D399' : '#059669',
                dateColor: isDark ? '#6EE7B7' : '#10B981',
            };
        }
        
        switch (type) {
            case 'half_day':
                return {
                    emoji: '⏰', // Alarm clock for half day
                    backgroundImage: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 42, 26, 0.95)', 'rgba(45, 31, 20, 0.98)'] 
                        : ['rgba(255, 248, 240, 0.92)', 'rgba(255, 237, 213, 0.95)'],
                    accentColor: '#F59E0B',
                    iconBgColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)',
                    titleColor: isDark ? '#FBBF24' : '#D97706',
                    dateColor: isDark ? '#FCD34D' : '#F59E0B',
                };
            case 'announcement':
                return {
                    emoji: '📢', // Megaphone for announcement
                    backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(30, 27, 75, 0.95)', 'rgba(23, 21, 51, 0.98)'] 
                        : ['rgba(238, 242, 255, 0.92)', 'rgba(224, 231, 255, 0.95)'],
                    accentColor: '#6366F1',
                    iconBgColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.25)',
                    titleColor: isDark ? '#A5B4FC' : '#4338CA',
                    dateColor: isDark ? '#C7D2FE' : '#6366F1',
                };
            case 'alert':
                return {
                    emoji: '⚠️', // Warning for alert
                    backgroundImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 26, 26, 0.95)', 'rgba(45, 20, 20, 0.98)'] 
                        : ['rgba(254, 242, 242, 0.92)', 'rgba(254, 202, 202, 0.95)'],
                    accentColor: '#EF4444',
                    iconBgColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)',
                    titleColor: isDark ? '#FCA5A5' : '#DC2626',
                    dateColor: isDark ? '#FECACA' : '#EF4444',
                };
            case 'birthday':
            default:
                return {
                    emoji: '🎂', // Birthday cake
                    backgroundImage: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80',
                    gradientColors: isDark 
                        ? ['rgba(61, 26, 46, 0.95)', 'rgba(45, 20, 34, 0.98)'] 
                        : ['rgba(253, 242, 248, 0.92)', 'rgba(252, 231, 243, 0.95)'],
                    accentColor: '#EC4899',
                    iconBgColor: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.25)',
                    titleColor: isDark ? '#F472B6' : '#DB2777',
                    dateColor: isDark ? '#FBCFE8' : '#EC4899',
                };
        }
    };

    const config = getEventConfig(notification.type, notification.title);

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
                    transform: [{ translateX: pan.x }],
                    opacity: opacity,
                },
            ]}
            {...panResponder.panHandlers}
        >
            <ImageBackground
                source={{ uri: config.backgroundImage }}
                style={styles.backgroundImage}
                imageStyle={styles.backgroundImageStyle}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={config.gradientColors as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <TouchableOpacity
                        style={styles.content}
                        onPress={() => onPress?.(notification)}
                        activeOpacity={0.8}
                    >
                        {/* Accent Line */}
                        <View style={[styles.accentLine, { backgroundColor: config.accentColor }]} />

                        {/* Icon Container with 3D Emoji */}
                        <View style={[styles.iconContainer, { backgroundColor: config.iconBgColor }]}>
                            <Text style={styles.emojiIcon}>{config.emoji}</Text>
                        </View>

                        {/* Content */}
                        <View style={styles.textContainer}>
                            <View style={styles.header}>
                                <Text 
                                    style={[styles.title, { color: config.titleColor }]} 
                                    numberOfLines={1}
                                >
                                    {notification.title}
                                </Text>
                                {notification.date && (
                                    <View style={[styles.dateBadge, { backgroundColor: config.iconBgColor }]}>
                                        <Text style={[styles.date, { color: config.dateColor }]}>
                                            {notification.date}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text 
                                style={[styles.message, { color: colors.textSecondary }]} 
                                numberOfLines={2}
                            >
                                {notification.message}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </ImageBackground>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 0,
        marginVertical: 6,
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
        width: '100%',
    },
    backgroundImage: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    backgroundImageStyle: {
        borderRadius: 16,
        opacity: 0.3,
    },
    gradient: {
        borderRadius: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 10,
    },
    accentLine: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiIcon: {
        fontSize: 24,
        textAlign: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.2,
        flex: 1,
    },
    dateBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    date: {
        fontSize: 11,
        fontWeight: '600',
    },
    message: {
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.1,
    },
    dismissButton: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default NotificationCard;