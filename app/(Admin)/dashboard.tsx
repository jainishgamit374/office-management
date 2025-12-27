// app/(Admin)/dashboard.tsx
import AdminToolsSection from '@/components/Admin/AdminToolsSection';
import ApprovalsSection from '@/components/Admin/ApprovalsSection';
import BirthdaysSection from '@/components/Admin/BirthdaysSection';
import DashboardHeader from '@/components/Admin/DashboardHeader';
import DashboardInfoCard from '@/components/Admin/DashboardInfoCard';
import QuickStatsSection from '@/components/Admin/QuickStatsSection';
import UpcomingSection from '@/components/Admin/UpcomingSection';
import {
    Birthday,
    DashboardStats,
    getDashboardStats,
    getEmployeePerformance,
    getLeaveRequests,
    getUpcomingBirthdays,
    getWFHRequests,
    LeaveRequest,
    PerformanceMetric,
    WFHRequest,
} from '@/lib/adminApi';
import { getUser, User } from '@/lib/auth';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Default empty state for dashboard stats
const DEFAULT_STATS: DashboardStats = {
    leave_requests_pending: 0,
    early_checkout_today: 0,
    miss_punch_alerts: 0,
    late_checkin_count: 0,
    wfh_requests_active: 0,
    pending_approvals_total: 0,
};

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
    const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveRequest[]>([]);
    const [upcomingWFH, setUpcomingWFH] = useState<WFHRequest[]>([]);
    const [birthdays, setBirthdays] = useState<Birthday[]>([]);
    const [performance, setPerformance] = useState<PerformanceMetric[]>([]);

    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                const userData = await getUser();
                if (isMounted) {
                    setUser(userData);
                    await loadDashboardData();
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Initialization error:', err);
                    setError('Failed to initialize dashboard');
                    setLoading(false);
                }
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, []);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsData, leavesData, wfhData, birthdaysData, performanceData] =
                await Promise.all([
                    getDashboardStats().catch(() => DEFAULT_STATS),
                    getLeaveRequests('approved').catch(() => []),
                    getWFHRequests('approved').catch(() => []),
                    getUpcomingBirthdays(30).catch(() => []),
                    getEmployeePerformance().catch(() => []),
                ]);

            // Use current date for filtering
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day

            // Filter and sort upcoming leaves
            const futureLeaves = leavesData
                .filter((leave) => {
                    try {
                        const fromDate = new Date(leave.from_date);
                        return fromDate > today;
                    } catch {
                        return false;
                    }
                })
                .slice(0, 3);

            // Filter and sort upcoming WFH
            const futureWFH = wfhData
                .filter((wfh) => {
                    try {
                        const wfhDate = new Date(wfh.date);
                        return wfhDate > today;
                    } catch {
                        return false;
                    }
                })
                .slice(0, 3);

            // Sort birthdays by days until birthday
            const sortedBirthdays = [...birthdaysData]
                .sort((a, b) => a.days_until_birthday - b.days_until_birthday)
                .slice(0, 5);

            // Sort performance by score
            const topPerformers = [...performanceData]
                .sort((a, b) => b.performance_score - a.performance_score)
                .slice(0, 5);

            // Update state
            setStats(statsData);
            setUpcomingLeaves(futureLeaves);
            setUpcomingWFH(futureWFH);
            setBirthdays(sortedBirthdays);
            setPerformance(topPerformers);
        } catch (err) {
            console.error('Dashboard load error:', err);
            setError('Failed to load dashboard data');

            // Show user-friendly error
            Alert.alert(
                'Error',
                'Unable to load dashboard data. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    }, [loadDashboardData]);

    // Loading state
    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color="#4A90FF"
                        accessibilityLabel="Loading dashboard"
                    />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state with retry option
    if (error && !loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text
                        style={styles.retryText}
                        onPress={loadDashboardData}
                        accessibilityRole="button"
                        accessibilityLabel="Retry loading dashboard"
                    >
                        Tap to retry
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A90FF"
                        colors={['#4A90FF']}
                    />
                }
                accessibilityLabel="Dashboard content"
            >
                <DashboardHeader user={user} />
                <QuickStatsSection stats={stats} />
                <ApprovalsSection stats={stats} />
                <UpcomingSection upcomingLeaves={upcomingLeaves} upcomingWFH={upcomingWFH} />
                <BirthdaysSection birthdays={birthdays} />
                <AdminToolsSection />
                <DashboardInfoCard />
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminDashboard;

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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '500',
    },
    retryText: {
        fontSize: 16,
        color: '#4A90FF',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
});