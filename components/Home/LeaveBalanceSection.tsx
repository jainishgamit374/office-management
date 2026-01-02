import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getPunchStatus } from '@/lib/attendance';
import { getLateCheckinCount, type LateCheckinCountResponse } from '@/lib/earlyLatePunch';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LeaveBalanceData {
    name: string;
    total: number;
    used: number;
    pending: number;
    available: number;
}

const LeaveBalanceSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [leaveBalances, setLeaveBalances] = useState<{ [key: string]: LeaveBalanceData }>({});
    const [lateCheckinData, setLateCheckinData] = useState<LateCheckinCountResponse['data'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaveBalance = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch both leave balance and late check-in count in parallel
            const [punchResponse, lateCheckinResponse] = await Promise.all([
                getPunchStatus(),
                getLateCheckinCount().catch(err => {
                    console.warn('⚠️ Failed to load late check-in count:', err);
                    return null;
                })
            ]);

            if (punchResponse.data?.leaveBalance) {
                setLeaveBalances(punchResponse.data.leaveBalance);
                console.log('✅ Leave balance loaded from API');
            } else {
                // Fallback to empty state
                setLeaveBalances({});
                console.log('⚠️ No leave balance data in response');
            }

            if (lateCheckinResponse?.data) {
                setLateCheckinData(lateCheckinResponse.data);
                console.log('✅ Late check-in count loaded from API');
            }
        } catch (err: any) {
            console.error('❌ Failed to load data:', err);
            setError(err.message);
            // Set default values on error
            setLeaveBalances({});
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchLeaveBalance();
        }, [fetchLeaveBalance])
    );

    // Get leave data by type
    const getLeaveData = (leaveType: string): LeaveBalanceData => {
        return leaveBalances[leaveType] || {
            name: leaveType,
            total: 0,
            used: 0,
            pending: 0,
            available: 0,
        };
    };

    // Get badge color
    const getBadgeColor = (leaveName: string): string => {
        switch (leaveName) {
            case 'PL': return '#4caf50';
            case 'CL': return '#2196f3';
            case 'SL': return '#ff9800';
            default: return '#9e9e9e';
        }
    };

    // Calculate total available leaves
    const getTotalAvailable = (): number => {
        const cl = getLeaveData('CL');
        const sl = getLeaveData('SL');
        const pl = getLeaveData('PL');
        return cl.available + sl.available + pl.available;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Leave Balance</Text>
                    <Text style={styles.subtitle}>Remaining leaves available</Text>
                </View>
                <TouchableOpacity
                    onPress={fetchLeaveBalance}
                    disabled={isLoading}
                    style={styles.refreshButton}
                >
                    <Feather
                        name="refresh-cw"
                        size={20}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            ) : (
                <View style={styles.grid}>
                    {/* Privilege Leave (PL) */}
                    <View style={styles.card}>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor('PL') }]}>
                            <Text style={styles.badgeText}>PL</Text>
                        </View>
                        <Text style={styles.count}>{getLeaveData('PL').available}</Text>
                        <Text style={styles.leaveLabel}>Available</Text>
                        {getLeaveData('PL').pending > 0 && (
                            <Text style={styles.pendingText}>({getLeaveData('PL').pending} pending)</Text>
                        )}
                    </View>

                    {/* Casual Leave (CL) */}
                    <View style={styles.card}>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor('CL') }]}>
                            <Text style={styles.badgeText}>CL</Text>
                        </View>
                        <Text style={styles.count}>{getLeaveData('CL').available}</Text>
                        <Text style={styles.leaveLabel}>Available</Text>
                        {getLeaveData('CL').pending > 0 && (
                            <Text style={styles.pendingText}>({getLeaveData('CL').pending} pending)</Text>
                        )}
                    </View>

                    {/* Sick Leave (SL) */}
                    <View style={styles.card}>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor('SL') }]}>
                            <Text style={styles.badgeText}>SL</Text>
                        </View>
                        <Text style={styles.count}>{getLeaveData('SL').available}</Text>
                        <Text style={styles.leaveLabel}>Available</Text>
                        {getLeaveData('SL').pending > 0 && (
                            <Text style={styles.pendingText}>({getLeaveData('SL').pending} pending)</Text>
                        )}
                    </View>

                    {/* Total */}
                    <View style={styles.card}>
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.badgeText}>Total</Text>
                        </View>
                        <Text style={styles.count}>{getTotalAvailable()}</Text>
                        <Text style={styles.leaveLabel}>Available</Text>
                    </View>
                </View>
            )}

            {/* Leave Balance Summary */}
            {!isLoading && Object.keys(leaveBalances).length > 0 && (
                <View style={styles.lateCheckinContainer}>
                    <View style={styles.lateCheckinHeader}>
                        <Feather name="calendar" size={16} color={colors.primary} />
                        <Text style={styles.lateCheckinTitle}>Leave Balance Summary</Text>
                    </View>
                    <View style={styles.lateCheckinContent}>
                        <View style={styles.lateCheckinStats}>
                            <Text style={[
                                styles.lateCheckinCount,
                                { color: colors.primary }
                            ]}>
                                {Object.values(leaveBalances).reduce((sum, leave) => sum + leave.total, 0)}
                            </Text>
                            <Text style={styles.lateCheckinLabel}>Total Leaves</Text>
                        </View>
                        <View style={styles.lateCheckinDivider} />
                        <View style={styles.lateCheckinStats}>
                            <Text style={[
                                styles.lateCheckinCount,
                                { color: colors.error }
                            ]}>
                                {Object.values(leaveBalances).reduce((sum, leave) => sum + leave.used, 0)}
                            </Text>
                            <Text style={styles.lateCheckinLabel}>Used</Text>
                        </View>
                        <View style={styles.lateCheckinDivider} />
                        <View style={styles.lateCheckinStats}>
                            <Text style={[
                                styles.lateCheckinCount,
                                { color: getTotalAvailable() > 5 ? colors.success : colors.warning }
                            ]}>
                                {getTotalAvailable()}
                            </Text>
                            <Text style={styles.lateCheckinLabel}>Remaining</Text>
                        </View>
                    </View>
                    {getTotalAvailable() <= 3 && getTotalAvailable() > 0 && (
                        <View style={styles.warningBox}>
                            <Feather name="alert-circle" size={12} color={colors.warning} />
                            <Text style={[styles.warningText, { color: colors.warning }]}>Running low on leaves!</Text>
                        </View>
                    )}
                    {getTotalAvailable() === 0 && (
                        <View style={styles.warningBox}>
                            <Feather name="alert-triangle" size={12} color={colors.error} />
                            <Text style={styles.warningText}>No leaves remaining!</Text>
                        </View>
                    )}
                </View>
            )}

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};


const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    subtitle: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    refreshButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: colors.primary + '10',
    },
    loadingContainer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 15,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    badge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        width: 50,
    },
    count: {
        fontSize: 24,
        width: 50,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    leaveLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    pendingText: {
        fontSize: 9,
        color: colors.warning,
        textAlign: 'center',
        marginTop: 2,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        textAlign: 'center',
        marginTop: 10,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 15,
        padding: 10,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: colors.info,
    },
    infoText: {
        flex: 1,
        fontSize: 11,
        color: colors.textSecondary,
    },
    lateCheckinContainer: {
        marginTop: 15,
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    lateCheckinHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    lateCheckinTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        width: '60%',
    },
    lateCheckinContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    lateCheckinStats: {
        alignItems: 'center',
        gap: 4,
    },
    lateCheckinCount: {
        fontSize: 28,
        fontWeight: '700',
    },
    lateCheckinLabel: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    lateCheckinDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        padding: 8,
        backgroundColor: '#ffebee',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
    },
    warningText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.error,
    },
});

export default LeaveBalanceSection;
