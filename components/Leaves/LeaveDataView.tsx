/**
 * Leave Data View Component
 * 
 * Displays leave statistics: approved count and applied count
 * Uses the /getemployeeleavedataview/ API endpoint
 */

import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getEmployeeLeaveDataView, LeaveDataViewResponse } from '@/lib/leaves';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LeaveDataView() {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [leaveData, setLeaveData] = useState<LeaveDataViewResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch leave data
    const fetchLeaveData = useCallback(async () => {
        try {
            setError(null);
            const response = await getEmployeeLeaveDataView();
            
            if (response.status === 'Success') {
                setLeaveData(response.data);
            } else {
                setError(response.message || 'Failed to fetch leave data');
            }
        } catch (err: any) {
            console.error('Error fetching leave data:', err);
            setError(err.message || 'Failed to fetch leave data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchLeaveData();
    }, [fetchLeaveData]);

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchLeaveData();
        }, [fetchLeaveData])
    );

    // Pull to refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchLeaveData();
    }, [fetchLeaveData]);

    // Calculate approval rate
    const approvalRate = useMemo(() => {
        if (!leaveData || leaveData.applied_count === 0) return 0;
        return Math.round((leaveData.approved_count / leaveData.applied_count) * 100);
    }, [leaveData]);

    // Calculate pending count
    const pendingCount = useMemo(() => {
        if (!leaveData) return 0;
        return (leaveData.applied_count || 0) - (leaveData.approved_count || 0);
    }, [leaveData]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading leave data...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.errorCard}>
                    <Feather name="alert-circle" size={32} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Leave Statistics</Text>
                <Text style={styles.subtitle}>Your leave application overview</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                {/* Applied Card */}
                <View style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                        <Feather name="file-text" size={22} color="#3B82F6" />
                    </View>
                    <Text style={styles.statValue}>{leaveData?.applied_count || 0}</Text>
                    <Text style={styles.statLabel}>Applied</Text>
                </View>

                {/* Approved Card */}
                <View style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                        <Feather name="check-circle" size={22} color="#10B981" />
                    </View>
                    <Text style={styles.statValue}>{leaveData?.approved_count || 0}</Text>
                    <Text style={styles.statLabel}>Approved</Text>
                </View>

                {/* Pending Card */}
                <View style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                        <Feather name="clock" size={22} color="#F59E0B" />
                    </View>
                    <Text style={styles.statValue}>{pendingCount}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            {/* Approval Rate Card */}
            {leaveData && leaveData.applied_count > 0 && (
                <View style={styles.rateCard}>
                    <View style={styles.rateHeader}>
                        <View style={styles.rateIconContainer}>
                            <Feather name="trending-up" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.rateTitleContainer}>
                            <Text style={styles.rateTitle}>Approval Rate</Text>
                            <Text style={styles.rateSubtitle}>Based on total applications</Text>
                        </View>
                        <Text style={styles.rateValue}>{approvalRate}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${approvalRate}%` },
                                ]}
                            />
                        </View>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>0%</Text>
                            <Text style={styles.progressLabel}>100%</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Feather name="bar-chart-2" size={18} color={colors.primary} />
                    <Text style={styles.summaryTitle}>Summary</Text>
                </View>
                
                <View style={styles.summaryRow}>
                    <View style={styles.summaryLabelContainer}>
                        <View style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.summaryLabel}>Total Applied</Text>
                    </View>
                    <Text style={styles.summaryValue}>{leaveData?.applied_count || 0}</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryRow}>
                    <View style={styles.summaryLabelContainer}>
                        <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.summaryLabel}>Approved</Text>
                    </View>
                    <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                        {leaveData?.approved_count || 0}
                    </Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryRow}>
                    <View style={styles.summaryLabelContainer}>
                        <View style={[styles.summaryDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.summaryLabel}>Pending / Rejected</Text>
                    </View>
                    <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                        {pendingCount}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
    },
    loadingCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        gap: 16,
        shadowColor: isDark ? '#000' : colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    errorCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#EF4444' + '30',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        fontWeight: '500',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        shadowColor: isDark ? '#000' : colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    rateCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: isDark ? '#000' : colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    rateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    rateIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rateTitleContainer: {
        flex: 1,
    },
    rateTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    rateSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    rateValue: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.primary,
    },
    progressBarContainer: {
        gap: 6,
    },
    progressBar: {
        height: 10,
        backgroundColor: isDark ? colors.background : '#E5E7EB',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 5,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    summaryCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: isDark ? '#000' : colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    summaryLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    summaryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: colors.border,
    },
});

    },
    approvedCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 24,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    statDescription: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    approvedText: {
        color: '#10B981',
    },
    pendingText: {
        color: '#F59E0B',
    },
    rateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    rateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    rateValue: {
        fontSize: 40,
        fontWeight: '800',
        color: '#6366F1',
        marginBottom: 16,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 4,
    },
});
