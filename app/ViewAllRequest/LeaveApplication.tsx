import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { calculateLeaveDays, getLeaveApplicationsList, LeaveApplicationDetails } from '@/lib/leaves';
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
    const [applications, setApplications] = useState<LeaveApplicationDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // History Modal State
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveApplicationDetails | null>(null);

    // Fetch leave applications from API
    const fetchLeaveApplications = useCallback(async (refresh: boolean = false) => {
        try {
            if (refresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            // Map UI filter to API values
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

            setApplications(response.data);
            if (response.pagination) {
                setTotalRecords(response.pagination.totalRecords);
            }

            console.log('✅ Leave applications loaded:', response.data.length);
        } catch (error: any) {
            console.error('Failed to fetch leave applications:', error);
            Alert.alert('Error', error.message || 'Failed to load leave applications');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedFilter, statusFilter, currentPage]);

    // Fetch data on mount and when filters change
    useFocusEffect(
        useCallback(() => {
            fetchLeaveApplications();
        }, [fetchLeaveApplications])
    );

    // Client-side filtering as backup (in case API doesn't filter properly)
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

        // Proper modern colors: Amber/Orange for Pending, Green for Approved, Red for Rejected
        if (statusLower.includes('pending') || statusLower.includes('awaiting')) {
            return { color: '#F57C00', bg: '#FFF3E0', icon: 'clock', label: 'Pending' }; // Darker Orange text
        }
        // Fix: Check for reject/disapprove BEFORE approve, because "disapprove" contains "approve"
        if (statusLower.includes('reject') || statusLower.includes('disapprove')) {
            return { color: '#C62828', bg: '#FFEBEE', icon: 'x-circle', label: 'Rejected' }; // Darker Red text
        }
        if (statusLower.includes('approve')) {
            return { color: '#2E7D32', bg: '#E8F5E9', icon: 'check-circle', label: 'Approved' }; // Darker Green text
        }
        if (statusLower.includes('cancel')) {
            return { color: '#616161', bg: '#F5F5F5', icon: 'slash', label: 'Cancelled' };
        }
        return { color: colors.textSecondary, bg: colors.border, icon: 'info', label: status };
    };

    const getLeaveTypeStyle = (type: string) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('casual')) return { color: '#2196F3', icon: 'coffee' }; // Blue
        if (typeLower.includes('sick')) return { color: '#FF9800', icon: 'activity' }; // Orange
        if (typeLower.includes('privilege')) return { color: '#9C27B0', icon: 'sun' }; // Purple
        return { color: colors.secondary, icon: 'calendar' };
    };

    const handleViewHistory = (item: LeaveApplicationDetails) => {
        setSelectedRequest(item);
        setHistoryModalVisible(true);
    };

    const handleReject = (requestId: number) => {
        Alert.alert(
            'Reject Leave Request',
            'Are you sure you want to reject this leave request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            // PROGRAM ID 1 for Leave
                            await disapproveAll({ ProgramID: 1, TranID: requestId });
                            Alert.alert('Success', 'Request rejected successfully');
                            // Refresh list
                            fetchLeaveApplications();
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

    const renderFilterChip = (label: string, value: FilterType, icon: string, iconColor: string) => {
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

    const renderLeaveRequestItem = ({ item }: { item: LeaveApplicationDetails }) => {
        // DEBUG: Check what data we are actually receiving
        // console.log(`Item ${item.LeaveApplicationMasterID} Data:`, JSON.stringify(item, null, 2));

        const statusStyle = getStatusStyle(item.ApprovalStatus);
        const leaveStyle = getLeaveTypeStyle(item.LeaveType);
        const isPending = item.ApprovalStatus === 'Pending' || item.ApprovalStatus === 'Awaiting Approve';

        // Normalized Rejection Reason (handle case sensitivity and common variations)
        const rejectionReason = item.RejectionReason || 
                                (item as any).rejectionReason || 
                                (item as any).reason_for_rejection ||
                                (item as any).rejection_reason;

        // Normalized Approval Username
        const approvalUsername = item.ApprovalUsername || 
                                 (item as any).approvalUsername || 
                                 (item as any).approval_username || 
                                 (item as any).approver_name;

        // Calculate days if not provided
        const daysCount = item.TotalDays || calculateLeaveDays(item.StartDate, item.EndDate, item.IsHalfDay);
        
        return (
            <View style={styles.requestCard}>
                
                {/* Header: Avatar, Name, Status */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.avatarContainer, { backgroundColor: `${leaveStyle.color}15` }]}>
                            <Feather name={leaveStyle.icon as any} size={20} color={leaveStyle.color} />
                        </View>
                        <View>
                            <Text style={styles.leaveTypeTitle}>{item.LeaveType}</Text>
                            <Text style={styles.requestDate}>Applied: {formatDate(item.CreatedAt || item.CreatedDate || '')}</Text>
                        </View>
                    </View>
                    
                    <View style={[
                        styles.statusBadge, 
                        { backgroundColor: statusStyle.bg, borderColor: `${statusStyle.color}30`, borderWidth: 1 }
                    ]}>
                        <Feather name={statusStyle.icon as any} size={12} color={statusStyle.color} />
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                {/* Body: Dates & Reason */}
                <View style={styles.cardBody}>
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
                        
                        {/* Days Pill */}
                        <View style={styles.daysPill}>
                            <Feather name="clock" size={12} color="#FFF" />
                            <Text style={styles.daysPillText}>{daysCount} Days</Text>
                        </View>
                    </View>
                    
                    {item.Reason && (
                         <View style={styles.reasonBlock}>
                             <Text style={styles.reasonText} numberOfLines={2}>
                                {item.Reason}
                             </Text>
                         </View>
                    )}

                    {/* Approval Info */}
                    {approvalUsername && (
                        <View style={styles.approvalInfo}>
                            <Feather 
                                name="user-check" 
                                size={14} 
                                color={statusStyle.color} 
                            />
                            <Text style={styles.approvalLabel}>
                                {isPending ? 'Reviewing by:' : `${statusStyle.label} by:`}
                            </Text>
                            <Text style={[styles.approvalName, { color: statusStyle.color }]}>
                                {approvalUsername}
                            </Text>
                        </View>
                    )}

                    {/* Rejection Reason */}
                    {(item.ApprovalStatus?.toLowerCase().includes('reject') || 
                      item.ApprovalStatus?.toLowerCase().includes('disapprove')) && 
                     rejectionReason && (
                        <View style={styles.rejectionBlock}>
                            <View style={styles.rejectionHeader}>
                                <Feather name="alert-circle" size={14} color="#C62828" />
                                <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
                            </View>
                            <Text style={styles.rejectionText}>{rejectionReason}</Text>
                        </View>
                    )}
                </View>

                {/* Footer: Workflow and Approver */}
                <View style={styles.cardFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Pressable
                            style={({ pressed }) => [styles.historyButton, pressed && { opacity: 0.7 }]}
                            onPress={() => handleViewHistory(item)}
                        >
                            <Feather name="git-merge" size={14} color={colors.primary} />
                            <Text style={styles.historyButtonText}>View Workflow</Text>
                        </Pressable>

                        {/* Approver Name beside Workflow */}
                        {approvalUsername ? (
                            <View style={styles.approverBadge}>
                                <Feather name="user" size={12} color={colors.textSecondary} />
                                <Text style={styles.approverText}>{approvalUsername}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <Text style={styles.screenTitle}>Leave Requests</Text>
                 <Text style={styles.totalCount}>{totalRecords} Records</Text>
            </View>

            <View style={styles.filterScrollContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {renderFilterChip('All', 'All', 'layers', '#666')}
                    {renderFilterChip('Casual', 'casualLeave', 'coffee', '#4A90FF')}
                    {renderFilterChip('Sick', 'sickLeave', 'activity', '#FF9800')}
                    {renderFilterChip('Privilege', 'privilegeLeave', 'sun', '#9C27B0')}
                </ScrollView>
            </View>

            {isLoading && !isRefreshing ? (
                 <View style={styles.centerContainer}>
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
                <FlatList
                    data={filteredRequests}
                    renderItem={renderLeaveRequestItem}
                    keyExtractor={(item) => item.LeaveApplicationMasterID?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={() => fetchLeaveApplications(true)}
                />
            )}

            {/* Approval History Modal */}
            {selectedRequest && (
                <ApprovalHistoryModal
                    visible={historyModalVisible}
                    onClose={() => setHistoryModalVisible(false)}
                    tranId={selectedRequest.LeaveApplicationMasterID}
                    progId={1} 
                    employeeName={selectedRequest.EmployeeName || 'Unknown'}
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
            alignItems: 'baseline',
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 10,
        },
        screenTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
        },
        totalCount: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            color: colors.textSecondary,
            fontSize: 15,
            fontWeight: '600',
        },
        
        // Filter
        filterScrollContainer: {
            paddingBottom: 12,
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
            // Subtle shadow for depth
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

        // List
        listContent: {
            paddingHorizontal: 20,
            paddingBottom: 40,
            gap: 16,
        },
        
        // Card
        requestCard: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 3,
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
        avatarContainer: {
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        leaveTypeTitle: {
            fontSize: 16,
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
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        
        // Body
        cardBody: {
            gap: 12,
            marginBottom: 16,
        },
        dateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background,
            padding: 12,
            borderRadius: 10,
        },
        dateItem: {
            gap: 2,
        },
        dateLabel: {
            fontSize: 11,
            color: colors.textSecondary,
            fontWeight: '600',
        },
        dateValue: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '700',
        },
        arrowContainer: {
            paddingHorizontal: 8,
        },
        daysPill: {
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            marginLeft: 8,
        },
        daysPillText: {
            color: '#FFF',
            fontSize: 12,
            fontWeight: '700',
        },
        reasonBlock: {
            backgroundColor: `${colors.background}80`, // slightly transparent
            padding: 2,
        },
        reasonText: {
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 18,
            fontStyle: 'italic',
        },
        approvalInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: colors.background,
            borderRadius: 8,
        },
        approvalLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        approvalName: {
            fontSize: 13,
            fontWeight: '700',
        },
        rejectionBlock: {
            backgroundColor: '#FFEBEE',
            borderLeftWidth: 3,
            borderLeftColor: '#C62828',
            padding: 12,
            borderRadius: 8,
            gap: 8,
        },
        rejectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        rejectionTitle: {
            fontSize: 12,
            fontWeight: '700',
            color: '#C62828',
            textTransform: 'uppercase',
        },
        rejectionText: {
            fontSize: 13,
            color: '#B71C1C',
            lineHeight: 18,
            fontWeight: '500',
        },

        // Footer
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        historyButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            padding: 4,
        },
        historyButtonText: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.primary,
        },
        approverBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: colors.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        approverText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
        },
        pendingActions: {
            flexDirection: 'row',
            gap: 10,
        },
        actionBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
        },
        rejectBtn: {
            borderColor: '#C62828',
            backgroundColor: '#FFEBEE',
        },
        rejectBtnText: {
            fontSize: 13,
            fontWeight: '700',
            color: '#C62828',
        },
        approveBtn: {
            borderColor: '#2E7D32',
            backgroundColor: '#4CAF50',
        },
        approveBtnText: {
            fontSize: 13,
            fontWeight: '700',
            color: '#FFF',
        },
        
        // Empty
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80,
            gap: 12,
        },
        emptyIconCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            shadowColor: colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 20,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
        },
        emptySubtitle: {
             fontSize: 14,
             color: colors.textSecondary,
             textAlign: 'center',
             maxWidth: '70%',
        },
    });

export default LeaveApplication;