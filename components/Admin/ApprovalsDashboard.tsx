import { getWorkflowApproval } from '@/lib/workflow';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface ApprovalStats {
    total_approvals: number;
    pending_approval_count: number;
    approved_count: number;
    disapproved_count: number;
    misscheckout_pending_approval_count: number;
    earlycheckout_pending_approval_count: number;
    IsAway_pending_approval_count: number;
    workfromhome_pending_approval_count: number;
}

const ApprovalsDashboard: React.FC = () => {
    const router = useRouter();
    const [stats, setStats] = useState<ApprovalStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchApprovalStats = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const response = await getWorkflowApproval();
            
            if (response.status === 'Success') {
                setStats({
                    total_approvals: response.total_approvals,
                    pending_approval_count: response.pending_approval_count,
                    approved_count: response.approved_count,
                    disapproved_count: response.disapproved_count,
                    misscheckout_pending_approval_count: response.misscheckout_pending_approval_count,
                    earlycheckout_pending_approval_count: response.earlycheckout_pending_approval_count,
                    IsAway_pending_approval_count: response.IsAway_pending_approval_count,
                    workfromhome_pending_approval_count: response.workfromhome_pending_approval_count,
                });
            }
        } catch (err: any) {
            console.error('Failed to fetch approval stats:', err);
            setError(err.message || 'Failed to load approval statistics');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchApprovalStats();
        }, [fetchApprovalStats])
    );

    const onRefresh = useCallback(() => {
        fetchApprovalStats(true);
    }, [fetchApprovalStats]);

    const renderApprovalCard = (
        title: string,
        count: number,
        icon: string,
        color: string,
        route?: string
    ) => (
        <Pressable
            style={({ pressed }) => [
                styles.approvalCard,
                pressed && styles.approvalCardPressed,
            ]}
            onPress={() => route && router.push(route as any)}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Feather name={icon as any} size={24} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={[styles.cardCount, { color }]}>{count}</Text>
            </View>
            {count > 0 && (
                <View style={[styles.badge, { backgroundColor: color }]}>
                    <Text style={styles.badgeText}>{count}</Text>
                </View>
            )}
        </Pressable>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4A90FF" />
                <Text style={styles.loadingText}>Loading approvals...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Feather name="alert-circle" size={48} color="#FF5252" />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={() => fetchApprovalStats()}>
                    <Feather name="refresh-cw" size={16} color="#FFF" />
                    <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
        >
            {/* Summary Section */}
            <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>Approval Overview</Text>
                <View style={styles.summaryCards}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Approvals</Text>
                        <Text style={[styles.summaryValue, { color: '#4A90FF' }]}>
                            {stats?.total_approvals || 0}
                        </Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Pending</Text>
                        <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
                            {stats?.pending_approval_count || 0}
                        </Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Approved</Text>
                        <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                            {stats?.approved_count || 0}
                        </Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Rejected</Text>
                        <Text style={[styles.summaryValue, { color: '#FF5252' }]}>
                            {stats?.disapproved_count || 0}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Pending Approvals Section */}
            <View style={styles.pendingSection}>
                <Text style={styles.sectionTitle}>Pending Approvals</Text>
                
                {renderApprovalCard(
                    'Work From Home Requests',
                    stats?.workfromhome_pending_approval_count || 0,
                    'home',
                    '#2196F3',
                    '/ViewAllRequest/Wfhrequest'
                )}

                {renderApprovalCard(
                    'Early Checkout Requests',
                    stats?.earlycheckout_pending_approval_count || 0,
                    'log-out',
                    '#FF9800',
                    '/ViewAllRequest/EarlyCheckout'
                )}

                {renderApprovalCard(
                    'Missing Checkout',
                    stats?.misscheckout_pending_approval_count || 0,
                    'alert-circle',
                    '#FF5252',
                    '/ViewAllRequest/ViewAllMisspunch'
                )}

                {renderApprovalCard(
                    'Is Away Requests',
                    stats?.IsAway_pending_approval_count || 0,
                    'user-x',
                    '#9C27B0',
                    '/Attendance/IsAwayList'
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionButtons}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.approveAllButton,
                            pressed && styles.actionButtonPressed,
                        ]}
                        onPress={() => {
                            // Navigate to approve all screen
                            router.push('/approvals/approve-all' as any);
                        }}
                    >
                        <Feather name="check-circle" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Approve All</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.viewHistoryButton,
                            pressed && styles.actionButtonPressed,
                        ]}
                        onPress={() => {
                            // Navigate to approval history
                            router.push('/approvals/history' as any);
                        }}
                    >
                        <Feather name="clock" size={20} color="#4A90FF" />
                        <Text style={[styles.actionButtonText, { color: '#4A90FF' }]}>
                            View History
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: '#FF5252',
        textAlign: 'center',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#4A90FF',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },

    // Summary Section
    summarySection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    summaryCards: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '800',
    },

    // Pending Approvals
    pendingSection: {
        marginBottom: 24,
    },
    approvalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    approvalCardPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    cardCount: {
        fontSize: 20,
        fontWeight: '800',
    },
    badge: {
        minWidth: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },

    // Quick Actions
    actionsSection: {
        marginBottom: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    actionButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    approveAllButton: {
        backgroundColor: '#4CAF50',
    },
    viewHistoryButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#4A90FF',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default ApprovalsDashboard;
