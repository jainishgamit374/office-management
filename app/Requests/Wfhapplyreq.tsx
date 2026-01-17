import { authApiRequest } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Wfhapplyreq = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [isFirstHalf, setIsFirstHalf] = useState(true);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const calculateDays = () => {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return isHalfDay ? 0.5 : diffDays;
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
            // If end date is before start date, update it
            if (selectedDate > endDate) {
                setEndDate(selectedDate);
            }
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) {
            // Ensure end date is not before start date
            if (selectedDate >= startDate) {
                setEndDate(selectedDate);
            } else {
                Alert.alert('Invalid Date', 'End date cannot be before start date');
            }
        }
    };

    const formatDateForAPI = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for your WFH request');
            return;
        }

        if (reason.trim().length < 10) {
            Alert.alert('Error', 'Reason must be at least 10 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const requestData = {
                DateTime: formatDateForAPI(startDate),
                IsFirstHalf: isHalfDay ? isFirstHalf : false,
                IsHalfDay: isHalfDay,
                Reason: reason.trim(),
            };

            console.log('📤 Submitting WFH Request:', requestData);

            const response = await authApiRequest<{
                status: string;
                statusCode: number;
                message: string;
                WorkFromHomeReqCode?: string;
            }>('/workfromhomereq/', {
                method: 'POST',
                body: JSON.stringify(requestData),
            });

            console.log('✅ WFH Response:', response);

            if (response.status === 'Success') {
                Alert.alert(
                    'Success! ✅',
                    `${response.message}\n\nRequest Code: ${response.WorkFromHomeReqCode || 'N/A'}\nDate: ${formatDate(startDate)}${isHalfDay ? ` (${isFirstHalf ? 'First' : 'Second'} Half)` : ''}\n\nYour request has been sent for approval.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setReason('');
                                setIsHalfDay(false);
                                setIsFirstHalf(true);
                                setStartDate(new Date());
                                setEndDate(new Date());
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Error', response.message || 'Failed to submit WFH request');
            }
        } catch (error: any) {
            console.error('❌ WFH Request Error:', error);
            
            // Check if this is a workflow configuration error
            const errorMessage = error.message || 'Failed to submit WFH request. Please try again.';
            const isWorkflowError = errorMessage.toLowerCase().includes('workflow');
            
            Alert.alert(
                isWorkflowError ? 'Setup Required' : 'Error',
                isWorkflowError 
                    ? `${errorMessage}\n\n📋 What this means:\nYour WFH approval workflow needs to be configured by the HR team before you can submit requests.\n\n👉 Next Steps:\n1. Contact your HR department\n2. Request them to set up your WFH approval workflow\n3. Once configured, you'll be able to submit WFH requests`
                    : errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
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
                        <View style={styles.headerIconContainer}>
                            <Feather name="home" size={28} color="#007bff" />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Work From Home</Text>
                            <Text style={styles.headerSubtitle}>
                                Apply for work from home request
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Date Selection Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Dates</Text>

                    {/* Start Date */}
                    <TouchableOpacity
                        style={styles.dateBox}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <View style={styles.dateIconContainer}>
                            <Feather name="calendar" size={20} color="#007bff" />
                        </View>
                        <View style={styles.dateTextContainer}>
                            <Text style={styles.dateLabel}>Start Date</Text>
                            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>

                    {/* End Date */}
                    <TouchableOpacity
                        style={[styles.dateBox, { marginTop: 12 }]}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <View style={styles.dateIconContainer}>
                            <Feather name="calendar" size={20} color="#007bff" />
                        </View>
                        <View style={styles.dateTextContainer}>
                            <Text style={styles.dateLabel}>End Date</Text>
                            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>

                    {/* Total Days Display */}
                    <View style={styles.totalDaysContainer}>
                        <Feather name="clock" size={16} color="#007bff" />
                        <Text style={styles.totalDaysText}>
                            Total: {calculateDays()} {calculateDays() === 1 ? 'Day' : 'Days'}
                        </Text>
                    </View>
                </View>

                {/* Date Pickers */}
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

                {/* Half-Day Checkbox */}
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
                            <Text style={styles.checkboxLabel}>Half-Day WFH</Text>
                            <Text style={styles.checkboxSubtext}>
                                Check this if you need only half-day work from home
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Half-Day Selection */}
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
                                    activeOpacity={0.7}
                                >
                                    <Feather
                                        name="sunrise"
                                        size={18}
                                        color={isFirstHalf ? '#FFF' : '#007bff'}
                                    />
                                    <Text
                                        style={[
                                            styles.halfDayButtonText,
                                            isFirstHalf && styles.halfDayButtonTextActive,
                                        ]}
                                    >
                                        First Half
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.halfDayButton,
                                        !isFirstHalf && styles.halfDayButtonActive,
                                    ]}
                                    onPress={() => setIsFirstHalf(false)}
                                    activeOpacity={0.7}
                                >
                                    <Feather
                                        name="sunset"
                                        size={18}
                                        color={!isFirstHalf ? '#FFF' : '#007bff'}
                                    />
                                    <Text
                                        style={[
                                            styles.halfDayButtonText,
                                            !isFirstHalf && styles.halfDayButtonTextActive,
                                        ]}
                                    >
                                        Second Half
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Reason Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason *</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder="Enter reason for work from home (minimum 10 characters)..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={5}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Text style={styles.characterCount}>{reason.length}/500 characters</Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Feather name="send" size={20} color="#FFF" />
                    )}
                    <Text style={styles.submitButtonText}>
                        {isLoading ? 'Submitting...' : 'Submit WFH Request'}
                    </Text>
                </TouchableOpacity>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                        <Feather name="info" size={20} color="#007bff" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Important Note</Text>
                        <Text style={styles.infoText}>
                            Work from home requests should be submitted at least 1 day in advance.
                            Ensure you have a stable internet connection and necessary equipment.
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
        backgroundColor: '#007bff20',
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

    // Date Box
    dateBox: {
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
    dateIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        fontWeight: '600',
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    totalDaysContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    totalDaysText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#007bff',
    },

    // Checkbox
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        gap: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    checkboxActive: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    checkboxTextContainer: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    checkboxSubtext: {
        fontSize: 12,
        color: '#999',
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
        backgroundColor: '#007bff',
        borderRadius: 12,
        padding: 18,
        gap: 10,
        shadowColor: '#007bff',
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
        backgroundColor: '#999',
        shadowOpacity: 0.1,
    },

    // Half-Day Selector
    halfDaySelector: {
        marginTop: 16,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    halfDayLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
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
        backgroundColor: '#E3F2FD',
        borderRadius: 10,
        padding: 14,
        borderWidth: 2,
        borderColor: '#E3F2FD',
    },
    halfDayButtonActive: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    halfDayButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007bff',
    },
    halfDayButtonTextActive: {
        color: '#FFF',
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#D1FAE5',
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
        shadowColor: '#10B981',
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

export default Wfhapplyreq;