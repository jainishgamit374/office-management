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
            <View style={styles.summaryHeader}>
                <Feather name="check-circle" size={24} color="#4CAF50" />
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Today's Summary</Text>
            </View>

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

                {/* Bottom: Tasks Completed - Full Width */}
                <View style={[styles.bottomRow, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#F5F5F5' }]}>
                    <View style={[styles.taskIcon, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#E0F7FA' }]}>
                        <Feather name="check-square" size={16} color="#00BCD4" />
                    </View>
                    <Text style={[styles.taskLabel, { color: colors.textSecondary }]}>Tasks Completed</Text>
                    <Text style={[styles.taskValue, { color: colors.text }]}>
                        {tasksCompleted} {tasksCompleted === 1 ? 'task' : 'tasks'}
                    </Text>
                </View>

                {/* Overtime (if any) - shown as badge */}
                {overtimeHours && overtimeHours !== '0h 0m' && (
                    <View style={styles.overtimeBadge}>
                        <Feather name="zap" size={14} color="#9C27B0" />
                        <Text style={styles.overtimeText}>+{overtimeHours} overtime</Text>
                    </View>
                )}

                {/* Location Information */}
                {(punchInLocation || punchOutLocation) && (
                    <View style={[styles.locationContainer, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#F9F9F9' }]}>
                        <View style={styles.locationHeader}>
                            <Feather name="map-pin" size={16} color="#FF9800" />
                            <Text style={[styles.locationTitle, { color: colors.text }]}>Location Details</Text>
                        </View>
                        <View style={styles.locationContent}>
                            {punchInLocation && (
                                <View style={styles.locationItem}>
                                    <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Check-In:</Text>
                                    <Text style={[styles.locationValue, { color: colors.text }]}>
                                        {punchInLocation.latitude.toFixed(6)}, {punchInLocation.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            )}
                            {punchOutLocation && (
                                <View style={styles.locationItem}>
                                    <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Check-Out:</Text>
                                    <Text style={[styles.locationValue, { color: colors.text }]}>
                                        {punchOutLocation.latitude.toFixed(6)}, {punchOutLocation.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
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
    // Center: Working Hours
    centerBox: {
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    workingHoursIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    workingHoursLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    workingHoursValue: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    // Bottom: Tasks
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginHorizontal: -16,
        marginTop: 8,
        borderRadius: 12,

    },
    taskIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    taskValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Overtime Badge
    overtimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F3E5F5',
        borderRadius: 12,
        alignSelf: 'center',
        marginTop: 4,
    },
    overtimeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9C27B0',
    },
    // Location Styles
    locationContainer: {
        marginTop: 12,
        borderRadius: 12,
        padding: 12,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    locationTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    locationContent: {
        gap: 8,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationLabel: {
        fontSize: 11,
        fontWeight: '500',
        width: 80,
    },
    locationValue: {
        fontSize: 11,
        fontWeight: '400',
        flex: 1,
    },
});

export default Checkoutdets;