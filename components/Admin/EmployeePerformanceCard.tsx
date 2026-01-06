// components/Admin/EmployeePerformanceCard.tsx
import { PerformanceMetric } from '@/lib/adminApi';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmployeePerformanceCardProps {
    performance: PerformanceMetric;
}

const EmployeePerformanceCard: React.FC<EmployeePerformanceCardProps> = ({ performance }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'improving') return '📈';
        if (trend === 'declining') return '📉';
        return '➡️';
    };

    const getTrendColor = (trend: string) => {
        if (trend === 'improving') return '#10B981';
        if (trend === 'declining') return '#EF4444';
        return '#6B7280';
    };

    const completionPercentage = performance.completion_rate;
    const scoreColor = getScoreColor(performance.performance_score);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {performance.employee_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.name} numberOfLines={1}>{performance.employee_name}</Text>
                    {performance.designation && (
                        <Text style={styles.designation} numberOfLines={1}>{performance.designation}</Text>
                    )}
                    {performance.department && (
                        <Text style={styles.department} numberOfLines={1}>{performance.department}</Text>
                    )}
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '15' }]}>
                    <Text style={[styles.scoreText, { color: scoreColor }]}>
                        {performance.performance_score}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricsRow}>
                <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Tasks Completed</Text>
                    <Text style={styles.metricValue}>
                        {performance.tasks_completed}/{performance.tasks_total}
                    </Text>
                </View>
                <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Completion Rate</Text>
                    <Text style={styles.metricValue}>{completionPercentage.toFixed(0)}%</Text>
                </View>
            </View>

            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${completionPercentage}%`, backgroundColor: scoreColor }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.trendContainer}>
                <Text style={styles.trendIcon}>{getTrendIcon(performance.improvement_trend)}</Text>
                <Text style={[styles.trendText, { color: getTrendColor(performance.improvement_trend) }]}>
                    {performance.improvement_trend.charAt(0).toUpperCase() + performance.improvement_trend.slice(1)}
                </Text>
            </View>
        </View>
    );
};

export default EmployeePerformanceCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4A90FF',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    designation: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
        marginBottom: 1,
    },
    department: {
        fontSize: 12,
        color: '#999',
    },
    scoreBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreText: {
        fontSize: 18,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 12,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    metric: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
        fontWeight: '500',
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    progressBarContainer: {
        marginBottom: 12,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    trendText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
