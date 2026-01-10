import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getMissingPunchOut } from '@/lib/attendance';
import { getMissingPunchDetails } from '@/lib/missPunchList';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

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
                const missedPunchData: MissedPunch[] = missedPunchResponse.data.map((item: any) => {
                    const date = new Date(item.datetime);
                    return {
                        id: item.MissPunchReqMasterID,
                        date: item.datetime,
                        dateFormatted: date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }),
                        type: item.PunchType === '1' ? 'check-in' : 'check-out',
                        reason: item.reason || 'No reason provided',
                        status: item.approval_status,
                    };
                });

                setMissedPunches(missedPunchData);
                console.log('✅ Missed punches loaded from API:', missedPunchData.length);
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

    // Don't render if no missed punches or missing punch-outs
    if (!isLoading && missedPunches.length === 0 && missingPunchOuts.length === 0) {
        return null;
    }

    const totalCount = missedPunches.length + missingPunchOuts.length;

    return (
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
                            <View key={`missing-${index}`} style={styles.warningContainer}>
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
                            </View>
                        ))}
                        
                        {/* Missed Punch Requests (Pending approval) */}
                        {missedPunches.map((punch, index) => (
                            <View key={`request-${index}`} style={styles.textContainerRight}>
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
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
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
});

export default MissedPunchSection;

