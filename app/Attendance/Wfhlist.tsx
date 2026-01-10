import { getWFHList, WFHEmployee } from '@/lib/wfhList';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected';

type FilterType = 'all' | 'approved' | 'pending' | 'fullDay' | 'halfDay';

const Wfhlist = () => {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [employees, setEmployees] = useState<WFHEmployee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch WFH list from backend
    const fetchWFHList = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            console.log('📋 Fetching WFH employee list...');
            const response = await getWFHList();

            if (response.status === 'Success') {
                setEmployees(response.data || []);
                console.log('✅ Loaded', response.data?.length || 0, 'WFH employees');
            } else {
                setEmployees([]);
            }
        } catch (err: any) {
            console.error('❌ Error fetching WFH list:', err);
            setError(err.message || 'Failed to load WFH employee list');
            setEmployees([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch on mount and when screen gains focus
    useFocusEffect(
        useCallback(() => {
            fetchWFHList();
        }, [])
    );

    // Handle pull to refresh
    const handleRefresh = () => {
        fetchWFHList(true);
    };

    // Filter employees based on selected filter
    const filteredEmployees = employees.filter((employee) => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'approved') return employee.approvalStatus === 'Approved';
        if (selectedFilter === 'pending') return employee.approvalStatus === 'Pending';
        if (selectedFilter === 'fullDay') return !employee.isHalfDay;
        if (selectedFilter === 'halfDay') return employee.isHalfDay;
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

    const getStatusColor = (status: ApprovalStatus) => {
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

    const getStatusBgColor = (status: ApprovalStatus) => {
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

    const renderWFHEmployeeItem = ({ item }: { item: WFHEmployee }) => (
        <View style={styles.employeeCard}>
            {/* Header Section */}
            <View style={styles.employeeHeader}>
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
                        <Text style={styles.employeeId}>{item.employeeId} • {item.department}</Text>
                    </View>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBgColor(item.approvalStatus) },
                    ]}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(item.approvalStatus) }]}>
                        {item.approvalStatus}
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

            {/* Approval Info */}
            {item.approvalStatus === 'Approved' && item.approvedBy && (
                <View style={styles.approvalInfo}>
                    <Feather name="check-circle" size={14} color="#4CAF50" />
                    <Text style={styles.approvalText}>
                        Approved by {item.approvedBy}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Loading State */}
            {isLoading && !isRefreshing && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4A90FF" />
                    <Text style={styles.loadingText}>Loading WFH employees...</Text>
                </View>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={48} color="#FF5252" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={() => fetchWFHList()}>
                        <Feather name="refresh-cw" size={16} color="#FFF" />
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </Pressable>
                </View>
            )}

            {/* Content */}
            {!isLoading && !error && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#4A90FF']}
                            tintColor="#4A90FF"
                        />
                    }
                >
                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <Text style={styles.sectionTitle}>Filter</Text>
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
                                All
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'approved' && styles.filterChipActive,
                                selectedFilter === 'approved' && { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
                            ]}
                            onPress={() => setSelectedFilter('approved')}
                        >
                            <Feather
                                name="check-circle"
                                size={14}
                                color={selectedFilter === 'approved' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'approved' && styles.filterChipTextActive,
                                ]}
                            >
                                Approved
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'pending' && styles.filterChipActive,
                                selectedFilter === 'pending' && { backgroundColor: '#FF9800', borderColor: '#FF9800' },
                            ]}
                            onPress={() => setSelectedFilter('pending')}
                        >
                            <Feather
                                name="clock"
                                size={14}
                                color={selectedFilter === 'pending' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'pending' && styles.filterChipTextActive,
                                ]}
                            >
                                Pending
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
                                selectedFilter === 'halfDay' && { backgroundColor: '#9C27B0', borderColor: '#9C27B0' },
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

                {/* Employees List */}
                <View style={styles.employeesContainer}>
                    <View style={styles.employeesHeader}>
                        <Text style={styles.sectionTitle}>Employees on WFH</Text>
                        <Text style={styles.recordCount}>{filteredEmployees.length} employees</Text>
                    </View>

                    {filteredEmployees.length > 0 ? (
                        <FlatList
                            data={filteredEmployees}
                            renderItem={renderWFHEmployeeItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Feather name="home" size={48} color="#CCC" />
                            <Text style={styles.emptyStateText}>No employees on WFH</Text>
                            <Text style={styles.emptyStateSubtext}>
                                There are no employees working from home at the moment
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
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

    // Employees Container
    employeesContainer: {
        marginBottom: 20,
    },
    employeesHeader: {
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

    // Employee Card
    employeeCard: {
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

    // Employee Header
    employeeHeader: {
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

    // Approval Info
    approvalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    approvalText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
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

    // Loading & Error States
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
});

export default Wfhlist;