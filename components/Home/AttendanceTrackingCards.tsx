import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AttendanceTrackingCardsProps {
    lateCheckIns?: number;
    earlyCheckOuts?: number;
    halfDays?: number;
}

const AttendanceTrackingCards: React.FC<AttendanceTrackingCardsProps> = ({
    lateCheckIns = 0,
    earlyCheckOuts = 0,
    halfDays = 0,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.label}>Late Check In</Text>
                <Feather name="log-in" size={32} color={colors.primary} />
                <Text style={styles.count}>{lateCheckIns}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Early Check Out</Text>
                <Feather name="log-out" size={32} color={colors.primary} />
                <Text style={styles.count}>{earlyCheckOuts}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Half Day</Text>
                <Feather name="calendar" size={32} color={colors.primary} />
                <Text style={styles.count}>{halfDays}</Text>
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
        gap: 10,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 150,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    count: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginTop: 10,
    },
});

export default AttendanceTrackingCards;

