import { getLeaveApplicationsList, LeaveApplicationDetails } from '@/lib/leaves';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
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

// Types
type FilterType = 'All' | 'CL' | 'SL' | 'PL';
type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

const LeaveApplication = () => {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [applications, setApplications] = useState<LeaveApplicationDetails[]>([]);
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

            const response = await getLeaveApplicationsList({
                page: currentPage,
                limit: 50,
                leaveType: selectedFilter,
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

    // Filtered applications (client-side filtering as backup)
    const filteredRequests = applications;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        if (statusLower.includes('pending') || statusLower.includes('awaiting')) {
            return '#FFA726'; // Bright Orange for pending/awaiting
        }
        if (statusLower.includes('approve') && !statusLower.includes('awaiting')) {
            return '#66BB6A'; // Bright Green for approved
        }
        if (statusLower.includes('reject') || statusLower.includes('disapprove')) {
            return '#EF5350'; // Bright Red for rejected
        }
        if (statusLower.includes('cancel')) {
            return '#9E9E9E'; // Gray for cancelled
        }
        return '#757575'; // Default gray
    };

    const getStatusBgColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        if (statusLower.includes('pending') || statusLower.includes('awaiting')) {
            return '#FFF3E0'; // Light orange background
        }
        if (statusLower.includes('approve') && !statusLower.includes('awaiting')) {
            return '#E8F5E9'; // Light green background
        }
        if (statusLower.includes('reject') || statusLower.includes('disapprove')) {
            return '#FFEBEE'; // Light red background
        }
        if (statusLower.includes('cancel')) {
            return '#F5F5F5'; // Light gray background
        }
        return '#FAFAFA'; // Default light gray
    };

    const getLeaveTypeColor = (type: string) => {
        if (type.includes('Casual')) return '#4A90FF';
        if (type.includes('Sick')) return '#FF9800';
        if (type.includes('Privilege')) return '#9C27B0';
        return '#666';
    };

    const getLeaveTypeIcon = (type: string) => {
        if (type.includes('Casual')) return 'coffee';
        if (type.includes('Sick')) return 'activity';
        if (type.includes('Privilege')) return 'sun';
        return 'calendar';
    };

    const renderLeaveRequestItem = ({ item }: { item: any }) => {
        // Get approver name from workflow_list
        const approverName = item.workflow_list?.[0]?.Approve_name || 'N/A';
        const workflowStatus = item.workflow_list?.[0]?.status || item.ApprovalStatus;

        return (
            <View style={styles.requestCard}>
                {/* Header Section */}
                <View style={styles.requestHeader}>
                    <View style={styles.employeeInfo}>
                        <View
                            style={[
                                styles.avatarContainer,
                                { backgroundColor: `${getLeaveTypeColor(item.LeaveType)}20` },
                            ]}
                        >
                            <Text style={[styles.avatarText, { color: getLeaveTypeColor(item.LeaveType) }]}>
                                {item.ShortName || 'NA'}
                            </Text>
                        </View>
                        <View style={styles.employeeDetails}>
                            <Text style={styles.employeeName}>Leave Request #{item.LeaveApplicationMasterID}</Text>
                            <Text style={styles.employeeId}>{item.LeaveType}</Text>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusBgColor(item.ApprovalStatus) },
                        ]}
                    >
                        <Text style={[styles.statusText, { color: getStatusColor(item.ApprovalStatus) }]}>
                            {item.ApprovalStatus}
                        </Text>
                    </View>
                </View>

                {/* Leave Type Badge */}
                <View
                    style={[
                        styles.leaveTypeBadge,
                        { backgroundColor: `${getLeaveTypeColor(item.LeaveType)}15` },
                    ]}
                >
                    <Feather
                        name={getLeaveTypeIcon(item.LeaveType) as any}
                        size={16}
                        color={getLeaveTypeColor(item.LeaveType)}
                    />
                    <Text style={[styles.leaveTypeText, { color: getLeaveTypeColor(item.LeaveType) }]}>
                        {item.LeaveType}
                    </Text>
                </View>

                {/* Workflow Information */}
                {item.workflow_list && item.workflow_list.length > 0 && (
                    <View style={styles.reasonContainer}>
                        <Text style={styles.reasonLabel}>Approval Workflow:</Text>
                        {item.workflow_list.map((workflow: any, index: number) => (
                            <View key={index} style={styles.workflowItem}>
                                <View style={styles.workflowRow}>
                                    <Feather
                                        name={workflow.status === 'Approved' ? 'check-circle' :
                                            workflow.status === 'Rejected' ? 'x-circle' : 'clock'}
                                        size={14}
                                        color={getStatusColor(workflow.status)}
                                    />
                                    <Text style={styles.workflowText}>
                                        {workflow.Approve_name} (Priority {workflow.Priority})
                                    </Text>
                                </View>
                                <Text style={[styles.workflowStatus, { color: getStatusColor(workflow.status) }]}>
                                    {workflow.status}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Status is Pending - show that it's awaiting approval */}
                {(item.ApprovalStatus === 'Pending' || item.ApprovalStatus === 'Awaiting Approve') && (
                    <View style={styles.pendingInfo}>
                        <Feather name="clock" size={14} color="#FFA726" />
                        <Text style={styles.pendingText}>
                            Awaiting approval from {approverName}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <Text style={styles.sectionTitle}>Filter by Leave Type</Text>
                    <View style={styles.filterRow}>
                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'all' && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedFilter('all')}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'all' && styles.filterChipTextActive,
                                ]}
                            >
                                All Leaves
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'casualLeave' && styles.filterChipActive,
                                selectedFilter === 'casualLeave' && { backgroundColor: '#4A90FF', borderColor: '#4A90FF' },
                            ]}
                            onPress={() => setSelectedFilter('casualLeave')}
                        >
                            <Feather
                                name="coffee"
                                size={14}
                                color={selectedFilter === 'casualLeave' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'casualLeave' && styles.filterChipTextActive,
                                ]}
                            >
                                CL
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'sickLeave' && styles.filterChipActive,
                                selectedFilter === 'sickLeave' && { backgroundColor: '#FF9800', borderColor: '#FF9800' },
                            ]}
                            onPress={() => setSelectedFilter('sickLeave')}
                        >
                            <Feather
                                name="activity"
                                size={14}
                                color={selectedFilter === 'sickLeave' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'sickLeave' && styles.filterChipTextActive,
                                ]}
                            >
                                SL
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'privilegeLeave' && styles.filterChipActive,
                                selectedFilter === 'privilegeLeave' && { backgroundColor: '#9C27B0', borderColor: '#9C27B0' },
                            ]}
                            onPress={() => setSelectedFilter('privilegeLeave')}
                        >
                            <Feather
                                name="sun"
                                size={14}
                                color={selectedFilter === 'privilegeLeave' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'privilegeLeave' && styles.filterChipTextActive,
                                ]}
                            >
                                PL
                            </Text>
                        </Pressable>

                    </View>
                </View>

                {/* Requests List */}
                <View style={styles.requestsContainer}>
                    <View style={styles.requestsHeader}>
                        <Text style={styles.sectionTitle}>Leave Requests</Text>
                        <Text style={styles.recordCount}>{filteredRequests.length} records</Text>
                    </View>

                    {filteredRequests.length > 0 ? (
                        <FlatList
                            data={filteredRequests}
                            renderItem={renderLeaveRequestItem}
                            keyExtractor={(item) => item.LeaveApplicationMasterID?.toString() || Math.random().toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Feather name="inbox" size={48} color="#CCC" />
                            <Text style={styles.emptyStateText}>No leave requests found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                There are no {selectedFilter === 'all' ? '' : selectedFilter.replace(/([A-Z])/g, ' $1').toLowerCase()} leave requests at the moment
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
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

    // Section Title
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },

    // Filter Chips
    filterContainer: {
        marginBottom: 24,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    filterChipActive: {
        backgroundColor: '#4A90FF',
        borderColor: '#4A90FF',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    filterChipTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },

    // Requests Container
    requestsContainer: {
        marginBottom: 20,
    },
    requestsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    recordCount: {
        fontSize: 13,
        color: '#999',
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 16,
    },

    // Request Card
    requestCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },

    // Request Header
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    employeeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    avatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 17,
        fontWeight: '700',
    },
    employeeDetails: {
        flex: 1,
    },
    employeeName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333',
        marginBottom: 3,
    },
    employeeId: {
        fontSize: 13,
        color: '#999',
        fontWeight: '600',
    },

    // Status Badge
    statusBadge: {
        width: '35%',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        width: '100%',
        textAlign: 'center',
        paddingVertical: 7,
        paddingHorizontal: 24,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // Leave Type Badge
    leaveTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 14,
    },
    leaveTypeText: {
        fontSize: 14,
        fontWeight: '700',
    },

    // Date Info
    dateInfoContainer: {
        marginBottom: 14,
    },
    dateInfoRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 10,
    },
    dateInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    dateInfoLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
    },
    dateInfoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    daysContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    daysText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A90FF',
    },

    // Reason
    reasonContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E8EAED',
    },
    reasonLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
        marginBottom: 6,
    },
    reasonText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        fontWeight: '500',
    },

    // Submitted Info
    submittedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    submittedText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
    },

    // Workflow Styles
    workflowItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E8EAED',
    },
    workflowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    workflowText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    workflowStatus: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },

    // Pending Info
    pendingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
    },
    pendingText: {
        fontSize: 13,
        color: '#FFA726', // Bright orange to match status color
        fontWeight: '600',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 6,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        width: '60%',
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#FF5252',
    },
    actionButtonText: {
        width: '60%',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffffff',
        letterSpacing: 0.5,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 14,
    },
    emptyStateText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#999',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#BBB',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
        fontWeight: '500',
    },
});

export default LeaveApplication;