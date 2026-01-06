import { submitEarlyCheckoutRequest, submitLateCheckinRequest } from '@/lib/earlyLatePunch';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type RequestType = 'Early Check-Out' | 'Late Check-In';

// Reusable Dropdown Component
interface DropdownProps {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
    icon?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onSelect, icon = 'chevron-down' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleDropdown = () => {
        const toValue = isOpen ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
        setIsOpen(!isOpen);
    };

    const handleSelect = (option: string) => {
        onSelect(option);
        toggleDropdown();
    };

    const dropdownHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.min(options.length * 50, 250)],
    });

    const rotateIcon = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleDropdown}
                activeOpacity={0.7}
            >
                <Text style={styles.dropdownButtonText}>{value}</Text>
                <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                    <Feather name={icon as any} size={20} color="#4A90FF" />
                </Animated.View>
            </TouchableOpacity>

            {isOpen && (
                <Animated.View
                    style={[
                        styles.dropdownList,
                        {
                            height: dropdownHeight,
                            opacity: animation,
                        },
                    ]}
                >
                    <ScrollView
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                    >
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dropdownItem,
                                    option === value && styles.dropdownItemActive,
                                ]}
                                onPress={() => handleSelect(option)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.dropdownItemText,
                                        option === value && styles.dropdownItemTextActive,
                                    ]}
                                >
                                    {option}
                                </Text>
                                {option === value && (
                                    <Feather name="check" size={18} color="#4A90FF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}
        </View>
    );
};

const Earlycheckoutreq = () => {
    const [requestType, setRequestType] = useState<RequestType>('Early Check-Out');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const onDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const onTimeChange = (event: any, date?: Date) => {
        setShowTimePicker(false);
        if (date) {
            setSelectedTime(date);
        }
    };

    const getRequestTypeColor = () => {
        return requestType === 'Early Check-Out' ? '#FF9800' : '#4A90FF';
    };

    const getRequestTypeIcon = () => {
        return requestType === 'Early Check-Out' ? 'log-out' : 'log-in';
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for your request');
            return;
        }

        if (reason.trim().length < 10) {
            Alert.alert('Error', 'Reason must be at least 10 characters');
            return;
        }

        try {
            setIsSubmitting(true);

            // Combine date and time into ISO format
            const dateTime = new Date(selectedDate);
            dateTime.setHours(selectedTime.getHours());
            dateTime.setMinutes(selectedTime.getMinutes());
            const isoDateTime = dateTime.toISOString();

            // Call the appropriate API based on request type
            if (requestType === 'Late Check-In') {
                await submitLateCheckinRequest(isoDateTime, reason.trim());
            } else {
                await submitEarlyCheckoutRequest(isoDateTime, reason.trim());
            }

            Alert.alert(
                'Success',
                `${requestType} request submitted successfully!\n\nDate: ${formatDate(selectedDate)}\nTime: ${formatTime(selectedTime)}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setReason('');
                            setSelectedDate(new Date());
                            setSelectedTime(new Date());
                        },
                    },
                ]
            );
        } catch (error: any) {
            // Enhanced error handling with specific messages
            const errorMessage = error.message || 'Failed to submit request';

            // Check for workflow configuration error
            if (errorMessage.includes('workflow not configured') || errorMessage.includes('contact HR')) {
                Alert.alert(
                    'Workflow Not Configured',
                    `The ${requestType} approval workflow has not been set up yet.\n\n` +
                    'Please contact your HR department to configure the approval workflow for this request type.\n\n' +
                    'Your request cannot be processed until the workflow is configured.',
                    [{ text: 'OK', style: 'default' }]
                );
            }
            // Check for duplicate request error
            else if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                Alert.alert(
                    'Duplicate Request',
                    `A ${requestType.toLowerCase()} request already exists for the selected date.\n\n` +
                    'Please check your pending requests or select a different date.',
                    [{ text: 'OK', style: 'default' }]
                );
            }
            // Check for session expired error
            else if (errorMessage.includes('session') || errorMessage.includes('expired') || errorMessage.includes('login')) {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please log in again to continue.',
                    [{ text: 'OK', style: 'default' }]
                );
            }
            // Generic error
            else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View
                            style={[
                                styles.headerIconContainer,
                                { backgroundColor: `${getRequestTypeColor()}20` },
                            ]}
                        >
                            <Feather
                                name={getRequestTypeIcon() as any}
                                size={28}
                                color={getRequestTypeColor()}
                            />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Check-In/Out Request</Text>
                            <Text style={styles.headerSubtitle}>
                                Submit Early Check-Out or Late Check-In request
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Status Cards */}
                <View style={styles.statusContainer}>
                    <TouchableOpacity
                        style={[
                            styles.statusCard,
                            requestType === 'Early Check-Out' && styles.statusCardActive,
                            { borderColor: requestType === 'Early Check-Out' ? '#FF9800' : '#E8E8E8' },
                        ]}
                        onPress={() => setRequestType('Early Check-Out')}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.statusIconContainer,
                                { backgroundColor: requestType === 'Early Check-Out' ? '#FF980020' : '#F5F5F5' },
                            ]}
                        >
                            <Feather
                                name="log-out"
                                size={24}
                                color={requestType === 'Early Check-Out' ? '#FF9800' : '#999'}
                            />
                        </View>
                        <Text
                            style={[
                                styles.statusCardText,
                                requestType === 'Early Check-Out' && styles.statusCardTextActive,
                            ]}
                        >
                            Early Check-Out
                        </Text>
                        {requestType === 'Early Check-Out' && (
                            <View style={styles.activeIndicator}>
                                <Feather name="check-circle" size={20} color="#FF9800" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.statusCard,
                            requestType === 'Late Check-In' && styles.statusCardActive,
                            { borderColor: requestType === 'Late Check-In' ? '#4A90FF' : '#E8E8E8' },
                        ]}
                        onPress={() => setRequestType('Late Check-In')}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.statusIconContainer,
                                { backgroundColor: requestType === 'Late Check-In' ? '#4A90FF20' : '#F5F5F5' },
                            ]}
                        >
                            <Feather
                                name="log-in"
                                size={24}
                                color={requestType === 'Late Check-In' ? '#4A90FF' : '#999'}
                            />
                        </View>
                        <Text
                            style={[
                                styles.statusCardText,
                                requestType === 'Late Check-In' && styles.statusCardTextActive,
                            ]}
                        >
                            Late Check-In
                        </Text>
                        {requestType === 'Late Check-In' && (
                            <View style={styles.activeIndicator}>
                                <Feather name="check-circle" size={20} color="#4A90FF" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Request Type Dropdown */}
                <View style={styles.section}>
                    <Dropdown
                        label="Request Type"
                        value={requestType}
                        options={['Early Check-Out', 'Late Check-In']}
                        onSelect={(value) => setRequestType(value as RequestType)}
                    />
                </View>

                {/* Date & Time Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date & Time</Text>

                    <View style={styles.dateTimeContainer}>
                        {/* Date */}
                        <TouchableOpacity
                            style={styles.dateTimeBox}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <View style={styles.dateTimeIconContainer}>
                                <Feather name="calendar" size={20} color="#4A90FF" />
                            </View>
                            <View style={styles.dateTimeTextContainer}>
                                <Text style={styles.dateTimeLabel}>Date</Text>
                                <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Time */}
                        <TouchableOpacity
                            style={styles.dateTimeBox}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <View style={styles.dateTimeIconContainer}>
                                <Feather name="clock" size={20} color="#4A90FF" />
                            </View>
                            <View style={styles.dateTimeTextContainer}>
                                <Text style={styles.dateTimeLabel}>Time</Text>
                                <Text style={styles.dateTimeValue}>{formatTime(selectedTime)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Date Picker */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    {/* Time Picker */}
                    {showTimePicker && (
                        <DateTimePicker
                            value={selectedTime}
                            mode="time"
                            display="default"
                            onChange={onTimeChange}
                        />
                    )}
                </View>

                {/* Reason Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder={`Enter reason for ${requestType.toLowerCase()}...`}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={5}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                    />
                    <Text style={styles.characterCount}>{reason.length}/500 characters</Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: getRequestTypeColor() },
                        isSubmitting && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Feather name="send" size={20} color="#FFF" />
                            <Text style={styles.submitButtonText}>
                                Submit {requestType} Request
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                        <Feather name="info" size={20} color="#4A90FF" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Important Note</Text>
                        <Text style={styles.infoText}>
                            {requestType === 'Early Check-Out'
                                ? 'Early check-out requests should be submitted at least 2 hours in advance. Approval is subject to manager discretion.'
                                : 'Late check-in requests should be submitted as soon as possible. Please inform your team lead directly for urgent situations.'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Header
    header: {
        marginBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#999',
    },

    // Status Cards
    statusContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statusCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
    },
    statusCardActive: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    statusIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statusCardText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    statusCardTextActive: {
        color: '#333',
        fontWeight: '700',
    },
    activeIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },

    // Dropdown
    dropdownContainer: {
        marginBottom: 0,
    },
    dropdownLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    dropdownButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    dropdownList: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginTop: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownItemActive: {
        backgroundColor: '#F0F8FF',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#666',
    },
    dropdownItemTextActive: {
        fontWeight: '600',
        color: '#4A90FF',
    },

    // Date & Time
    dateTimeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateTimeBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    dateTimeIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A90FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dateTimeTextContainer: {
        flex: 1,
    },
    dateTimeLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    dateTimeValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },

    // Reason Input
    reasonInput: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minHeight: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    characterCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 8,
    },

    // Submit Button
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 18,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 24,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    infoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A90FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1976D2',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#1565C0',
        lineHeight: 20,
    },
});

export default Earlycheckoutreq;