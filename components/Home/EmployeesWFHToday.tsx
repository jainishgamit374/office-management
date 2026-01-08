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
}

const EmployeesWFHToday: React.FC<EmployeesWFHTodayProps> = ({
    isExpanded,
    onToggleExpand,
    onAnimatePress,
    scaleAnim,
}) => {
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
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchWFHEmployees();
        }, [fetchWFHEmployees])
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Employees WFH Today</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={styles.toggleIcon}
                        activeOpacity={0.7}
                        onPress={() => onAnimatePress('wfhToday', onToggleExpand)}
                    >
                        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#4169E1" />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {isExpanded && (
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#4169E1" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : employees.length > 0 ? (
                    <View style={styles.grid}>
                        {employees.map((employee) => (
                            <View key={employee.id} style={styles.card}>
                                <View style={styles.profileImage}>
                                    <Feather name="user" size={24} color="#4169E1" />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{employee.name}</Text>
                                    <Text style={styles.cardSubtitle}>{employee.task}</Text>
                                </View>
                                <View style={styles.statusIcon}>
                                    <Feather name="home" size={24} color="#4169E1" />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Feather name="users" size={32} color="#ccc" />
                        <Text style={styles.emptyText}>No employees working from home today</Text>
                    </View>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 20,
        borderWidth: 1,
        backgroundColor: '#FFF',
        borderColor: '#fbfbfbff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    header: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1565c0',
        textAlign: 'center',
    },
    toggleIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
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
        borderBottomColor: '#cececeff',
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E0E8FF',
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
        color: '#000',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#a0a0a0ff',
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
        color: '#666',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
});

export default EmployeesWFHToday;
