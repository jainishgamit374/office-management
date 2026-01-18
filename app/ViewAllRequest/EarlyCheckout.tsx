import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getEarlyLatePunchList, type EarlyLatePunchDetails } from '@/lib/earlyLatePunch';
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
type FilterType = 'All' | 'Early' | 'Late';
type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

const EarlyCheckout = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [requests, setRequests] = useState<EarlyLatePunchDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // History Modal State
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<EarlyLatePunchDetails | null>(null);

    // Fetch requests from API
    const fetchRequests = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            console.log('🔍 Fetching early/late requests with filters:', {
                checkoutType: selectedFilter,
                status: statusFilter,
            });

            const response = await getEarlyLatePunchList({
                checkoutType: selectedFilter,
                status: statusFilter,
                sortBy: 'CreatedDate',
                sortOrder: 'desc',
            });

            console.log('📦 API Response:', {
                status: response.status,
                dataLength: response.data?.length || 0,
                data: response.data,
            });

            setRequests(response.data || []);
        } catch (err: any) {
            console.error('❌ Failed to fetch requests:', err);
            Alert.alert('Error', err.message || 'Failed to load requests');
            setRequests([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedFilter, statusFilter]);

    useFocusEffect(
        useCallback(() => {
            fetchRequests();
        }, [fetchRequests])
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateTimeString: string | null | undefined) => {
        if (!dateTimeString) return 'N/A';
        const timePart = dateTimeString.split(' ').slice(1).join(' ');
        return timePart || dateTimeString;
    };

    const getStatusStyle = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        if (statusLower.includes('pending') || statusLower.includes('await')) {
            return { color: '#F57C00', bg: '#FFF3E0', icon: 'clock' as const, label: 'Pending' };
        }
        if (statusLower.includes('reject') || statusLower.includes('disapprove')) {
            return { color: '#C62828', bg: '#FFEBEE', icon: 'x-circle' as const, label: 'Rejected' };
        }
        if (statusLower.includes('approve')) {
            return { color: '#2E7D32', bg: '#E8F5E9', icon: 'check-circle' as const, label: 'Approved' };
        }

        return { color: colors.textSecondary, bg: colors.border, icon: 'info' as const, label: status };
    };

    const handleReject = (requestId: number) => {
        Alert.alert(
            'Reject Request',
            'Are you sure you want to reject this request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await disapproveAll({ ProgramID: 6, TranID: requestId });
                            Alert.alert('Success', 'Request rejected successfully!');
                            fetchRequests();
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

    const handleViewHistory = (item: EarlyLatePunchDetails) => {
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

    const renderRequestItem = ({ item }: { item: EarlyLatePunchDetails }) => {
        // Safe fallbacks for missing fields
        const approvalStatus = item.ApprovalStatus || 'Pending';
        const statusStyle = getStatusStyle(approvalStatus);
        const requestColor = item.CheckoutType === 'Early' ? '#FF9800' : '#4A90FF';
        const isPending = approvalStatus?.toLowerCase().includes('pending');
        const isApproved = approvalStatus?.toLowerCase().includes('approve');
        const isRejected = approvalStatus?.toLowerCase().includes('reject');

        const approverName = item.workflow_list?.[0]?.Approve_name || 'Not Assigned';
        const employeeName = item.EmployeeName || `Employee #${item.EmployeeID}`;
        const dateTimeISO = item.DateTimeISO || item.DateTime || item.CreatedDate;

        const getApproverLabel = (): string => {
            if (isPending) return 'Pending with';
            if (isApproved) return 'Approved by';
            if (isRejected) return 'Rejected by';
            return 'Reviewer';
        };

        return (
            <View style={styles.requestCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.avatarContainer, { backgroundColor: `${requestColor}15` }]}>
                            <Feather 
                                name={item.CheckoutType === 'Early' ? 'log-out' : 'log-in'} 
                                size={20} 
                                color={requestColor} 
                            />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.employeeName}>{employeeName}</Text>
                            <Text style={styles.employeeId}>
                                {item.CheckoutType === 'Early' ? 'Early Check-Out' : 'Late Check-In'}
                            </Text>
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
                    {/* Date & Time Row */}
                    <View style={styles.dateRow}>
                        <View style={styles.dateItem}>
                            <Feather name="calendar" size={14} color={colors.textSecondary} />
                            <Text style={styles.dateLabel}>Date:</Text>
                            <Text style={styles.dateValue}>{formatDate(dateTimeISO)}</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Feather name="clock" size={14} color={colors.textSecondary} />
                            <Text style={styles.dateLabel}>Time:</Text>
                            <Text style={styles.dateValue}>{formatTime(item.DateTime)}</Text>
                        </View>
                    </View>

                    {/* Reason */}
                    {item.Reason && (
                        <View style={styles.reasonBlock}>
                            <Text style={styles.reasonLabel}>Reason</Text>
                            <Text style={styles.reasonText} numberOfLines={3}>
                                {item.Reason}
                            </Text>
                        </View>
                    )}
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
                <Text style={styles.screenTitle}>Early/Late Requests</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.totalCount}>{requests.length} Records</Text>
                </View>
            </View>

            {/* Type Filter Chips */}
            <View style={styles.filterScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {renderFilterChip('All', 'All', 'layers')}
                    {renderFilterChip('Early Check-Out', 'Early', 'log-out')}
                    {renderFilterChip('Late Check-In', 'Late', 'log-in')}
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
            ) : requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Feather name="inbox" size={40} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.emptyTitle}>No Requests Found</Text>
                    <Text style={styles.emptySubtitle}>
                        No requests match the selected filters.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestItem}
                    keyExtractor={(item) => item.EarlyLatePunchMasterID.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={() => fetchRequests(true)}
                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                />
            )}

            {/* Approval History Modal */}
            {selectedRequest && (
                <ApprovalHistoryModal
                    visible={historyModalVisible}
                    onClose={() => setHistoryModalVisible(false)}
                    tranId={selectedRequest.EarlyLatePunchMasterID}
                    progId={6}
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
            gap: 16,
        },
        dateItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flex: 1,
        },
        dateLabel: {
            fontSize: 11,
            color: colors.textSecondary,
            fontWeight: '600',
        },
        dateValue: {
            fontSize: 13,
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

export default EarlyCheckout;