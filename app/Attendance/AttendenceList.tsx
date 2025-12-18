import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock attendance data
const attendanceData = [
    {
        id: '1',
        date: '2025-12-17',
        day: '17',
        month: 'Dec',
        dayName: 'Tuesday',
        punchIn: '09:15 AM',
        punchOut: '06:30 PM',
        workingHours: '9h 15m',
        status: 'present',
    },
    {
        id: '2',
        date: '2025-12-16',
        day: '16',
        month: 'Dec',
        dayName: 'Monday',
        punchIn: '09:00 AM',
        punchOut: '06:00 PM',
        workingHours: '9h 00m',
        status: 'present',
    },
    {
        id: '3',
        date: '2025-12-15',
        day: '15',
        month: 'Dec',
        dayName: 'Sunday',
        punchIn: '-',
        punchOut: '-',
        workingHours: '-',
        status: 'weekend',
    },
    {
        id: '4',
        date: '2025-12-14',
        day: '14',
        month: 'Dec',
        dayName: 'Saturday',
        punchIn: '-',
        punchOut: '-',
        workingHours: '-',
        status: 'weekend',
    },
    {
        id: '5',
        date: '2025-12-13',
        day: '13',
        month: 'Dec',
        dayName: 'Friday',
        punchIn: '09:30 AM',
        punchOut: '06:45 PM',
        workingHours: '9h 15m',
        status: 'present',
    },
    {
        id: '6',
        date: '2025-12-12',
        day: '12',
        month: 'Dec',
        dayName: 'Thursday',
        punchIn: '09:10 AM',
        punchOut: '06:20 PM',
        workingHours: '9h 10m',
        status: 'present',
    },
    {
        id: '7',
        date: '2025-12-11',
        day: '11',
        month: 'Dec',
        dayName: 'Wednesday',
        punchIn: '-',
        punchOut: '-',
        workingHours: '-',
        status: 'absent',
    },
    {
        id: '8',
        date: '2025-12-10',
        day: '10',
        month: 'Dec',
        dayName: 'Tuesday',
        punchIn: '09:05 AM',
        punchOut: '06:15 PM',
        workingHours: '9h 10m',
        status: 'present',
    },
];

type FilterType = 'all' | 'today' | 'tomorrow' | 'calendar';

const AttendenceList = () => {
    const [startDate, setStartDate] = useState('2025-12-01');
    const [endDate, setEndDate] = useState('2025-12-17');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarType, setCalendarType] = useState<'start' | 'end'>('start');

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
                        <Text style={styles.timeValue}>{item.punchIn}</Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeItem}>
                        <Feather name="log-out" size={14} color="#666" />
                        <Text style={styles.timeLabel}>Punch Out</Text>
                        <Text style={styles.timeValue}>{item.punchOut}</Text>
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
                        <Text style={styles.recordCount}>{attendanceData.length} records</Text>
                    </View>

                    <FlatList
                        data={attendanceData}
                        renderItem={renderAttendanceItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    />
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
});

export default AttendenceList;