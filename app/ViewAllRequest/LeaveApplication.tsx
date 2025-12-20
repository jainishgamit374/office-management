import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Privilege Leave' | 'Leave Without Pay';
type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: RequestStatus;
    submittedOn: string;
}

// Mock leave request data
const leaveRequestsData: LeaveRequest[] = [
    {
        id: '1',
        employeeName: 'John Doe',
        employeeId: 'EMP001',
        leaveType: 'Sick Leave',
        startDate: '2025-12-20',
        endDate: '2025-12-22',
        days: 3,
        reason: 'Suffering from viral fever and need rest',
        status: 'Pending',
        submittedOn: '2025-12-18',
    },
    {
        id: '2',
        employeeName: 'Jane Smith',
        employeeId: 'EMP002',
        leaveType: 'Casual Leave',
        startDate: '2025-12-25',
        endDate: '2025-12-27',
        days: 3,
        reason: 'Family function - cousin\'s wedding',
        status: 'Approved',
        submittedOn: '2025-12-17',
    },
    {
        id: '3',
        employeeName: 'Mike Johnson',
        employeeId: 'EMP003',
        leaveType: 'Privilege Leave',
        startDate: '2025-12-23',
        endDate: '2025-12-30',
        days: 8,
        reason: 'Planned vacation with family to Goa',
        status: 'Approved',
        submittedOn: '2025-12-15',
    },
    {
        id: '4',
        employeeName: 'Sarah Williams',
        employeeId: 'EMP004',
        leaveType: 'Sick Leave',
        startDate: '2025-12-19',
        endDate: '2025-12-19',
        days: 1,
        reason: 'Doctor appointment for regular checkup',
        status: 'Pending',
        submittedOn: '2025-12-18',
    },
    {
        id: '5',
        employeeName: 'David Brown',
        employeeId: 'EMP005',
        leaveType: 'Leave Without Pay',
        startDate: '2025-12-28',
        endDate: '2026-01-05',
        days: 9,
        reason: 'Personal work - house renovation',
        status: 'Rejected',
        submittedOn: '2025-12-16',
    },
    {
        id: '6',
        employeeName: 'Emily Davis',
        employeeId: 'EMP006',
        leaveType: 'Casual Leave',
        startDate: '2025-12-21',
        endDate: '2025-12-21',
        days: 1,
        reason: 'Attending parent-teacher meeting at school',
        status: 'Approved',
        submittedOn: '2025-12-17',
    },
];

type FilterType = 'all' | 'casualLeave' | 'sickLeave' | 'privilegeLeave' | 'lwp';

const LeaveApplication = () => {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [requests, setRequests] = useState<LeaveRequest[]>(leaveRequestsData);

    // Filter requests based on selected filter
    const filteredRequests = requests.filter((request) => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'casualLeave') return request.leaveType === 'Casual Leave';
        if (selectedFilter === 'sickLeave') return request.leaveType === 'Sick Leave';
        if (selectedFilter === 'privilegeLeave') return request.leaveType === 'Privilege Leave';
        if (selectedFilter === 'lwp') return request.leaveType === 'Leave Without Pay';
        return true;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: RequestStatus) => {
        switch (status) {
            case 'Pending':
                return '#FF9800';
            case 'Approved':
                return '#4CAF50';
            case 'Rejected':
                return '#FF5252';
            default:
                return '#666';
        }
    };

    const getStatusBgColor = (status: RequestStatus) => {
        switch (status) {
            case 'Pending':
                return '#FFF3E0';
            case 'Approved':
                return '#E8F5E9';
            case 'Rejected':
                return '#FFEBEE';
            default:
                return '#F0F0F0';
        }
    };

    const getLeaveTypeColor = (type: LeaveType) => {
        switch (type) {
            case 'Casual Leave':
                return '#4A90FF';
            case 'Sick Leave':
                return '#FF9800';
            case 'Privilege Leave':
                return '#9C27B0';
            case 'Leave Without Pay':
                return '#F44336';
            default:
                return '#666';
        }
    };

    const getLeaveTypeIcon = (type: LeaveType) => {
        switch (type) {
            case 'Casual Leave':
                return 'coffee';
            case 'Sick Leave':
                return 'activity';
            case 'Privilege Leave':
                return 'sun';
            case 'Leave Without Pay':
                return 'alert-circle';
            default:
                return 'calendar';
        }
    };

    const getLeaveTypeShort = (type: LeaveType) => {
        switch (type) {
            case 'Casual Leave':
                return 'CL';
            case 'Sick Leave':
                return 'SL';
            case 'Privilege Leave':
                return 'PL';
            case 'Leave Without Pay':
                return 'LWP';
            default:
                return '';
        }
    };

    const handleApprove = (requestId: string) => {
        Alert.alert(
            'Approve Leave Request',
            'Are you sure you want to approve this leave request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => {
                        setRequests((prev) =>
                            prev.map((req) =>
                                req.id === requestId ? { ...req, status: 'Approved' } : req
                            )
                        );
                        Alert.alert('Success', 'Leave request approved successfully!');
                    },
                },
            ]
        );
    };

    const handleReject = (requestId: string) => {
        Alert.alert(
            'Reject Leave Request',
            'Are you sure you want to reject this leave request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: () => {
                        setRequests((prev) =>
                            prev.map((req) =>
                                req.id === requestId ? { ...req, status: 'Rejected' } : req
                            )
                        );
                        Alert.alert('Success', 'Leave request rejected successfully!');
                    },
                },
            ]
        );
    };

    const renderLeaveRequestItem = ({ item }: { item: LeaveRequest }) => (
        <View style={styles.requestCard}>
            {/* Header Section */}
            <View style={styles.requestHeader}>
                <View style={styles.employeeInfo}>
                    <View
                        style={[
                            styles.avatarContainer,
                            { backgroundColor: `${getLeaveTypeColor(item.leaveType)}20` },
                        ]}
                    >
                        <Text style={[styles.avatarText, { color: getLeaveTypeColor(item.leaveType) }]}>
                            {getLeaveTypeShort(item.leaveType)}
                        </Text>
                    </View>
                    <View style={styles.employeeDetails}>
                        <Text style={styles.employeeName}>{item.employeeName}</Text>
                        <Text style={styles.employeeId}>{item.employeeId}</Text>
                    </View>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBgColor(item.status) },
                    ]}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {/* Leave Type Badge */}
            <View
                style={[
                    styles.leaveTypeBadge,
                    { backgroundColor: `${getLeaveTypeColor(item.leaveType)}15` },
                ]}
            >
                <Feather
                    name={getLeaveTypeIcon(item.leaveType) as any}
                    size={16}
                    color={getLeaveTypeColor(item.leaveType)}
                />
                <Text style={[styles.leaveTypeText, { color: getLeaveTypeColor(item.leaveType) }]}>
                    {item.leaveType}
                </Text>
            </View>

            {/* Date Info */}
            <View style={styles.dateInfoContainer}>
                <View style={styles.dateInfoRow}>
                    <View style={styles.dateInfoItem}>
                        <Feather name="calendar" size={16} color="#666" />
                        <Text style={styles.dateInfoLabel}>From:</Text>
                        <Text style={styles.dateInfoValue}>{formatDate(item.startDate)}</Text>
                    </View>
                    <View style={styles.dateInfoItem}>
                        <Feather name="calendar" size={16} color="#666" />
                        <Text style={styles.dateInfoLabel}>To:</Text>
                        <Text style={styles.dateInfoValue}>{formatDate(item.endDate)}</Text>
                    </View>
                </View>
                <View style={styles.daysContainer}>
                    <Feather name="clock" size={14} color="#4A90FF" />
                    <Text style={styles.daysText}>
                        {item.days} {item.days === 1 ? 'Day' : 'Days'}
                    </Text>
                </View>
            </View>

            {/* Reason */}
            <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{item.reason}</Text>
            </View>

            {/* Submitted Info */}
            <View style={styles.submittedInfo}>
                <Feather name="send" size={12} color="#999" />
                <Text style={styles.submittedText}>
                    Submitted on {formatDate(item.submittedOn)}
                </Text>
            </View>

            {/* Action Buttons (only for pending requests) */}
            {item.status === 'Pending' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(item.id)}
                        activeOpacity={0.7}
                    >
                        <Feather name="check-circle" size={18} color="#FFF" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(item.id)}
                        activeOpacity={0.7}
                    >
                        <Feather name="x-circle" size={18} color="#FFF" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

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

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'lwp' && styles.filterChipActive,
                                selectedFilter === 'lwp' && { backgroundColor: '#F44336', borderColor: '#F44336' },
                            ]}
                            onPress={() => setSelectedFilter('lwp')}
                        >
                            <Feather
                                name="alert-circle"
                                size={14}
                                color={selectedFilter === 'lwp' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'lwp' && styles.filterChipTextActive,
                                ]}
                            >
                                LWP
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
                            keyExtractor={(item) => item.id}
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