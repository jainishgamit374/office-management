/**
 * Leave Data View Component
 * 
 * Displays leave statistics: approved count and applied count
 * Uses the /getemployeeleavedataview/ API endpoint
 */

import { getEmployeeLeaveDataView, LeaveDataViewResponse } from '@/lib/leaves';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LeaveDataView() {
    const [leaveData, setLeaveData] = useState<LeaveDataViewResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch leave data
    const fetchLeaveData = async () => {
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
    };

    // Initial load
    useEffect(() => {
        fetchLeaveData();
    }, []);

    // Refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchLeaveData();
        }, [])
    );

    // Pull to refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaveData();
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading leave data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.content}>
                <Text style={styles.title}>Leave Statistics</Text>

                <View style={styles.statsContainer}>
                    {/* Applied Count */}
                    <View style={[styles.statCard, styles.appliedCard]}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>📝</Text>
                        </View>
                        <Text style={styles.statLabel}>Applied Leaves</Text>
                        <Text style={styles.statValue}>{leaveData?.applied_count || 0}</Text>
                        <Text style={styles.statDescription}>Total leave applications</Text>
                    </View>

                    {/* Approved Count */}
                    <View style={[styles.statCard, styles.approvedCard]}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>✅</Text>
                        </View>
                        <Text style={styles.statLabel}>Approved Leaves</Text>
                        <Text style={styles.statValue}>{leaveData?.approved_count || 0}</Text>
                        <Text style={styles.statDescription}>Approved applications</Text>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Applied:</Text>
                        <Text style={styles.summaryValue}>{leaveData?.applied_count || 0}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Approved:</Text>
                        <Text style={[styles.summaryValue, styles.approvedText]}>
                            {leaveData?.approved_count || 0}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Pending/Rejected:</Text>
                        <Text style={[styles.summaryValue, styles.pendingText]}>
                            {(leaveData?.applied_count || 0) - (leaveData?.approved_count || 0)}
                        </Text>
                    </View>
                </View>

                {/* Approval Rate */}
                {leaveData && leaveData.applied_count > 0 && (
                    <View style={styles.rateCard}>
                        <Text style={styles.rateLabel}>Approval Rate</Text>
                        <Text style={styles.rateValue}>
                            {Math.round((leaveData.approved_count / leaveData.applied_count) * 100)}%
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(leaveData.approved_count / leaveData.applied_count) * 100}%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FE',
    },
    content: {
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
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
    appliedCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
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
