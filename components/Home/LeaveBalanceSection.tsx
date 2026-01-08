import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getEmployeeLeaveBalance, type LeaveBalanceItem } from '@/lib/leaves';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LeaveBalanceSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaveBalance = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🔄 [LeaveBalanceSection] Fetching leave balance...');
            const response = await getEmployeeLeaveBalance();

            console.log('📡 [LeaveBalanceSection] Full API response:', JSON.stringify(response, null, 2));

            // Handle different response structures
            let balanceData: LeaveBalanceItem[] = [];

            if (response.data && Array.isArray(response.data)) {
                balanceData = response.data;
                console.log('✅ Using response.data array:', balanceData);
            } else if (Array.isArray(response)) {
                balanceData = response as any;
                console.log('✅ Using direct response array:', balanceData);
            } else if (response && typeof response === 'object') {
                // Try to extract data from nested structure
                const possibleData = (response as any).leave_balance || (response as any).leaveBalance || (response as any).balances;
                if (possibleData && Array.isArray(possibleData)) {
                    balanceData = possibleData;
                    console.log('✅ Using nested data:', balanceData);
                }
            }

            if (balanceData.length > 0) {
                setLeaveBalances(balanceData);
                console.log('✅ Leave balance loaded:', balanceData.length, 'items');
                console.log('📊 Balance details:', balanceData.map(b => `${b.Leavename}: ${b.count}`).join(', '));
            } else {
                setLeaveBalances([]);
                console.warn('⚠️ No leave balance data found in response');
                console.warn('⚠️ Response structure:', Object.keys(response));
            }
        } catch (err: any) {
            console.error('❌ Failed to load leave balance:', err);
            console.error('❌ Error details:', err.message);
            setError(err.message);
            setLeaveBalances([]);
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

    // Get leave count by type
    const getLeaveCount = (leaveType: string): number => {
        const leave = leaveBalances.find(item => item.Leavename === leaveType);
        return leave?.count || 0;
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
        return leaveBalances.reduce((sum, leave) => sum + leave.count, 0);
    };

    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={fetchLeaveBalance}
            disabled={isLoading}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Leave Balance</Text>
                    <Text style={styles.subtitle}>
                        {isLoading ? 'Refreshing...' : 'Tap to refresh'}
                    </Text>
                </View>
                {isLoading && (
                    <ActivityIndicator size="small" color={colors.primary} />
                )}
            </View>

            {isLoading && !leaveBalances.length ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={20} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <>
                    <View style={styles.grid}>
                        {/* Privilege Leave (PL) */}
                        <View style={styles.card}>
                            <View style={[styles.badge, { backgroundColor: getBadgeColor('PL') }]}>
                                <Text style={styles.badgeText}>PL</Text>
                            </View>
                            <Text style={styles.count}>{getLeaveCount('PL')}</Text>
                            <Text style={styles.leaveLabel}>Available</Text>
                        </View>

                        {/* Casual Leave (CL) */}
                        <View style={styles.card}>
                            <View style={[styles.badge, { backgroundColor: getBadgeColor('CL') }]}>
                                <Text style={styles.badgeText}>CL</Text>
                            </View>
                            <Text style={styles.count}>{getLeaveCount('CL')}</Text>
                            <Text style={styles.leaveLabel}>Available</Text>
                        </View>

                        {/* Sick Leave (SL) */}
                        <View style={styles.card}>
                            <View style={[styles.badge, { backgroundColor: getBadgeColor('SL') }]}>
                                <Text style={styles.badgeText}>SL</Text>
                            </View>
                            <Text style={styles.count}>{getLeaveCount('SL')}</Text>
                            <Text style={styles.leaveLabel}>Available</Text>
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

                    {/* Leave Balance Summary */}
                    {leaveBalances.length > 0 && (
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryHeader}>
                                <Feather name="calendar" size={16} color={colors.primary} />
                                <Text style={styles.summaryTitle}>Leave Summary</Text>
                            </View>
                            <View style={styles.summaryContent}>
                                <View style={styles.summaryStats}>
                                    <Text style={[
                                        styles.summaryCount,
                                        { color: getTotalAvailable() > 5 ? colors.success : getTotalAvailable() > 0 ? colors.warning : colors.error }
                                    ]}>
                                        {getTotalAvailable()}
                                    </Text>
                                    <Text style={styles.summaryLabel}>Total Available</Text>
                                </View>
                            </View>
                            {getTotalAvailable() <= 3 && getTotalAvailable() > 0 && (
                                <View style={styles.warningBox}>
                                    <Feather name="alert-circle" size={12} color={colors.warning} />
                                    <Text style={[styles.warningText, { color: colors.warning }]}>Running low on leaves!</Text>
                                </View>
                            )}
                            {getTotalAvailable() === 0 && (
                                <View style={[styles.warningBox, { borderLeftColor: colors.error, backgroundColor: '#ffebee' }]}>
                                    <Feather name="alert-triangle" size={12} color={colors.error} />
                                    <Text style={[styles.warningText, { color: colors.error }]}>No leaves remaining!</Text>
                                </View>
                            )}
                        </View>
                    )}
                </>
            )}
        </TouchableOpacity>
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
    loadingContainer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: colors.error + '10',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        color: colors.error,
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
    summaryContainer: {
        marginTop: 15,
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    summaryTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
    },
    summaryContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryStats: {
        alignItems: 'center',
        gap: 4,
    },
    summaryCount: {
        fontSize: 32,
        fontWeight: '700',
    },
    summaryLabel: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        padding: 8,
        backgroundColor: '#fff3e0',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: colors.warning,
    },
    warningText: {
        fontSize: 11,
        fontWeight: '600',
    },
});

export default LeaveBalanceSection;
