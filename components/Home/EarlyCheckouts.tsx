import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getEarlyCheckouts } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface EarlyCheckoutData {
    name: string;
    checkoutTime: string;
    approvalStatus: number;
}

interface EarlyCheckoutsProps {
    title: string;
}

const EarlyCheckouts: React.FC<EarlyCheckoutsProps> = ({ title }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [employees, setEmployees] = useState<EarlyCheckoutData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEarlyCheckouts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getEarlyCheckouts();

            if (response.early_checkouts && response.early_checkouts.length > 0) {
                const transformedData: EarlyCheckoutData[] = response.early_checkouts.map((emp: any) => ({
                    name: emp.EmployeeName,
                    checkoutTime: emp.CheckoutTime,
                    approvalStatus: emp.ApprovalStatus,
                }));

                setEmployees(transformedData);
                console.log('✅ Early checkouts loaded:', transformedData.length);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Failed to fetch early checkouts:', error);
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchEarlyCheckouts();
        }, [fetchEarlyCheckouts])
    );

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: // Approved
                return '#4CAF50';
            case 2: // Pending
                return '#FF9800';
            case 3: // Rejected
                return '#FF5252';
            default:
                return colors.textSecondary;
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case 1:
                return 'Approved';
            case 2:
                return 'Pending';
            case 3:
                return 'Rejected';
            default:
                return 'Unknown';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : employees.length > 0 ? (
                <View style={styles.grid}>
                    {employees.map((employee, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.iconContainer}>
                                <Feather name="log-out" size={24} color="#2196F3" />
                            </View>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{employee.name}</Text>
                                <View style={styles.detailsRow}>
                                    <Feather name="clock" size={14} color={colors.textSecondary} />
                                    <Text style={styles.detailText}>Checkout: {employee.checkoutTime}</Text>
                                </View>
                                <View style={styles.statusContainer}>
                                    <View
                                        style={[
                                            styles.statusDot,
                                            { backgroundColor: getStatusColor(employee.approvalStatus) },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getStatusColor(employee.approvalStatus) },
                                        ]}
                                    >
                                        {getStatusText(employee.approvalStatus)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Feather name="check-circle" size={32} color="#4CAF50" />
                    <Text style={styles.emptyText}>No early checkouts today</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
    },
    header: {
        marginBottom: 12,
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
    cardHeader: {
        flex: 1,
        gap: 6,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
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
});

export default EarlyCheckouts;
