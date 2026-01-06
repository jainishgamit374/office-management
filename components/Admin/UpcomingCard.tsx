// components/Admin/UpcomingCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface UpcomingCardProps {
    employeeName: string;
    dateRange: string;
    type: 'leave' | 'wfh';
}

const UpcomingCard: React.FC<UpcomingCardProps> = ({
    employeeName,
    dateRange,
    type,
}) => {
    // Generate initials from name
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <View style={styles.card}>
            <View style={[styles.avatar, type === 'leave' ? styles.avatarLeave : styles.avatarWFH]}>
                <Text style={styles.avatarText}>{getInitials(employeeName)}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{employeeName}</Text>
                <Text style={styles.date}>{dateRange}</Text>
            </View>
        </View>
    );
};

export default UpcomingCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    avatarLeave: {
        backgroundColor: '#D4F4DD',
    },
    avatarWFH: {
        backgroundColor: '#E3F2FD',
    },
    avatarText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});
