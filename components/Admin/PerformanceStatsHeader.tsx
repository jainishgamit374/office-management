// components/Admin/PerformanceStatsHeader.tsx
import { PerformanceMetric } from '@/lib/adminApi';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PerformanceStatsHeaderProps {
    performanceData: PerformanceMetric[];
}

const PerformanceStatsHeader: React.FC<PerformanceStatsHeaderProps> = ({ performanceData }) => {
    const totalEmployees = performanceData.length;

    const averageCompletionRate = totalEmployees > 0
        ? performanceData.reduce((sum, p) => sum + p.completion_rate, 0) / totalEmployees
        : 0;

    const totalTasksCompleted = performanceData.reduce((sum, p) => sum + p.tasks_completed, 0);

    const topPerformer = performanceData.length > 0
        ? performanceData.reduce((top, current) =>
            current.performance_score > top.performance_score ? current : top
        )
        : null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📊 Performance Overview</Text>
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{totalEmployees}</Text>
                    <Text style={styles.statLabel}>Total Employees</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{averageCompletionRate.toFixed(0)}%</Text>
                    <Text style={styles.statLabel}>Avg Completion</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{totalTasksCompleted}</Text>
                    <Text style={styles.statLabel}>Tasks Completed</Text>
                </View>
                {topPerformer && (
                    <View style={[styles.statCard, styles.topPerformerCard]}>
                        <Text style={styles.topPerformerIcon}>🏆</Text>
                        <Text style={styles.topPerformerName} numberOfLines={1}>
                            {topPerformer.employee_name.split(' ')[0]}
                        </Text>
                        <Text style={styles.statLabel}>Top Performer</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default PerformanceStatsHeader;

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        minHeight: 100,
        justifyContent: 'center',
    },
    topPerformerCard: {
        backgroundColor: '#FFF9E6',
        borderColor: '#FFD700',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },
    topPerformerIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    topPerformerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
});
