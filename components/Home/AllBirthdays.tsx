import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Birthday {
    id: string;
    name: string;
    initials: string;
    date: string;
}

interface AllBirthdaysProps {
    birthdays?: Birthday[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onAnimatePress: (animKey: 'birthday', callback: () => void) => void;
    scaleAnim: Animated.Value;
}

const defaultBirthdays: Birthday[] = [
    { id: '1', name: 'Sneha Kapoor', initials: 'SK', date: 'December 12, 2024' },
    { id: '2', name: 'Aditya Malhotra', initials: 'AM', date: 'December 15, 2024' },
    { id: '3', name: 'Pooja Deshmukh', initials: 'PD', date: 'December 18, 2024' },
];

const AllBirthdays: React.FC<AllBirthdaysProps> = ({
    birthdays = defaultBirthdays,
    isExpanded,
    onToggleExpand,
    onAnimatePress,
    scaleAnim,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>All Birthdays 🎂</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={styles.toggleIcon}
                        activeOpacity={0.7}
                        onPress={() => onAnimatePress('birthday', onToggleExpand)}
                    >
                        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#d4145a" />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {isExpanded ? (
                <View style={styles.grid}>
                    {birthdays.map((birthday) => (
                        <View key={birthday.id} style={styles.card}>
                            <View style={styles.profileImage}>
                                <Text style={styles.initials}>{birthday.initials}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardName}>{birthday.name}</Text>
                                <Text style={styles.cardDate}>{birthday.date}</Text>
                            </View>
                            <View style={styles.icon}>
                                <Text style={styles.emoji}>🎉</Text>
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No birthdays today 🎈</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fef5e7',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: '#f9e79f',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Shadow for Android
        elevation: 3,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    header: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#d4145a',
        textAlign: 'center',
    },
    toggleIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'column',
        gap: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#f9e79f',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        // Shadow for Android
        elevation: 2,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#8e44ad',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    cardDate: {
        fontSize: 13,
        color: '#666',
    },
    icon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 28,
    },
    emptyState: {
        paddingVertical: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
});

export default AllBirthdays;
