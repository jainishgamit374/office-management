import { getMissPunchDetails as getMissingPunchDetails, MissPunchRequest as MissPunchDetail } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MissPunchList = () => {
    const [requests, setRequests] = useState<MissPunchDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch missed punch requests
    const fetchRequests = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            console.log('📋 Fetching missed punch details...');
            const response = await getMissingPunchDetails();

            if (response.status === 'Success') {
                setRequests(response.data || []);
                console.log('✅ Loaded', response.data?.length || 0, 'requests');
            } else {
                setRequests([]);
            }
        } catch (err: any) {
            console.error('❌ Error fetching requests:', err);
            setError(err.message || 'Failed to load missed punch requests');
            setRequests([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch on mount and when screen gains focus
    useFocusEffect(
        useCallback(() => {
            fetchRequests();
        }, [])
    );

    // Handle pull to refresh
    const handleRefresh = () => {
        fetchRequests(true);
    };

    // Get status info based on ApprovalStatusMasterID
    const getStatusInfo = (statusId: number) => {
        switch (statusId) {
            case 1:
                return { text: 'Approved', color: '#4CAF50', bgColor: '#E8F5E9' };
            case 2:
                return { text: 'Rejected', color: '#FF5252', bgColor: '#FFEBEE' };
            case 3:
                return { text: 'Awaiting Approve', color: '#FF9800', bgColor: '#FFF3E0' };
            default:
                return { text: 'Unknown', color: '#999', bgColor: '#F5F5F5' };
        }
    };

    // Get punch type label
    const getPunchTypeLabel = (punchType: string) => {
        return punchType === '1' ? 'Punch In' : 'Punch Out';
    };

    // Render individual request card
    const renderRequestCard = ({ item }: { item: MissPunchDetail }) => {
        const statusInfo = getStatusInfo(item.ApprovalStatusMasterID);
        const punchTypeLabel = getPunchTypeLabel(item.PunchType);
        
        return (
            <View style={styles.requestCard}>
                {/* Header with ID */}
                <View style={styles.cardHeader}>
                    <View style={styles.idBadge}>
                        <Text style={styles.idText}>#{item.MissPunchReqMasterID}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                    </View>
                </View>

                {/* Punch Type */}
                <View style={styles.punchTypeSection}>
                    <View style={styles.punchTypeIcon}>
                        <Feather 
                            name={item.PunchType === '1' ? 'log-in' : 'log-out'} 
                            size={20} 
                            color="#4A90FF" 
                        />
                    </View>
                    <View style={styles.punchTypeInfo}>
                        <Text style={styles.punchTypeLabel}>Punch Type</Text>
                        <Text style={styles.punchTypeValue}>{punchTypeLabel}</Text>
                    </View>
                </View>

                {/* Date & Time */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Feather name="calendar" size={16} color="#666" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Missed Punch Date & Time</Text>
                        <Text style={styles.infoValue}>{item.datetime}</Text>
                    </View>
                </View>

                {/* Reason */}
                {item.reason && (
                    <View style={styles.reasonSection}>
                        <View style={styles.reasonHeader}>
                            <Feather name="message-circle" size={16} color="#666" />
                            <Text style={styles.reasonLabel}>Reason</Text>
                        </View>
                        <Text style={styles.reasonText}>{item.reason}</Text>
                    </View>
                )}

                {/* Workflow */}
                {item.workflow_list && item.workflow_list.length > 0 && (
                    <View style={styles.workflowSection}>
                        <View style={styles.workflowHeader}>
                            <Feather name="users" size={14} color="#666" />
                            <Text style={styles.workflowTitle}>Approval Workflow</Text>
                        </View>
                        {item.workflow_list.map((approver, index) => (
                            <View key={index} style={styles.workflowItem}>
                                <View style={styles.priorityBadge}>
                                    <Text style={styles.priorityText}>{approver.Priority}</Text>
                                </View>
                                <View style={styles.workflowInfo}>
                                    <Text style={styles.approverName}>{approver.Approve_name}</Text>
                                    <Text style={styles.approverStatus}>{approver.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Missed Punch Requests</Text>
                    <Text style={styles.headerSubtitle}>
                        {requests.length} request{requests.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                >
                    <Feather
                        name="refresh-cw"
                        size={20}
                        color="#4A90FF"
                    />
                </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading && !isRefreshing && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4A90FF" />
                    <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={48} color="#FF5252" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchRequests()}
                    >
                        <Feather name="refresh-cw" size={16} color="#FFF" />
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Empty State */}
            {!isLoading && !error && requests.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Feather name="check-circle" size={64} color="#4CAF50" />
                    <Text style={styles.emptyTitle}>All Clear!</Text>
                    <Text style={styles.emptyText}>
                        No missed punch requests
                    </Text>
                </View>
            )}

            {/* Requests List */}
            {!isLoading && !error && requests.length > 0 && (
                <FlatList
                    data={requests}
                    renderItem={renderRequestCard}
                    keyExtractor={(item) => item.MissPunchReqMasterID.toString()}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#4A90FF']}
                            tintColor="#4A90FF"
                        />
                    }
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

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // List
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Request Card
    requestCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    idBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    idText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Employee Section
    employeeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    employeeInfo: {
        flex: 1,
    },
    employeeLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },

    // Info Row
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },

    // Reason Section
    reasonSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    reasonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    reasonLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    reasonText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },

    // Punch Type Section
    punchTypeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    punchTypeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    punchTypeInfo: {
        flex: 1,
    },
    punchTypeLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    punchTypeValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },

    // Workflow Section
    workflowSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    workflowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    workflowTitle: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    workflowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    priorityBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4A90FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    workflowInfo: {
        flex: 1,
    },
    approverName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    approverStatus: {
        fontSize: 11,
        color: '#666',
    },

    // States
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 15,
        color: '#FF5252',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
        fontWeight: '500',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4A90FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});

export default MissPunchList;
