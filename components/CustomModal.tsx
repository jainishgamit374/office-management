import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    type?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    onClose,
    type = 'info',
    title,
    message,
}) => {
    const slideAnim = React.useRef(new Animated.Value(-150)).current;
    const progressAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

    React.useEffect(() => {
        if (visible) {
            // Reset animations
            progressAnim.setValue(0);
            scaleAnim.setValue(0.9);

            // Slide down with scale
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 7,
                    tension: 35,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 35,
                    useNativeDriver: true,
                }),
            ]).start();

            // Progress bar animation
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: false,
            }).start();

            // Auto dismiss after 3 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            // Slide up
            Animated.timing(slideAnim, {
                toValue: -150,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -150,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    iconColor: '#10B981',
                    gradientColors: ['#ECFDF5', '#D1FAE5'],
                    borderColor: '#10B981',
                    progressColor: '#10B981',
                    iconBg: 'rgba(16, 185, 129, 0.12)',
                };
            case 'error':
                return {
                    icon: 'close-circle' as const,
                    iconColor: '#EF4444',
                    gradientColors: ['#FEF2F2', '#FEE2E2'],
                    borderColor: '#EF4444',
                    progressColor: '#EF4444',
                    iconBg: 'rgba(239, 68, 68, 0.12)',
                };
            case 'warning':
                return {
                    icon: 'warning' as const,
                    iconColor: '#F59E0B',
                    gradientColors: ['#FFFBEB', '#FEF3C7'],
                    borderColor: '#F59E0B',
                    progressColor: '#F59E0B',
                    iconBg: 'rgba(245, 158, 11, 0.12)',
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle' as const,
                    iconColor: '#3B82F6',
                    gradientColors: ['#EFF6FF', '#DBEAFE'],
                    borderColor: '#3B82F6',
                    progressColor: '#3B82F6',
                    iconBg: 'rgba(59, 130, 246, 0.12)',
                };
        }
    };

    const config = getConfig();

    if (!visible) return null;

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.notificationWrapper,
                        {
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim },
                            ],
                        },
                    ]}
                >
                    <View style={styles.cardShadow}>
                        <LinearGradient
                            colors={config.gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.notificationBar,
                                { borderLeftColor: config.borderColor }
                            ]}
                        >
                            {/* Content Container */}
                            <View style={styles.contentContainer}>
                                {/* Icon with modern background */}
                                <View style={[styles.iconWrapper, { backgroundColor: config.iconBg }]}>
                                    <Ionicons
                                        name={config.icon}
                                        size={24}
                                        color={config.iconColor}
                                    />
                                </View>

                                {/* Text Content */}
                                <View style={styles.textContainer}>
                                    <Text style={[styles.title, { color: config.iconColor }]}>
                                        {title}
                                    </Text>
                                    {message && (
                                        <Text style={styles.message} numberOfLines={2}>
                                            {message}
                                        </Text>
                                    )}
                                </View>

                                {/* Close Button */}
                                <TouchableOpacity
                                    onPress={handleClose}
                                    style={styles.closeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={18} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            {/* Animated Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <Animated.View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: progressWidth,
                                            backgroundColor: config.progressColor,
                                        },
                                    ]}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    notificationWrapper: {
        width: width - 20,
        marginTop: 55,
        marginHorizontal: 10,
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 18,
    },
    notificationBar: {
        borderRadius: 18,
        borderLeftWidth: 4,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 18,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
        paddingRight: 6,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.1,
        marginBottom: 3,
    },
    message: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 17,
        fontWeight: '400',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(156, 163, 175, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        height: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        width: '100%',
    },
    progressBar: {
        height: '100%',
    },
});

export default CustomModal;
