import { getEarlyLatePunchList, type EarlyLatePunchDetails } from '@/lib/earlyLatePunch';
import { disapproveAll } from '@/lib/workflow';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApprovalHistoryModal from '../../components/Admin/ApprovalHistoryModal';

// Types
type FilterType = 'All' | 'Early' | 'Late';
type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

const EarlyCheckoutt = () => {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [requests, setRequests] = useState<EarlyLatePunchDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // History Modal State
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<EarlyLatePunchDetails | null>(null);

    // Fetch requests from API
    const fetchRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getEarlyLatePunchList({
                checkoutType: selectedFilter,
                status: statusFilter,
                sortBy: 'CreatedDate',
                sortOrder: 'desc',
            });
            setRequests(response.data);
            console.log('✅ Fetched', response.data.length, 'requests');
        } catch (err: any) {
            console.error('Failed to fetch requests:', err);
            setError(err.message || 'Failed to load requests');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFilter, statusFilter]);

    // Fetch data on mount and when filters change
    useFocusEffect(
        useCallback(() => {
            fetchRequests();
        }, [fetchRequests])
    );

    const formatDate = (dateString: string) => {
        // Handle both "2025-01-10 04:00:00 PM" and ISO format
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateTimeString: string | null | undefined) => {
        if (!dateTimeString) return 'N/A';
        // Extract time from "2025-01-10 04:00:00 PM" format
        const timePart = dateTimeString.split(' ').slice(1).join(' ');
        return timePart || dateTimeString;
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'NA';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    };

    const getStatusColor = (status: string) => {
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

    const getStatusBgColor = (status: string) => {
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

    const getRequestTypeColor = (type: string) => {
        return type === 'Early' ? '#FF9800' : '#4A90FF';
    };

    const getRequestTypeIcon = (type: string) => {
        return type === 'Early' ? 'log-out' : 'log-in';
    };

    const getRequestTypeLabel = (type: string) => {
        return type === 'Early' ? 'Early Check-Out' : 'Late Check-In';
    };

    const handleApprove = (requestId: number) => {
        Alert.alert(
            'Approve Request',
            'Are you sure you want to approve this request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => {
                        // TODO: Call API to approve request
                        Alert.alert('Success', 'Request approved successfully!');
                        fetchRequests(); // Refresh list
                    },
                },
            ]
        );
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
                            // PROGRAM ID 6 for Early/Late Punch
                            await disapproveAll({ ProgramID: 6, TranID: requestId });
                            
                            // Optimistic update
                            setRequests((prev) =>
                                prev.map((req) =>
                                    req.EarlyLatePunchMasterID === requestId ? { ...req, ApprovalStatus: 'Rejected' as any } : req
                                )
                            );

                            Alert.alert('Success', 'Request rejected successfully!');
                            fetchRequests(); // Refresh list
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

    const renderRequestItem = ({ item }: { item: EarlyLatePunchDetails }) => (
        <View style={styles.requestCard}>
            {/* Header Section */}
            <View style={styles.requestHeader}>
                <View style={styles.employeeInfo}>
                    <View
                        style={[
                            styles.avatarContainer,
                            { backgroundColor: `${getRequestTypeColor(item.CheckoutType)}20` },
                        ]}
                    >
                        <Text style={[styles.avatarText, { color: getRequestTypeColor(item.CheckoutType) }]}>
                            {getInitials(item.EmployeeName)}
                        </Text>
                    </View>
                    <View style={styles.employeeDetails}>
                        <Text style={styles.employeeName}>{item.EmployeeName || 'Unknown Employee'}</Text>
                        <Text style={styles.employeeId}>{item.EmployeeEmail || 'No email'}</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
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
                    <TouchableOpacity
                        style={styles.historyIconButton}
                        onPress={() => handleViewHistory(item)}
                    >
                        <Feather name="clock" size={16} color="#4A90FF" />
                        <Text style={styles.historyLinkText}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Request Type Badge */}
            <View
                style={[
                    styles.requestTypeBadge,
                    { backgroundColor: `${getRequestTypeColor(item.CheckoutType)}15` },
                ]}
            >
                <Feather
                    name={getRequestTypeIcon(item.CheckoutType) as any}
                    size={16}
                    color={getRequestTypeColor(item.CheckoutType)}
                />
                <Text style={[styles.requestTypeText, { color: getRequestTypeColor(item.CheckoutType) }]}>
                    {getRequestTypeLabel(item.CheckoutType)}
                </Text>
            </View>

            {/* Date & Time Info */}
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Feather name="calendar" size={16} color="#666" />
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.DateTimeISO)}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Feather name="clock" size={16} color="#666" />
                    <Text style={styles.infoLabel}>Time:</Text>
                    <Text style={styles.infoValue}>{formatTime(item.DateTime)}</Text>
                </View>
            </View>

            {/* Reason */}
            <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{item.Reason}</Text>
            </View>

            {/* Submitted Info */}
            <View style={styles.submittedInfo}>
                <Feather name="send" size={12} color="#999" />
                <Text style={styles.submittedText}>
                    Submitted on {formatDate(item.CreatedDateISO)}
                </Text>
            </View>

            {/* Action Buttons (only for pending requests and if user can edit) */}
            {item.ApprovalStatus === 'Pending' && item.CanEdit && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(item.EarlyLatePunchMasterID)}
                        activeOpacity={0.7}
                    >
                        <Feather name="check-circle" size={18} color="#FFF" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(item.EarlyLatePunchMasterID)}
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
                                selectedFilter === 'All' && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedFilter('All')}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'All' && styles.filterChipTextActive,
                                ]}
                            >
                                All Requests
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'Early' && styles.filterChipActive,
                                selectedFilter === 'Early' && { backgroundColor: '#FF9800', borderColor: '#FF9800' },
                            ]}
                            onPress={() => setSelectedFilter('Early')}
                        >
                            <Feather
                                name="log-out"
                                size={14}
                                color={selectedFilter === 'Early' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'Early' && styles.filterChipTextActive,
                                ]}
                            >
                                Early Check-Out
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'Late' && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedFilter('Late')}
                        >
                            <Feather
                                name="log-in"
                                size={14}
                                color={selectedFilter === 'Late' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'Late' && styles.filterChipTextActive,
                                ]}
                            >
                                Late Check-In
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Requests List */}
                <View style={styles.requestsContainer}>
                    <View style={styles.requestsHeader}>
                        <Text style={styles.sectionTitle}>Requests</Text>
                        <Text style={styles.recordCount}>{requests.length} records</Text>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4A90FF" />
                            <Text style={styles.loadingText}>Loading requests...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.emptyState}>
                            <Feather name="alert-circle" size={48} color="#FF5252" />
                            <Text style={styles.emptyStateText}>Error loading requests</Text>
                            <Text style={styles.emptyStateSubtext}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={fetchRequests}
                            >
                                <Feather name="refresh-cw" size={16} color="#4A90FF" />
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : requests.length > 0 ? (
                        <FlatList
                            data={requests}
                            renderItem={renderRequestItem}
                            keyExtractor={(item) => item.EarlyLatePunchMasterID.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Feather name="inbox" size={48} color="#CCC" />
                            <Text style={styles.emptyStateText}>No requests found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                There are no {selectedFilter === 'All' ? '' : selectedFilter === 'Early' ? 'early check-out' : 'late check-in'} requests at the moment
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Approval History Modal */}
            {selectedRequest && (
                <ApprovalHistoryModal
                    visible={historyModalVisible}
                    onClose={() => setHistoryModalVisible(false)}
                    tranId={selectedRequest.EarlyLatePunchMasterID}
                    progId={6} // Using 6 for Early/Late Punch based on user info
                    employeeName={selectedRequest.EmployeeName || 'Unknown'}
                />
            )}
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

    // Header Actions
    headerActions: {
        alignItems: 'flex-end',
        gap: 6,
    },
    historyIconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#E3F2FD',
    },
    historyLinkText: {
        fontSize: 11,
        color: '#4A90FF',
        fontWeight: '700',
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

    // Request Type Badge
    requestTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 14,
    },
    requestTypeText: {
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

    // Loading
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 14,
    },
    loadingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#999',
    },

    // Retry Button
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4A90FF',
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A90FF',
    },
});

export default EarlyCheckoutt;