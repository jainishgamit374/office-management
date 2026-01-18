import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getMissingPunchDetails } from '@/lib/missPunchList';
import { disapproveAll } from '@/lib/workflow';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApprovalHistoryModal from '../../components/Admin/ApprovalHistoryModal';

// Types
type PunchType = 'In' | 'Out';
type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Awaiting Approve';
type FilterType = 'All' | 'PunchIn' | 'PunchOut';
type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

interface MissPunchRequest {
    id: number;
    employeeName: string;
    employeeId: string;
    date: string;
    punchType: PunchType;
    reason: string;
    status: RequestStatus;
    workflowApprovers?: string[];
}

const ViewAllMisspunch = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [requests, setRequests] = useState<MissPunchRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // History Modal State
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MissPunchRequest | null>(null);

    const fetchMissPunchRequests = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const response = await getMissingPunchDetails();

            if (response.status === 'Success' && response.data) {
                const missPunchData: MissPunchRequest[] = response.data.map(item => ({
                    id: item.MissPunchReqMasterID,
                    employeeName: item.workflow_list?.[0]?.Approve_name || 'Unknown Employee',
                    employeeId: `EMP${String(item.MissPunchReqMasterID).padStart(4, '0')}`,
                    date: item.datetime,
                    punchType: item.PunchType === '1' ? 'In' : 'Out',
                    reason: item.reason || 'No reason provided',
                    status: item.approval_status as RequestStatus,
                    workflowApprovers: item.workflow_list?.map(w => w.Approve_name) || [],
                }));

                setRequests(missPunchData);
            } else {
                setRequests([]);
            }
        } catch (err: any) {
            console.error('❌ Failed to fetch miss punch requests:', err);
            Alert.alert('Error', err.message || 'Failed to load miss punch requests');
            setRequests([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMissPunchRequests(false);
        }, [fetchMissPunchRequests])
    );

    const filteredRequests = useMemo(() => {
        let filtered = requests;

        // Filter by punch type
        if (selectedFilter === 'PunchIn') {
            filtered = filtered.filter(r => r.punchType === 'In');
        } else if (selectedFilter === 'PunchOut') {
            filtered = filtered.filter(r => r.punchType === 'Out');
        }

        // Filter by status
        if (statusFilter !== 'All') {
            filtered = filtered.filter(r => r.status === statusFilter || 
                (statusFilter === 'Pending' && r.status === 'Awaiting Approve'));
        }

        return filtered;
    }, [requests, selectedFilter, statusFilter]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusStyle = (status: RequestStatus) => {
        if (status === 'Pending' || status === 'Awaiting Approve') {
            return { color: '#F57C00', bg: '#FFF3E0', icon: 'clock' as const, label: 'Pending' };
        }
        if (status === 'Rejected') {
            return { color: '#C62828', bg: '#FFEBEE', icon: 'x-circle' as const, label: 'Rejected' };
        }
        if (status === 'Approved') {
            return { color: '#2E7D32', bg: '#E8F5E9', icon: 'check-circle' as const, label: 'Approved' };
        }
        return { color: colors.textSecondary, bg: colors.border, icon: 'info' as const, label: status };
    };

    const handleReject = (requestId: number) => {
        Alert.alert(
            'Reject Miss Punch Request',
            'Are you sure you want to reject this miss punch request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await disapproveAll({ ProgramID: 4, TranID: requestId });
                            Alert.alert('Success', 'Miss punch request rejected successfully!');
                            fetchMissPunchRequests();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to reject request');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleViewHistory = (item: MissPunchRequest) => {
        setSelectedRequest(item);
        setHistoryModalVisible(true);
    };

    const renderFilterChip = (label: string, value: FilterType, icon: string) => {
        const isActive = selectedFilter === value;
        return (
            <Pressable
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(value)}
            >
                <Feather name={icon as any} size={14} color={isActive ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {label}
                </Text>
            </Pressable>
        );
    };

    const renderStatusChip = (label: string, value: StatusFilter, icon: string) => {
        const isActive = statusFilter === value;
        return (
            <Pressable
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setStatusFilter(value)}
            >
                <Feather name={icon as any} size={14} color={isActive ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {label}
                </Text>
            </Pressable>
        );
    };

    const renderMissPunchRequestItem = ({ item }: { item: MissPunchRequest }) => {
        const statusStyle = getStatusStyle(item.status);
        const isPending = item.status === 'Pending' || item.status === 'Awaiting Approve';
        const punchColor = item.punchType === 'In' ? '#4CAF50' : '#FF5252';

        const approverName = item.workflowApprovers?.[0] || 'Not Assigned';

        const getApproverLabel = (): string => {
            if (isPending) return 'Pending with';
            if (item.status === 'Approved') return 'Approved by';
            if (item.status === 'Rejected') return 'Rejected by';
            return 'Reviewer';
        };

        return (
            <View style={styles.requestCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.avatarContainer, { backgroundColor: `${punchColor}15` }]}>
                            <Feather 
                                name={item.punchType === 'In' ? 'log-in' : 'log-out'} 
                                size={20} 
                                color={punchColor} 
                            />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.employeeName}>{item.employeeName}</Text>
                            <Text style={styles.employeeId}>Punch {item.punchType}</Text>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: `${statusStyle.color}30`, borderWidth: 1 }]}>
                        <Feather name={statusStyle.icon} size={12} color={statusStyle.color} />
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                    {/* Date Row */}
                    <View style={styles.dateRow}>
                        <Feather name="calendar" size={16} color={colors.textSecondary} />
                        <Text style={styles.dateLabel}>Date:</Text>
                        <Text style={styles.dateValue}>{formatDate(item.date)}</Text>
                    </View>

                    {/* Reason */}
                    <View style={styles.reasonBlock}>
                        <Text style={styles.reasonLabel}>Reason</Text>
                        <Text style={styles.reasonText} numberOfLines={3}>
                            {item.reason}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View style={styles.approverSection}>
                        <View style={styles.approverInfo}>
                            <Text style={styles.approverLabel}>{getApproverLabel()}</Text>
                            <View style={styles.approverNameRow}>
                                <Feather name="user" size={14} color={statusStyle.color} />
                                <Text style={[styles.approverNameText, { color: statusStyle.color }]}>
                                    {approverName}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Workflow Button */}
                    <Pressable
                        style={({ pressed }) => [styles.historyButton, pressed && { opacity: 0.7 }]}
                        onPress={() => handleViewHistory(item)}
                    >
                        <Feather name="git-merge" size={16} color={colors.primary} />
                        <Text style={styles.historyButtonText}>Workflow</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Miss Punch Requests</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.totalCount}>{filteredRequests.length} Records</Text>
                </View>
            </View>

            {/* Type Filter Chips */}
            <View style={styles.filterScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {renderFilterChip('All', 'All', 'layers')}
                    {renderFilterChip('Punch In', 'PunchIn', 'log-in')}
                    {renderFilterChip('Punch Out', 'PunchOut', 'log-out')}
                </ScrollView>
            </View>

            {/* Status Filter Chips */}
            <View style={styles.filterScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {renderStatusChip('All Status', 'All', 'filter')}
                    {renderStatusChip('Pending', 'Pending', 'clock')}
                    {renderStatusChip('Approved', 'Approved', 'check-circle')}
                    {renderStatusChip('Rejected', 'Rejected', 'x-circle')}
                </ScrollView>
            </View>

            {/* Content */}
            {isLoading && !isRefreshing ? (
                <View style={styles.centerContainer}>
                    <Feather name="loader" size={24} color={colors.primary} />
                    <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
            ) : filteredRequests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Feather name="inbox" size={40} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.emptyTitle}>No Requests Found</Text>
                    <Text style={styles.emptySubtitle}>
                        No miss punch requests match the selected filters.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRequests}
                    renderItem={renderMissPunchRequestItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={() => fetchMissPunchRequests(true)}
                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                />
            )}

            {/* Approval History Modal */}
            {selectedRequest && (
                <ApprovalHistoryModal
                    visible={historyModalVisible}
                    onClose={() => setHistoryModalVisible(false)}
                    tranId={selectedRequest.id}
                    progId={4}
                    employeeName={selectedRequest.employeeName}
                />
            )}
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },

        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 12,
        },
        screenTitle: {
            fontSize: 28,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.5,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        totalCount: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.textSecondary,
            backgroundColor: colors.card,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 18,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
        },

        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
        },
        loadingText: {
            color: colors.textSecondary,
            fontSize: 15,
            fontWeight: '600',
        },

        filterScrollContainer: {
            paddingBottom: 10,
        },
        filterRow: {
            paddingHorizontal: 20,
            gap: 10,
        },
        filterChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        filterChipActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        filterChipText: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        filterChipTextActive: {
            color: '#FFF',
        },

        listContent: {
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        listSeparator: {
            height: 14,
        },

        requestCard: {
            backgroundColor: colors.card,
            borderRadius: 18,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
        },

        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
        },
        headerLeft: {
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
            flex: 1,
        },
        headerTextContainer: {
            flex: 1,
        },
        avatarContainer: {
            width: 50,
            height: 50,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        employeeName: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 3,
        },
        employeeId: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '500',
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
        },
        statusText: {
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },

        cardBody: {
            gap: 14,
            marginBottom: 16,
        },

        dateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 14,
            gap: 10,
        },
        dateLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '600',
        },
        dateValue: {
            fontSize: 15,
            color: colors.text,
            fontWeight: '700',
        },

        reasonBlock: {
            backgroundColor: `${colors.textSecondary}08`,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
        },
        reasonLabel: {
            fontSize: 11,
            fontWeight: '700',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 6,
        },
        reasonText: {
            fontSize: 14,
            color: colors.text,
            lineHeight: 20,
        },

        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },

        approverSection: {
            flex: 1,
        },
        approverInfo: {
            gap: 4,
        },
        approverLabel: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        approverNameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        approverNameText: {
            fontSize: 15,
            fontWeight: '700',
        },

        historyButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: `${colors.primary}10`,
            borderRadius: 10,
        },
        historyButtonText: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.primary,
        },

        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
            paddingTop: 60,
            gap: 14,
        },
        emptyIconCircle: {
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: colors.shadow,
            shadowOpacity: 0.12,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
        },
        emptyTitle: {
            fontSize: 22,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: '80%',
        },
    });

export default ViewAllMisspunch;