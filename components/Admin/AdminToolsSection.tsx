// components/Admin/AdminToolsSection.tsx
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AdminToolsSection: React.FC = () => {
    const handleEmployeesPress = useCallback(() => {
        try {
            router.push('/(Admin)/employees/index');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handleTasksPress = useCallback(() => {
        try {
            router.push('/(Admin)/tasks/index');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handleProfilePress = useCallback(() => {
        try {
            router.push('/(Admin)/profile');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handleReportsPress = useCallback(() => {
        try {
            router.push('/(Admin)/employeereport');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    const handleCreateTaskPress = useCallback(() => {
        try {
            router.push('/(Admin)/tasks/create');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, []);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Feather name="settings" size={20} color="#6366F1" />
                <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                >
                    Admin Tools
                </Text>
            </View>
            <View style={styles.menuGrid}>
                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={handleEmployeesPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Manage employees"
                    accessibilityHint="Double tap to view and manage team members"
                >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#4A90FF20' }]}>
                        <Feather name="users" size={24} color="#4A90FF" />
                    </View>
                    <Text style={styles.menuTitle}>Employees</Text>
                    <Text style={styles.menuSubtitle}>Manage team</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={handleTasksPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Manage tasks"
                    accessibilityHint="Double tap to view and assign work"
                >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#FF980020' }]}>
                        <Feather name="check-square" size={24} color="#FF9800" />
                    </View>
                    <Text style={styles.menuTitle}>Tasks</Text>
                    <Text style={styles.menuSubtitle}>Assign work</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={handleProfilePress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="View profile"
                    accessibilityHint="Double tap to view your account"
                >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#4CAF5020' }]}>
                        <Feather name="user-check" size={24} color="#4CAF50" />
                    </View>
                    <Text style={styles.menuTitle}>Profile</Text>
                    <Text style={styles.menuSubtitle}>Your account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuCard}
                    activeOpacity={0.7}
                    onPress={handleReportsPress}
                    accessibilityRole="button"
                    accessibilityLabel="View reports"
                    accessibilityHint="Double tap to view analytics"
                >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#9C27B020' }]}>
                        <Feather name="bar-chart-2" size={24} color="#9C27B0" />
                    </View>
                    <Text style={styles.menuTitle}>Reports</Text>
                    <Text style={styles.menuSubtitle}>Analytics</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.createTaskButton}
                onPress={handleCreateTaskPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Create new task"
                accessibilityHint="Double tap to assign work to team members"
            >
                <View style={styles.createTaskIconContainer}>
                    <Feather name="plus-circle" size={24} color="#FFF" />
                </View>
                <View style={styles.createTaskTextContainer}>
                    <Text style={styles.createTaskTitle}>Create New Task</Text>
                    <Text style={styles.createTaskSubtitle}>Assign work to team members</Text>
                </View>
                <Feather name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

export default React.memo(AdminToolsSection);

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.3,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    menuCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    menuIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
        textAlign: 'center',
        width: '100%',
        letterSpacing: 0.2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#999',
        width: '100%',
        textAlign: 'center',
        fontWeight: '500',
    },
    createTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90FF',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        shadowColor: '#4A90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    createTaskIconContainer: {
        marginRight: 14,
    },
    createTaskTextContainer: {
        flex: 1,
    },
    createTaskTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    createTaskSubtitle: {
        fontSize: 13,
        color: '#E3F2FD',
        fontWeight: '500',
    },
});
