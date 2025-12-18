import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LeaveDetail {
    id: number;
    name: string;
    leaveType: string;
    dates: string;
    duration: string;
    reason: string;
    status: 'Pending' | 'Approved';
}

interface UpcomingLeavesProps {
    leaves?: LeaveDetail[];
    expandedLeave: number | null;
    onToggleExpand: (id: number | null) => void;
    onAnimatePress: (animKey: 'leave1' | 'leave2' | 'leave3', callback: () => void) => void;
    scaleAnims: {
        leave1: Animated.Value;
        leave2: Animated.Value;
        leave3: Animated.Value;
    };
}

const defaultLeaves: LeaveDetail[] = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        leaveType: 'Sick Leave',
        dates: '12-15 Dec',
        duration: '12 Dec - 15 Dec (4 days)',
        reason: 'Medical treatment and recovery',
        status: 'Pending',
    },
    {
        id: 2,
        name: 'Priya Sharma',
        leaveType: 'Casual Leave',
        dates: '18 Dec',
        duration: '18 Dec (1 day)',
        reason: 'Personal work',
        status: 'Pending',
    },
    {
        id: 3,
        name: 'Amit Desai',
        leaveType: 'Privilege Leave',
        dates: '20-22 Dec',
        duration: '20 Dec - 22 Dec (3 days)',
        reason: 'Family function and vacation',
        status: 'Pending',
    },
];

const UpcomingLeaves: React.FC<UpcomingLeavesProps> = ({
    leaves = defaultLeaves,
    expandedLeave,
    onToggleExpand,
    onAnimatePress,
    scaleAnims,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Upcoming Leaves</Text>
            </View>

            <View style={styles.grid}>
                {leaves.map((leave, index) => {
                    const animKey = `leave${leave.id}` as 'leave1' | 'leave2' | 'leave3';

                    return (
                        <View key={leave.id} style={styles.expandableCard}>
                            <Animated.View style={{ transform: [{ scale: scaleAnims[animKey] }] }}>
                                <TouchableOpacity
                                    style={styles.card}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        onAnimatePress(animKey, () =>
                                            onToggleExpand(expandedLeave === leave.id ? null : leave.id)
                                        )
                                    }
                                >
                                    <View style={styles.profileImage}>
                                        <Feather name="user" size={24} color="#4169E1" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{leave.name}</Text>
                                        <Text style={styles.cardSubtitle}>
                                            {leave.leaveType} • {leave.dates}
                                        </Text>
                                    </View>
                                    <View style={styles.statusIcon}>
                                        <Feather
                                            name={expandedLeave === leave.id ? 'chevron-up' : 'chevron-down'}
                                            size={24}
                                            color="#666"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>

                            {expandedLeave === leave.id && (
                                <View style={styles.expandedContent}>
                                    <View style={styles.detailRow}>
                                        <Feather name="calendar" size={16} color="#4289f4ff" />
                                        <Text style={styles.detailText}>Duration: {leave.duration}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Feather name="file-text" size={16} color="#4289f4ff" />
                                        <Text style={styles.detailText}>Reason: {leave.reason}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Feather name="clock" size={16} color="#ff9800" />
                                        <Text style={styles.detailTextPending}>Status: {leave.status}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fafcff',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: '#e3f2fd',
        // Shadow for iOS
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        // Shadow for Android
        elevation: 4,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1565c0',
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'column',
        gap: 1,
    },
    expandableCard: {
        width: '100%',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cececeff',
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E0E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#a0a0a0ff',
    },
    statusIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedContent: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#cececeff',
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    detailTextPending: {
        fontSize: 14,
        color: '#ff9800',
        fontWeight: '600',
        flex: 1,
    },
});

export default UpcomingLeaves;
