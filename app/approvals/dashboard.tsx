import ApprovalsDashboard from '@/components/Admin/ApprovalsDashboard';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const ApprovalsDashboardScreen = () => {
    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{
                    title: 'Approvals Dashboard',
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F5F7FA' },
                    headerTintColor: '#333',
                }} 
            />
            <ApprovalsDashboard />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
});

export default ApprovalsDashboardScreen;
