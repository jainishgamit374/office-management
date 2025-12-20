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
type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

interface WFHRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    date: string;
    isHalfDay: boolean;
    reason: string;
    status: RequestStatus;
    submittedOn: string;
}

// Mock WFH request data
const wfhRequestsData: WFHRequest[] = [
    {
        id: '1',
        employeeName: 'John Doe',
        employeeId: 'EMP001',
        date: '2025-12-20',
        isHalfDay: false,
        reason: 'Internet installation at home',
        status: 'Pending',
        submittedOn: '2025-12-18',
    },
    {
        id: '2',
        employeeName: 'Jane Smith',
        employeeId: 'EMP002',
        date: '2025-12-19',
        isHalfDay: true,
        reason: 'Plumber coming for repairs in the morning',
        status: 'Approved',
        submittedOn: '2025-12-17',
    },
    {
        id: '3',
        employeeName: 'Mike Johnson',
        employeeId: 'EMP003',
        date: '2025-12-23',
        isHalfDay: false,
        reason: 'Avoiding traffic during festival season',
        status: 'Approved',
        submittedOn: '2025-12-16',
    },
    {
        id: '4',
        employeeName: 'Sarah Williams',
        employeeId: 'EMP004',
        date: '2025-12-21',
        isHalfDay: false,
        reason: 'Need to take care of sick family member',
        status: 'Pending',
        submittedOn: '2025-12-18',
    },
    {
        id: '5',
        employeeName: 'David Brown',
        employeeId: 'EMP005',
        date: '2025-12-22',
        isHalfDay: true,
        reason: 'Personal appointment in afternoon',
        status: 'Rejected',
        submittedOn: '2025-12-17',
    },
    {
        id: '6',
        employeeName: 'Emily Davis',
        employeeId: 'EMP006',
        date: '2025-12-24',
        isHalfDay: false,
        reason: 'Working on important project requiring quiet environment',
        status: 'Approved',
        submittedOn: '2025-12-16',
    },
];

type FilterType = 'all' | 'fullDay' | 'halfDay';

const Wfhrequest = () => {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [requests, setRequests] = useState<WFHRequest[]>(wfhRequestsData);

    // Filter requests based on selected filter
    const filteredRequests = requests.filter((request) => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'fullDay') return !request.isHalfDay;
        if (selectedFilter === 'halfDay') return request.isHalfDay;
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

    const handleApprove = (requestId: string) => {
        Alert.alert(
            'Approve WFH Request',
            'Are you sure you want to approve this WFH request?',
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
                        Alert.alert('Success', 'WFH request approved successfully!');
                    },
                },
            ]
        );
    };

    const handleReject = (requestId: string) => {
        Alert.alert(
            'Reject WFH Request',
            'Are you sure you want to reject this WFH request?',
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
                        Alert.alert('Success', 'WFH request rejected successfully!');
                    },
                },
            ]
        );
    };

    const renderWFHRequestItem = ({ item }: { item: WFHRequest }) => (
        <View style={styles.requestCard}>
            {/* Header Section */}
            <View style={styles.requestHeader}>
                <View style={styles.employeeInfo}>
                    <View
                        style={[
                            styles.avatarContainer,
                            { backgroundColor: item.isHalfDay ? '#FF980020' : '#4A90FF20' },
                        ]}
                    >
                        <Text style={[styles.avatarText, { color: item.isHalfDay ? '#FF9800' : '#4A90FF' }]}>
                            {item.employeeName.split(' ').map((n) => n[0]).join('')}
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

            {/* WFH Type Badge */}
            <View
                style={[
                    styles.wfhTypeBadge,
                    { backgroundColor: item.isHalfDay ? '#FF980015' : '#4A90FF15' },
                ]}
            >
                <Feather
                    name={item.isHalfDay ? 'clock' : 'home'}
                    size={16}
                    color={item.isHalfDay ? '#FF9800' : '#4A90FF'}
                />
                <Text style={[styles.wfhTypeText, { color: item.isHalfDay ? '#FF9800' : '#4A90FF' }]}>
                    {item.isHalfDay ? 'Half-Day WFH' : 'Full-Day WFH'}
                </Text>
            </View>

            {/* Date Info */}
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Feather name="calendar" size={16} color="#666" />
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.date)}</Text>
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
                    <Text style={styles.sectionTitle}>Filter by Type</Text>
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
                                All Requests
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'fullDay' && styles.filterChipActive,
                                selectedFilter === 'fullDay' && { backgroundColor: '#4A90FF', borderColor: '#4A90FF' },
                            ]}
                            onPress={() => setSelectedFilter('fullDay')}
                        >
                            <Feather
                                name="home"
                                size={14}
                                color={selectedFilter === 'fullDay' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'fullDay' && styles.filterChipTextActive,
                                ]}
                            >
                                Full Day
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'halfDay' && styles.filterChipActive,
                                selectedFilter === 'halfDay' && { backgroundColor: '#FF9800', borderColor: '#FF9800' },
                            ]}
                            onPress={() => setSelectedFilter('halfDay')}
                        >
                            <Feather
                                name="clock"
                                size={14}
                                color={selectedFilter === 'halfDay' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'halfDay' && styles.filterChipTextActive,
                                ]}
                            >
                                Half Day
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Requests List */}
                <View style={styles.requestsContainer}>
                    <View style={styles.requestsHeader}>
                        <Text style={styles.sectionTitle}>WFH Requests</Text>
                        <Text style={styles.recordCount}>{filteredRequests.length} records</Text>
                    </View>

                    {filteredRequests.length > 0 ? (
                        <FlatList
                            data={filteredRequests}
                            renderItem={renderWFHRequestItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Feather name="inbox" size={48} color="#CCC" />
                            <Text style={styles.emptyStateText}>No WFH requests found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                There are no {selectedFilter === 'all' ? '' : selectedFilter === 'fullDay' ? 'full-day' : 'half-day'} WFH requests at the moment
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

    // WFH Type Badge
    wfhTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 14,
    },
    wfhTypeText: {
        fontSize: 14,
        fontWeight: '700',
    },

    // Info Row
    infoRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 14,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
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

export default Wfhrequest;