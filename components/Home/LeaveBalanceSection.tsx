import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { LeaveBalance } from '@/lib/earlyLatePunch';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LeaveBalanceSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaveBalance();
    }, []);

    const fetchLeaveBalance = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Using static data as provided
            const staticData = [
                { Leavename: 'CL', count: 15 },
                { Leavename: 'PL', count: 15 },
                { Leavename: 'SL', count: 13 }
            ];

            setLeaveBalances(staticData);
            console.log('✅ Leave balance loaded (static data)');
        } catch (err: any) {
            console.error('❌ Failed to load leave balance:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Get leave count by name
    const getLeaveCount = (leaveName: string): number => {
        const leave = leaveBalances.find(l => l.Leavename === leaveName);
        return leave ? leave.count : 0;
    };

    // Get leave full name
    const getLeaveFullName = (leaveName: string): string => {
        switch (leaveName) {
            case 'PL': return 'Privilege Leave';
            case 'CL': return 'Casual Leave';
            case 'SL': return 'Sick Leave';
            default: return leaveName;
        }
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
                        <Text style={styles.count}>{getLeaveCount('PL')}</Text>
                        <Text style={styles.leaveLabel}>Days Left</Text>
                    </View>

                    {/* Casual Leave (CL) */}
                    <View style={styles.card}>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor('CL') }]}>
                            <Text style={styles.badgeText}>CL</Text>
                        </View>
                        <Text style={styles.count}>{getLeaveCount('CL')}</Text>
                        <Text style={styles.leaveLabel}>Days Left</Text>
                    </View>

                    {/* Sick Leave (SL) */}
                    <View style={styles.card}>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor('SL') }]}>
                            <Text style={styles.badgeText}>SL</Text>
                        </View>
                        <Text style={styles.count}>{getLeaveCount('SL')}</Text>
                        <Text style={styles.leaveLabel}>Days Left</Text>
                    </View>

                    {/* Total */}
                    <View style={styles.card}>
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.badgeText}>Total</Text>
                        </View>
                        <Text style={styles.count}>
                            {getLeaveCount('PL') + getLeaveCount('CL') + getLeaveCount('SL')}
                        </Text>
                        <Text style={styles.leaveLabel}>Days Left</Text>
                    </View>
                </View>
            )}

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            <View style={styles.infoBox}>
                <Feather name="info" size={14} color={colors.info} />
                <Text style={styles.infoText}>
                    Balance updates automatically when you take leave
                </Text>
            </View>
        </View>
    );
};


const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
    },
    subtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
    },
    loadingContainer: {
        paddingVertical: 20,
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
});

export default LeaveBalanceSection;
