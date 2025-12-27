// components/Admin/DashboardHeader.tsx
import { User } from '@/lib/auth';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
    user: User | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
    const firstName = useMemo(() => user?.first_name || 'Admin', [user?.first_name]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const greetingIcon = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'sunrise';
        if (hour < 17) return 'sun';
        return 'moon';
    }, []);

    const avatarInitials = useMemo(() => {
        const firstInitial = user?.first_name?.[0]?.toUpperCase() ?? 'A';
        const lastInitial = user?.last_name?.[0]?.toUpperCase() ?? 'D';
        return `${firstInitial}${lastInitial}`;
    }, [user?.first_name, user?.last_name]);

    const handleProfilePress = () => {
        try {
            router.push('/(Admin)/profile');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.headerTextContainer}>
                    <View style={styles.greetingRow}>
                        <Feather name={greetingIcon} size={16} color="#FF9800" />
                        <Text
                            style={styles.greeting}
                            accessibilityLabel={`${greeting}, ${firstName}`}
                        >
                            {greeting}
                        </Text>
                    </View>
                    <Text
                        style={styles.userName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {firstName}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={handleProfilePress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View profile for ${firstName}`}
                    accessibilityHint="Double tap to open your profile"
                >
                    <Text style={styles.avatarText}>
                        {avatarInitials}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default React.memo(DashboardHeader);

const styles = StyleSheet.create({
    header: {
        marginBottom: 28,
        paddingBottom: 12,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    greeting: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
        letterSpacing: 0.2,
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.3,
    },
    avatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#4A90FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
