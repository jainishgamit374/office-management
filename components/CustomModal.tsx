import { Ionicons } from '@expo/vector-icons';
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
    const slideAnim = React.useRef(new Animated.Value(-100)).current;

    React.useEffect(() => {
        if (visible) {
            // Slide down
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();

            // Auto dismiss after 3 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            // Slide up
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    color: '#10B981',
                    backgroundColor: '#D1FAE5',
                    borderColor: '#10B981',
                };
            case 'error':
                return {
                    icon: 'close-circle' as const,
                    color: '#EF4444',
                    backgroundColor: '#FEE2E2',
                    borderColor: '#EF4444',
                };
            case 'warning':
                return {
                    icon: 'warning' as const,
                    color: '#F59E0B',
                    backgroundColor: '#FEF3C7',
                    borderColor: '#F59E0B',
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle' as const,
                    color: '#3B82F6',
                    backgroundColor: '#DBEAFE',
                    borderColor: '#3B82F6',
                };
        }
    };

    const config = getConfig();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={styles.container}
                activeOpacity={1}
                onPress={handleClose}
            >
                <Animated.View
                    style={[
                        styles.notificationBar,
                        {
                            backgroundColor: config.backgroundColor,
                            borderLeftColor: config.borderColor,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.contentContainer}>
                        <Ionicons
                            name={config.icon}
                            size={28}
                            color={config.color}
                            style={styles.icon}
                        />
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: config.color }]}>
                                {title}
                            </Text>
                            {message && (
                                <Text style={styles.message}>{message}</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    notificationBar: {
        width: width - 32,
        marginTop: 50,
        marginHorizontal: 16,
        borderRadius: 16,
        borderLeftWidth: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 12,
        overflow: 'hidden',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        paddingVertical: 16,
    },
    icon: {
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    message: {
        fontSize: 14,
        color: '#4B5563',
        marginTop: 4,
        lineHeight: 20,
    },
    closeButton: {
        padding: 6,
        marginLeft: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
});

export default CustomModal;
