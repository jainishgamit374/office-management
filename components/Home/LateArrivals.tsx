import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getLateArrivals } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LateArrivalData {
    name: string;
    expectedTime: string;
    reason?: string;
}

interface LateArrivalsProps {
    title: string;
}

const LateArrivals: React.FC<LateArrivalsProps> = ({ title }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [employees, setEmployees] = useState<LateArrivalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLateArrivals = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getLateArrivals();

            if (response.late_arrivals && response.late_arrivals.length > 0) {
                const transformedData: LateArrivalData[] = response.late_arrivals.map((emp) => ({
                    name: emp.EmployeeName,
                    expectedTime: emp.ExpectedArrivalTime,
                    reason: emp.Reason,
                }));

                setEmployees(transformedData);
                console.log('✅ Late arrivals loaded:', transformedData.length);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Failed to fetch late arrivals:', error);
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchLateArrivals();
        }, [fetchLateArrivals])
    );

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
                                <Feather name="clock" size={24} color="#FF9800" />
                            </View>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{employee.name}</Text>
                                <View style={styles.detailsRow}>
                                    <Feather name="clock" size={14} color={colors.textSecondary} />
                                    <Text style={styles.detailText}>Expected: {employee.expectedTime}</Text>
                                </View>
                                {employee.reason && (
                                    <View style={styles.reasonRow}>
                                        <Feather name="info" size={14} color={colors.textSecondary} />
                                        <Text style={styles.reasonText}>{employee.reason}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Feather name="check-circle" size={32} color="#4CAF50" />
                    <Text style={styles.emptyText}>No late arrivals expected today</Text>
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
        backgroundColor: '#FFF3E0',
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
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reasonText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
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

export default LateArrivals;
