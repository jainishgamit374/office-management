import { getUpcomingLeaves } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LeaveArrivalData {
    id: number;
    name: string;
    leaveType: string;
    dates: string;
    startDate: string;
    endDate: string;
}

interface LeaveArrivalsTodayProps {
    refreshKey?: number;
}

const LeaveArrivalsToday: React.FC<LeaveArrivalsTodayProps> = ({ refreshKey }) => {
    const [arrivals, setArrivals] = useState<LeaveArrivalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchLeaveArrivals = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔄 [LeaveArrivalsToday] Fetching employees on leave today...');

            const response = await getUpcomingLeaves();

            if (response.status === 'Success' && response.data && response.data.length > 0) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Filter for employees on leave today
                const todayLeaves = response.data
                    .filter((item: any) => {
                        // Check if approval status is approved
                        const statusLower = item.approval_status?.toLowerCase() || '';
                        const isApproved = statusLower.includes('approve') && !statusLower.includes('await');
                        
                        if (!isApproved) return false;

                        // Parse start and end dates
                        const parseDate = (dateStr: string | null | undefined): Date | null => {
                            if (!dateStr || typeof dateStr !== 'string') return null;
                            try {
                                const parts = dateStr.trim().split('-');
                                if (parts.length !== 3) return null;
                                const [day, month, year] = parts;
                                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            } catch {
                                return null;
                            }
                        };

                        const startDate = parseDate(item.start_date);
                        const endDate = parseDate(item.end_date);

                        if (!startDate || !endDate) return false;

                        // Reset time parts for comparison
                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(0, 0, 0, 0);

                        // Check if today falls within the leave period
                        return today >= startDate && today <= endDate;
                    })
                    .map((item: any) => ({
                        id: item.leave_application_id,
                        name: item.employee_name || 'Unknown',
                        leaveType: item.leave_type || 'Leave',
                        dates: item.start_date === item.end_date 
                            ? item.start_date 
                            : `${item.start_date} to ${item.end_date}`,
                        startDate: item.start_date,
                        endDate: item.end_date,
                    }));

                console.log(`✅ [LeaveArrivalsToday] Found ${todayLeaves.length} employees on leave today`);
                setArrivals(todayLeaves);
            } else {
                setArrivals([]);
                console.log('ℹ️ [LeaveArrivalsToday] No leave data available');
            }
        } catch (error) {
            console.error('❌ [LeaveArrivalsToday] Failed to fetch:', error);
            setArrivals([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchLeaveArrivals();
        }, [fetchLeaveArrivals, refreshKey])
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    Leave Arrivals Today {arrivals.length > 0 && `(${arrivals.length})`}
                </Text>
                <Feather 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#4169E1" 
                />
            </TouchableOpacity>

            {isExpanded && (
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#4169E1" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : arrivals.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="calendar" size={32} color="#ccc" />
                        <Text style={styles.emptyText}>No employees on leave today</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {arrivals.map((arrival) => (
                            <View key={arrival.id} style={styles.card}>
                                <View style={styles.iconContainer}>
                                    <Feather name="calendar" size={24} color="#EF4444" />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{arrival.name}</Text>
                                    <View style={styles.detailsRow}>
                                        <Feather name="briefcase" size={14} color="#64748B" />
                                        <Text style={styles.detailText}>{arrival.leaveType}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Feather name="calendar" size={14} color="#64748B" />
                                        <Text style={styles.detailText}>{arrival.dates}</Text>
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

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4169E1',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#64748B',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    },
    grid: {
        padding: 12,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 6,
    },
});

export default LeaveArrivalsToday;
