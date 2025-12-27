// components/Admin/BirthdayCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BirthdayCardProps {
    employeeName: string;
    age?: number;
    date: string;
    isToday?: boolean;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({
    employeeName,
    age,
    date,
    isToday = false,
}) => {
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <View style={[styles.card, isToday && styles.cardToday]}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(employeeName)}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{employeeName}</Text>
                {isToday ? (
                    <Text style={styles.todayText}>🎂 Turning {age} today!</Text>
                ) : (
                    <Text style={styles.dateText}>{date}</Text>
                )}
            </View>
        </View>
    );
};

export default BirthdayCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardToday: {
        backgroundColor: '#fff9e6',
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOpacity: 0.15,
        elevation: 4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4A90FF',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    todayText: {
        fontSize: 12,
        color: '#FF9800',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});
