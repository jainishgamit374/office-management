import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TaskSectionProps {
  hasEverCheckedIn: boolean;
  isCheckedIn: boolean;
  totalTasks?: number;
  tasksToComplete?: number;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  hasEverCheckedIn,
  isCheckedIn,
  totalTasks = 12,
  tasksToComplete = 4,
}) => {
  if (!hasEverCheckedIn) return null;

  return (
    <View style={styles.taskSection}>
      {isCheckedIn ? (
        <>
          <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
        </>
      ) : (
        <>
          <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
          <Text style={styles.taskCountText}>
            Tasks Completed: <Text style={styles.taskCountBold}>{totalTasks - tasksToComplete}</Text>
          </Text>
          <Text style={styles.taskCountText}>
            Task Remaining: {tasksToComplete}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  taskText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  taskCountText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  taskCountBold: {
    fontWeight: '700',
    color: '#000',
  },
});

export default TaskSection;