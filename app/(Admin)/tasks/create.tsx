// app/(Admin)/tasks/create.tsx
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Employee = {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    color: string;
};

const MOCK_EMPLOYEES: Employee[] = [
    { id: '1', name: 'Sarah Johnson', role: 'Senior Developer', department: 'Engineering', avatar: 'SJ', color: '#FF6B9D' },
    { id: '2', name: 'David Chen', role: 'Product Manager', department: 'Product', avatar: 'DC', color: '#4A90FF' },
    { id: '3', name: 'Emily Davis', role: 'UI/UX Designer', department: 'Design', avatar: 'ED', color: '#FF9800' },
    { id: '4', name: 'Michael Brown', role: 'Backend Developer', department: 'Engineering', avatar: 'MB', color: '#9C27B0' },
    { id: '5', name: 'Sarah Wilson', role: 'QA Engineer', department: 'Quality', avatar: 'SW', color: '#4CAF50' },
];

const CreateTaskScreen: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [dueDate, setDueDate] = useState('Oct 25, 2023');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEmployees = MOCK_EMPLOYEES.filter((emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleSubmit = () => {
        if (!title.trim() || !description.trim() || !selectedEmployee) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        Alert.alert(
            'Success',
            `Task assigned to ${selectedEmployee.name} successfully!`,
            [{ text: 'OK', onPress: () => router.back() }],
        );
    };

    const getPriorityColor = (p: 'Low' | 'Medium' | 'High') => {
        switch (p) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#10B981';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Feather name="arrow-left" size={24} color="#1a1a1a" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Create Task</Text>
                    <Text style={styles.headerSubtitle}>Assign work to your team</Text>
                </View>

                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Assign To Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="users" size={18} color="#4A90FF" />
                        <Text style={styles.sectionLabel}>Assign To</Text>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={18} color="#999" />
                        <TextInput
                            placeholder="Search employees..."
                            placeholderTextColor="#999"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Employee List */}
                    <View style={styles.employeeListContainer}>
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee, index) => {
                                const isSelected = selectedEmployee?.id === employee.id;
                                const isLast = index === filteredEmployees.length - 1;

                                return (
                                    <TouchableOpacity
                                        key={employee.id}
                                        style={[
                                            styles.employeeRow,
                                            isLast && styles.employeeRowLast,
                                            isSelected && styles.employeeRowSelected,
                                        ]}
                                        onPress={() => setSelectedEmployee(employee)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.employeeAvatar,
                                                { backgroundColor: employee.color },
                                            ]}
                                        >
                                            <Text style={styles.employeeAvatarText}>
                                                {employee.avatar}
                                            </Text>
                                        </View>
                                        <View style={styles.employeeInfo}>
                                            <Text style={styles.employeeName}>{employee.name}</Text>
                                            <Text style={styles.employeeRole}>{employee.role} • {employee.department}</Text>
                                        </View>
                                        {isSelected && (
                                            <View style={styles.checkContainer}>
                                                <Feather name="check-circle" size={22} color="#4A90FF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <View style={styles.emptyState}>
                                <Feather name="user-x" size={32} color="#ccc" />
                                <Text style={styles.emptyText}>No employees found</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Task Title */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="file-text" size={18} color="#4A90FF" />
                        <Text style={styles.sectionLabel}>Task Title</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Quarterly Report Review"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="align-left" size={18} color="#4A90FF" />
                        <Text style={styles.sectionLabel}>Description</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter task details..."
                        placeholderTextColor="#999"
                        multiline
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical="top"
                    />
                </View>

                {/* Due Date */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="calendar" size={18} color="#4A90FF" />
                        <Text style={styles.sectionLabel}>Due Date</Text>
                    </View>
                    <TouchableOpacity style={styles.input}>
                        <Text style={styles.inputText}>{dueDate}</Text>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Priority */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="flag" size={18} color="#4A90FF" />
                        <Text style={styles.sectionLabel}>Priority</Text>
                    </View>
                    <View style={styles.priorityContainer}>
                        {(['Low', 'Medium', 'High'] as const).map((p) => {
                            const active = priority === p;
                            const color = getPriorityColor(p);
                            return (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.priorityChip,
                                        active && { backgroundColor: color, borderColor: color },
                                    ]}
                                    onPress={() => setPriority(p)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.priorityText,
                                            active && styles.priorityTextActive,
                                        ]}
                                    >
                                        {p}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Assign Task Button */}
                <TouchableOpacity
                    style={styles.assignButton}
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Assign task"
                >
                    <Feather name="check" size={20} color="#FFF" />
                    <Text style={styles.assignButtonText}>Assign Task</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateTaskScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
        fontWeight: '500',
    },
    headerRight: {
        width: 40,
    },

    // Content
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    sectionLabel: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1a1a1a',
        marginLeft: 10,
        fontWeight: '400',
    },

    // Employee list
    employeeListContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    employeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 68,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F7FA',
    },
    employeeRowLast: {
        borderBottomWidth: 0,
    },
    employeeRowSelected: {
        backgroundColor: '#F0F7FF',
    },
    employeeAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    employeeAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '600',
        marginBottom: 3,
    },
    employeeRole: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    checkContainer: {
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },

    // Inputs
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1a1a1a',
        minHeight: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputText: {
        fontSize: 15,
        color: '#1a1a1a',
        fontWeight: '400',
    },
    textArea: {
        minHeight: 120,
        paddingTop: 14,
        textAlignVertical: 'top',
    },

    // Priority
    priorityContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    priorityChip: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priorityText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    priorityTextActive: {
        color: '#FFFFFF',
    },

    // Bottom button
    assignButton: {
        marginTop: 12,
        backgroundColor: '#4A90FF',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        minHeight: 56,
        shadowColor: '#4A90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    assignButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});
