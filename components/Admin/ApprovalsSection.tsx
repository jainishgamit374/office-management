// components/Admin/ApprovalsSection.tsx
import { DashboardStats } from '@/lib/adminApi';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ApprovalCard from './ApprovalCard';

interface ApprovalsSectionProps {
    stats: DashboardStats;
}

const ApprovalsSection: React.FC<ApprovalsSectionProps> = ({ stats }) => {
    const pendingApprovals = typeof stats.pending_approvals_total === 'number' && !isNaN(stats.pending_approvals_total)
        ? stats.pending_approvals_total
        : 0;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Feather name="check-square" size={20} color="#10B981" />
                <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                >
                    Approvals & Balance
                </Text>
            </View>
            <View
                style={styles.approvalsRow}
                accessibilityLabel="Approvals and balance information"
            >
                <ApprovalCard
                    title="Pending Approvals"
                    count={pendingApprovals}
                    backgroundColor="#FFFFFF"
                />
                <ApprovalCard
                    title="Leave Balance"
                    days={8}
                    limit={24}
                    backgroundColor="#FFFFFF"
                />
                <ApprovalCard
                    title="WFH Balance"
                    days={4}
                    limit={10}
                    backgroundColor="#FFFFFF"
                />
            </View>
        </View>
    );
};

export default React.memo(ApprovalsSection, (prevProps, nextProps) => {
    return prevProps.stats.pending_approvals_total === nextProps.stats.pending_approvals_total;
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
    approvalsRow: {
        flexDirection: 'row',
        gap: 12,
    },
});
