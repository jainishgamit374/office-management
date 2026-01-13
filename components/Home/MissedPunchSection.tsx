import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getMissingPunchOut } from '@/lib/attendance';
import { getMissingPunchDetails } from '@/lib/missPunchList';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MissedPunch {
    id: number;
    date: string;
    dateFormatted: string;
    type: 'check-in' | 'check-out';
    reason: string;
    status: string;
}

interface MissingPunchOut {
    date: string;
    dateFormatted: string;
}

const MissedPunchSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [isLoading, setIsLoading] = useState(true);
    const [missedPunches, setMissedPunches] = useState<MissedPunch[]>([]);
    const [missingPunchOuts, setMissingPunchOuts] = useState<MissingPunchOut[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPunch, setSelectedPunch] = useState<MissedPunch | null>(null);
    const [selectedMissingPunchOut, setSelectedMissingPunchOut] = useState<MissingPunchOut | null>(null);

    const fetchMissedPunches = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('📋 Fetching missed punches and missing punch-outs from API...');
            
            // Fetch both data sources in parallel
            const [missedPunchResponse, missingPunchOutResponse] = await Promise.all([
                getMissingPunchDetails(),
                getMissingPunchOut()
            ]);

            // Transform missed punch requests
            if (missedPunchResponse.status === 'Success' && missedPunchResponse.data) {
                console.log('📋 Raw missed punch data:', JSON.stringify(missedPunchResponse.data, null, 2));
                
                const missedPunchData: MissedPunch[] = missedPunchResponse.data.map((item: any) => {
                    const date = new Date(item.datetime);
                    const punchType = item.PunchType === '1' ? 'check-in' : 'check-out';
                    
                    console.log(`📌 Processing: ID=${item.MissPunchReqMasterID}, PunchType="${item.PunchType}" → ${punchType}`);
                    
                    return {
                        id: item.MissPunchReqMasterID,
                        date: item.datetime,
                        dateFormatted: date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }),
                        type: punchType,
                        reason: item.reason || 'No reason provided',
                        status: item.approval_status,
                    };
                });

                // Count by type
                const checkInCount = missedPunchData.filter(p => p.type === 'check-in').length;
                const checkOutCount = missedPunchData.filter(p => p.type === 'check-out').length;
                
                console.log(`✅ Missed punches loaded: ${missedPunchData.length} total`);
                console.log(`   - Check-IN requests: ${checkInCount}`);
                console.log(`   - Check-OUT requests: ${checkOutCount}`);

                setMissedPunches(missedPunchData);
            } else {
                setMissedPunches([]);
            }

            // Transform missing punch-out dates
            if (missingPunchOutResponse.status === 'Success' && missingPunchOutResponse.data) {
                const missingPunchOutData: MissingPunchOut[] = missingPunchOutResponse.data.map((item: any) => {
                    const date = new Date(item.missing_date);
                    return {
                        date: item.missing_date,
                        dateFormatted: date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }),
                    };
                });

                setMissingPunchOuts(missingPunchOutData);
                console.log('✅ Missing punch-outs loaded from API:', missingPunchOutData.length);
            } else {
                setMissingPunchOuts([]);
            }
        } catch (error) {
            console.error('❌ Failed to fetch missed punches:', error);
            setMissedPunches([]);
            setMissingPunchOuts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchMissedPunches();
        }, [fetchMissedPunches])
    );

    const handlePunchClick = (punch: MissedPunch) => {
        setSelectedPunch(punch);
        setSelectedMissingPunchOut(null);
        setShowModal(true);
    };

    const handleMissingPunchOutClick = (punchOut: MissingPunchOut) => {
        setSelectedMissingPunchOut(punchOut);
        setSelectedPunch(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPunch(null);
        setSelectedMissingPunchOut(null);
    };

    const formatDateTime = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusColor = (status: string): string => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('approve') && !statusLower.includes('awaiting')) {
            return '#4CAF50';
        } else if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
            return '#FF9800';
        } else if (statusLower.includes('reject')) {
            return '#FF5252';
        }
        return '#9E9E9E';
    };

    // Don't render if no missed punches or missing punch-outs
    if (!isLoading && missedPunches.length === 0 && missingPunchOuts.length === 0) {
        return null;
    }

    const totalCount = missedPunches.length + missingPunchOuts.length;

    return (
        <>
            <View style={styles.container}>
                <View style={styles.mainTextContainer}>
                    <Text style={styles.mainText}>
                        Missed Punches {totalCount > 0 && `(${totalCount})`}
                    </Text>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                    </View>
                ) : (
                    <View style={styles.textContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollViewContent}
                        >
                            {/* Missing Punch-Outs (Warning - forgot to punch out) */}
                            {missingPunchOuts.map((punchOut, index) => (
                                <TouchableOpacity
                                    key={`missing-${index}`}
                                    style={styles.warningContainer}
                                    onPress={() => handleMissingPunchOutClick(punchOut)}
                                    activeOpacity={0.7}
                                >
                                    <Feather
                                        name="alert-circle"
                                        size={16}
                                        color="#FF5252"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.warningText}>{punchOut.dateFormatted}</Text>
                                    <Text style={styles.warningTypeText}>
                                        Missing Punch-Out
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            
                            {/* Missed Punch Requests (Pending approval) */}
                            {missedPunches.map((punch, index) => (
                                <TouchableOpacity
                                    key={`request-${index}`}
                                    style={styles.textContainerRight}
                                    onPress={() => handlePunchClick(punch)}
                                    activeOpacity={0.7}
                                >
                                    <Feather
                                        name={punch.type === 'check-in' ? 'log-in' : 'log-out'}
                                        size={16}
                                        color={colors.primary}
                                        style={styles.icon}
                                    />
                                    <Text style={styles.text}>{punch.dateFormatted}</Text>
                                    <Text style={styles.typeText}>
                                        {punch.type === 'check-in' ? 'Check-In' : 'Check-Out'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* Details Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedMissingPunchOut ? 'Missing Punch-Out' : 'Missed Punch Request'}
                            </Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Feather name="x" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedPunch && (
                            <View style={styles.modalBody}>
                                <View style={styles.detailRow}>
                                    <Feather 
                                        name={selectedPunch.type === 'check-in' ? 'log-in' : 'log-out'} 
                                        size={20} 
                                        color={colors.primary} 
                                    />
                                    <Text style={styles.detailLabel}>Type:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedPunch.type === 'check-in' ? 'Punch-In' : 'Punch-Out'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Feather name="calendar" size={20} color={colors.primary} />
                                    <Text style={styles.detailLabel}>Date & Time:</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDateTime(selectedPunch.date)}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Feather name="info" size={20} color={colors.primary} />
                                    <Text style={styles.detailLabel}>Reason:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedPunch.reason}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Feather name="check-circle" size={20} color={getStatusColor(selectedPunch.status)} />
                                    <Text style={styles.detailLabel}>Status:</Text>
                                    <Text style={[styles.detailValue, { color: getStatusColor(selectedPunch.status) }]}>
                                        {selectedPunch.status}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {selectedMissingPunchOut && (
                            <View style={styles.modalBody}>
                                <View style={styles.detailRow}>
                                    <Feather name="alert-circle" size={20} color="#FF5252" />
                                    <Text style={styles.detailLabel}>Type:</Text>
                                    <Text style={[styles.detailValue, { color: '#FF5252' }]}>
                                        Missing Punch-Out
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Feather name="calendar" size={20} color="#FF5252" />
                                    <Text style={styles.detailLabel}>Date:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedMissingPunchOut.dateFormatted}
                                    </Text>
                                </View>

                                <View style={styles.warningBox}>
                                    <Feather name="alert-triangle" size={16} color="#FF5252" />
                                    <Text style={styles.warningBoxText}>
                                        You forgot to punch out on this date. Please submit a missed punch request.
                                    </Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: colors.primary,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        gap: 15,
    },
    mainTextContainer: {
        width: '100%',
        alignItems: 'flex-start',
    },
    mainText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 10,
    },
    scrollViewContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 5,
    },
    textContainerRight: {
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 140,
        gap: 5,
    },
    warningContainer: {
        backgroundColor: '#FFEBEE',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 140,
        gap: 5,
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    icon: {
        marginBottom: 5,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
    typeText: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.textSecondary,
        textAlign: 'center',
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF5252',
        textAlign: 'center',
    },
    warningTypeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#D32F2F',
        textAlign: 'center',
        textTransform: 'uppercase',
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
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    modalBody: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        width: 90,
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FF5252',
        marginTop: 8,
    },
    warningBoxText: {
        flex: 1,
        fontSize: 12,
        color: '#D32F2F',
        fontWeight: '500',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default MissedPunchSection;

