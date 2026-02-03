import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
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
    const { colors } = useTheme();
    const styles = createStyles(colors);
    
    const [leaves, setLeaves] = useState<LeaveDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch leave applications from API
    const fetchLeaveApplications = useCallback(async () => {
        try {
            setIsLoading(true);

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

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    Upcoming Leaves {leaves.length > 0 && `(${leaves.length})`}
                </Text>
                <Feather 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.primary} 
                />
            </TouchableOpacity>

            {isExpanded && (
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : leaves.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="calendar" size={32} color={colors.textTertiary} />
                        <Text style={styles.emptyText}>No upcoming leaves</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {leaves.map((leave, index) => (
                            <View key={leave.id || index} style={styles.card}>
                                <View style={styles.iconContainer}>
                                    <Feather name="calendar" size={24} color={colors.success} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{leave.name}</Text>
                                    <View style={styles.detailsRow}>
                                        <Feather name="briefcase" size={14} color={colors.textSecondary} />
                                        <Text style={styles.detailText}>{leave.leaveType}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Feather name="calendar" size={14} color={colors.textSecondary} />
                                        <Text style={styles.detailText}>{leave.dates}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Feather name="clock" size={14} color={colors.textSecondary} />
                                        <Text style={styles.detailText}>{leave.duration}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'left',
    },
    grid: {
        flexDirection: 'column',
        gap: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    cardContent: {
        flex: 1,
        gap: 6,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default UpcomingLeaves;
