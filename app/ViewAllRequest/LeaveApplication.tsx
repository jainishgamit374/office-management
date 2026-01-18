import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { calculateLeaveDays, getLeaveApplicationsList, LeaveApplicationDetails, LeaveApplicationSummary } from '@/lib/leaves';
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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApprovalHistoryModal from '../../components/Admin/ApprovalHistoryModal';

// Types
type FilterType = 'All' | 'casualLeave' | 'sickLeave' | 'privilegeLeave';
type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

const LeaveApplication = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [applications, setApplications] = useState<(LeaveApplicationDetails | LeaveApplicationSummary)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // History Modal State
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveApplicationDetails | LeaveApplicationSummary | null>(null);

    // Fetch leave applications from API
    const fetchLeaveApplications = useCallback(async (refresh: boolean = false) => {
        try {
            if (refresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            let apiLeaveType: 'CL' | 'SL' | 'PL' | 'All' = 'All';
            if (selectedFilter === 'casualLeave') apiLeaveType = 'CL';
            else if (selectedFilter === 'sickLeave') apiLeaveType = 'SL';
            else if (selectedFilter === 'privilegeLeave') apiLeaveType = 'PL';

            const response = await getLeaveApplicationsList({
                page: currentPage,
                limit: 100,
                leaveType: apiLeaveType,
                status: statusFilter,
                sortBy: 'CreatedDate',
                sortOrder: 'desc',
            });

            // Debug logging
            if (response.data && response.data.length > 0) {
                console.log('✅ Leave applications loaded:', response.data.length);
                console.log('📋 First item approver:', response.data[0].workflow_list?.[0]?.Approve_name || 'None');
            }

            setApplications(response.data);
            if (response.pagination) {
                setTotalRecords(response.pagination.totalRecords);
            }

        } catch (error: any) {
            console.error('Failed to fetch leave applications:', error);
            Alert.alert('Error', error.message || 'Failed to load leave applications');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedFilter, statusFilter, currentPage]);

    useFocusEffect(
        useCallback(() => {
            fetchLeaveApplications();
        }, [fetchLeaveApplications])
    );

    const filteredRequests = useMemo(() => {
        if (selectedFilter === 'All') {
            return applications;
        }

        return applications.filter(app => {
            const leaveType = app.LeaveType?.toUpperCase() || '';
            const leaveTypeCode = app.LeaveTypeCode?.toUpperCase() || '';

            if (selectedFilter === 'casualLeave') {
                return leaveType.includes('CASUAL') || leaveTypeCode === 'CL' || leaveType === 'CL';
            }
            if (selectedFilter === 'sickLeave') {
                return leaveType.includes('SICK') || leaveTypeCode === 'SL' || leaveType === 'SL';
            }
            if (selectedFilter === 'privilegeLeave') {
                return leaveType.includes('PRIVILEGE') || leaveTypeCode === 'PL' || leaveType === 'PL';
            }
            return true;
        });
    }, [applications, selectedFilter]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusStyle = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        if (statusLower.includes('pending') || statusLower.includes('awaiting')) {
            return {
                color: '#F57C00',
                bg: '#FFF3E0',
                icon: 'clock' as const,
                label: 'Pending'
            };
        }
        if (statusLower.includes('reject') || statusLower.includes('disapprove')) {
            return {
                color: '#C62828',
                bg: '#FFEBEE',
                icon: 'x-circle' as const,
                label: 'Rejected'
            };
        }
        if (statusLower.includes('approve')) {
            return {
                color: '#2E7D32',
                bg: '#E8F5E9',
                icon: 'check-circle' as const,
                label: 'Approved'
            };
        }
        if (statusLower.includes('cancel')) {
            return {
                color: '#616161',
                bg: '#F5F5F5',
                icon: 'slash' as const,
                label: 'Cancelled'
            };
        }
        return {
            color: colors.textSecondary,
            bg: colors.border,
            icon: 'info' as const,
            label: status
        };
    };

    const getLeaveTypeStyle = (type: string) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('casual')) return { color: '#2196F3', icon: 'coffee' as const };
        if (typeLower.includes('sick')) return { color: '#FF9800', icon: 'activity' as const };
        if (typeLower.includes('privilege')) return { color: '#9C27B0', icon: 'sun' as const };
        return { color: colors.secondary, icon: 'calendar' as const };
    };

    const handleViewHistory = (item: LeaveApplicationDetails | LeaveApplicationSummary) => {
        setSelectedRequest(item);
        setHistoryModalVisible(true);
    };

    const renderFilterChip = (label: string, value: FilterType, icon: string) => {
        const isActive = selectedFilter === value;
        return (
            <Pressable
                style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(value)}
            >
                <Feather
                    name={icon as any}
                    size={14}
                    color={isActive ? '#FFF' : colors.textSecondary}
                />
                <Text
                    style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                    ]}
                >
                    {label}
                </Text>
            </Pressable>
        );
    };

    const renderStatusChip = (label: string, value: StatusFilter, icon: string) => {
        const isActive = statusFilter === value;
        return (
            <Pressable
                style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(value)}
            >
                <Feather
                    name={icon as any}
                    size={14}
                    color={isActive ? '#FFF' : colors.textSecondary}
                />
                <Text
                    style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                    ]}
                >
                    {label}
                </Text>
            </Pressable>
        );
    };

    // Render Leave Request Item
    const renderLeaveRequestItem = ({ item }: { item: LeaveApplicationDetails | LeaveApplicationSummary }) => {
        const statusStyle = getStatusStyle(item.ApprovalStatus);
        const leaveStyle = getLeaveTypeStyle(item.LeaveType);

        const isPending = item.ApprovalStatus?.toLowerCase().includes('pending') ||
            item.ApprovalStatus?.toLowerCase().includes('awaiting');

        const isRejected = item.ApprovalStatus?.toLowerCase().includes('reject') ||
            item.ApprovalStatus?.toLowerCase().includes('disapprove');

        const isApproved = item.ApprovalStatus?.toLowerCase().includes('approve') && !isRejected;

        const isCancelled = item.ApprovalStatus?.toLowerCase().includes('cancel');

        // Get approver name from workflow_list
        const approverName = 
            item.workflow_list && item.workflow_list.length > 0 
                ? item.workflow_list[0].Approve_name 
                : 'Not Assigned';

        const rejectionReason = item.RejectionReason || null;

        const daysCount = item.TotalDays || calculateLeaveDays(item.StartDate, item.EndDate, item.IsHalfDay);

        const getApproverLabel = (): string => {
            if (isPending) return 'Pending with';
            if (isApproved) return 'Approved by';
            if (isRejected) return 'Rejected by';
            if (isCancelled) return 'Cancelled';
            return 'Reviewer';
        };

        const getApproverIcon = (): string => {
            if (isPending) return 'clock';
            if (isApproved) return 'check-circle';
            if (isRejected) return 'x-circle';
            if (isCancelled) return 'slash';
            return 'user';
        };

        return (
            <View style={styles.requestCard}>

                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.avatarContainer, { backgroundColor: `${leaveStyle.color}15` }]}>
                            <Feather name={leaveStyle.icon} size={20} color={leaveStyle.color} />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.leaveTypeTitle}>{item.LeaveType}</Text>
                            <Text style={styles.requestDate}>
                                Applied: {formatDate(item.CreatedAt || item.CreatedDate || '')}
                            </Text>
                        </View>
                    </View>

                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.bg, borderColor: `${statusStyle.color}30`, borderWidth: 1 }
                    ]}>
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
                        <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>From</Text>
                            <Text style={styles.dateValue}>{formatDate(item.StartDate)}</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                            <Feather name="arrow-right" size={16} color={colors.textTertiary} />
                        </View>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>To</Text>
                            <Text style={styles.dateValue}>{formatDate(item.EndDate)}</Text>
                        </View>

                        <View style={styles.daysPill}>
                            <Feather name="calendar" size={12} color="#FFF" />
                            <Text style={styles.daysPillText}>
                                {daysCount} {daysCount === 1 ? 'Day' : 'Days'}
                            </Text>
                        </View>
                    </View>

                    {/* Half Day */}
                    {item.IsHalfDay && (
                        <View style={styles.halfDayRow}>
                            <Feather name="clock" size={14} color="#FF9800" />
                            <Text style={styles.halfDayText}>
                                Half Day ({item.IsFirstHalf ? 'First Half' : 'Second Half'})
                            </Text>
                        </View>
                    )}

                    {/* Reason */}
                    {item.Reason && (
                        <View style={styles.reasonBlock}>
                            <Text style={styles.reasonLabel}>Reason</Text>
                            <Text style={styles.reasonText} numberOfLines={3}>
                                {item.Reason}
                            </Text>
                        </View>
                    )}

                    {/* Rejection Reason */}
                    {isRejected && rejectionReason && (
                        <View style={styles.rejectionBlock}>
                            <View style={styles.rejectionHeader}>
                                <Feather name="alert-circle" size={14} color="#C62828" />
                                <Text style={styles.rejectionTitle}>Rejection Reason</Text>
                            </View>
                            <Text style={styles.rejectionText}>{rejectionReason}</Text>
                        </View>
                    )}
                </View>

                {/* Footer - Approver + Workflow Button */}
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
                <Text style={styles.screenTitle}>Leave Requests</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.totalCount}>{totalRecords} Records</Text>
                </View>
            </View>

            {/* Leave Type Filter Chips */}
            <View style={styles.filterScrollContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {renderFilterChip('All', 'All', 'layers')}
                    {renderFilterChip('Casual', 'casualLeave', 'coffee')}
                    {renderFilterChip('Sick', 'sickLeave', 'activity')}
                    {renderFilterChip('Privilege', 'privilegeLeave', 'sun')}
                </ScrollView>
            </View>

            {/* Status Filter Chips */}
            <View style={styles.filterScrollContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {renderStatusChip('All Status', 'All', 'filter')}
                    {renderStatusChip('Pending', 'Pending', 'clock')}
                    {renderStatusChip('Approved', 'Approved', 'check-circle')}
                    {renderStatusChip('Rejected', 'Rejected', 'x-circle')}
                    {renderStatusChip('Cancelled', 'Cancelled', 'slash')}
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
                        No leave requests match the selected filters.
                    </Text>
                </View>
            ) : (
                <FlatList<LeaveApplicationDetails | LeaveApplicationSummary>
                    data={filteredRequests}
                    renderItem={renderLeaveRequestItem}
                    keyExtractor={(item) => item.LeaveApplicationMasterID?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={() => fetchLeaveApplications(true)}
                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                />
            )}

            {/* Approval History Modal */}
            {selectedRequest && (
                <ApprovalHistoryModal
                    visible={historyModalVisible}
                    onClose={() => setHistoryModalVisible(false)}
                    tranId={selectedRequest.LeaveApplicationMasterID}
                    progId={2} // Leave Program ID
                    employeeName={`Leave Request - ${selectedRequest.LeaveType}`}
                />
            )}
        </SafeAreaView>
    );
};

// ✅ STYLES
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
        leaveTypeTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 3,
        },
        requestDate: {
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
        },
        dateItem: {
            flex: 1,
        },
        dateLabel: {
            fontSize: 11,
            color: colors.textSecondary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 5,
        },
        dateValue: {
            fontSize: 15,
            color: colors.text,
            fontWeight: '700',
        },
        arrowContainer: {
            paddingHorizontal: 12,
        },
        daysPill: {
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 14,
            marginLeft: 8,
        },
        daysPillText: {
            color: '#FFF',
            fontSize: 13,
            fontWeight: '700',
        },

        halfDayRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: '#FFF3E0',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#FFE0B2',
        },
        halfDayText: {
            fontSize: 13,
            fontWeight: '600',
            color: '#F57C00',
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

        rejectionBlock: {
            backgroundColor: '#FFEBEE',
            borderLeftWidth: 4,
            borderLeftColor: '#C62828',
            padding: 16,
            borderRadius: 12,
            gap: 8,
        },
        rejectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        rejectionTitle: {
            fontSize: 12,
            fontWeight: '700',
            color: '#C62828',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        rejectionText: {
            fontSize: 14,
            color: '#B71C1C',
            lineHeight: 20,
            fontWeight: '500',
            marginLeft: 22,
        },

        // Footer with Approver + Workflow Button
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

export default LeaveApplication;