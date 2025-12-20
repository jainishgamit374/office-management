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
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.label}>Late Check In</Text>
                <Feather name="log-in" size={32} color="#4289f4ff" />
                <Text style={styles.count}>{lateCheckIns}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Early Check Out</Text>
                <Feather name="log-out" size={32} color="#4289f4ff" />
                <Text style={styles.count}>{earlyCheckOuts}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Half Day</Text>
                <Feather name="calendar" size={32} color="#4289f4ff" />
                <Text style={styles.count}>{halfDays}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: '#f0f7ff',
        borderRadius: 15,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 150,
        borderWidth: 1,
        borderColor: '#d6e9ff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    count: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginTop: 10,
    },
});

export default AttendanceTrackingCards;
