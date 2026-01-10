/**
 * Miss Punch Details Component
 * 
 * Displays detailed miss punch requests with workflow approval information
 * Uses the /getmissingpunchdetails/ API endpoint
 */

import { getMissingPunchDetails, MissPunchDetail, WorkflowApprover } from '@/lib/missPunchList';
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

const MissPunchDetails = () => {
    const [details, setDetails] = useState<MissPunchDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch miss punch details
    const fetchDetails = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            console.log('📋 Fetching miss punch details...');
            const response = await getMissingPunchDetails();

            if (response.status === 'Success') {
                setDetails(response.data || []);
                console.log('✅ Loaded', response.data?.length || 0, 'miss punch details');
            } else {
                setDetails([]);
            }
        } catch (err: any) {
            console.error('❌ Error fetching details:', err);
            setError(err.message || 'Failed to load miss punch details');
            setDetails([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch on mount and when screen gains focus
    useFocusEffect(
        useCallback(() => {
            fetchDetails();
        }, [])
    );

    // Handle pull to refresh
    const handleRefresh = () => {
        fetchDetails(true);
    };

    // Get status color based on approval status
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('approved') && !statusLower.includes('awaiting')) {
            return { text: '#4CAF50', bg: '#E8F5E9' };
        } else if (statusLower.includes('rejected')) {
            return { text: '#FF5252', bg: '#FFEBEE' };
        } else if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
            return { text: '#FF9800', bg: '#FFF3E0' };
        }
        return { text: '#999', bg: '#F5F5F5' };
    };

    // Get punch type label
    const getPunchTypeLabel = (punchType: string) => {
        return punchType === '1' ? 'Punch In' : 'Punch Out';
    };

    // Get punch type icon
    const getPunchTypeIcon = (punchType: string) => {
        return punchType === '1' ? 'log-in' : 'log-out';
    };

    // Render workflow item
    const renderWorkflowItem = (approver: WorkflowApprover, index: number) => {
        const statusColor = getStatusColor(approver.status);
        
        return (
            <View key={index} style={styles.workflowItem}>
                <View style={styles.workflowLeft}>
                    <View style={styles.priorityBadge}>
                        <Text style={styles.priorityText}>{approver.Priority}</Text>
                    </View>
                    <View style={styles.workflowInfo}>
                        <Text style={styles.approverName}>{approver.Approve_name}</Text>
                        <View style={[styles.workflowStatus, { backgroundColor: statusColor.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor.text }]} />
                            <Text style={[styles.workflowStatusText, { color: statusColor.text }]}>
                                {approver.status}
                            </Text>
                        </View>
                    </View>
                </View>
                <Feather 
                    name={approver.status.toLowerCase().includes('approved') && !approver.status.toLowerCase().includes('awaiting') ? 'check-circle' : 'clock'} 
                    size={20} 
                    color={statusColor.text} 
                />
            </View>
        );
    };

    // Render individual detail card
    const renderDetailCard = ({ item }: { item: MissPunchDetail }) => {
        const statusColor = getStatusColor(item.approval_status);
        const punchTypeLabel = getPunchTypeLabel(item.PunchType);
        const punchTypeIcon = getPunchTypeIcon(item.PunchType);
        
        return (
            <View style={styles.detailCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.idBadge}>
                        <Text style={styles.idText}>#{item.MissPunchReqMasterID}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor.text }]} />
                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                            {item.approval_status}
                        </Text>
                    </View>
                </View>

                {/* Punch Type */}
                <View style={styles.punchTypeSection}>
                    <View style={styles.punchTypeIcon}>
                        <Feather name={punchTypeIcon as any} size={20} color="#4A90FF" />
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
                        <Text style={styles.infoLabel}>Date & Time</Text>
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
                            <Feather name="users" size={16} color="#666" />
                            <Text style={styles.workflowTitle}>Approval Workflow</Text>
                        </View>
                        <View style={styles.workflowList}>
                            {item.workflow_list.map((approver, index) => 
                                renderWorkflowItem(approver, index)
                            )}
                        </View>
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
                    <Text style={styles.headerTitle}>Miss Punch Details</Text>
                    <Text style={styles.headerSubtitle}>
                        {details.length} request{details.length !== 1 ? 's' : ''}
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
                    <Text style={styles.loadingText}>Loading details...</Text>
                </View>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={48} color="#FF5252" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchDetails()}
                    >
                        <Feather name="refresh-cw" size={16} color="#FFF" />
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Empty State */}
            {!isLoading && !error && details.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Feather name="check-circle" size={64} color="#4CAF50" />
                    <Text style={styles.emptyTitle}>All Clear!</Text>
                    <Text style={styles.emptyText}>
                        No miss punch requests found
                    </Text>
                </View>
            )}

            {/* Details List */}
            {!isLoading && !error && details.length > 0 && (
                <FlatList
                    data={details}
                    renderItem={renderDetailCard}
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

    // Detail Card
    detailCard: {
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

    // Punch Type Section
    punchTypeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    punchTypeIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
        marginBottom: 16,
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

    // Workflow Section
    workflowSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    workflowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    workflowTitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    workflowList: {
        gap: 8,
    },
    workflowItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    workflowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    priorityBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4A90FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    workflowInfo: {
        flex: 1,
    },
    approverName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    workflowStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    workflowStatusText: {
        fontSize: 10,
        fontWeight: '600',
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

export default MissPunchDetails;
