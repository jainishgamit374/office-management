import ApprovalHistoryList from '@/components/Admin/ApprovalHistoryList';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const ApprovalHistoryScreen = () => {
    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{
                    title: 'Approval History',
                    headerStyle: { backgroundColor: '#F5F7FA' },
                    headerTintColor: '#333',
                }} 
            />
            {/* Display global history by not passing IDs */}
            <ApprovalHistoryList />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
});

export default ApprovalHistoryScreen;
