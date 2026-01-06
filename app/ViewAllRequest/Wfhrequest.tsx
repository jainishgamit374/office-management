import { authApiRequest } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import {
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

// Types
interface WorkflowItem {
    Approve_name: string;
    Priority: number;
    status: string;
}

interface WFHRequest {
    WorkFromHomeReqMasterID: number;
    EmployeeID: number;
    ApprovalStatusID: number;
    ApprovalStatus: string;
    Reason: string;
    DateTime: string;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
    workflow_list: WorkflowItem[];
}


type FilterType = 'all' | 'fullDay' | 'halfDay';

const Wfhrequest = () => {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [requests, setRequests] = useState<WFHRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch WFH requests from API
    const fetchWFHRequests = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const response = await authApiRequest<{
                status: string;
                statusCode: number;
                data: WFHRequest[];
            }>('/workfromhomeapplicationslist/', {
                method: 'GET',
            });

            console.log('✅ WFH Requests Response:', response);

            if (response.status === 'Success' && response.data) {
                setRequests(response.data);
            }
        } catch (error: any) {
            console.error('❌ Error fetching WFH requests:', error);
            Alert.alert('Error', error.message || 'Failed to fetch WFH requests');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchWFHRequests();
    }, []);

    // Handle pull-to-refresh
    const handleRefresh = () => {
        fetchWFHRequests(true);
    };

    // Filter requests based on selected filter
    const filteredRequests = requests.filter((request) => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'fullDay') return !request.IsHalfDay;
        if (selectedFilter === 'halfDay') return request.IsHalfDay;
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

    const getStatusColor = (status: string) => {
        if (status.toLowerCase().includes('approved') || status.toLowerCase().includes('approve')) {
            return '#4CAF50';
        } else if (status.toLowerCase().includes('reject')) {
            return '#FF5252';
        } else if (status.toLowerCase().includes('await') || status.toLowerCase().includes('pending')) {
            return '#FF9800';
        }
        return '#666';
    };

    const getStatusBgColor = (status: string) => {
        if (status.toLowerCase().includes('approved') || status.toLowerCase().includes('approve')) {
            return '#E8F5E9';
        } else if (status.toLowerCase().includes('reject')) {
            return '#FFEBEE';
        } else if (status.toLowerCase().includes('await') || status.toLowerCase().includes('pending')) {
            return '#FFF3E0';
        }
        return '#F0F0F0';
    };

    const handleApprove = (requestId: number) => {
        Alert.alert(
            'Approve WFH Request',
            'Are you sure you want to approve this WFH request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => {
                        // TODO: Implement approve API call
                        Alert.alert('Info', 'Approve functionality will be implemented with the approval API endpoint');
                    },
                },
            ]
        );
    };

    const handleReject = (requestId: number) => {
        Alert.alert(
            'Reject WFH Request',
            'Are you sure you want to reject this WFH request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement reject API call
                        Alert.alert('Info', 'Reject functionality will be implemented with the rejection API endpoint');
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
                            { backgroundColor: item.IsHalfDay ? '#FF980020' : '#4A90FF20' },
                        ]}
                    >
                        <Feather 
                            name="user" 
                            size={24} 
                            color={item.IsHalfDay ? '#FF9800' : '#4A90FF'} 
                        />
                    </View>
                    <View style={styles.employeeDetails}>
                        <Text style={styles.employeeName}>Employee ID: {item.EmployeeID}</Text>
                        <Text style={styles.employeeId}>Request #{item.WorkFromHomeReqMasterID}</Text>
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

            {/* WFH Type Badge */}
            <View
                style={[
                    styles.wfhTypeBadge,
                    { backgroundColor: item.IsHalfDay ? '#FF980015' : '#4A90FF15' },
                ]}
            >
                <Feather
                    name={item.IsHalfDay ? 'clock' : 'home'}
                    size={16}
                    color={item.IsHalfDay ? '#FF9800' : '#4A90FF'}
                />
                <Text style={[styles.wfhTypeText, { color: item.IsHalfDay ? '#FF9800' : '#4A90FF' }]}>
                    {item.IsHalfDay ? (item.IsFirstHalf ? 'First Half WFH' : 'Second Half WFH') : 'Full-Day WFH'}
                </Text>
            </View>

            {/* Date Info */}
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Feather name="calendar" size={16} color="#666" />
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.DateTime)}</Text>
                </View>
            </View>

            {/* Reason */}
            <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{item.Reason}</Text>
            </View>

            {/* Workflow List */}
            {item.workflow_list && item.workflow_list.length > 0 && (
                <View style={styles.workflowContainer}>
                    <Text style={styles.workflowTitle}>Approval Workflow:</Text>
                    {item.workflow_list.map((workflow, index) => (
                        <View key={index} style={styles.workflowItem}>
                            <View style={styles.workflowBadge}>
                                <Text style={styles.workflowPriority}>{workflow.Priority}</Text>
                            </View>
                            <View style={styles.workflowDetails}>
                                <Text style={styles.workflowName}>{workflow.Approve_name}</Text>
                                <Text style={[
                                    styles.workflowStatus,
                                    { color: getStatusColor(workflow.status) }
                                ]}>
                                    {workflow.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Action Buttons (only for pending requests) */}
            {item.ApprovalStatus.toLowerCase().includes('await') && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(item.WorkFromHomeReqMasterID)}
                        activeOpacity={0.7}
                    >
                        <Feather name="check-circle" size={18} color="#FFF" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(item.WorkFromHomeReqMasterID)}
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
                            keyExtractor={(item) => item.WorkFromHomeReqMasterID.toString()}
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

    // Workflow Container
    workflowContainer: {
        backgroundColor: '#F0F4FF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#D6E4FF',
    },
    workflowTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
        marginBottom: 10,
    },
    workflowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    workflowBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4A90FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    workflowPriority: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    workflowDetails: {
        flex: 1,
    },
    workflowName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    workflowStatus: {
        fontSize: 12,
        fontWeight: '600',
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