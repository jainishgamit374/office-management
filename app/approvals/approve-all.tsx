import { approveAll, getWorkflowApproval, WorkflowApprovalResponse } from '@/lib/workflow';
import Feather from '@expo/vector-icons/Feather';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const ApproveAllScreen = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState<WorkflowApprovalResponse | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const response = await getWorkflowApproval();
            if (response.status === 'Success') {
                setStats(response);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            Alert.alert('Error', 'Failed to load approval statistics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveAll = async () => {
        try {
            setIsSubmitting(true);
            const response = await approveAll();
            
            if (response.status === 'Success') {
                Alert.alert(
                    'Success',
                    response.message || 'All pending requests have been approved.',
                    [{ 
                        text: 'OK', 
                        onPress: () => router.back() 
                    }]
                );
            } else {
                Alert.alert('Error', response.message || 'Failed to approve requests');
            }
        } catch (error: any) {
            console.error('Approve all error:', error);
            Alert.alert('Error', error.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmApproveAll = () => {
        if (!stats?.pending_approval_count) return;

        Alert.alert(
            'Confirm Approval',
            `Are you sure you want to approve all ${stats.pending_approval_count} pending requests? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Approve All', 
                    style: 'destructive',
                    onPress: handleApproveAll 
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4A90FF" />
                <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
        );
    }

    const {
        pending_approval_count = 0,
        misscheckout_pending_approval_count = 0,
        earlycheckout_pending_approval_count = 0,
        IsAway_pending_approval_count = 0,
        workfromhome_pending_approval_count = 0
    } = stats || {};

    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{
                    title: 'Approve All',
                    headerStyle: { backgroundColor: '#F5F7FA' },
                    headerTintColor: '#333',
                }} 
            />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Feather name="check-circle" size={40} color="#4CAF50" />
                    </View>
                    <Text style={styles.title}>Bulk Approval</Text>
                    <Text style={styles.subtitle}>
                        You are about to approve {pending_approval_count} pending requests.
                    </Text>
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Breakdown</Text>
                    
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>WFH Requests</Text>
                        <Text style={styles.statValue}>{workfromhome_pending_approval_count}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Early Checkout</Text>
                        <Text style={styles.statValue}>{earlycheckout_pending_approval_count}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Missing Checkout</Text>
                        <Text style={styles.statValue}>{misscheckout_pending_approval_count}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Is Away / Leave</Text>
                        <Text style={styles.statValue}>{IsAway_pending_approval_count}</Text>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, styles.totalText]}>Total Pending</Text>
                        <Text style={[styles.statValue, styles.totalText]}>{pending_approval_count}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Pressable 
                        style={[
                            styles.approveButton, 
                            (pending_approval_count === 0 || isSubmitting) && styles.disabledButton
                        ]}
                        onPress={confirmApproveAll}
                        disabled={pending_approval_count === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Feather name="check" size={20} color="#FFF" />
                                <Text style={styles.approveButtonText}>
                                    Approve All Requests
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                {pending_approval_count === 0 && (
                    <Text style={styles.emptyNote}>
                        There are no pending requests to approve.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        maxWidth: 300,
    },
    statsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statLabel: {
        fontSize: 15,
        color: '#666',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    totalText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#4A90FF',
    },
    actions: {
        gap: 16,
    },
    approveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        gap: 10,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#A5D6A7',
        opacity: 0.7,
        shadowOpacity: 0,
    },
    approveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    emptyNote: {
        textAlign: 'center',
        color: '#999',
        marginTop: 16,
        fontSize: 14,
    },
});

export default ApproveAllScreen;
