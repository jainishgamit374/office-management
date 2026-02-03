import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getTodayWFH } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WFHEmployee {
    id: string;
    name: string;
    task: string;
}

interface EmployeesWFHTodayProps {
    isExpanded: boolean;
    onToggleExpand: () => void;
    onAnimatePress: (animKey: 'wfhToday', callback: () => void) => void;
    scaleAnim: Animated.Value;
    refreshKey?: number;
}

const EmployeesWFHToday: React.FC<EmployeesWFHTodayProps> = ({
    isExpanded,
    onToggleExpand,
    onAnimatePress,
    scaleAnim,
    refreshKey,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    
    const [employees, setEmployees] = useState<WFHEmployee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWFHEmployees = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getTodayWFH();

            if (response.today_WFH && response.today_WFH.length > 0) {
                const transformedData: WFHEmployee[] = response.today_WFH.map((emp, index) => {
                    // Determine task description based on half-day status
                    let task = emp.Reason || 'Working from home';
                    if (emp.IsHalfDay) {
                        task = emp.IsFirstHalf ? 'First half WFH' : 'Second half WFH';
                    }

                    return {
                        id: `${index + 1}`,
                        name: emp.EmployeeName,
                        task: task,
                    };
                });

                setEmployees(transformedData);
                console.log('✅ Today\'s WFH employees loaded:', transformedData.length);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Failed to fetch WFH employees:', error);
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchWFHEmployees();
        }, [fetchWFHEmployees, refreshKey])
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header}
                onPress={() => onAnimatePress('wfhToday', onToggleExpand)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    Employees WFH Today {employees.length > 0 && `(${employees.length})`}
                </Text>
                <Feather 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.primary} 
                />
            </TouchableOpacity>

            {isExpanded && (
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : employees.length > 0 ? (
                    <View style={styles.grid}>
                        {employees.map((employee) => (
                            <View key={employee.id} style={styles.card}>
                                <View style={styles.iconContainer}>
                                    <Feather name="user" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{employee.name}</Text>
                                    <View style={styles.detailsRow}>
                                        <Feather name="briefcase" size={14} color={colors.textSecondary} />
                                        <Text style={styles.detailText}>{employee.task}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Feather name="users" size={32} color={colors.textTertiary} />
                        <Text style={styles.emptyText}>No employees working from home today</Text>
                    </View>
                )
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
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 6,
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

export default EmployeesWFHToday;
