import { getPunchStatus } from '@/lib/attendance';
import { applyLeave, calculateLeaveDays, validateLeaveApplication } from '@/lib/leaves';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LeaveType = 'PL' | 'CL' | 'SL';

const Leaveapplyreq = () => {
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [isFirstHalf, setIsFirstHalf] = useState(true);
    const [contactNumber, setContactNumber] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarType, setCalendarType] = useState<'start' | 'end'>('start');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);

    // Leave balance data - will be fetched from API
    const [leaveBalance, setLeaveBalance] = useState<{
        [key: string]: {
            name: string;
            total: number;
            used: number;
            pending: number;
            available: number;
        };
    }>({});

    // Fetch leave balance from dashboard API
    const fetchLeaveBalance = useCallback(async () => {
        try {
            setIsLoadingBalance(true);
            const response = await getPunchStatus();

            if (response.data?.leaveBalance) {
                setLeaveBalance(response.data.leaveBalance);
                console.log('✅ Leave balance loaded');
            }
        } catch (error) {
            console.error('Failed to fetch leave balance:', error);
        } finally {
            setIsLoadingBalance(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchLeaveBalance();
        }, [fetchLeaveBalance])
    );

    const handleSubmit = async () => {
        // Validate form
        const validation = validateLeaveApplication({
            LeaveType: selectedLeaveType || undefined,
            Reason: reason,
            StartDate: startDate,
            EndDate: endDate,
            IsHalfDay: isHalfDay,
            IsFirstHalf: isFirstHalf,
            ContactNumber: contactNumber || undefined,
            EmergencyContact: emergencyContact || undefined,
        });

        if (!validation.valid) {
            Alert.alert('Validation Error', validation.errors.join('\n'));
            return;
        }

        // Calculate total days
        const totalDays = calculateLeaveDays(startDate, endDate, isHalfDay);

        // Check leave balance
        if (selectedLeaveType && leaveBalance[selectedLeaveType]) {
            const balance = leaveBalance[selectedLeaveType];
            if (balance.available < totalDays) {
                Alert.alert(
                    'Insufficient Balance',
                    `You don't have enough ${selectedLeaveType} balance.\n\nAvailable: ${balance.available} days\nRequested: ${totalDays} days`
                );
                return;
            }
        }

        try {
            setIsSubmitting(true);

            const leaveData = {
                LeaveType: selectedLeaveType!,
                Reason: reason.trim(),
                StartDate: startDate,
                EndDate: endDate,
                IsHalfDay: isHalfDay,
                IsFirstHalf: isFirstHalf,
                ContactNumber: contactNumber || undefined,
                EmergencyContact: emergencyContact || undefined,
            };

            const response = await applyLeave(leaveData);

            // Calculate total days for display
            const totalDays = calculateLeaveDays(startDate, endDate, isHalfDay);

            // Get leave type name
            const leaveTypeName = selectedLeaveType === 'PL' ? 'Privilege Leave' :
                selectedLeaveType === 'CL' ? 'Casual Leave' :
                    selectedLeaveType === 'SL' ? 'Sick Leave' : selectedLeaveType;

            Alert.alert(
                'Success! ✅',
                `Leave application submitted successfully!\n\nType: ${leaveTypeName}\nDates: ${formatDate(startDate)} to ${formatDate(endDate)}\nTotal Days: ${totalDays}${isHalfDay ? ' (Half Day)' : ''}\n\nYour leave request has been sent for approval.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setSelectedLeaveType(null);
                            setReason('');
                            setIsHalfDay(false);
                            setIsFirstHalf(true);
                            setContactNumber('');
                            setEmergencyContact('');
                            // Refresh leave balance
                            fetchLeaveBalance();
                        },
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit leave application');
        } finally {
            setIsSubmitting(false);
        }
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
                    {isLoadingBalance ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4A90FF" />
                            <Text style={styles.loadingText}>Loading leave balance...</Text>
                        </View>
                    ) : (
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
                                    <Text style={styles.balanceSubLabel}>{value.name}</Text>
                                    {value.pending > 0 && (
                                        <View style={styles.pendingBadge}>
                                            <Text style={styles.pendingText}>{value.pending} pending</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Leave Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Leave Type</Text>
                    <View style={styles.leaveTypeContainer}>
                        {(['PL', 'CL', 'SL'] as LeaveType[]).map((type) => (
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

                    {/* Half Day Selection */}
                    {isHalfDay && (
                        <View style={styles.halfDaySelection}>
                            <Text style={styles.halfDaySelectionLabel}>Select Half</Text>
                            <View style={styles.halfDayButtons}>
                                <Pressable
                                    style={[
                                        styles.halfDayButton,
                                        isFirstHalf && styles.halfDayButtonActive,
                                    ]}
                                    onPress={() => setIsFirstHalf(true)}
                                >
                                    <Feather
                                        name="sunrise"
                                        size={18}
                                        color={isFirstHalf ? '#FFF' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            styles.halfDayButtonText,
                                            isFirstHalf && styles.halfDayButtonTextActive,
                                        ]}
                                    >
                                        First Half
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.halfDayButton,
                                        !isFirstHalf && styles.halfDayButtonActive,
                                    ]}
                                    onPress={() => setIsFirstHalf(false)}
                                >
                                    <Feather
                                        name="sunset"
                                        size={18}
                                        color={!isFirstHalf ? '#FFF' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            styles.halfDayButtonText,
                                            !isFirstHalf && styles.halfDayButtonTextActive,
                                        ]}
                                    >
                                        Second Half
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information (Optional)</Text>
                    <TextInput
                        style={styles.contactInput}
                        placeholder="Contact Number (10 digits)"
                        placeholderTextColor="#999"
                        value={contactNumber}
                        onChangeText={setContactNumber}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                    <TextInput
                        style={styles.contactInput}
                        placeholder="Emergency Contact (10 digits)"
                        placeholderTextColor="#999"
                        value={emergencyContact}
                        onChangeText={setEmergencyContact}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <ActivityIndicator size="small" color="#FFF" />
                            <Text style={styles.submitButtonText}>Submitting...</Text>
                        </>
                    ) : (
                        <>
                            <Feather name="send" size={20} color="#FFF" />
                            <Text style={styles.submitButtonText}>Submit Leave Request</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Calendar Modal */}
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

                        <View style={styles.calendarContainer}>
                            <DateTimePicker
                                value={new Date(calendarType === 'start' ? startDate : endDate)}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    if (event.type === 'set' && selectedDate) {
                                        const formattedDate = selectedDate.toISOString().split('T')[0];
                                        if (calendarType === 'start') {
                                            setStartDate(formattedDate);
                                            // Auto-update end date if it's before the new start date
                                            if (new Date(endDate) < selectedDate) {
                                                setEndDate(formattedDate);
                                            }
                                        } else {
                                            setEndDate(formattedDate);
                                        }
                                    }
                                }}
                                minimumDate={calendarType === 'start' ? new Date() : new Date(startDate)}
                                textColor="#333"
                                style={styles.dateTimePicker}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowCalendar(false)}
                        >
                            <Feather name="check" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.modalButtonText}>Confirm</Text>
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

    // Loading
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#999',
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
    pendingBadge: {
        marginTop: 8,
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pendingText: {
        fontSize: 10,
        color: '#FF9800',
        fontWeight: '600',
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
    halfDaySelection: {
        marginTop: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
    },
    halfDaySelectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    halfDayButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    halfDayButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        gap: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    halfDayButtonActive: {
        backgroundColor: '#4A90FF',
        borderColor: '#4A90FF',
    },
    halfDayButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    halfDayButtonTextActive: {
        color: '#FFF',
    },

    // Contact Input
    contactInput: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
    submitButtonDisabled: {
        backgroundColor: '#CCC',
        shadowColor: '#999',
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
    calendarContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 16,
    },
    dateTimePicker: {
        width: '100%',
        height: 200,
    },
    modalButton: {
        flexDirection: 'row',
        backgroundColor: '#4A90FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    modalButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default Leaveapplyreq;