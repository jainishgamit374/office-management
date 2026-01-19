import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getLateEarlyCount } from '@/lib/api';
import { createEarlyLatePunch, getLateCheckinCount } from '@/lib/earlyLatePunch';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please enter a reason');
            return;
        }

        try {
            setIsSubmitting(true);

            // Get current date/time in ISO format
            const now = new Date();
            const dateTime = now.toISOString().slice(0, 19); // Remove milliseconds and Z

            await createEarlyLatePunch(dateTime, selectedType, reason.trim());

            Alert.alert(
                'Success',
                `${selectedType === 'Early' ? 'Early checkout' : 'Late arrival'} recorded successfully!`,
                [{
                    text: 'OK', onPress: () => {
                        setShowModal(false);
                        setReason('');
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
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => setShowModal(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.label}>Early / Late Punch</Text>
                        <Feather name="clock" size={32} color={colors.warning} />
                        <Text style={styles.actionText}>Tap to Record</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleRefresh}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.label}>Late Check In</Text>
                        <Feather
                            name="log-in"
                            size={32}
                            color={lateCheckIns >= 5 ? '#FF5252' : lateCheckIns >= 3 ? '#FFA726' : '#4CAF50'}
                        />
                        <Text style={[
                            styles.count,
                            { color: lateCheckIns >= 5 ? '#FF5252' : lateCheckIns >= 3 ? '#FFA726' : '#4CAF50' }
                        ]}>
                            {lateCheckIns}/5
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleRefresh}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.label}>Early Check Out</Text>
                        <Feather
                            name="log-out"
                            size={32}
                            color={earlyCheckOuts >= 5 ? '#FF5252' : earlyCheckOuts >= 3 ? '#FFA726' : '#4CAF50'}
                        />
                        <Text style={[
                            styles.count,
                            { color: earlyCheckOuts >= 5 ? '#FF5252' : earlyCheckOuts >= 3 ? '#FFA726' : '#4CAF50' }
                        ]}>
                            {earlyCheckOuts}/5
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <Text style={styles.label}>Half Day</Text>
                        <Feather name="calendar" size={32} color={colors.primary} />
                        <Text style={styles.count}>0</Text>
                    </View>
                </ScrollView>
            </View>

            {/* Early/Late Punch Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Record Early/Late Punch</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Feather name="x" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Type Selection */}
                            <Text style={styles.sectionLabel}>Type</Text>
                            <View style={styles.typeContainer}>
                                <Pressable
                                    style={[
                                        styles.typeButton,
                                        selectedType === 'Early' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setSelectedType('Early')}
                                >
                                    <Feather
                                        name="log-out"
                                        size={20}
                                        color={selectedType === 'Early' ? '#fff' : colors.text}
                                    />
                                    <Text style={[
                                        styles.typeButtonText,
                                        selectedType === 'Early' && styles.typeButtonTextActive,
                                    ]}>
                                        Early Checkout
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.typeButton,
                                        selectedType === 'Late' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => setSelectedType('Late')}
                                >
                                    <Feather
                                        name="log-in"
                                        size={20}
                                        color={selectedType === 'Late' ? '#fff' : colors.text}
                                    />
                                    <Text style={[
                                        styles.typeButtonText,
                                        selectedType === 'Late' && styles.typeButtonTextActive,
                                    ]}>
                                        Late Arrival
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Reason Input */}
                            <Text style={styles.sectionLabel}>Reason *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter reason (e.g., Personal work, Medical appointment)"
                                placeholderTextColor={colors.textTertiary}
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                numberOfLines={4}
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
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Feather name="check" size={20} color="#fff" />
                                        <Text style={styles.submitButtonText}>Submit</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    wrapper: {
        marginTop: 10,
    },
    container: {
        paddingHorizontal: 16,
        paddingVertical: 5,
        gap: 10,
    },
    card: {
        width: 120,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 130,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
        width: '100%',
        paddingHorizontal: 9,
    },
    count: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginTop: 8,
        width: '100%',
        paddingHorizontal: 9,
        textAlign: 'center',
    },
    actionText: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.warning,
        marginTop: 8,
        width: '100%',
        paddingHorizontal: 9,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
        color: colors.text,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
        marginTop: 16,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    typeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    textInput: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 100,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default AttendanceTrackingCards;
