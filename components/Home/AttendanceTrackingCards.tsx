import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getLateEarlyCount } from '@/lib/api';
import { getLateCheckinCount, submitEarlyCheckoutRequest, submitLateCheckinRequest } from '@/lib/earlyLatePunch';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AttendanceTrackingCardsProps {
    onCountsChange?: (lateCount: number, earlyCount: number) => void;
    refreshKey?: number;
}

const AttendanceTrackingCards: React.FC<AttendanceTrackingCardsProps> = ({ onCountsChange, refreshKey }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState<'Early' | 'Late'>('Early');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Date and Time picker states
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    
    // Manage counts internally
    const [lateCheckIns, setLateCheckIns] = useState(0);
    const [earlyCheckOuts, setEarlyCheckOuts] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch counts from API
    const fetchCounts = useCallback(async () => {
        try {
            console.log('🔄 [AttendanceTrackingCards] Fetching counts...');
            
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const monthStr = (month + 1).toString();
            const yearStr = year.toString();

            // First day of current month
            const fromDate = new Date(year, month, 1);
            const fromDateStr = fromDate.toISOString().split('T')[0];
            
            // Last day of current month
            const toDate = new Date(year, month + 1, 0);
            const toDateStr = toDate.toISOString().split('T')[0];

            // Fetch both counts in parallel
            // Late from dedicated endpoint, Early from combined endpoint
            const [lateResponse, earlyResponse] = await Promise.all([
                getLateCheckinCount(monthStr, yearStr).catch(err => {
                    console.error('❌ Error fetching late count:', err);
                    return null;
                }),
                getLateEarlyCount(fromDateStr, toDateStr).catch(err => {
                    console.error('❌ Error fetching early count:', err);
                    return null;
                })
            ]);

            console.log('📊 Late check-in response:', lateResponse);
            console.log('📊 Early check-out response:', earlyResponse);

            // Update late check-in count from dedicated endpoint
            if (lateResponse?.data?.late_checkin_count !== undefined) {
                const newLateCount = lateResponse.data.late_checkin_count;
                console.log('✅ Setting late count:', newLateCount);
                setLateCheckIns(newLateCount);
            }

            // Update early check-out count from combined endpoint
            if (earlyResponse?.data && earlyResponse.data.length > 0) {
                const newEarlyCount = earlyResponse.data[0].early;
                console.log('✅ Setting early count:', newEarlyCount);
                setEarlyCheckOuts(newEarlyCount);
            }

            // Notify parent if callback provided
            if (onCountsChange) {
                onCountsChange(
                    lateResponse?.data?.late_checkin_count || 0,
                    earlyResponse?.data?.[0]?.early || 0
                );
            }

            console.log('✅ [AttendanceTrackingCards] Counts updated successfully');
        } catch (error) {
            console.error('❌ [AttendanceTrackingCards] Error fetching counts:', error);
        }
    }, [onCountsChange, refreshKey]);

    // Fetch on mount and when screen gains focus
    useFocusEffect(
        useCallback(() => {
            fetchCounts();
        }, [fetchCounts, refreshKey])
    );

    // Manual refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchCounts();
        setIsRefreshing(false);
    };

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Format time for display
    const formatTime = (time: Date): string => {
        return time.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Handle date change
    const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
        }
    };

    // Handle time change
    const onTimeChange = (event: DateTimePickerEvent, time?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (time) {
            setSelectedTime(time);
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please enter a reason');
            return;
        }

        try {
            setIsSubmitting(true);

            // Combine selected date and time
            const combinedDateTime = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes(),
                selectedTime.getSeconds()
            );
            const dateTime = combinedDateTime.toISOString().slice(0, 19); // Remove milliseconds and Z

            // Use separate endpoints for Early Checkout and Late Arrival
            if (selectedType === 'Early') {
                await submitEarlyCheckoutRequest(dateTime, reason.trim());
            } else {
                await submitLateCheckinRequest(dateTime, reason.trim());
            }

            Alert.alert(
                'Success',
                `${selectedType === 'Early' ? 'Early checkout' : 'Late arrival'} recorded successfully!`,
                [{
                    text: 'OK', onPress: () => {
                        setShowModal(false);
                        setReason('');
                        setSelectedDate(new Date());
                        setSelectedTime(new Date());
                        // Refresh counts after recording
                        setTimeout(() => fetchCounts(), 1500);
                    }
                }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to record punch');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <View style={styles.wrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.container}
                >
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => setShowModal(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.label}>Early/Late</Text>
                        <Text style={[styles.actionText, { color: colors.warning }]}>Record →</Text>
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <Text style={styles.label}>Late In</Text>
                        <Text style={[
                            styles.count,
                            { color: lateCheckIns >= 5 ? '#FF5252' : lateCheckIns >= 3 ? '#FFA726' : '#4CAF50' }
                        ]}>
                            {lateCheckIns}/5
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Early Out</Text>
                        <Text style={[
                            styles.count,
                            { color: earlyCheckOuts >= 5 ? '#FF5252' : earlyCheckOuts >= 3 ? '#FFA726' : '#4CAF50' }
                        ]}>
                            {earlyCheckOuts}/5
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Half Day</Text>
                        <Text style={[styles.count, { color: colors.primary }]}>0</Text>
                    </View>
                </ScrollView>
            </View>

            {/* Early/Late Punch Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Record Punch</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setShowModal(false)}
                            >
                                <Feather name="x" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Type Selection - Compact Pills */}
                            <View style={styles.typeContainer}>
                                <Pressable
                                    style={[
                                        styles.typePill,
                                        selectedType === 'Early' && styles.typePillActive,
                                    ]}
                                    onPress={() => setSelectedType('Early')}
                                >
                                    <Feather
                                        name="log-out"
                                        size={16}
                                        color={selectedType === 'Early' ? '#fff' : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.typePillText,
                                        selectedType === 'Early' && styles.typePillTextActive,
                                    ]}>
                                        Early Checkout
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.typePill,
                                        selectedType === 'Late' && styles.typePillActive,
                                    ]}
                                    onPress={() => setSelectedType('Late')}
                                >
                                    <Feather
                                        name="log-in"
                                        size={16}
                                        color={selectedType === 'Late' ? '#fff' : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.typePillText,
                                        selectedType === 'Late' && styles.typePillTextActive,
                                    ]}>
                                        Late Arrival
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Date & Time Row */}
                            <View style={styles.dateTimeRow}>
                                <TouchableOpacity
                                    style={styles.dateTimeBox}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Feather name="calendar" size={18} color={colors.primary} />
                                    <View style={styles.dateTimeInfo}>
                                        <Text style={styles.dateTimeLabel}>Date</Text>
                                        <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dateTimeBox}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Feather name="clock" size={18} color={colors.primary} />
                                    <View style={styles.dateTimeInfo}>
                                        <Text style={styles.dateTimeLabel}>Time</Text>
                                        <Text style={styles.dateTimeValue}>{formatTime(selectedTime)}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Reason Input - Compact */}
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter reason..."
                                placeholderTextColor={colors.textTertiary}
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isSubmitting && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Feather name="check" size={18} color="#fff" />
                                        <Text style={styles.submitButtonText}>Submit</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>

                {/* Date Picker Modal - iOS only */}
                {Platform.OS === 'ios' && showDatePicker && (
                    <Modal transparent animationType="fade" visible={showDatePicker}>
                        <Pressable 
                            style={styles.pickerOverlay} 
                            onPress={() => setShowDatePicker(false)}
                        >
                            <Pressable style={styles.pickerModal}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerTitle}>Select Date</Text>
                                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                        <Text style={styles.pickerDoneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display="inline"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                    style={styles.picker}
                                />
                            </Pressable>
                        </Pressable>
                    </Modal>
                )}

                {/* Time Picker Modal - iOS only */}
                {Platform.OS === 'ios' && showTimePicker && (
                    <Modal transparent animationType="fade" visible={showTimePicker}>
                        <Pressable 
                            style={styles.pickerOverlay} 
                            onPress={() => setShowTimePicker(false)}
                        >
                            <Pressable style={styles.pickerModal}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerTitle}>Select Time</Text>
                                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                        <Text style={styles.pickerDoneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    display="spinner"
                                    onChange={onTimeChange}
                                    style={styles.picker}
                                />
                            </Pressable>
                        </Pressable>
                    </Modal>
                )}
            </Modal>

            {/* Android Date Picker - Must be outside Modal */}
            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (event.type === 'set' && date) {
                            setSelectedDate(date);
                        }
                    }}
                    maximumDate={new Date()}
                />
            )}

            {/* Android Time Picker - Must be outside Modal */}
            {Platform.OS === 'android' && showTimePicker && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    onChange={(event, time) => {
                        setShowTimePicker(false);
                        if (event.type === 'set' && time) {
                            setSelectedTime(time);
                        }
                    }}
                />
            )}
        </>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    wrapper: {
        marginTop: 8,
        marginHorizontal: 16,

    },
    container: {
        paddingHorizontal: 0,
        paddingVertical: 4,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    card: {
        minWidth: 75,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 58,
        borderRadius: 10,
        padding: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        gap: 3,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.textSecondary,
        textAlign: 'center',
    },
    count: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    actionText: {
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Modal Styles - Modern & Compact
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    typePill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: colors.background,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    typePillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typePillText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    typePillTextActive: {
        color: '#fff',
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    dateTimeBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateTimeInfo: {
        flex: 1,
    },
    dateTimeLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.textTertiary,
        marginBottom: 2,
    },
    dateTimeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    textInput: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 70,
        marginBottom: 12,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 14,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    // Picker Modal Styles
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerModal: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    pickerDoneText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    picker: {
        height: Platform.OS === 'ios' ? 340 : 200,
    },
});

export default AttendanceTrackingCards;
