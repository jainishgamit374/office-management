import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WFHEmployee {
    id: string;
    name: string;
    task: string;
}

interface EmployeesWFHTodayProps {
    employees?: WFHEmployee[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onAnimatePress: (animKey: 'wfhToday', callback: () => void) => void;
    scaleAnim: Animated.Value;
}

const defaultEmployees: WFHEmployee[] = [
    { id: '1', name: 'Arjun Reddy', task: 'Client presentation preparation' },
    { id: '2', name: 'Kavya Iyer', task: 'Backend API development' },
    { id: '3', name: 'Rohan Gupta', task: 'Database optimization tasks' },
];

const EmployeesWFHToday: React.FC<EmployeesWFHTodayProps> = ({
    employees = defaultEmployees,
    isExpanded,
    onToggleExpand,
    onAnimatePress,
    scaleAnim,
}) => {
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
});

export default EmployeesWFHToday;
