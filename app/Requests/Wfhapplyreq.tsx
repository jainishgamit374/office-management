import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Wfhapplyreq = () => {
    const [selectedDate, setSelectedDate] = useState('2025-12-18');
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [reason, setReason] = useState('');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleSubmit = () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for your WFH request');
            return;
        }

        const requestType = isHalfDay ? 'Half-Day Leave' : 'WFH Request';
        Alert.alert(
            'Success',
            `${requestType} submitted successfully!\n\nDate: ${formatDate(selectedDate)}`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        setReason('');
                        setIsHalfDay(false);
                    },
                },
            ]
        );
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
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <TouchableOpacity style={styles.dateBox}>
                        <View style={styles.dateIconContainer}>
                            <Feather name="calendar" size={20} color="#007bff" />
                        </View>
                        <View style={styles.dateTextContainer}>
                            <Text style={styles.dateLabel}>WFH Date</Text>
                            <Text style={styles.dateValue}>{formatDate(selectedDate)}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Half-Day Leave Checkbox */}
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
                            <Text style={styles.checkboxLabel}>Apply for Half-Day Leave</Text>
                            <Text style={styles.checkboxSubtext}>
                                Check this if you need only half-day leave
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Reason Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason</Text>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder="Enter reason for work from home..."
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
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                >
                    <Feather name="send" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>
                        {isHalfDay ? 'Submit for Half-Day Leave' : 'Submit for WFH Request'}
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
                            {isHalfDay
                                ? 'Half-day leave requests should be submitted at least 1 day in advance. Please coordinate with your team for coverage.'
                                : 'Work from home requests should be submitted at least 1 day in advance. Ensure you have a stable internet connection and necessary equipment.'}
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