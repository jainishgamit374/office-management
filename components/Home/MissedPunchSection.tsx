import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getMissingPunchOut } from '@/lib/attendance';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

interface MissedPunch {
    date: string;
    dateFormatted: string;
    type: 'check-in' | 'check-out';
}

const MissedPunchSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [isLoading, setIsLoading] = useState(true);
    const [missedPunches, setMissedPunches] = useState<MissedPunch[]>([]);

    const fetchMissedPunches = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getMissingPunchOut();

            // Transform API response to component format
            const missedPunchData: MissedPunch[] = response.data.map(item => {
                const date = new Date(item.missing_date);
                return {
                    date: item.missing_date,
                    dateFormatted: date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    type: 'check-out' as const, // Missing punch-out means they didn't check out
                };
            });

            setMissedPunches(missedPunchData);
            console.log('✅ Missed punches loaded from API:', missedPunchData.length);
        } catch (error) {
            console.error('Failed to fetch missed punches:', error);
            setMissedPunches([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchMissedPunches();
        }, [fetchMissedPunches])
    );

    // Don't render if no missed punches
    if (!isLoading && missedPunches.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainTextContainer}>
                <Text style={styles.mainText}>Missed Punch / Check-Out</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                </View>
            ) : (
                <View style={styles.textContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        {missedPunches.map((punch, index) => (
                            <View key={index} style={styles.textContainerRight}>
                                <Feather
                                    name={punch.type === 'check-in' ? 'log-in' : 'log-out'}
                                    size={16}
                                    color={colors.primary}
                                    style={styles.icon}
                                />
                                <Text style={styles.text}>{punch.dateFormatted}</Text>
                                <Text style={styles.typeText}>
                                    {punch.type === 'check-in' ? 'Check-In' : 'Check-Out'}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: colors.primary,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        gap: 12,
    },
    mainTextContainer: {
        width: '100%',
        alignItems: 'flex-start',
    },
    mainText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 10,
    },
    scrollViewContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 5,
    },
    textContainerRight: {
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 140,
        gap: 5,
    },
    icon: {
        marginBottom: 5,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
    typeText: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default MissedPunchSection;

