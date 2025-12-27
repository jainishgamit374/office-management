// components/Admin/DashboardInfoCard.tsx
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DashboardInfoCard: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Feather name="info" size={24} color="#4A90FF" />
                </View>
                <View style={styles.content}>
                    <Text
                        style={styles.title}
                        accessibilityRole="header"
                    >
                        Admin Dashboard
                    </Text>
                    <Text
                        style={styles.description}
                        accessibilityLabel="Manage your team efficiently with real-time insights and quick actions"
                    >
                        Manage your team efficiently with real-time insights and quick actions.
                    </Text>
                </View>
            </View>
        </View>
    );
};

// Memoize since this component has no props and never changes
export default React.memo(DashboardInfoCard);

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    description: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666',
        lineHeight: 20,
        letterSpacing: 0.1,
    },
});
