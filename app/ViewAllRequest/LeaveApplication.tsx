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
                console.log('� First item approver:', response.data[0].workflow_list?.[0]?.Approve_name || 'None');
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

        // Get approver name from workflow_list (API doesn't return ApprovalUsername directly)
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
                            <Feather name="file-text" size={14} color={colors.textSecondary} />
                            <Text style={styles.reasonText} numberOfLines={2}>
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

                {/* ✅ FOOTER - Only Approver Name (Removed Application ID) */}
                <View style={styles.cardFooter}>
                    <View style={styles.approverSection}>
                        <Feather
                            name={getApproverIcon() as any}
                            size={18}
                            color={statusStyle.color}
                        />
                        <Text style={[styles.approverLabel, { color: statusStyle.color }]}>
                            {getApproverLabel()}:
                        </Text>
                        <View style={[styles.approverNameBadge, { backgroundColor: `${statusStyle.color}15`, borderColor: `${statusStyle.color}30` }]}>
                            <Feather name="user" size={14} color={statusStyle.color} />
                            <Text style={[styles.approverNameText, { color: statusStyle.color }]}>
                                {approverName}
                            </Text>
                        </View>
                    </View>
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

            {/* Filter Chips */}
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
                        No leave requests match the selected filter.
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
            paddingBottom: 16,
        },
        screenTitle: {
            fontSize: 26,
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
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            backgroundColor: colors.card,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            overflow: 'hidden',
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
            paddingBottom: 16,
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
            height: 16,
        },

        requestCard: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
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
            width: 48,
            height: 48,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        leaveTypeTitle: {
            fontSize: 17,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 2,
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
            paddingVertical: 6,
            borderRadius: 20,
        },
        statusText: {
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },

        cardBody: {
            gap: 12,
            marginBottom: 16,
        },

        dateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            padding: 14,
            borderRadius: 12,
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
            marginBottom: 4,
        },
        dateValue: {
            fontSize: 14,
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
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            marginLeft: 8,
        },
        daysPillText: {
            color: '#FFF',
            fontSize: 12,
            fontWeight: '700',
        },

        halfDayRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: '#FFF3E0',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FFE0B2',
        },
        halfDayText: {
            fontSize: 13,
            fontWeight: '600',
            color: '#F57C00',
        },

        reasonBlock: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
            paddingVertical: 8,
        },
        reasonText: {
            flex: 1,
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
        },

        rejectionBlock: {
            backgroundColor: '#FFEBEE',
            borderLeftWidth: 4,
            borderLeftColor: '#C62828',
            padding: 14,
            borderRadius: 10,
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

        // ✅ FOOTER STYLES - Clean approver display
        cardFooter: {
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },

        approverSection: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        approverLabel: {
            fontSize: 14,
            fontWeight: '600',
        },
        approverNameBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
        },
        approverNameText: {
            fontSize: 14,
            fontWeight: '700',
        },

        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
            gap: 12,
        },
        emptyIconCircle: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            shadowColor: colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
    });

export default LeaveApplication;