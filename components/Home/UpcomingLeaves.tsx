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
}

const UpcomingLeaves: React.FC<UpcomingLeavesProps> = ({
    expandedLeave,
    onToggleExpand,
    onAnimatePress,
    scaleAnims,
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
            const transformedData: LeaveDetail[] = applications.slice(0, 3).map((item: any, index: number) => {
                // Map approval status
                let status: 'Pending' | 'Approved' | 'Rejected' = 'Pending';
                if (item.approval_status?.toLowerCase().includes('approve')) {
                    status = 'Approved';
                } else if (item.approval_status?.toLowerCase().includes('reject')) {
                    status = 'Rejected';
                }

                // Format dates (format: "DD-MM-YYYY")
                const formatDate = (dateStr: string) => {
                    if (!dateStr) return '';
                    const [day, month, year] = dateStr.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                };

                const startDate = formatDate(item.leave_application_enddate); // Note: Using enddate as start based on API
                const endDate = formatDate(item.leave_application_date);
                const dates = startDate === endDate ? startDate : `${startDate} - ${endDate}`;

                return {
                    id: index + 1,
                    name: item.employee_name || 'Employee',
                    leaveType: item.leave_type || 'Leave',
                    dates: dates,
                    duration: item.total_days ? `${Math.abs(item.total_days)} day${Math.abs(item.total_days) > 1 ? 's' : ''}` : '1 day',
                    reason: item.leave_duration || 'No reason provided',
                    status,
                };
            });

            setLeaves(transformedData);
            console.log('✅ Transformed upcoming leaves:', transformedData);
        } catch (err: any) {
            console.error('❌ Error fetching upcoming leaves:', err);
            setError(err.message || 'Failed to load upcoming leaves');
            setLeaves([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on component mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchLeaveApplications();
        }, [fetchLeaveApplications])
    );

    // Show loading state
    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Upcoming Leaves</Text>
                </View>
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
                <View style={styles.header}>
                    <Text style={styles.title}>Upcoming Leaves</Text>
                </View>
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
                <View style={styles.header}>
                    <Text style={styles.title}>Upcoming Leaves</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Feather name="calendar" size={32} color="#999" />
                    <Text style={styles.emptyText}>No upcoming leaves</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Upcoming Leaves</Text>
            </View>

            <View style={styles.grid}>
                {leaves.map((leave, index) => {
                    const animKey = `leave${leave.id}` as 'leave1' | 'leave2' | 'leave3';

                    return (
                        <View key={leave.id} style={styles.expandableCard}>
                            <Animated.View style={{ transform: [{ scale: scaleAnims[animKey] || scaleAnims.leave1 }] }}>
                                <TouchableOpacity
                                    style={styles.card}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        onAnimatePress(animKey, () =>
                                            onToggleExpand(expandedLeave === leave.id ? null : leave.id)
                                        )
                                    }
                                >
                                    <View style={styles.profileImage}>
                                        <Feather name="user" size={24} color="#4169E1" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{leave.name}</Text>
                                        <Text style={styles.cardSubtitle}>
                                            {leave.leaveType} • {leave.dates}
                                        </Text>
                                    </View>
                                    <View style={styles.statusIcon}>
                                        <Feather
                                            name={expandedLeave === leave.id ? 'chevron-up' : 'chevron-down'}
                                            size={24}
                                            color="#666"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>

                            {expandedLeave === leave.id && (
                                <View style={styles.expandedContent}>
                                    <View style={styles.detailRow}>
                                        <Feather name="calendar" size={16} color="#4289f4ff" />
                                        <Text style={styles.detailText}>Duration: {leave.duration}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Feather name="file-text" size={16} color="#4289f4ff" />
                                        <Text style={styles.detailText}>Reason: {leave.reason}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Feather
                                            name={leave.status === 'Approved' ? 'check-circle' : leave.status === 'Rejected' ? 'x-circle' : 'clock'}
                                            size={16}
                                            color={leave.status === 'Approved' ? '#4CAF50' : leave.status === 'Rejected' ? '#FF5252' : '#ff9800'}
                                        />
                                        <Text style={[
                                            styles.detailTextPending,
                                            leave.status === 'Approved' && { color: '#4CAF50' },
                                            leave.status === 'Rejected' && { color: '#FF5252' }
                                        ]}>
                                            Status: {leave.status}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        backgroundColor: '#FFF',
        borderColor: '#fbfbfbff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1565c0',
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'column',
        gap: 1,
    },
    expandableCard: {
        width: '100%',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cececeff',
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E0E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#a0a0a0ff',
    },
    statusIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedContent: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#cececeff',
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    detailTextPending: {
        fontSize: 14,
        color: '#ff9800',
        fontWeight: '600',
        flex: 1,
    },
    // Loading & Empty States
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#999',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default UpcomingLeaves;
