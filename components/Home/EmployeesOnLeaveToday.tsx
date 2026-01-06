import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Employee {
    id: string;
    name: string;
    leaveType: string;
}

interface EmployeesOnLeaveTodayProps {
    employees?: Employee[];
}

const defaultEmployees: Employee[] = [
    { id: '1', name: 'Prakesh Darji', leaveType: 'Sick Leave' },
    { id: '2', name: 'Nipa Barot', leaveType: 'Privilege Leave' },
    { id: '3', name: 'Hemant Patel', leaveType: 'Casual Leave' },
];

const EmployeesOnLeaveToday: React.FC<EmployeesOnLeaveTodayProps> = ({
    employees = defaultEmployees,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Employees on Leave Today</Text>
            </View>

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
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 20,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
        textAlign: 'center',
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
});

export default EmployeesOnLeaveToday;
