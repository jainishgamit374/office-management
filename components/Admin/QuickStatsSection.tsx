// components/Admin/QuickStatsSection.tsx
import { DashboardStats } from '@/lib/adminApi';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QuickStatsCard from './QuickStatsCard';

interface QuickStatsSectionProps {
    stats: DashboardStats;
}

interface StatConfig {
    icon: string;
    title: string;
    key: keyof DashboardStats;
    subtitle: string;
}

// Professional icon-based configuration
const STATS_CONFIG: StatConfig[] = [
    {
        icon: 'calendar',
        title: 'Leave Requests',
        key: 'leave_requests_pending',
        subtitle: 'Pending',
    },
    {
        icon: 'clock',
        title: 'Early Checkout',
        key: 'early_checkout_today',
        subtitle: 'Today',
    },
    {
        icon: 'alert-circle',
        title: 'Miss Punch',
        key: 'miss_punch_alerts',
        subtitle: 'Alerts',
    },
    {
        icon: 'user-x',
        title: 'Late Check-In',
        key: 'late_checkin_count',
        subtitle: 'Today',
    },
    {
        icon: 'home',
        title: 'WFH Requests',
        key: 'wfh_requests_active',
        subtitle: 'Active',
    },
    {
        icon: 'check-circle',
        title: 'Approvals',
        key: 'pending_approvals_total',
        subtitle: 'Pending',
    },
];

const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({ stats }) => {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Feather name="bar-chart-2" size={20} color="#4A90FF" />
                <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                >
                    Quick Stats
                </Text>
            </View>
            <View
                style={styles.statsGrid}
                accessibilityLabel="Dashboard statistics"
            >
                {STATS_CONFIG.map((config) => {
                    const count = stats[config.key];
                    const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;

                    return (
                        <QuickStatsCard
                            key={config.key}
                            icon={config.icon}
                            title={config.title}
                            count={safeCount}
                            subtitle={config.subtitle}
                            backgroundColor="#FFFFFF"
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default React.memo(QuickStatsSection, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.stats) === JSON.stringify(nextProps.stats);
});

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 4,
    },
});
