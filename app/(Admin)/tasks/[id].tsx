// app/(Admin)/tasks/[id].tsx
import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TaskDetailScreen = () => {
    const { id } = useLocalSearchParams();

    // Mock data
    const task = {
        id,
        title: 'Complete Q4 Report',
        description: 'Prepare and submit quarterly performance report including all team metrics, achievements, and areas for improvement.',
        assignedTo: 'Jane Doe',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2025-12-25',
        createdDate: '2025-12-18',
        progress: 65,
    };

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
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Task Details</Text>
                    <TouchableOpacity>
                        <Feather name="more-vertical" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Task Card */}
                <View style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}20` }]}>
                            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                                {task.priority}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.taskDescription}>{task.description}</Text>

                    {/* Progress */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <Text style={styles.progressValue}>{task.progress}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Task Information</Text>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Feather name="user" size={18} color="#4A90FF" />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Assigned To</Text>
                            <Text style={styles.detailValue}>{task.assignedTo}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Feather name="activity" size={18} color="#4A90FF" />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(task.status)}20` }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                                    {task.status}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Feather name="calendar" size={18} color="#4A90FF" />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Due Date</Text>
                            <Text style={styles.detailValue}>{task.dueDate}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Feather name="clock" size={18} color="#4A90FF" />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Created On</Text>
                            <Text style={styles.detailValue}>{task.createdDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsCard}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="edit-2" size={20} color="#4A90FF" />
                        <Text style={styles.actionButtonText}>Edit Task</Text>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="message-square" size={20} color="#4A90FF" />
                        <Text style={styles.actionButtonText}>Add Comment</Text>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.actionButtonDanger]}>
                        <Feather name="trash-2" size={20} color="#FF5252" />
                        <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Delete Task</Text>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },

    // Task Card
    taskCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    taskTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginRight: 12,
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '700',
    },
    taskDescription: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 20,
    },

    // Progress
    progressSection: {
        marginTop: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A90FF',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4A90FF',
        borderRadius: 4,
    },

    // Details Card
    detailsCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Actions Card
    actionsCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    actionButtonText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    actionButtonDanger: {
        borderBottomWidth: 0,
    },
    actionButtonTextDanger: {
        color: '#FF5252',
    },
});
