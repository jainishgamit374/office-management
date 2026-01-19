import { getBirthdays } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Birthday {
    id: string;
    name: string;
    initials: string;
    date: string;
}

interface AllBirthdaysProps {
    isExpanded: boolean;
    onToggleExpand: () => void;
    onAnimatePress: (animKey: 'birthday', callback: () => void) => void;
    scaleAnim: Animated.Value;
    refreshKey?: number;
}

const AllBirthdays: React.FC<AllBirthdaysProps> = ({
    isExpanded,
    onToggleExpand,
    onAnimatePress,
    scaleAnim,
    refreshKey,
}) => {
    const [birthdays, setBirthdays] = useState<Birthday[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBirthdays = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getBirthdays();

            // Transform today's birthdays to component format
            const birthdayData: Birthday[] = response.data.todays_birthdays.map((person: any, index: number) => {
                const initials = person.name.split(' ').map((n: string) => n[0]).join('');
                
                // Parse the date (format: "DD-MM-YYYY")
                const [day, month, year] = person.dob.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                return {
                    id: `${index}`,
                    name: person.name,
                    initials: initials,
                    date: formattedDate,
                };
            });

            setBirthdays(birthdayData);
            console.log('✅ Birthdays loaded:', birthdayData.length);
        } catch (error) {
            console.error('Failed to fetch birthdays:', error);
            setBirthdays([]);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchBirthdays();
        }, [fetchBirthdays, refreshKey])
    );

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
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#d4145a" />
                        <Text style={styles.loadingText}>Loading birthdays...</Text>
                    </View>
                ) : birthdays.length > 0 ? (
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
                )
            ) : null}
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
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
});

export default AllBirthdays;
