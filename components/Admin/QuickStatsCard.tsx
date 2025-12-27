// components/Admin/QuickStatsCard.tsx
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickStatsCardProps {
    icon: string; // Feather icon name
    title: string;
    count: number | string;
    subtitle?: string;
    backgroundColor: string;
    onPress?: () => void;
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
    icon,
    title,
    count,
    subtitle,
    backgroundColor,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Feather name={icon as any} size={24} color="#4A90FF" />
                </View>
                <Text style={styles.count}>{count}</Text>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export default QuickStatsCard;

const styles = StyleSheet.create({
    card: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        minHeight: 145,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    count: {
        fontSize: 34,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 6,
        width: '100%',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        width: '100%',
        textAlign: 'center',
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 12,
        width: '100%',
        color: '#999',
        fontWeight: '500',
        textAlign: 'center',
    },
});
