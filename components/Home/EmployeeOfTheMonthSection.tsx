import { getEmployeeOfTheMonth } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface EmployeeOfMonthData {
    name: string;
    month: string;
}

interface EmployeeOfTheMonthSectionProps {
    refreshKey?: number;
}

const EmployeeOfTheMonthSection: React.FC<EmployeeOfTheMonthSectionProps> = ({ refreshKey }) => {
    const [employee, setEmployee] = useState<EmployeeOfMonthData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEmployeeOfTheMonth = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getEmployeeOfTheMonth();

            if (response.data && response.data.length > 0) {
                const empData = response.data[0];
                const monthYear = new Date(empData.MonthOfYear);
                const formattedMonth = monthYear.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });

                setEmployee({
                    name: empData.Name,
                    month: formattedMonth,
                });
            } else {
                setEmployee(null);
            }

            console.log('✅ Employee of the month loaded');
        } catch (error) {
            console.error('Failed to fetch employee of the month:', error);
            setEmployee(null);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchEmployeeOfTheMonth();
        }, [fetchEmployeeOfTheMonth, refreshKey])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Feather name="award" size={24} color="#FFD700" />
                <Text style={styles.title}>Employee of the Month</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFD700" />
                </View>
            ) : employee ? (
                <View style={styles.content}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {employee.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.employeeName}>{employee.name}</Text>
                        <Text style={styles.monthText}>{employee.month}</Text>
                    </View>
                    <View style={styles.badgeContainer}>
                        <Feather name="star" size={32} color="#FFD700" />
                    </View>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No employee selected yet</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        padding: 12,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingVertical: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD70020',
        borderWidth: 2,
        borderColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFD700',
    },
    infoContainer: {
        flex: 1,
        gap: 4,
    },
    employeeName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    monthText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    badgeContainer: {
        padding: 8,
    },
    emptyContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
});

export default EmployeeOfTheMonthSection;
