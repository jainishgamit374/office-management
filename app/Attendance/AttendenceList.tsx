import { getIsAwayApprovalHistory, getMissPunchDetails as getMissingPunchDetails, getMissingPunchOut } from '@/lib/api';
import { getEarlyCheckoutCount, getLateCheckinCount } from '@/lib/earlyLatePunch';
import type { TransformedAttendanceRecord } from '@/lib/employeeAttendance';
import { getEmployeeAttendance } from '@/lib/employeeAttendance';
import { formatISTTime } from '@/lib/timezone';
import { getWFHApprovalHistory } from '@/lib/wfhApprovalHistory';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
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
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(lastDay.toISOString().split('T')[0]);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarType, setCalendarType] = useState<'start' | 'end'>('start');
    const [tempDate, setTempDate] = useState(new Date());

    // API state
    const [attendanceData, setAttendanceData] = useState<TransformedAttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalCount: 0,
        presentDays: 0,
        absentDays: 0,
        totalHours: '0h 0m',
    });

    // Statistics state
    const [statistics, setStatistics] = useState({
        lateCheckIns: 0,
        earlyCheckouts: 0,
        missingPunchOuts: 0,
        wfhDays: 0,
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Enhanced data state
    const [wfhDates, setWfhDates] = useState<Set<string>>(new Set());
    const [isAwayDates, setIsAwayDates] = useState<Set<string>>(new Set());
    const [missingPunchOutDates, setMissingPunchOutDates] = useState<Set<string>>(new Set());
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [showPendingSection, setShowPendingSection] = useState(false);

    // Fetch attendance data from API
    const fetchAttendanceData = useCallback(async () => {
        try {
            console.log('🔄 Starting fetch...');
            setIsLoading(true);
            setError(null);

            console.log('📅 Date range:', startDate, 'to', endDate);
            
            const response = await getEmployeeAttendance(startDate, endDate);

            console.log('📊 API Response Success:', response.success);
            console.log('📊 Has Data:', !!response.data);

            if (response.success && response.data && response.data.records) {
                const records = response.data.records;
                console.log('✅ Setting', records.length, 'records to state');
                
                // Force state update
                setAttendanceData([...records]);
                setStats({
                    totalCount: response.data.total_count || records.length,
                    presentDays: response.data.present_days || 0,
                    absentDays: response.data.absent_days || 0,
                    totalHours: response.data.total_hours || '0h 0m',
                });
                
                console.log('✅ State updated successfully');
            } else {
                console.warn('⚠️ No data in response');
                setAttendanceData([]);
                setStats({
                    totalCount: 0,
                    presentDays: 0,
                    absentDays: 0,
                    totalHours: '0h 0m',
                });
            }
        } catch (err: any) {
            console.error('❌ Fetch error:', err.message);
            setError(err.message || 'Failed to load attendance data');
            setAttendanceData([]);
        } finally {
            setIsLoading(false);
            console.log('🏁 Fetch complete');
        }
    }, [startDate, endDate]);

    // Fetch statistics data
    const fetchStatistics = useCallback(async () => {
        try {
            setIsLoadingStats(true);
            console.log('📊 Fetching statistics...');

            const now = new Date();
            const month = (now.getMonth() + 1).toString();
            const year = now.getFullYear().toString();

            // Fetch all statistics in parallel
            const [lateCountRes, earlyCountRes, missingPunchOutRes, wfhHistoryRes] = await Promise.all([
                getLateCheckinCount(month, year).catch(() => ({ data: { late_checkin_count: 0 } })),
                getEarlyCheckoutCount(month, year).catch(() => ({ data: { early_checkout_count: 0 } })),
                getMissingPunchOut().catch(() => ({ data: [] })),
                getWFHApprovalHistory().catch(() => ({ approval_requests: [] })),
            ]);

            setStatistics({
                lateCheckIns: lateCountRes.data?.late_checkin_count || 0,
                earlyCheckouts: earlyCountRes.data?.early_checkout_count || 0,
                missingPunchOuts: Array.isArray(missingPunchOutRes.data) ? missingPunchOutRes.data.length : 0,
                wfhDays: wfhHistoryRes.approval_requests ? wfhHistoryRes.approval_requests.length : 0,
            });

            console.log('✅ Statistics loaded');
        } catch (error) {
            console.error('❌ Failed to fetch statistics:', error);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    // Fetch enhanced data (WFH, IsAway, Missing Punch-outs, Pending Requests)
    const fetchEnhancedData = useCallback(async () => {
        try {
            console.log('🔍 Fetching enhanced data...');

            const [wfhRes, isAwayRes, missingPunchOutRes, pendingReqRes] = await Promise.all([
                getWFHApprovalHistory().catch(() => ({ approval_requests: [] })),
                getIsAwayApprovalHistory().catch(() => ({ approval_requests: [] })),
                getMissingPunchOut().catch(() => ({ data: [] })),
                getMissingPunchDetails().catch(() => ({ data: [] })),
            ]);

            // Create date sets for quick lookup
            const wfhDateSet = new Set<string>();
            if (wfhRes.approval_requests) {
                wfhRes.approval_requests.forEach((item: any) => {
                    if (item.DateTime) wfhDateSet.add(item.DateTime.split('T')[0]);
                });
            }

            const isAwayDateSet = new Set<string>();
            if (Array.isArray(isAwayRes.approval_requests)) {
                isAwayRes.approval_requests.forEach((item: any) => {
                    if (item.DateTime) isAwayDateSet.add(item.DateTime.split('T')[0].split(' ')[0]);
                });
            }

            const missingPunchOutDateSet = new Set<string>();
            if (Array.isArray(missingPunchOutRes.data)) {
                missingPunchOutRes.data.forEach((item: any) => {
                    if (item.missing_date) missingPunchOutDateSet.add(item.missing_date);
                });
            }

            setWfhDates(wfhDateSet);
            setIsAwayDates(isAwayDateSet);
            setMissingPunchOutDates(missingPunchOutDateSet);
            setPendingRequests(Array.isArray(pendingReqRes.data) ? pendingReqRes.data : []);

            console.log('✅ Enhanced data loaded:', {
                wfh: wfhDateSet.size,
                isAway: isAwayDateSet.size,
                missingPunchOuts: missingPunchOutDateSet.size,
                pending: Array.isArray(pendingReqRes.data) ? pendingReqRes.data.length : 0,
            });
        } catch (error) {
            console.error('❌ Failed to fetch enhanced data:', error);
        }
    }, []);

    // Fetch data on mount and when date range changes
    useEffect(() => {
        console.log('🎯 useEffect triggered');
        fetchAttendanceData();
    }, [fetchAttendanceData]);

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

    // Handle calendar date change
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowCalendar(false);
        }
        
        if (selectedDate) {
            setTempDate(selectedDate);
            if (Platform.OS === 'android') {
                // On Android, apply immediately
                applyDateSelection(selectedDate);
            }
        }
    };

    // Apply selected date
    const applyDateSelection = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        if (calendarType === 'start') {
            setStartDate(dateStr);
        } else {
            setEndDate(dateStr);
        }
        setShowCalendar(false);
    };

    // Open calendar with current date
    const openCalendar = (type: 'start' | 'end') => {
        setCalendarType(type);
        const currentDate = type === 'start' ? new Date(startDate) : new Date(endDate);
        setTempDate(currentDate);
        setShowCalendar(true);
    };

    // Get working hours color based on duration
    const getWorkingHoursColor = (hours: string) => {
        if (hours === '--') return '#999';
        
        // Parse hours (format: "08:30:00" or "8h 30m")
        let totalHours = 0;
        if (hours.includes(':')) {
            const parts = hours.split(':');
            totalHours = parseInt(parts[0]) + (parseInt(parts[1]) / 60);
        } else if (hours.includes('h')) {
            const match = hours.match(/(\d+)h/);
            totalHours = match ? parseInt(match[1]) : 0;
        }

        if (totalHours >= 8) return '#4CAF50'; // Green - full day
        if (totalHours >= 4) return '#FF9800'; // Orange - partial day
        return '#FF5252'; // Red - less than 4 hours
    };

    // Format working hours for display
    const formatWorkingHours = (hours: string) => {
        if (hours === '--') return '--';
        
        // If already in "Xh Ym" format, return as is
        if (hours.includes('h')) return hours;
        
        // Convert "08:30:00" to "8h 30m"
        const parts = hours.split(':');
        if (parts.length >= 2) {
            const h = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            return `${h}h ${m}m`;
        }
        
        return hours;
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
                {/* Header Row with Employee Name and Status */}
                <View style={styles.cardHeaderRow}>
                    <View style={styles.employeeInfo}>
                        <Feather name="user" size={12} color="#4A90FF" />
                        <Text style={styles.employeeName} numberOfLines={1}>{item.employeeName}</Text>
                    </View>
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

                {/* Day Name and Badges Row */}
                <View style={styles.dayBadgesRow}>
                    <Text style={styles.dayName}>{item.dayName}</Text>
                    {(item.isLateCheckIn || item.isEarlyCheckOut) && (
                        <View style={styles.alertBadges}>
                            {item.isLateCheckIn && (
                                <View style={styles.lateBadge}>
                                    <Feather name="clock" size={8} color="#FF5252" />
                                    <Text style={styles.lateText}>Late</Text>
                                </View>
                            )}
                            {item.isEarlyCheckOut && (
                                <View style={styles.earlyBadge}>
                                    <Feather name="log-out" size={8} color="#FF9800" />
                                    <Text style={styles.earlyText}>Early</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Time Details */}
                <View style={styles.timeContainer}>
                    <View style={styles.timeItem}>
                        <View style={styles.timeIconLabel}>
                            <Feather name="log-in" size={12} color="#10B981" />
                            <Text style={styles.timeLabel}>In</Text>
                        </View>
                        <Text style={styles.timeValue}>
                            {item.punchIn && item.punchIn !== '--' && (item.punchIn.includes('T') || item.punchIn.includes('Z'))
                                ? formatISTTime(item.punchIn)
                                : item.punchIn}
                        </Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeItem}>
                        <View style={styles.timeIconLabel}>
                            <Feather name="log-out" size={12} color="#EF4444" />
                            <Text style={styles.timeLabel}>Out</Text>
                        </View>
                        <Text style={styles.timeValue}>
                            {item.punchOut && item.punchOut !== '--' && (item.punchOut.includes('T') || item.punchOut.includes('Z'))
                                ? formatISTTime(item.punchOut)
                                : item.punchOut}
                        </Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeItem}>
                        <View style={styles.timeIconLabel}>
                            <Feather name="clock" size={12} color={getWorkingHoursColor(item.workingHours)} />
                            <Text style={styles.timeLabel}>Hours</Text>
                        </View>
                        <Text style={[styles.timeValue, { color: getWorkingHoursColor(item.workingHours), fontWeight: '700' }]}>
                            {formatWorkingHours(item.workingHours)}
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

                    {/* Debug Panel - Remove after fixing */}
                    {__DEV__ && (
                        <View style={{ padding: 12, backgroundColor: '#FFF3CD', marginBottom: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FFC107' }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#856404', marginBottom: 8 }}>
                                🐛 DEBUG INFO
                            </Text>
                            <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                                • Loading: {isLoading ? 'YES' : 'NO'}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                                • Error: {error || 'NONE'}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                                • Records in state: {attendanceData.length}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                                • Date Range: {startDate} to {endDate}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#856404' }}>
                                • Will show list: {(!isLoading && !error && attendanceData.length > 0) ? 'YES' : 'NO'}
                            </Text>
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
                        <View style={styles.listContent}>
                            {attendanceData.map((item, index) => (
                                <View key={item.id || `attendance-${index}`}>
                                    {renderAttendanceItem({ item })}
                                    {index < attendanceData.length - 1 && <View style={{ height: 12 }} />}
                                </View>
                            ))}
                        </View>
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

                        <View style={styles.calendarContainer}>
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={tempDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={handleDateChange}
                                style={styles.datePicker}
                                themeVariant="light"
                                accentColor="#4A90FF"
                                textColor="#000000"
                            />
                        </View>

                        {Platform.OS === 'ios' && (
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => applyDateSelection(tempDate)}
                            >
                                <Text style={styles.modalButtonText}>Confirm Date</Text>
                            </TouchableOpacity>
                        )}
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
        paddingLeft: 14,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    employeeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    dayBadgesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dayName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    alertBadges: {
        flexDirection: 'row',
        gap: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    // Time Container
    timeContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 10,
        gap: 8,
    },
    timeItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    timeIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    timeLabel: {
        fontSize: 9,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    timeValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1F2937',
    },
    timeDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
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
    calendarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    datePicker: {
        width: Platform.OS === 'ios' ? '100%' : undefined,
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
    
    // Employee Name
    employeeName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4A90FF',
        flex: 1,
    },
    
    // Late Badge
    lateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: '#FEE2E2',
    },
    lateText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#DC2626',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    
    // Early Badge
    earlyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: '#FEF3C7',
    },
    earlyText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#D97706',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
});

export default AttendenceList;