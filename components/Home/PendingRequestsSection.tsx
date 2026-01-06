import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getPunchStatus } from '@/lib/attendance';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface RequestItem {
    id: string;
    title: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    count: number;
}

const PendingRequestsSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPending, setTotalPending] = useState(0);
    const [leaveRequests, setLeaveRequests] = useState(0);
    const [lateCheckinRequests, setLateCheckinRequests] = useState(0);
    const [earlyCheckoutRequests, setEarlyCheckoutRequests] = useState(0);

    const fetchPendingRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getPunchStatus();

            if (response.data?.pendingRequests) {
                setTotalPending(response.data.pendingRequests.total || 0);
                setLeaveRequests(response.data.pendingRequests.leaveRequests || 0);
                setLateCheckinRequests(response.data.pendingRequests.lateCheckinRequests || 0);
                setEarlyCheckoutRequests(response.data.pendingRequests.earlyCheckoutRequests || 0);
                console.log('✅ Pending requests loaded from API');
            }
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
            // Keep default values on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchPendingRequests();
        }, [fetchPendingRequests])
    );

    const requests: RequestItem[] = [
        { id: '1', title: 'Leave Requests', icon: 'check-circle', color: '#12df34ff', count: leaveRequests },
        { id: '2', title: 'Late Check-in Requests', icon: 'clock', color: '#f45742ff', count: lateCheckinRequests },
        { id: '3', title: 'Early Check-out Requests', icon: 'log-out', color: '#2d58e4ff', count: earlyCheckoutRequests },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Pending Requests</Text>
                {!isLoading && totalPending > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{totalPending}</Text>
                    </View>
                )}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            ) : totalPending === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="check-circle" size={40} color={colors.success} />
                    <Text style={styles.emptyText}>No pending requests</Text>
                    <Text style={styles.emptySubtext}>All your requests are up to date!</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {requests.map((request) => (
                        request.count > 0 && (
                            <View key={request.id} style={styles.card}>
                                <View style={styles.iconContainer}>
                                    <Feather style={styles.icon} name={request.icon} size={24} color={request.color} />
                                </View>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{request.title}</Text>
                                    <Text style={styles.countText}>{request.count} pending</Text>
                                </View>
                            </View>
                        )
                    ))}
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
        paddingHorizontal: 5,
        paddingVertical: 14,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        width: '100%',
        textAlign: 'center',

    },
    badge: {
        backgroundColor: colors.error,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 30,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginTop: 10,
        textAlign: 'center',
        width: '100%',
    },
    emptySubtext: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    grid: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        gap: 8,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    cardHeader: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2,
        padding: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'left',
    },
    countText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});

export default PendingRequestsSection;

