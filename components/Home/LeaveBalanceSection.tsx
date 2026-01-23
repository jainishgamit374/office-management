import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getEmployeeLeaveBalance, type LeaveBalanceItem } from '@/lib/leaves';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LeaveBalanceSectionProps {
    refreshKey?: number;
}

const LeaveBalanceSection: React.FC<LeaveBalanceSectionProps> = ({ refreshKey }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaveBalance = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getEmployeeLeaveBalance();
            console.log('📡 Leave Balance Response:', JSON.stringify(response, null, 2));
            
            if (response.status === 'Success' && response.data && Array.isArray(response.data)) {
                setLeaveBalances(response.data);
            } else {
                setLeaveBalances([]);
            }
        } catch (err: any) {
            console.error('Failed to load leave balance:', err);
            setError(err.message);
            setLeaveBalances([]);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    useFocusEffect(
        useCallback(() => {
            fetchLeaveBalance();
        }, [fetchLeaveBalance, refreshKey])
    );

    const getLeaveCount = (leaveType: string): number => {
        const leave = leaveBalances.find(item => 
            (item.Leavename || '').toUpperCase() === leaveType.toUpperCase()
        );
        return leave?.count || 0;
    };

    const getBadgeColor = (leaveName: string): string => {
        switch (leaveName) {
            case 'PL': return '#4caf50';
            case 'CL': return '#2196f3';
            case 'SL': return '#ff9800';
            default: return '#9e9e9e';
        }
    };

    const getTotalAvailable = (): number => {
        return leaveBalances.reduce((sum, leave) => sum + leave.count, 0);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Leave Balance</Text>
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
                </>
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
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    count: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    leaveLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default LeaveBalanceSection;
