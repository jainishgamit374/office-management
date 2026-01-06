import { useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CheckoutDetailsProps {
    punchInTime: string | null;
    punchOutTime: string | null;
    workingHours: string | null;
    overtimeHours?: string | null;
    tasksCompleted?: number;
    punchInLocation?: { latitude: number; longitude: number } | null;
    punchOutLocation?: { latitude: number; longitude: number } | null;
}

const Checkoutdets: React.FC<CheckoutDetailsProps> = ({
    punchInTime,
    punchOutTime,
    workingHours,
    overtimeHours,
    tasksCompleted = 0,
    punchInLocation,
    punchOutLocation,
}) => {
    const { colors, theme } = useTheme();

    return (
        <View style={[styles.summaryCard, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff' }]}>
            <View style={styles.summaryContent}>
                {/* Top Row: Check-in, Working Hours, and Check-out */}
                <View style={styles.topRow}>
                    {/* Check-in */}
                    <View style={styles.timeBox}>
                        <View style={[styles.timeIcon, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#E3F2FD' }]}>
                            <Feather name="log-in" size={18} color="#2196F3" />
                        </View>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check-In</Text>
                        <Text style={[styles.timeValue, { color: colors.text }]}>
                            {punchInTime
                                ? new Date(punchInTime).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })
                                : '--'}
                        </Text>
                    </View>

                    {/* Working Hours */}
                    <View style={styles.timeBox}>
                        <View style={[styles.timeIcon, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#E8F5E9' }]}>
                            <Feather name="clock" size={18} color="#4CAF50" />
                        </View>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Working Hours</Text>
                        <Text style={[styles.timeValue, { color: '#4CAF50' }]}>
                            {workingHours || '--'}
                        </Text>
                    </View>

                    {/* Check-out */}
                    <View style={styles.timeBox}>
                        <View style={[styles.timeIcon, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#FFF3E0' }]}>
                            <Feather name="log-out" size={18} color="#FF9800" />
                        </View>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check-Out</Text>
                        <Text style={[styles.timeValue, { color: colors.text }]}>
                            {punchOutTime
                                ? new Date(punchOutTime).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })
                                : '--'}
                        </Text>
                    </View>
                </View>


            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    summaryCard: {
        marginTop: 15,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        paddingHorizontal: 10,
        paddingBottom: 10,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        width: '100%',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    summaryContent: {
        padding: 1,
        marginHorizontal: -10,
        paddingHorizontal: 10,
        paddingTop: 20,
        gap: 12,
    },
    // Top Row: Check-in and Check-out
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    timeBox: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    timeIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
        width: '100%',
    },
    timeValue: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },

});

export default Checkoutdets;