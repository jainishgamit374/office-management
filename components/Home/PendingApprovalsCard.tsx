import { getEarlyCheckoutApprovalHistory, getLeaveApprovals, getMissPunchApprovalHistory, getWfhApprovals } from '@/lib/approvalsApi';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PendingApproval {
    id: number;
    employeeName: string;
    type: string;
    dateRange: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
}

interface PendingApprovalsCardProps {
    refreshKey?: number;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ refreshKey }) => {
    const router = useRouter();
    const [approvals, setApprovals] = useState<PendingApproval[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchPendingApprovals = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔄 [PendingApprovalsCard] Fetching pending approvals...');

            const [leaveRes, wfhRes, missRes, earlyRes] = await Promise.allSettled([
                getLeaveApprovals(),
                getWfhApprovals(),
                getMissPunchApprovalHistory(),
                getEarlyCheckoutApprovalHistory(),
            ]);

            const allApprovals: PendingApproval[] = [];

            // Process Leave Approvals (ProgramID 2)
            if (leaveRes.status === 'fulfilled' && leaveRes.value.status === 'Success') {
                const leaves = leaveRes.value.pending_approvals || [];
                leaves.forEach((item) => {
                    allApprovals.push({
                        id: item.LeaveApplicationMasterID || item.Leave_ID,
                        employeeName: item.employee_name,
                        type: `Leave: ${item.leave_type}`,
                        dateRange: `${item.start_date} → ${item.end_date}`,
                        icon: 'calendar',
                        color: '#EC4899',
                    });
                });
            }

            // Process WFH Approvals (ProgramID 6)
            if (wfhRes.status === 'fulfilled' && wfhRes.value.status === 'Success') {
                const wfhs = wfhRes.value.approval_requests || [];
                wfhs.forEach((item) => {
                    allApprovals.push({
                        id: item.WorkFromHomeReqMasterID,
                        employeeName: item.EmployeeName,
                        type: `WFH: ${item.IsHalfDay ? 'Half Day' : 'Full Day'}`,
                        dateRange: item.DateTime,
                        icon: 'home',
                        color: '#8B5CF6',
                    });
                });
            }

            // Process Miss Punch Approvals (ProgramID 1) - Filter pending only
            if (missRes.status === 'fulfilled' && missRes.value.status === 'Success') {
                const missPunches = (missRes.value.approval_requests || []).filter(
                    (i) => i.ApprovalStatus === 3
                );
                missPunches.forEach((item) => {
                    allApprovals.push({
                        id: item.TranID,
                        employeeName: item.EmployeeName,
                        type: 'Miss Punch',
                        dateRange: item.DateTime,
                        icon: 'clock',
                        color: '#F59E0B',
                    });
                });
            }

            // Process Early Checkout Approvals (ProgramID 3) - Filter pending only
            if (earlyRes.status === 'fulfilled' && earlyRes.value.status === 'Success') {
                const earlyCheckouts = (earlyRes.value.approval_requests || []).filter(
                    (i) => i.ApprovalStatus === 3
                );
                earlyCheckouts.forEach((item) => {
                    allApprovals.push({
                        id: item.TranID,
                        employeeName: item.EmployeeName,
                        type: 'Early Checkout',
                        dateRange: item.DateTime,
                        icon: 'log-out',
                        color: '#EF4444',
                    });
                });
            }

            // Sort by most recent and take top 3
            const topApprovals = allApprovals.slice(0, 3);
            
            setApprovals(topApprovals);
            setTotalCount(allApprovals.length);
            console.log(`✅ [PendingApprovalsCard] Found ${allApprovals.length} pending approvals (showing ${topApprovals.length})`);
        } catch (error) {
            console.error('❌ [PendingApprovalsCard] Failed to fetch:', error);
            setApprovals([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPendingApprovals();
        }, [fetchPendingApprovals, refreshKey])
    );

    const handleViewAll = () => {
        router.push('/approvals/dashboard');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    Pending Approvals {totalCount > 0 && `(${totalCount})`}
                </Text>
                <Feather 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#4169E1" 
                />
            </TouchableOpacity>

            {isExpanded && (
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#4169E1" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : totalCount === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="check-circle" size={32} color="#10B981" />
                        <Text style={styles.emptyText}>No pending approvals</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.grid}>
                            {approvals.map((approval) => (
                                <View key={`${approval.type}-${approval.id}`} style={styles.card}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${approval.color}20` }]}>
                                        <Feather name={approval.icon} size={24} color={approval.color} />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{approval.employeeName}</Text>
                                        <View style={styles.detailsRow}>
                                            <Feather name="briefcase" size={14} color="#64748B" />
                                            <Text style={styles.detailText}>{approval.type}</Text>
                                        </View>
                                        <View style={styles.detailsRow}>
                                            <Feather name="calendar" size={14} color="#64748B" />
                                            <Text style={styles.detailText}>{approval.dateRange}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                        
                        {/* View All Button */}
                        <TouchableOpacity 
                            style={styles.viewAllButton}
                            onPress={handleViewAll}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewAllText}>View all approvals</Text>
                            <Feather name="arrow-right" size={16} color="#4169E1" />
                        </TouchableOpacity>
                    </>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4169E1',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#64748B',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    },
    grid: {
        padding: 12,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 6,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        marginHorizontal: 12,
        marginBottom: 12,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4169E1',
        marginRight: 6,
    },
});

export default PendingApprovalsCard;
