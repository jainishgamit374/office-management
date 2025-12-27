// components/Employee/TaskCard.tsx
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Task = {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: string;
};

interface TaskCardProps {
    task: Task;
    onPress: () => void;
    showStatus?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, showStatus = true }) => {
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

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}20` }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                        {task.priority}
                    </Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>{task.description}</Text>

            <View style={styles.footer}>
                <View style={styles.dateContainer}>
                    <Feather name="calendar" size={14} color="#666" />
                    <Text style={styles.dateText}>Due: {task.dueDate}</Text>
                </View>
                {showStatus && (
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(task.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                            {task.status}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default TaskCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginRight: 8,
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
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
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
});
