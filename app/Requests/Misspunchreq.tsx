import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { submitEarlyCheckoutRequest, submitLateCheckinRequest } from '@/lib/earlyLatePunch';
import { submitMissPunch } from '@/lib/missPunchList';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MissPunchStatus = 'Miss-Punch' | 'Early-Check-Out' | 'Late-Check-In';

const Misspunchreq = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [selectedStatus, setSelectedStatus] = useState<MissPunchStatus>('Miss-Punch');
    
    // For Miss Punch, we might need Punch Type (In/Out). 
    // The user's prompt implies "Miss Punch" is the category, but usually it needs IN/OUT.
    // We'll assume default "IN" or add a toggle if needed. 
    // For now, let's keep it simple or infer. 
    // Actually, Miss Punch submission requires PunchType (1=In, 2=Out).
    // The previous code had "Check-Out" as a status. 
    // Let's add a toggle for "Punch Type" if status is Miss-Punch.
    const [punchType, setPunchType] = useState<1 | 2>(1); // 1=IN, 2=OUT

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reason, setReason] = useState('');
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions: MissPunchStatus[] = ['Miss-Punch', 'Early-Check-Out', 'Late-Check-In'];

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for the request');
            return;
        }

        setIsSubmitting(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
            // For time, we might need a full ISO string or similar depending on API.
            // submitMissPunch takes Date(YYYY-MM-DD).
            // submitEarlyCheckout takes DateTime (string).
            // submitLateCheckin takes DateTime (string).
            
            // Construct DateTime string locally (approximate ISO format typically required by backend)
            // Or just send the ISO string of the selected date object?
            // The APIs usually expect "YYYY-MM-DD HH:mm:ss" or ISO. 
            // Let's use ISO string for safety or construct specific format.
            // Based on earlyLatePunch.ts, it just takes "dateTime: string".
            
            // Adjust for local timezone offset if sending raw string? 
            // Or just send ISO. Let's send a simplified "YYYY-MM-DD HH:mm:ss" which fits SQL often.
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const hours = String(selectedDate.getHours()).padStart(2, '0');
            const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
            const seconds = String(selectedDate.getSeconds()).padStart(2, '0');
            
            const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            if (selectedStatus === 'Miss-Punch') {
                await submitMissPunch({
                    Date: dateStr,
                    PunchType: punchType,
                    Reason: reason
                });
            } else if (selectedStatus === 'Early-Check-Out') {
                await submitEarlyCheckoutRequest(formattedDateTime, reason);
            } else if (selectedStatus === 'Late-Check-In') {
                await submitLateCheckinRequest(formattedDateTime, reason);
            }

            Alert.alert('Success', `${selectedStatus.replace(/-/g, ' ')} request submitted successfully!`, [
                {
                    text: 'OK',
                    onPress: () => {
                        setReason('');
                        setSelectedDate(new Date());
                    }
                }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

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
            hour12: true
        });
    };

    const getStatusColor = (status: MissPunchStatus) => {
        switch (status) {
            case 'Early-Check-Out': return '#FF5252';
            case 'Late-Check-In': return '#FF9800';
            case 'Miss-Punch': return '#4A90FF';
            default: return colors.textSecondary;
        }
    };

    const getStatusIcon = (status: MissPunchStatus) => {
        switch (status) {
            case 'Early-Check-Out': return 'log-out';
            case 'Late-Check-In': return 'clock';
            case 'Miss-Punch': return 'alert-circle';
            default: return 'circle';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Attendance Request</Text>
                    <Text style={styles.headerSubtitle}>
                        Submit a request for missed punch, early checkout or late arrival
                    </Text>
                </View>

                {/* Status Dropdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Request Type</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                    >
                        <View style={styles.dropdownLeft}>
                            <View
                                style={[
                                    styles.statusIconContainer,
                                    { backgroundColor: `${getStatusColor(selectedStatus)}20` },
                                ]}
                            >
                                <Feather
                                    name={getStatusIcon(selectedStatus)}
                                    size={20}
                                    color={getStatusColor(selectedStatus)}
                                />
                            </View>
                            <Text style={styles.dropdownText}>{selectedStatus.replace(/-/g, ' ')}</Text>
                        </View>
                        <Feather
                            name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>

                    {/* Dropdown Options */}
                    {showStatusDropdown && (
                        <View style={styles.dropdownMenu}>
                            {statusOptions.map((status) => (
                                <Pressable
                                    key={status}
                                    style={[
                                        styles.dropdownOption,
                                        selectedStatus === status && styles.dropdownOptionActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedStatus(status);
                                        setShowStatusDropdown(false);
                                    }}
                                >
                                    <View style={styles.dropdownOptionLeft}>
                                        <View
                                            style={[
                                                styles.statusIconContainer,
                                                { backgroundColor: `${getStatusColor(status)}20` },
                                            ]}
                                        >
                                            <Feather
                                                name={getStatusIcon(status)}
                                                size={18}
                                                color={getStatusColor(status)}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.dropdownOptionText,
                                                selectedStatus === status &&
                                                styles.dropdownOptionTextActive,
                                            ]}
                                        >
                                            {status.replace(/-/g, ' ')}
                                        </Text>
                                    </View>
                                    {selectedStatus === status && (
                                        <Feather name="check" size={20} color={colors.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Punch Type Selector (Only for Miss Punch) */}
                {selectedStatus === 'Miss-Punch' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Punch Type</Text>
                        <View style={styles.punchTypeRow}>
                            <Pressable 
                                style={[styles.punchTypeBtn, punchType === 1 && styles.punchTypeBtnActive]}
                                onPress={() => setPunchType(1)}
                            >
                                <Feather name="log-in" size={18} color={punchType === 1 ? '#FFF' : colors.textSecondary} />
                                <Text style={[styles.punchTypeText, punchType === 1 && styles.punchTypeTextActive]}>Punch IN</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.punchTypeBtn, punchType === 2 && styles.punchTypeBtnActive]}
                                onPress={() => setPunchType(2)}
                            >
                                <Feather name="log-out" size={18} color={punchType === 2 ? '#FFF' : colors.textSecondary} />
                                <Text style={[styles.punchTypeText, punchType === 2 && styles.punchTypeTextActive]}>Punch OUT</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Date & Time Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date & Time</Text>
                    <View style={styles.dateTimeRow}>
                        {/* Date Picker Trigger */}
                        <TouchableOpacity
                            style={styles.dateTimeInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <View style={styles.dateTimeIconContainer}>
                                <Feather name="calendar" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.dateTimeTextContainer}>
                                <Text style={styles.dateTimeLabel}>Date</Text>
                                <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Time Picker Trigger (Only logic, if status needs time) */}
                        {selectedStatus !== 'Miss-Punch' && (
                            <TouchableOpacity
                                style={styles.dateTimeInput}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <View style={styles.dateTimeIconContainer}>
                                    <Feather name="clock" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.dateTimeTextContainer}>
                                    <Text style={styles.dateTimeLabel}>Time</Text>
                                    <Text style={styles.dateTimeValue}>{formatTime(selectedDate)}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                    {selectedStatus === 'Miss-Punch' && (
                         <Text style={styles.noteText}>* Miss Punch only requires Date.</Text>
                    )}
                </View>

                {/* Reason Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder="Explain usage..."
                        placeholderTextColor={colors.textTertiary}
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
                    style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : ( 
                        <>
                            <Feather name="send" size={20} color="#FFF" />
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Date/Time Picker Modal Logic (using native DateTimePicker if platform allows inside modal or inline) */}
            {/* For better UX, we use DateTimePicker directly if iOS/Android supports it nicely. 
                Platform specific: Android opens a dialog, iOS puts it inline or sheet. 
                We'll trigger the picker based on platform behavior. 
            */}
            
            {(showDatePicker || showTimePicker) && (Platform.OS === 'android' || Platform.OS === 'ios') && (
                <DateTimePicker
                    value={selectedDate}
                    mode={showDatePicker ? 'date' : 'time'}
                    display="default"
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                        if (event.type === 'set' && date) {
                            // Merge date/time appropriately
                            if (showDatePicker) {
                                // Update date part, keep time part
                                const newDate = new Date(selectedDate);
                                newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                setSelectedDate(newDate);
                            } else {
                                // Update time part, keep date part
                                const newDate = new Date(selectedDate);
                                newDate.setHours(date.getHours(), date.getMinutes());
                                setSelectedDate(newDate);
                            }
                        }
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Header
    headerSection: {
        marginBottom: 24,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
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

    // Dropdown
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    dropdownMenu: {
        backgroundColor: colors.card,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dropdownOptionActive: {
        backgroundColor: `${colors.primary}10`,
    },
    dropdownOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dropdownOptionText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    dropdownOptionTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },

    // Date & Time
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateTimeInput: {
        flex: 1,
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
    dateTimeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateTimeTextContainer: {
        flex: 1,
    },
    dateTimeLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateTimeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    noteText: {
        marginTop: 8,
        fontSize: 12,
        color: colors.textTertiary,
        fontStyle: 'italic',
    },

    // Punch Type
    punchTypeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    punchTypeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    punchTypeBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    punchTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    punchTypeTextActive: {
        color: '#FFF',
    },

    // Reason Input
    reasonInput: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 140,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    characterCount: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'right',
        marginTop: 8,
    },

    // Submit Button
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
        marginTop: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
});

export default Misspunchreq;