// components/Dev/ResetDataButton.tsx
// Development-only button for resetting attendance data
// Add this to your HomeScreen or Settings during development

import DevUtils from '@/utils/resetData';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ResetDataButtonProps {
  onReset?: () => void;
}

const ResetDataButton: React.FC<ResetDataButtonProps> = ({ onReset }) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    Alert.alert(
      '⚠️ Reset Attendance Data',
      'This will clear all check-in/out data but keep you logged in. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              await DevUtils.clearAttendanceData();
              
              Alert.alert(
                '✅ Success',
                'Attendance data cleared! Please reload the app.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onReset?.();
                      // Optionally trigger a reload here
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                '❌ Error',
                error instanceof Error ? error.message : 'Failed to reset data'
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleResetPunchAndAttendance = async () => {
    Alert.alert(
      '🔄 Reset Punch & Attendance',
      'This will reset check-in/out state and delete ALL attendance data. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              await DevUtils.resetPunchAndAttendance();
              
              Alert.alert(
                '✅ Success',
                'Punch and attendance data reset! Please reload the app.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onReset?.();
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                '❌ Error',
                error instanceof Error ? error.message : 'Failed to reset'
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      '🚨 Clear ALL Data',
      'This will log you out and clear everything. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              await DevUtils.clearAllData();
              
              Alert.alert(
                '✅ Success',
                'All data cleared! App will restart.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                '❌ Error',
                error instanceof Error ? error.message : 'Failed to clear data'
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleListKeys = async () => {
    try {
      const keys = await DevUtils.listAllKeys();
      console.log('📋 Storage Keys:', keys);
      Alert.alert(
        '📋 Storage Keys',
        `Found ${keys.length} keys. Check console for details.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Error',
        error instanceof Error ? error.message : 'Failed to list keys'
      );
    }
  };

  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠️ Dev Tools</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={handleReset}
        disabled={isResetting}
      >
        <Text style={styles.buttonText}>
          {isResetting ? '⏳ Resetting...' : '🔄 Reset Attendance Data'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.punchResetButton]}
        onPress={handleResetPunchAndAttendance}
        disabled={isResetting}
      >
        <Text style={styles.buttonText}>
          {isResetting ? '⏳ Resetting...' : '🗑️ Reset Punch & Attendance'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={handleClearAll}
        disabled={isResetting}
      >
        <Text style={styles.buttonText}>
          {isResetting ? '⏳ Clearing...' : '🗑️ Clear All Data'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.listButton]}
        onPress={handleListKeys}
      >
        <Text style={styles.buttonText}>📋 List Storage Keys</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    margin: 16,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#856404',
    textAlign: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  listButton: {
    backgroundColor: '#2196F3',
  },
  punchResetButton: {
    backgroundColor: '#E91E63',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ResetDataButton;
