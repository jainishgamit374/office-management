import { getUpcomingLeaves } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LeaveDetail {
    id: number;
    name: string;
    leaveType: string;
    dates: string;
    startDate: string;
    endDate: string;
    duration: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

interface UpcomingLeavesProps {
    leaves?: LeaveDetail[];
    expandedLeave: number | null;
    onToggleExpand: (id: number | null) => void;
    onAnimatePress: (animKey: 'leave1' | 'leave2' | 'leave3', callback: () => void) => void;
    scaleAnims: {
        leave1: Animated.Value;
        leave2: Animated.Value;
        leave3: Animated.Value;
    };
    refreshKey?: number;
}

const UpcomingLeaves: React.FC<UpcomingLeavesProps> = ({
    expandedLeave,
    onToggleExpand,
    onAnimatePress,
    scaleAnims,
    refreshKey,
}) => {
    const [leaves, setLeaves] = useState<LeaveDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch leave applications from API
    const fetchLeaveApplications = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('📋 Fetching upcoming leaves from API...');

            const response = await getUpcomingLeaves();

            console.log('✅ API Response:', response);

            // Transform API data to component format
            const applications = response.data || [];
            const transformedData: LeaveDetail[] = applications
                .slice(0, 3)
                .map((item: any, index: number) => {
                    // Map approval status
                    let status: 'Pending' | 'Approved' | 'Rejected' = 'Pending';
                    const statusLower = item.approval_status?.toLowerCase() || '';
                    
                    if (statusLower.includes('reject')) {
                        status = 'Rejected';
                    } else if (statusLower.includes('approve') && !statusLower.includes('await')) {
                        status = 'Approved';
                    }

                    // Format dates with error handling (format: "DD-MM-YYYY")
                    const formatDate = (dateStr: string | null | undefined): string => {
                        if (!dateStr || typeof dateStr !== 'string') return '';
                        
                        try {
                            const parts = dateStr.trim().split('-');
                            if (parts.length !== 3) return dateStr;
                            
                            const [day, month, year] = parts;
                            const dayNum = parseInt(day);
                            const monthNum = parseInt(month);
                            const yearNum = parseInt(year);
                            
                            if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return dateStr;
                            if (monthNum < 1 || monthNum > 12) return dateStr;
                            if (dayNum < 1 || dayNum > 31) return dateStr;
                            
                            const date = new Date(yearNum, monthNum - 1, dayNum);
                            if (isNaN(date.getTime())) return dateStr;
                            
                            return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                        } catch (error) {
                            console.warn('Date formatting error:', error);
                            return dateStr || '';
                        }
                    };

                    // FIXED: Correct date order - start should be leave_application_date
                    const startDate = formatDate(item.leave_application_date);
                    const endDate = formatDate(item.leave_application_enddate);
                    
                    let dates = startDate;
                    if (startDate && endDate && startDate !== endDate) {
                        dates = `${startDate} - ${endDate}`;
                    } else if (!startDate && endDate) {
                        dates = endDate;
                    } else if (!startDate && !endDate) {
                        dates = 'Date not specified';
                    }

                    // FIXED: Handle negative total_days properly
                    const totalDays = item.total_days != null ? parseFloat(item.total_days) : null;
                    let duration = '1 day';
                    
                    if (totalDays !== null && !isNaN(totalDays)) {
                        const absDays = Math.abs(totalDays);
                        const roundedDays = Math.ceil(absDays);
                        const days = roundedDays > 0 ? roundedDays : 1;
                        duration = `${days} day${days > 1 ? 's' : ''}`;
                    } else if (item.leave_duration) {
                        duration = item.leave_duration;
                    }

                    return {
                        id: index + 1,
                        name: item.employee_name || 'Employee',
                        leaveType: item.leave_type || 'Leave',
                        dates: dates,
                        startDate: startDate,
                        endDate: endDate || startDate,
                        duration: duration,
                        reason: item.leave_type || 'Leave application',
                        status,
                    };
                })
                .filter(leave => leave.status === 'Approved'); // ✅ Only show approved leave requests

            setLeaves(transformedData);
            console.log('✅ Approved upcoming leaves loaded:', transformedData.length);
        } catch (err: any) {
            console.error('❌ Error fetching upcoming leaves:', err);
            setError(err.message || 'Failed to load upcoming leaves');
            setLeaves([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    // Fetch data on component mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchLeaveApplications();
        }, [fetchLeaveApplications, refreshKey])
    );

    // Show loading state
    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Upcoming Leaves</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4169E1" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        );
    }

    // Show error state
    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Upcoming Leaves</Text>
                <View style={styles.emptyContainer}>
                    <Feather name="alert-circle" size={32} color="#999" />
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            </View>
        );
    }

    // Show empty state
    if (leaves.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Upcoming Leaves</Text>
                <View style={styles.emptyContainer}>
                    <Feather name="calendar" size={32} color="#999" />
                    <Text style={styles.emptyText}>No upcoming leaves</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Upcoming Leaves</Text>

            {leaves.map((leave, index) => {
                const animKey = `leave${leave.id}` as 'leave1' | 'leave2' | 'leave3';
                const isExpanded = expandedLeave === leave.id;

                return (
                    <Animated.View 
                        key={leave.id} 
                        style={[
                            styles.leaveCard,
                            { transform: [{ scale: scaleAnims[animKey] || scaleAnims.leave1 }] }
                        ]}
                    >
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                onAnimatePress(animKey, () =>
                                    onToggleExpand(isExpanded ? null : leave.id)
                                )
                            }
                        >
                            {/* Main Card Content */}
                            <View style={styles.cardHeader}>
                                <View style={styles.leftSection}>
                                    <View style={styles.statusIndicator} />
                                    <View style={styles.textSection}>
                                        <Text style={styles.employeeName}>{leave.name}</Text>
                                        <Text style={styles.leaveType}>{leave.leaveType}</Text>
                                        <Text style={styles.dateRange}>
                                            {leave.startDate === leave.endDate 
                                                ? leave.startDate 
                                                : `${leave.startDate} → ${leave.endDate}`}
                                        </Text>
                                    </View>
                                </View>
                                <Feather
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="#94A3B8"
                                />
                            </View>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <View style={styles.expandedSection}>
                                    {/* Timeline */}
                                    <View style={styles.timelineContainer}>
                                        <View style={styles.timelineItem}>
                                            <View style={styles.timelineDot} />
                                            <View style={styles.timelineContent}>
                                                <Text style={styles.timelineLabel}>Start Date</Text>
                                                <Text style={styles.timelineValue}>{leave.startDate}</Text>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.timelineLine} />
                                        
                                        <View style={styles.timelineItem}>
                                            <View style={styles.timelineDot} />
                                            <View style={styles.timelineContent}>
                                                <Text style={styles.timelineLabel}>End Date</Text>
                                                <Text style={styles.timelineValue}>{leave.endDate}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Meta Info */}
                                    <View style={styles.metaRow}>
                                        <View style={styles.metaItem}>
                                            <Feather name="clock" size={14} color="#64748B" />
                                            <Text style={styles.metaText}>{leave.duration}</Text>
                                        </View>
                                        <View style={[
                                            styles.statusChip,
                                            leave.status === 'Approved' && styles.chipApproved,
                                            leave.status === 'Rejected' && styles.chipRejected,
                                            leave.status === 'Pending' && styles.chipPending,
                                        ]}>
                                            <Text style={[
                                                styles.chipText,
                                                leave.status === 'Approved' && styles.chipTextApproved,
                                                leave.status === 'Rejected' && styles.chipTextRejected,
                                                leave.status === 'Pending' && styles.chipTextPending,
                                            ]}>
                                                {leave.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Reason */}
                                    {leave.reason && (
                                        <View style={styles.reasonContainer}>
                                            <Text style={styles.reasonLabel}>Reason</Text>
                                            <Text style={styles.reasonText}>{leave.reason}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    leaveCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 12,
    },
    statusIndicator: {
        width: 3,
        height: 48,
        backgroundColor: '#6366F1',
        borderRadius: 2,
        marginTop: 2,
    },
    textSection: {
        flex: 1,
        gap: 3,
    },
    employeeName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 1,
    },
    leaveType: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    dateRange: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    expandedSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
    },
    timelineContainer: {
        marginBottom: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6366F1',
        marginTop: 6,
    },
    timelineLine: {
        width: 2,
        height: 20,
        backgroundColor: '#E2E8F0',
        marginLeft: 3,
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
    },
    timelineLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    timelineValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    statusChip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
    },
    chipApproved: { backgroundColor: '#DCFCE7' },
    chipRejected: { backgroundColor: '#FEE2E2' },
    chipPending: { backgroundColor: '#FEF3C7' },
    chipText: { 
        fontSize: 11, 
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    chipTextApproved: { color: '#15803D' },
    chipTextRejected: { color: '#B91C1C' },
    chipTextPending: { color: '#A16207' },
    reasonContainer: {
        gap: 6,
    },
    reasonLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    reasonText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 19,
    },
    
    // Loading & Empty States
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
    },
});

export default UpcomingLeaves;
