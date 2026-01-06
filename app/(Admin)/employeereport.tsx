// app/(Admin)/employeereport.tsx
import EmployeePerformanceCard from '@/components/Admin/EmployeePerformanceCard';
import PerformanceStatsHeader from '@/components/Admin/PerformanceStatsHeader';
import { getEmployeePerformance, PerformanceMetric } from '@/lib/adminApi';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EmployeeReport: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'completion' | 'name'>('score');

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                const data = await getEmployeePerformance();
                if (isMounted) {
                    setPerformanceData(data);
                }
            } catch (error) {
                console.error('Failed to load performance data:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const loadPerformanceData = useCallback(async () => {
        try {
            const data = await getEmployeePerformance();
            setPerformanceData(data);
        } catch (error) {
            console.error('Failed to load performance data:', error);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPerformanceData();
        setRefreshing(false);
    }, [loadPerformanceData]);

    const filteredData = useMemo(() => {
        let filtered = [...performanceData];

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.designation?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'score':
                    return b.performance_score - a.performance_score;
                case 'completion':
                    return b.completion_rate - a.completion_rate;
                case 'name':
                    return a.employee_name.localeCompare(b.employee_name);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [performanceData, searchQuery, sortBy]);

    const renderSortButton = (label: string, value: 'score' | 'completion' | 'name', icon: string) => (
        <TouchableOpacity
            style={[styles.sortButton, sortBy === value && styles.sortButtonActive]}
            onPress={() => setSortBy(value)}
            activeOpacity={0.7}
            accessibilityRole="button"
        >
            <Feather
                name={icon as any}
                size={14}
                color={sortBy === value ? '#FFFFFF' : '#666'}
            />
            <Text style={[styles.sortButtonText, sortBy === value && styles.sortButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color="#4A90FF"
                        accessibilityLabel="Loading performance data"
                    />
                    <Text style={styles.loadingText}>Loading performance data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Feather name="arrow-left" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <View style={styles.headerIconContainer}>
                        <Feather name="trending-up" size={24} color="#4A90FF" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Performance Reports</Text>
                        <Text style={styles.headerSubtitle}>Team analytics & insights</Text>
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.employee_id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A90FF"
                        colors={['#4A90FF']}
                    />
                }
                ListHeaderComponent={
                    <>
                        <PerformanceStatsHeader performanceData={performanceData} />

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <Feather name="search" size={18} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search employees or departments..."
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Feather name="x-circle" size={18} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Sort Buttons */}
                        <View style={styles.sortContainer}>
                            <View style={styles.sortHeader}>
                                <Feather name="sliders" size={16} color="#666" />
                                <Text style={styles.sortLabel}>Sort by</Text>
                            </View>
                            <View style={styles.sortButtons}>
                                {renderSortButton('Score', 'score', 'award')}
                                {renderSortButton('Completion', 'completion', 'check-circle')}
                                {renderSortButton('Name', 'name', 'user')}
                            </View>
                        </View>

                        <View style={styles.sectionTitleContainer}>
                            <Feather name="users" size={18} color="#4A90FF" />
                            <Text style={styles.sectionTitle}>
                                Team Performance ({filteredData.length})
                            </Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <EmployeePerformanceCard performance={item} />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="user-x" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No employees found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your search</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default EmployeeReport;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginLeft: 12,
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    headerRight: {
        width: 40,
    },

    // Content
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1a1a1a',
        fontWeight: '400',
    },

    // Sort
    sortContainer: {
        marginBottom: 24,
    },
    sortHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sortLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
        letterSpacing: 0.2,
    },
    sortButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    sortButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sortButtonActive: {
        backgroundColor: '#4A90FF',
        borderColor: '#4A90FF',
    },
    sortButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    sortButtonTextActive: {
        color: '#FFFFFF',
    },

    // Section Title
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.2,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 6,
    },
});
