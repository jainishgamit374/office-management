import { useRefresh } from '@/contexts/RefreshContext';
import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { applyLeave, calculateLeaveDays, getEmployeeLeaveBalance, validateLeaveApplication } from '@/lib/leaves';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LeaveType = 'PL' | 'CL' | 'SL' | 'LWP';

const Leaveapplyreq = () => {
    const { colors } = useTheme();
    const { triggerRefresh } = useRefresh();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [isFirstHalf, setIsFirstHalf] = useState(true);
    const [contactNumber, setContactNumber] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);

    // Leave balance data
    const [leaveBalance, setLeaveBalance] = useState<{
        [key: string]: {
            name: string;
            total: number;
            used: number;
            pending: number;
            available: number;
        };
    }>({});

    // Fetch leave balance
    // 📊 Balance Lifecycle:
    // 1. When leave is APPLIED → balance goes to "pending" (not deducted yet)
    // 2. When leave is APPROVED → balance moves from "pending" to "used" (deducted)
    // 3. When leave is REJECTED → balance is restored from "pending" to "available"
    // 
    // Formula: Available = Total - Used - Pending
    const fetchLeaveBalance = useCallback(async () => {
        try {
            setIsLoadingBalance(true);
            const response = await getEmployeeLeaveBalance();

            if (response.data && Array.isArray(response.data)) {
                const balanceMap: any = {};
                response.data.forEach((item: any) => {
                    const key = item.Leavename; 
                    // Calculate actual available balance
                    // If the API provides used/pending, use them; otherwise assume all is available
                    const total = item.count || 0;
                    const used = item.used || 0;
                    const pending = item.pending || 0;
                    const available = Math.max(0, total - used - pending);
                    
                    balanceMap[key] = {
                        name: item.Leavename,
                        total: total, 
                        used: used,           // Approved and consumed leaves
                        pending: pending,     // Applied but awaiting approval
                        available: available  // Can be applied for (Total - Used - Pending)
                    };
                });
                setLeaveBalance(balanceMap);
                console.log('📊 Leave balance loaded:', balanceMap);
            }
        } catch (error) {
            console.error('Failed to fetch leave balance:', error);
            Alert.alert('Error', 'Failed to load leave balance. Please try again.');
        } finally {
            setIsLoadingBalance(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchLeaveBalance();
        }, [fetchLeaveBalance])
    );

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDateForAPI = (date: Date) => {
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const day = String(date.getDate()).padStart(2, '0');
         return `${year}-${month}-${day}`;
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
            if (selectedDate > endDate) {
                setEndDate(selectedDate);
            }
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) {
            if (selectedDate >= startDate) {
                setEndDate(selectedDate);
            } else {
                Alert.alert('Invalid Date', 'End date cannot be before start date');
            }
        }
    };

    const handleSubmit = async () => {
        if (!selectedLeaveType) {
            Alert.alert('Error', 'Please select a leave type');
            return;
        }

        const sDateStr = formatDateForAPI(startDate);
        const eDateStr = formatDateForAPI(endDate);

        // Calculate total days
        const totalDays = calculateLeaveDays(sDateStr, eDateStr, isHalfDay);

        // ✅ Enhanced leave balance validation
        const balance = leaveBalance[selectedLeaveType];
        
        if (!balance) {
            Alert.alert(
                'Balance Not Available',
                `Unable to fetch ${selectedLeaveType} balance. Please refresh and try again.`
            );
            return;
        }

        // Check if sufficient balance is available
        if (balance.available < totalDays) {
            const shortBy = (totalDays - balance.available).toFixed(1);
            const message = `You don't have enough ${selectedLeaveType} leave balance.\n\n` +
                `📊 Balance Details:\n` +
                `• Total: ${balance.total} days\n` +
                `• Used: ${balance.used} days\n` +
                `• Pending: ${balance.pending} days\n` +
                `• Available: ${balance.available} days\n\n` +
                `🚫 Requested: ${totalDays} days\n` +
                `⚠️ Short by: ${shortBy} days`;
            
            Alert.alert('Insufficient Leave Balance', message);
            return;
        }

        const validation = validateLeaveApplication({
            LeaveType: selectedLeaveType,
            Reason: reason,
            StartDate: sDateStr,
            EndDate: eDateStr,
            IsHalfDay: isHalfDay,
            IsFirstHalf: isFirstHalf,
            ContactNumber: contactNumber
        });

        if (!validation.valid) {
            Alert.alert('Validation Error', validation.errors.join('\n'));
            return;
        }

        try {
            setIsSubmitting(true);
            const leaveData = {
                LeaveType: selectedLeaveType,
                Reason: reason.trim(),
                StartDate: sDateStr,
                EndDate: eDateStr,
                IsHalfDay: isHalfDay,
                IsFirstHalf: isFirstHalf,
                ContactNumber: contactNumber,
            };

            await applyLeave(leaveData);

            Alert.alert(
                'Success! ✅',
                `Leave application submitted successfully!\nType: ${selectedLeaveType}\nDays: ${totalDays}`,
                [{
                    text: 'OK',
                    onPress: () => {
                        setSelectedLeaveType(null);
                        setReason('');
                        setIsHalfDay(false);
                        setStartDate(new Date());
                        setEndDate(new Date());
                        setContactNumber('');
                        fetchLeaveBalance();
                        // Trigger global refresh to update all components
                        triggerRefresh();
                    },
                }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit leave application');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLeaveTypeColor = (type: string) => {
        switch (type) {
            case 'PL': return '#9C27B0';
            case 'CL': return '#2196F3';
            case 'SL': return '#FF9800';
            default: return colors.primary;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerIconContainer}>
                            <Feather name="calendar" size={28} color={colors.primary} />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Apply for Leave</Text>
                            <Text style={styles.headerSubtitle}>Submit your leave request</Text>
                        </View>
                    </View>
                </View>

                {/* Leave Balance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Balance</Text>
                    {isLoadingBalance ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                            {['CL', 'SL', 'PL'].map((key) => {
                                const value = leaveBalance[key] || { available: 0, total: 0, used: 0, pending: 0 };
                                const color = getLeaveTypeColor(key);
                                const hasBalance = value.available > 0;
                                
                                return (
                                    <View key={key} style={[
                                        styles.balanceCard,
                                        !hasBalance && styles.balanceCardEmpty
                                    ]}>
                                        <Text style={[styles.balanceCount, { color }]}>{value.available}</Text>
                                        <Text style={styles.balanceLabel}>{key}</Text>
                                        <Text style={styles.balanceSubtext}>of {value.total}</Text>
                                        {value.pending > 0 && (
                                            <Text style={styles.balancePending}>({value.pending} pending)</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Leave Type Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Leave Type</Text>
                    <View style={styles.leaveTypeRow}>
                        {(['CL', 'SL', 'PL'] as LeaveType[]).map((type) => {
                            const isSelected = selectedLeaveType === type;
                            const color = getLeaveTypeColor(type);
                            const balance = leaveBalance[type];
                            const hasBalance = balance && balance.available > 0;
                            const isDisabled = !isLoadingBalance && !hasBalance;
                            
                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.leaveTypeChip,
                                        isSelected && { backgroundColor: color, borderColor: color },
                                        isDisabled && styles.leaveTypeChipDisabled,
                                    ]}
                                    onPress={() => {
                                        if (!isDisabled) {
                                            setSelectedLeaveType(type);
                                        } else {
                                            Alert.alert(
                                                'No Balance',
                                                `You don't have any ${type} leave balance available.`
                                            );
                                        }
                                    }}
                                    disabled={isDisabled}
                                >
                                    <Feather 
                                        name={isSelected ? "check-circle" : "circle"} 
                                        size={18} 
                                        color={isSelected ? "#FFF" : (isDisabled ? colors.textTertiary : colors.textSecondary)} 
                                    />
                                    <Text style={[
                                        styles.leaveTypeText, 
                                        isSelected && styles.leaveTypeTextActive,
                                        isDisabled && styles.leaveTypeTextDisabled,
                                    ]}>
                                        {type}
                                    </Text>
                                    {!isLoadingBalance && balance && (
                                        <Text style={[
                                            styles.leaveTypeBalance,
                                            isSelected && styles.leaveTypeBalanceActive,
                                            isDisabled && styles.leaveTypeBalanceDisabled,
                                        ]}>
                                            ({balance.available})
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Dates Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Dates</Text>

                    {/* Start Date */}
                    <TouchableOpacity
                        style={styles.dateBox}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <View style={styles.dateIconContainer}>
                            <Feather name="calendar" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.dateTextContainer}>
                            <Text style={styles.dateLabel}>Start Date</Text>
                            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* End Date */}
                    <TouchableOpacity
                        style={[styles.dateBox, { marginTop: 12 }]}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <View style={styles.dateIconContainer}>
                            <Feather name="calendar" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.dateTextContainer}>
                            <Text style={styles.dateLabel}>End Date</Text>
                            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Total Days */}
                    <View style={styles.totalDaysContainer}>
                        <Feather name="clock" size={16} color={colors.primary} />
                        <Text style={styles.totalDaysText}>
                            Total: {calculateLeaveDays(formatDateForAPI(startDate), formatDateForAPI(endDate), isHalfDay)} Days
                        </Text>
                    </View>
                </View>

                {showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleStartDateChange}
                        minimumDate={new Date()}
                    />
                )}

                {showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleEndDateChange}
                        minimumDate={startDate}
                    />
                )}

                {/* Half Day Checkbox */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setIsHalfDay(!isHalfDay)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, isHalfDay && styles.checkboxActive]}>
                            {isHalfDay && (
                                <Feather name="check" size={18} color="#FFF" />
                            )}
                        </View>
                        <View style={styles.checkboxTextContainer}>
                            <Text style={styles.checkboxLabel}>Half-Day Leave</Text>
                            <Text style={styles.checkboxSubtext}>Check if applying for half day</Text>
                        </View>
                    </TouchableOpacity>

                    {isHalfDay && (
                        <View style={styles.halfDaySelector}>
                            <Text style={styles.halfDayLabel}>Select Half:</Text>
                            <View style={styles.halfDayButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.halfDayButton,
                                        isFirstHalf && styles.halfDayButtonActive,
                                    ]}
                                    onPress={() => setIsFirstHalf(true)}
                                >
                                    <Feather name="sunrise" size={18} color={isFirstHalf ? '#FFF' : colors.primary} />
                                    <Text style={[styles.halfDayButtonText, isFirstHalf && styles.halfDayButtonTextActive]}>First Half</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.halfDayButton,
                                        !isFirstHalf && styles.halfDayButtonActive,
                                    ]}
                                    onPress={() => setIsFirstHalf(false)}
                                >
                                    <Feather name="sunset" size={18} color={!isFirstHalf ? '#FFF' : colors.primary} />
                                    <Text style={[styles.halfDayButtonText, !isFirstHalf && styles.halfDayButtonTextActive]}>Second Half</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Reason */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason *</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder="Reason for leave..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                    />
                </View>

                {/* Contact Number (Optional) */}
                <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Contact Number (Optional)</Text>
                     <TextInput
                        style={[styles.reasonInput, { minHeight: 50 }]}
                        numberOfLines={1}
                        placeholder="Emergency contact..."
                        placeholderTextColor={colors.textTertiary}
                        value={contactNumber}
                        onChangeText={setContactNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Feather name="send" size={20} color="#FFF" />
                    )}
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        backgroundColor: `${colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },

    // Balance Card
    balanceCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        minWidth: 80,
    },
    balanceCount: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    balanceLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    balanceSubtext: {
        fontSize: 10,
        color: colors.textTertiary,
        marginTop: 2,
    },
    balancePending: {
        fontSize: 9,
        color: colors.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    balanceCardEmpty: {
        opacity: 0.5,
    },

    // Leave Types
    leaveTypeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    leaveTypeChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    leaveTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    leaveTypeTextActive: {
        color: '#FFF',
    },
    leaveTypeTextDisabled: {
        color: colors.textTertiary,
        opacity: 0.5,
    },
    leaveTypeBalance: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textSecondary,
        marginLeft: 4,
    },
    leaveTypeBalanceActive: {
        color: '#FFF',
    },
    leaveTypeBalanceDisabled: {
        color: colors.textTertiary,
        opacity: 0.5,
    },
    leaveTypeChipDisabled: {
        opacity: 0.5,
        backgroundColor: colors.border,
    },

    // Date Box
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateTextContainer: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    totalDaysContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: `${colors.primary}15`,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    totalDaysText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },

    // Checkbox
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        gap: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
    },
    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxTextContainer: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    checkboxSubtext: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    halfDaySelector: {
        marginTop: 16,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    halfDayLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
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
        gap: 8,
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    halfDayButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    halfDayButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    halfDayButtonTextActive: {
        color: '#FFF',
    },

    // Inputs
    reasonInput: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 120,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    // Submit
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 18,
        gap: 10,
        shadowColor: colors.primary,
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
        backgroundColor: colors.border,
        shadowOpacity: 0.1,
    },
});

export default Leaveapplyreq;