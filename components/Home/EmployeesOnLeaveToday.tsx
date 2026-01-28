import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getTodayLeaves } from '@/lib/todayLeaves';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Employee {
    id: string;
    name: string;
    leaveType: string;
    approvalStatus: number;
}

interface EmployeesOnLeaveTodayProps {
    refreshKey?: number;
}

const EmployeesOnLeaveToday: React.FC<EmployeesOnLeaveTodayProps> = ({ refreshKey }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTodayLeaves = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('📋 Fetching today\'s leaves from API...');
            const response = await getTodayLeaves();

            if (response.status === 'Success' && response.today_leaves) {
                const transformedData: Employee[] = response.today_leaves.map((leave: any, index: number) => ({
                    id: `${index + 1}`,
                    name: leave.EmployeeName,
                    leaveType: leave.LeaveType,
                    approvalStatus: leave.ApprovalStatus,
                }));

                setEmployees(transformedData);
                console.log('✅ Today\'s leaves loaded:', transformedData.length);
            } else {
                setEmployees([]);
            }
        } catch (err: any) {
            console.error('❌ Error fetching today\'s leaves:', err);
            setError(err.message || 'Failed to load leave data');
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchTodayLeaves();
        }, [fetchTodayLeaves, refreshKey])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Employees on Leave Today</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : error ? (
                <View style={styles.emptyContainer}>
                    <Feather name="alert-circle" size={32} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : employees.length > 0 ? (
                <View style={styles.grid}>
                    {employees.map((employee) => (
                        <View key={employee.id} style={styles.card}>
                            <View style={styles.profileImage}>
                                <Feather name="user" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{employee.name}</Text>
                                <Text style={styles.cardSubtitle}>{employee.leaveType}</Text>
                            </View>
                            <View style={styles.statusIcon}>
                                <Feather name="check-circle" size={24} color={colors.success} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Feather name="users" size={32} color="#ccc" />
                    <Text style={styles.emptyText}>No employees on leave today</Text>
                </View>
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
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: colors.primaryLight,
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
        color: colors.text,
    },
    cardSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    statusIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
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
    errorText: {
        fontSize: 14,
        color: colors.error,
        textAlign: 'center',
    },
});

export default EmployeesOnLeaveToday;
