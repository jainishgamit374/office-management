// app/(Admin)/tasks/index.tsx
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Task = {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: string;
};

const MOCK_TASKS: Task[] = [
    {
        id: '1',
        title: 'Complete Q4 Report',
        description: 'Prepare and submit quarterly performance report',
        assignedTo: 'Jane Doe',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2025-12-25',
    },
    {
        id: '2',
        title: 'Update Employee Records',
        description: 'Review and update all employee information',
        assignedTo: 'John Smith',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '2025-12-28',
    },
    {
        id: '3',
        title: 'Team Building Event',
        description: 'Organize year-end team building activity',
        assignedTo: 'Emily Davis',
        priority: 'Low',
        status: 'Completed',
        dueDate: '2025-12-20',
    },
];

const AdminTasksScreen = () => {
    const [query, setQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Pending', 'In Progress', 'Completed'];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#FF5252';
            case 'Medium': return '#FF9800';
            case 'Low': return '#4CAF50';
            default: return '#999';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#4CAF50';
            case 'In Progress': return '#4A90FF';
            case 'Pending': return '#FF9800';
            default: return '#999';
        }
    };

    const filtered = MOCK_TASKS.filter((task) => {
        const matchStatus = selectedFilter === 'All' || task.status === selectedFilter;
        const matchQuery =
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.assignedTo.toLowerCase().includes(query.toLowerCase());
        return matchStatus && matchQuery;
    });

    const renderTask = ({ item }: { item: Task }) => (
        <TouchableOpacity
            style={styles.taskCard}
            activeOpacity={0.7}
            onPress={() => router.push({
                pathname: '/(Admin)/tasks/[id]',
                params: { id: item.id }
            })}
        >
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(item.priority)}20` }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                        {item.priority}
                    </Text>
                </View>
            </View>
            <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
            <View style={styles.taskFooter}>
                <View style={styles.assigneeContainer}>
                    <Feather name="user" size={14} color="#666" />
                    <Text style={styles.assigneeText}>{item.assignedTo}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <View style={styles.dueDateContainer}>
                <Feather name="calendar" size={14} color="#666" />
                <Text style={styles.dueDateText}>Due: {item.dueDate}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.headerIconContainer}>
                        <Feather name="check-square" size={28} color="#4A90FF" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Task Management</Text>
                        <Text style={styles.headerSubtitle}>Assign and track team tasks</Text>
                    </View>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#999" />
                    <TextInput
                        placeholder="Search tasks or employees..."
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/(Admin)/tasks/create')}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                {filters.map((filter) => {
                    const active = selectedFilter === filter;
                    return (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                active && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    active && styles.filterTextActive,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={renderTask}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="inbox" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No tasks found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default AdminTasksScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },

    // Header
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4A90FF20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#999',
    },

    // Search
    searchWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1a1a1a', fontWeight: '400' },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#4A90FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },

    // Filters
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    filterChipActive: {
        backgroundColor: '#4A90FF',
        borderColor: '#4A90FF',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 0.1,
    },
    filterTextActive: {
        color: '#FFF',
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    taskCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginRight: 8,
        letterSpacing: 0.2,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
    },
    taskDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    assigneeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    assigneeText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dueDateText: {
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
    },
});
