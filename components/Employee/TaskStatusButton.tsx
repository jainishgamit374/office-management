// components/Employee/TaskStatusButton.tsx
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskStatusButtonProps {
    currentStatus: 'Pending' | 'In Progress' | 'Completed';
    onStatusChange: (newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
    disabled?: boolean;
}

const TaskStatusButton: React.FC<TaskStatusButtonProps> = ({
    currentStatus,
    onStatusChange,
    disabled = false,
}) => {
    const getNextStatus = () => {
        switch (currentStatus) {
            case 'Pending':
                return 'In Progress';
            case 'In Progress':
                return 'Completed';
            case 'Completed':
                return 'Completed'; // Can't change from completed
            default:
                return 'Pending';
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return 'check-circle';
            case 'In Progress': return 'activity';
            case 'Pending': return 'clock';
            default: return 'circle';
        }
    };

    const nextStatus = getNextStatus();
    const isCompleted = currentStatus === 'Completed';

    return (
        <View style={styles.container}>
            {/* Current Status */}
            <View style={[styles.currentStatus, { backgroundColor: `${getStatusColor(currentStatus)}20` }]}>
                <Feather name={getStatusIcon(currentStatus)} size={20} color={getStatusColor(currentStatus)} />
                <Text style={[styles.currentStatusText, { color: getStatusColor(currentStatus) }]}>
                    {currentStatus}
                </Text>
            </View>

            {/* Update Button */}
            {!isCompleted && (
                <TouchableOpacity
                    style={[
                        styles.updateButton,
                        { backgroundColor: getStatusColor(nextStatus) },
                        disabled && styles.disabledButton,
                    ]}
                    onPress={() => !disabled && onStatusChange(nextStatus)}
                    disabled={disabled}
                    activeOpacity={0.8}
                >
                    <Text style={styles.updateButtonText}>
                        Mark as {nextStatus}
                    </Text>
                    <Feather name="arrow-right" size={16} color="#FFF" />
                </TouchableOpacity>
            )}

            {isCompleted && (
                <View style={styles.completedBadge}>
                    <Feather name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.completedText}>Task Completed!</Text>
                </View>
            )}
        </View>
    );
};

export default TaskStatusButton;

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    currentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
    },
    currentStatusText: {
        fontSize: 16,
        fontWeight: '700',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    updateButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    disabledButton: {
        opacity: 0.5,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        backgroundColor: '#4CAF5020',
        borderRadius: 12,
    },
    completedText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4CAF50',
    },
});
