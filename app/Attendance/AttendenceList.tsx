import type { TransformedAttendanceRecord } from '@/lib/employeeAttendance';
import { getEmployeeAttendance } from '@/lib/employeeAttendance';
import { formatISTTime } from '@/lib/timezone';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'all' | 'today' | 'tomorrow' | 'calendar';

const AttendenceList = () => {
    const [startDate, setStartDate] = useState('2025-12-01');
    const [endDate, setEndDate] = useState('2025-12-31');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarType, setCalendarType] = useState<'start' | 'end'>('start');

    // API state
    const [attendanceData, setAttendanceData] = useState<TransformedAttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalCount: 0,
        presentDays: 0,
        absentDays: 0,
        totalHours: '0h 0m',
    });

    // Fetch attendance data from API
    const fetchAttendanceData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('📅 Fetching attendance from API...');
            const response = await getEmployeeAttendance(startDate, endDate);

            console.log('📊 Full API Response:', JSON.stringify(response, null, 2));

            if (response.success && response.data) {
                console.log('📊 Records from API:', response.data.records?.length || 0);

                setAttendanceData(response.data.records || []);
                setStats({
                    totalCount: response.data.total_count || 0,
                    presentDays: response.data.present_days || 0,
                    absentDays: response.data.absent_days || 0,
                    totalHours: response.data.total_hours || '0h 0m',
                });
                console.log('✅ Attendance data loaded:', response.data.records.length, 'records');
            } else {
                setAttendanceData([]);
                setStats({
                    totalCount: 0,
                    presentDays: 0,
                    absentDays: 0,
                    totalHours: '0h 0m',
                });
            }
        } catch (err: any) {
            console.error('❌ Error fetching attendance:', err);
            setError(err.message || 'Failed to load attendance data');
            setAttendanceData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data on mount and when date range changes
    useEffect(() => {
        fetchAttendanceData();
    }, [startDate, endDate]);

    const handleFilterPress = (filter: FilterType) => {
        setSelectedFilter(filter);
        if (filter === 'calendar') {
            setShowCalendar(true);
        } else if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setEndDate(today);
        } else if (filter === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            setStartDate(tomorrowStr);
            setEndDate(tomorrowStr);
        } else if (filter === 'all') {
            // Set to current month
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setStartDate(firstDay.toISOString().split('T')[0]);
            setEndDate(lastDay.toISOString().split('T')[0]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return '#4CAF50';
            case 'absent':
                return '#FF5252';
            case 'weekend':
                return '#9E9E9E';
            default:
                return '#666';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'present':
                return '#E8F5E9';
            case 'absent':
                return '#FFEBEE';
            case 'weekend':
                return '#F5F5F5';
            default:
                return '#F0F0F0';
        }
    };

    const renderAttendanceItem = ({ item }: { item: typeof attendanceData[0] }) => (
        <View style={styles.attendanceCard}>
            {/* Date Section */}
            <View style={styles.dateSection}>
                <Text style={styles.day}>{item.day}</Text>
                <Text style={styles.month}>{item.month}</Text>
                <View
                    style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(item.status) },
                    ]}
                />
            </View>

            {/* Details Section */}
            <View style={styles.detailsSection}>
                <View style={styles.detailsHeader}>
                    <Text style={styles.dayName}>{item.dayName}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusBgColor(item.status) },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                { color: getStatusColor(item.status) },
                            ]}
                        >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                {/* Time Details */}
                <View style={styles.timeContainer}>
                    <View style={styles.timeItem}>
                        <Feather name="log-in" size={14} color="#666" />
                        <Text style={styles.timeLabel}>Punch In</Text>
                        <Text style={styles.timeValue}>
                            {item.punchIn && item.punchIn !== '--' && (item.punchIn.includes('T') || item.punchIn.includes('Z'))
                                ? formatISTTime(item.punchIn)
                                : item.punchIn}
                        </Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeItem}>
                        <Feather name="log-out" size={14} color="#666" />
                        <Text style={styles.timeLabel}>Punch Out</Text>
                        <Text style={styles.timeValue}>
                            {item.punchOut && item.punchOut !== '--' && (item.punchOut.includes('T') || item.punchOut.includes('Z'))
                                ? formatISTTime(item.punchOut)
                                : item.punchOut}
                        </Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeItem}>
                        <Feather name="clock" size={14} color="#4A90FF" />
                        <Text style={styles.timeLabel}>Working</Text>
                        <Text style={[styles.timeValue, { color: '#4A90FF', fontWeight: '600' }]}>
                            {item.workingHours}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Date Range Filter */}
                <View style={styles.dateRangeContainer}>
                    <Text style={styles.sectionTitle}>Date Range</Text>
                    <View style={styles.dateRangeRow}>
                        {/* Start Date */}
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => {
                                setCalendarType('start');
                                setShowCalendar(true);
                            }}
                        >
                            <View style={styles.dateIconContainer}>
                                <Feather name="calendar" size={20} color="#4A90FF" />
                            </View>
                            <View style={styles.dateTextContainer}>
                                <Text style={styles.dateLabel}>Start Date</Text>
                                <Text style={styles.dateValue}>
                                    {new Date(startDate).toLocaleDateString('en-US', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Separator */}
                        <View style={styles.dateSeparator}>
                            <Feather name="arrow-right" size={20} color="#999" />
                        </View>

                        {/* End Date */}
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => {
                                setCalendarType('end');
                                setShowCalendar(true);
                            }}
                        >
                            <View style={styles.dateIconContainer}>
                                <Feather name="calendar" size={20} color="#4A90FF" />
                            </View>
                            <View style={styles.dateTextContainer}>
                                <Text style={styles.dateLabel}>End Date</Text>
                                <Text style={styles.dateValue}>
                                    {new Date(endDate).toLocaleDateString('en-US', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Filter */}
                <View style={styles.filterContainer}>
                    <Text style={styles.sectionTitle}>Quick Filters</Text>
                    <View style={styles.filterRow}>
                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'all' && styles.filterChipActive,
                            ]}
                            onPress={() => handleFilterPress('all')}
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
                                selectedFilter === 'today' && styles.filterChipActive,
                            ]}
                            onPress={() => handleFilterPress('today')}
                        >
                            <Feather
                                name="sun"
                                size={14}
                                color={selectedFilter === 'today' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'today' && styles.filterChipTextActive,
                                ]}
                            >
                                Today
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'tomorrow' && styles.filterChipActive,
                            ]}
                            onPress={() => handleFilterPress('tomorrow')}
                        >
                            <Feather
                                name="sunrise"
                                size={14}
                                color={selectedFilter === 'tomorrow' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'tomorrow' && styles.filterChipTextActive,
                                ]}
                            >
                                Tomorrow
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.filterChip,
                                selectedFilter === 'calendar' && styles.filterChipActive,
                            ]}
                            onPress={() => handleFilterPress('calendar')}
                        >
                            <Feather
                                name="calendar"
                                size={14}
                                color={selectedFilter === 'calendar' ? '#FFF' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === 'calendar' && styles.filterChipTextActive,
                                ]}
                            >
                                Choose
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Attendance History */}
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionTitle}>Attendance History</Text>
                        <Text style={styles.recordCount}>{stats.totalCount} records</Text>
                    </View>

                    {/* Loading State */}
                    {isLoading && (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#4A90FF" />
                            <Text style={styles.loadingText}>Loading attendance data...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {!isLoading && error && (
                        <View style={styles.errorContainer}>
                            <Feather name="alert-circle" size={48} color="#FF5252" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={fetchAttendanceData}
                            >
                                <Feather name="refresh-cw" size={16} color="#FFF" />
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && attendanceData.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Feather name="calendar" size={48} color="#999" />
                            <Text style={styles.emptyText}>No attendance records found</Text>
                            <Text style={styles.emptySubtext}>
                                Try selecting a different date range
                            </Text>
                        </View>
                    )}

                    {/* Data List */}
                    {!isLoading && !error && attendanceData.length > 0 && (
                        <FlatList
                            data={attendanceData}
                            renderItem={renderAttendanceItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Calendar Modal (Placeholder) */}
            <Modal
                visible={showCalendar}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Select {calendarType === 'start' ? 'Start' : 'End'} Date
                            </Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.calendarPlaceholder}>
                            <Feather name="calendar" size={48} color="#4A90FF" />
                            <Text style={styles.placeholderText}>
                                Calendar picker will be implemented here
                            </Text>
                            <Text style={styles.placeholderSubtext}>
                                Available from version 1.0.0
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowCalendar(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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

    // Date Range Filter
    dateRangeContainer: {
        marginBottom: 20,
    },
    dateRangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateTextContainer: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    dateSeparator: {
        width: 24,
        alignItems: 'center',
    },

    // Filter Chips
    filterContainer: {
        marginBottom: 20,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterChipActive: {
        backgroundColor: '#4A90FF',
        borderColor: '#4A90FF',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    filterChipTextActive: {
        color: '#FFF',
    },

    // Attendance History
    historyContainer: {
        marginBottom: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recordCount: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 16,
    },

    // Attendance Card
    attendanceCard: {
        flexDirection: 'row',
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
    dateSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
        minWidth: 60,
    },
    day: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        lineHeight: 32,
        width: '90%',
        textAlign: 'center',
    },
    month: {
        fontSize: 12,
        width: '90%',
        textAlign: 'center',
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 4,
    },

    // Details Section
    detailsSection: {
        flex: 1,
        paddingLeft: 16,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,

    },
    dayName: {
        fontSize: 16,
        width: '40%',
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Time Container
    timeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    timeItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    timeLabel: {
        fontSize: 10,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    timeValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginTop: 2,
    },
    timeDivider: {
        width: 1,
        backgroundColor: '#F0F0F0',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    calendarPlaceholder: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    placeholderText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    placeholderSubtext: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    modalButton: {
        backgroundColor: '#4A90FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    modalButtonText: {
        fontSize: 15,
        textTransform: 'uppercase',
        width: '50%',
        textAlign: 'center',
        fontWeight: '600',
        color: '#FFF',
    },

    // Loading, Error, and Empty States
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    errorText: {
        fontSize: 15,
        color: '#FF5252',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontWeight: '500',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4A90FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginTop: 8,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
});

export default AttendenceList;