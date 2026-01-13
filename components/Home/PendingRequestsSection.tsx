import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getPunchStatus } from '@/lib/attendance';
import type { WFHApprovalRequest } from '@/lib/wfhApprovalHistory';
import { getWFHApprovalHistory } from '@/lib/wfhApprovalHistory';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RequestItem {
    id: string;
    title: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    count: number;
}

const PendingRequestsSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPending, setTotalPending] = useState(0);
    const [leaveRequests, setLeaveRequests] = useState(0);
    const [lateCheckinRequests, setLateCheckinRequests] = useState(0);
    const [earlyCheckoutRequests, setEarlyCheckoutRequests] = useState(0);
    const [wfhRequests, setWfhRequests] = useState<WFHApprovalRequest[]>([]);
    const [showWFHDetails, setShowWFHDetails] = useState(false);

    const fetchPendingRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // Fetch punch status for leave/late/early requests
            const punchResponse = await getPunchStatus();
            if (punchResponse.data?.pendingRequests) {
                setLeaveRequests(punchResponse.data.pendingRequests.leaveRequests || 0);
                setLateCheckinRequests(punchResponse.data.pendingRequests.lateCheckinRequests || 0);
                setEarlyCheckoutRequests(punchResponse.data.pendingRequests.earlyCheckoutRequests || 0);
            }

            // Fetch WFH approval history
            const wfhResponse = await getWFHApprovalHistory();
            if (wfhResponse.status === 'Success' && wfhResponse.approval_requests) {
                setWfhRequests(wfhResponse.approval_requests);
            }

            // Calculate total
            const total = (punchResponse.data?.pendingRequests?.total || 0) + (wfhResponse.approval_requests?.length || 0);
            setTotalPending(total);
            
            console.log('✅ Pending requests loaded from API');
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
            // Keep default values on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchPendingRequests();
        }, [fetchPendingRequests])
    );

    const requests: RequestItem[] = [
        { id: '1', title: 'Leave Requests', icon: 'check-circle', color: '#12df34ff', count: leaveRequests },
        { id: '2', title: 'Late Check-in Requests', icon: 'clock', color: '#f45742ff', count: lateCheckinRequests },
        { id: '3', title: 'Early Check-out Requests', icon: 'log-out', color: '#2d58e4ff', count: earlyCheckoutRequests },
        { id: '4', title: 'WFH Requests', icon: 'home', color: '#FF9800', count: wfhRequests.length },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approve':
            case 'approved':
                return '#4CAF50';
            case 'pending':
            case 'awaiting':
                return '#FF9800';
            case 'reject':
            case 'rejected':
                return '#FF5252';
            default:
                return colors.textSecondary;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    My Pending Requests {!isLoading && totalPending > 0 && `(${totalPending})`}
                </Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            ) : totalPending === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="check-circle" size={40} color={colors.success} />
                    <Text style={styles.emptyText}>No pending requests</Text>
                    <Text style={styles.emptySubtext}>All your requests are up to date!</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {requests.map((request) => (
                        request.count > 0 && (
                            <TouchableOpacity 
                                key={request.id} 
                                style={styles.card}
                                onPress={() => {
                                    if (request.id === '4') {
                                        setShowWFHDetails(!showWFHDetails);
                                    }
                                }}
                                activeOpacity={request.id === '4' ? 0.7 : 1}
                            >
                                <View style={styles.iconContainer}>
                                    <Feather style={styles.icon} name={request.icon} size={24} color={request.color} />
                                </View>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{request.title}</Text>
                                    <Text style={styles.countText}>{request.count} pending</Text>
                                </View>
                                {request.id === '4' && wfhRequests.length > 0 && (
                                    <Feather 
                                        name={showWFHDetails ? 'chevron-up' : 'chevron-down'} 
                                        size={20} 
                                        color={colors.textSecondary} 
                                    />
                                )}
                            </TouchableOpacity>
                        )
                    ))}
                    
                    {/* WFH Details Expansion */}
                    {showWFHDetails && wfhRequests.length > 0 && (
                        <View style={styles.wfhDetailsContainer}>
                            {wfhRequests.map((wfh, index) => (
                                <View key={wfh.TranID} style={styles.wfhCard}>
                                    <View style={styles.wfhHeader}>
                                        <Text style={styles.wfhName}>{wfh.EmployeeName}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(wfh.ApprovalStatus) + '20' }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(wfh.ApprovalStatus) }]}>
                                                {wfh.ApprovalStatus}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.wfhDetails}>
                                        <View style={styles.wfhRow}>
                                            <Feather name="calendar" size={14} color={colors.textSecondary} />
                                            <Text style={styles.wfhText}>{wfh.DateTime}</Text>
                                        </View>
                                        <View style={styles.wfhRow}>
                                            <Feather name="message-circle" size={14} color={colors.textSecondary} />
                                            <Text style={styles.wfhText}>{wfh.Reason}</Text>
                                        </View>
                                        {wfh.IsHalfDay && (
                                            <View style={styles.wfhRow}>
                                                <Feather name="clock" size={14} color={colors.textSecondary} />
                                                <Text style={styles.wfhText}>
                                                    {wfh.IsFirstHalf ? 'First Half' : 'Second Half'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: colors.error,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 5,
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 0,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
    loadingContainer: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
        marginTop: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'column',
        gap: 12,
    },
    card: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flex: 1,
        gap: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primaryLight || '#E8F5E9',
    },
    icon: {
        fontSize: 24,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    countText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    wfhDetailsContainer: {
        width: '100%',
        marginTop: 4,
        paddingTop: 12,
        gap: 10,
    },
    wfhCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    wfhHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    wfhName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    wfhDetails: {
        gap: 8,
    },
    wfhRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    wfhText: {
        fontSize: 13,
        color: colors.textSecondary,
        flex: 1,
    },
});

export default PendingRequestsSection;

