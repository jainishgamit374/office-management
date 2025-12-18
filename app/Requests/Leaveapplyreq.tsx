import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LeaveType = 'LWP' | 'PL' | 'CL' | 'SL';

const Leaveapplyreq = () => {
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState('2025-12-17');
    const [endDate, setEndDate] = useState('2025-12-17');
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarType, setCalendarType] = useState<'start' | 'end'>('start');

    // Leave balance data
    const leaveBalance = {
        PL: { available: 12, total: 15, label: 'Paid Leave' },
        CL: { available: 8, total: 10, label: 'Casual Leave' },
        SL: { available: 5, total: 7, label: 'Sick Leave' },
    };

    const handleSubmit = () => {
        if (!selectedLeaveType) {
            Alert.alert('Error', 'Please select a leave type');
            return;
        }
        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for leave');
            return;
        }

        Alert.alert(
            'Success',
            `Leave request submitted successfully!\n\nType: ${selectedLeaveType}\nDates: ${formatDate(startDate)} to ${formatDate(endDate)}\nHalf Day: ${isHalfDay ? 'Yes' : 'No'}`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset form
                        setSelectedLeaveType(null);
                        setReason('');
                        setIsHalfDay(false);
                    },
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getLeaveTypeColor = (type: LeaveType) => {
        switch (type) {
            case 'PL':
                return '#4A90FF';
            case 'CL':
                return '#FF9800';
            case 'SL':
                return '#FF5252';
            case 'LWP':
                return '#9E9E9E';
            default:
                return '#666';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Leave Balance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Leave Balance</Text>
                    <View style={styles.balanceContainer}>
                        {Object.entries(leaveBalance).map(([key, value]) => (
                            <View key={key} style={styles.balanceCard}>
                                <View style={styles.balanceHeader}>
                                    <Text style={styles.balanceType}>{key}</Text>
                                    <View
                                        style={[
                                            styles.balanceIcon,
                                            { backgroundColor: `${getLeaveTypeColor(key as LeaveType)}20` },
                                        ]}
                                    >
                                        <Feather
                                            name="calendar"
                                            size={16}
                                            color={getLeaveTypeColor(key as LeaveType)}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.balanceCount}>{value.available}</Text>
                                <Text style={styles.balanceLabel}>
                                    of {value.total} available
                                </Text>
                                <Text style={styles.balanceSubLabel}>{value.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Leave Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Leave Type</Text>
                    <View style={styles.leaveTypeContainer}>
                        {(['LWP', 'PL', 'CL', 'SL'] as LeaveType[]).map((type) => (
                            <Pressable
                                key={type}
                                style={[
                                    styles.leaveTypeChip,
                                    selectedLeaveType === type && {
                                        backgroundColor: getLeaveTypeColor(type),
                                        borderColor: getLeaveTypeColor(type),
                                    },
                                ]}
                                onPress={() => setSelectedLeaveType(type)}
                            >
                                <Text
                                    style={[
                                        styles.leaveTypeText,
                                        selectedLeaveType === type && styles.leaveTypeTextActive,
                                    ]}
                                >
                                    {type}
                                </Text>
                                {selectedLeaveType === type && (
                                    <Feather name="check-circle" size={16} color="#FFF" />
                                )}
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Reason Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason for Leave</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder="Enter your reason for taking leave..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                    />
                    <Text style={styles.characterCount}>{reason.length}/500 characters</Text>
                </View>

                {/* Date Range Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Leave Duration</Text>
                    <View style={styles.dateRangeRow}>
                        {/* Start Date */}
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => {
                                setCalendarType('start');
                                setShowCalendar(true);
                            }}
                        >
                            <View style={styles.dateIconContainer}>
                                <Feather name="calendar" size={20} color="#4A90FF" />
                            </View>
                            <View style={styles.dateTextContainer}>
                                <Text style={styles.dateLabel}>Starting Date</Text>
                                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Arrow */}
                        <View style={styles.dateArrow}>
                            <Feather name="arrow-right" size={20} color="#999" />
                        </View>

                        {/* End Date */}
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => {
                                setCalendarType('end');
                                setShowCalendar(true);
                            }}
                        >
                            <View style={styles.dateIconContainer}>
                                <Feather name="calendar" size={20} color="#4A90FF" />
                            </View>
                            <View style={styles.dateTextContainer}>
                                <Text style={styles.dateLabel}>Ending Date</Text>
                                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Half Day Option */}
                <View style={styles.section}>
                    <Pressable
                        style={styles.halfDayContainer}
                        onPress={() => setIsHalfDay(!isHalfDay)}
                    >
                        <View style={styles.halfDayLeft}>
                            <View
                                style={[
                                    styles.checkbox,
                                    isHalfDay && styles.checkboxActive,
                                ]}
                            >
                                {isHalfDay && (
                                    <Feather name="check" size={16} color="#FFF" />
                                )}
                            </View>
                            <View>
                                <Text style={styles.halfDayTitle}>Apply for Half-Day Leave</Text>
                                <Text style={styles.halfDaySubtitle}>
                                    Check this if you need only half day off
                                </Text>
                            </View>
                        </View>
                        <Feather
                            name={isHalfDay ? 'toggle-right' : 'toggle-left'}
                            size={32}
                            color={isHalfDay ? '#4A90FF' : '#CCC'}
                        />
                    </Pressable>
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Feather name="send" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Submit Leave Request</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Calendar Modal (Placeholder) */}
            <Modal
                visible={showCalendar}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Select {calendarType === 'start' ? 'Starting' : 'Ending'} Date
                            </Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.calendarPlaceholder}>
                            <Feather name="calendar" size={48} color="#4A90FF" />
                            <Text style={styles.placeholderText}>
                                Calendar picker will be implemented here
                            </Text>
                            <Text style={styles.placeholderSubtext}>
                                Available from version 1.0.0
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowCalendar(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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

    // Leave Balance
    balanceContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    balanceCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    balanceType: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        letterSpacing: 0.5,
    },
    balanceIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceCount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    balanceLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 2,
    },
    balanceSubLabel: {
        fontSize: 10,
        color: '#BBB',
        textAlign: 'center',
    },

    // Leave Type
    leaveTypeContainer: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    leaveTypeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        gap: 8,
        minWidth: 80,
        justifyContent: 'center',
    },
    leaveTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    leaveTypeTextActive: {
        color: '#FFF',
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
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    characterCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 8,
    },

    // Date Range
    dateRangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateInput: {
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateTextContainer: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    dateArrow: {
        width: 24,
        alignItems: 'center',
    },

    // Half Day
    halfDayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    halfDayLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CCC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#4A90FF',
        borderColor: '#4A90FF',
    },
    halfDayTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    halfDaySubtitle: {
        fontSize: 12,
        color: '#999',
    },

    // Submit Button
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A90FF',
        borderRadius: 12,
        padding: 18,
        gap: 10,
        shadowColor: '#4A90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginTop: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    calendarPlaceholder: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    placeholderText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    placeholderSubtext: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    modalButton: {
        backgroundColor: '#4A90FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    modalButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default Leaveapplyreq;