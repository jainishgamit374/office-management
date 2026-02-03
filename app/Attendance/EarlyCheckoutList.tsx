import { EarlyCheckoutRequest, getEarlyCheckoutList } from '@/lib/earlyCheckoutList';
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

const EarlyCheckoutList = () => {
    const [requests, setRequests] = useState<EarlyCheckoutRequest[]>([]);
    const [totalPending, setTotalPending] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch early checkout requests
    const fetchRequests = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            console.log('📋 Fetching early checkout requests...');
            const response = await getEarlyCheckoutList();

            if (response.status === 'Success') {
                setRequests(response.approval_requests || []);
                setTotalPending(response.total_pending_approvals || 0);
                console.log('✅ Loaded', response.approval_requests?.length || 0, 'requests');
            } else {
                setRequests([]);
                setTotalPending(0);
            }
        } catch (err: any) {
            console.error('❌ Error fetching requests:', err);
            setError(err.message || 'Failed to load early checkout requests');
            setRequests([]);
            setTotalPending(0);
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

    // Format date/time for display
    const formatDateTime = (dateTimeStr: string) => {
        // The API returns format like "10-01-26 12:00 PM"
        // We'll display it as is, but you can parse and reformat if needed
        return dateTimeStr;
    };

    // Render individual request card
    const renderRequestCard = ({ item }: { item: EarlyCheckoutRequest }) => (
        <View style={styles.requestCard}>
            {/* Header with ID */}
            <View style={styles.cardHeader}>
                <View style={styles.idBadge}>
                    <Text style={styles.idText}>#{item.EarlyCheckoutReqMasterID || item.TranID}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Pending</Text>
                </View>
            </View>

            {/* Employee Info */}
            <View style={styles.employeeSection}>
                <View style={styles.avatarContainer}>
                    <Feather name="user" size={20} color="#4A90FF" />
                </View>
                <View style={styles.employeeInfo}>
                    <Text style={styles.employeeLabel}>Employee</Text>
                    <Text style={styles.employeeName}>{item.EmployeeName}</Text>
                </View>
            </View>

            {/* Date & Time */}
            <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                    <Feather name="calendar" size={16} color="#666" />
                </View>
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Requested Date & Time</Text>
                    <Text style={styles.infoValue}>{formatDateTime(item.DateTime)}</Text>
                </View>
            </View>

            {/* Reason */}
            <View style={styles.reasonSection}>
                <View style={styles.reasonHeader}>
                    <Feather name="message-circle" size={16} color="#666" />
                    <Text style={styles.reasonLabel}>Reason</Text>
                </View>
                <Text style={styles.reasonText}>{item.Reason}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Early Checkout Requests</Text>
                    <Text style={styles.headerSubtitle}>
                        {totalPending} pending approval{totalPending !== 1 ? 's' : ''}
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
                        style={isRefreshing ? styles.rotating : undefined}
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
                        No pending early checkout requests
                    </Text>
                </View>
            )}

            {/* Requests List */}
            {!isLoading && !error && requests.length > 0 && (
                <FlatList
                    data={requests}
                    renderItem={renderRequestCard}
                    keyExtractor={(item, index) => (item.EarlyCheckoutReqMasterID || item.TranID || index).toString()}
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
    rotating: {
        // Animation would be added via Animated API if needed
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
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF9800',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FF9800',
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

export default EarlyCheckoutList;
