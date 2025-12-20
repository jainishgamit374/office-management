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

type MissPunchStatus = 'All' | 'Check-Out' | 'Late-Check-In';

const Misspunchreq = () => {
    const [selectedStatus, setSelectedStatus] = useState<MissPunchStatus>('All');
    const [selectedDate, setSelectedDate] = useState('2025-12-19');
    const [selectedTime, setSelectedTime] = useState('09:00 AM');
    const [reason, setReason] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const statusOptions: MissPunchStatus[] = ['All', 'Check-Out', 'Late-Check-In'];

    const handleSubmit = () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for the miss punch request');
            return;
        }

        Alert.alert(
            'Success',
            `Miss Punch request submitted successfully!\n\nStatus: ${selectedStatus}\nDate: ${formatDate(selectedDate)}\nTime: ${selectedTime}\nReason: ${reason}`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset form
                        setSelectedStatus('All');
                        setReason('');
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

    const getStatusColor = (status: MissPunchStatus) => {
        switch (status) {
            case 'Check-Out':
                return '#FF5252';
            case 'Late-Check-In':
                return '#FF9800';
            case 'All':
                return '#4A90FF';
            default:
                return '#666';
        }
    };

    const getStatusIcon = (status: MissPunchStatus) => {
        switch (status) {
            case 'Check-Out':
                return 'log-out';
            case 'Late-Check-In':
                return 'clock';
            case 'All':
                return 'list';
            default:
                return 'circle';
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
                    <Text style={styles.headerTitle}>Miss Punch Request</Text>
                    <Text style={styles.headerSubtitle}>
                        Submit a request for missed punch entries
                    </Text>
                </View>

                {/* Status Dropdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status Type</Text>
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
                            <Text style={styles.dropdownText}>{selectedStatus}</Text>
                        </View>
                        <Feather
                            name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#999"
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
                                            {status}
                                        </Text>
                                    </View>
                                    {selectedStatus === status && (
                                        <Feather name="check" size={20} color="#4A90FF" />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Date & Time Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date & Time</Text>
                    <View style={styles.dateTimeRow}>
                        {/* Date Picker */}
                        <TouchableOpacity
                            style={styles.dateTimeInput}
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

                        {/* Time Picker */}
                        <TouchableOpacity
                            style={styles.dateTimeInput}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <View style={styles.dateTimeIconContainer}>
                                <Feather name="clock" size={20} color="#4A90FF" />
                            </View>
                            <View style={styles.dateTimeTextContainer}>
                                <Text style={styles.dateTimeLabel}>Time</Text>
                                <Text style={styles.dateTimeValue}>{selectedTime}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Reason Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder="Explain why you missed the punch..."
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
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Feather name="send" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Date Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pickerPlaceholder}>
                            <Feather name="calendar" size={48} color="#4A90FF" />
                            <Text style={styles.placeholderText}>
                                Date picker will be implemented here
                            </Text>
                            <Text style={styles.placeholderSubtext}>
                                Current date: {formatDate(selectedDate)}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowDatePicker(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Time Picker Modal */}
            <Modal
                visible={showTimePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Time</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pickerPlaceholder}>
                            <Feather name="clock" size={48} color="#4A90FF" />
                            <Text style={styles.placeholderText}>
                                Time picker will be implemented here
                            </Text>
                            <Text style={styles.placeholderSubtext}>
                                Current time: {selectedTime}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowTimePicker(false)}
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

    // Header
    headerSection: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#999',
        lineHeight: 20,
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
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        // backgroundColor: '#682c2cff',
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
        width: '50%',
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    dropdownMenu: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
        shadowColor: '#000',
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
        borderBottomColor: '#F0F0F0',
    },
    dropdownOptionActive: {
        backgroundColor: '#F8FBFF',
    },
    dropdownOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dropdownOptionText: {
        width: '50%',
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },
    dropdownOptionTextActive: {
        color: '#4A90FF',
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
    dateTimeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    dateTimeValue: {
        fontSize: 14,
        fontWeight: '600',
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
    pickerPlaceholder: {
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

export default Misspunchreq;