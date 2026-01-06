import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WFHDetail {
    id: number;
    name: string;
    dates: string;
    duration: string;
    reason: string;
    status: 'Pending' | 'Approved';
}

interface UpcomingWFHsProps {
    wfhs?: WFHDetail[];
    expandedLeave: number | null;
    onToggleExpand: (id: number | null) => void;
    onAnimatePress: (animKey: 'wfhMain' | 'wfh1' | 'wfh2' | 'wfh3', callback: () => void) => void;
    scaleAnims: {
        wfhMain: Animated.Value;
        wfh1: Animated.Value;
        wfh2: Animated.Value;
        wfh3: Animated.Value;
    };
}

const defaultWFHs: WFHDetail[] = [
    {
        id: 5,
        name: 'Vikram Singh',
        dates: '12-15 Dec',
        duration: '12 Dec - 15 Dec (4 days)',
        reason: 'Project work from home',
        status: 'Pending',
    },
    {
        id: 6,
        name: 'Anjali Mehta',
        dates: '16-18 Dec',
        duration: '16 Dec - 18 Dec (3 days)',
        reason: 'Remote client meetings',
        status: 'Pending',
    },
    {
        id: 7,
        name: 'Suresh Patel',
        dates: '20 Dec',
        duration: '20 Dec (1 day)',
        reason: 'Personal appointment',
        status: 'Pending',
    },
];

const UpcomingWFHs: React.FC<UpcomingWFHsProps> = ({
    wfhs = defaultWFHs,
    expandedLeave,
    onToggleExpand,
    onAnimatePress,
    scaleAnims,
}) => {
    const isMainExpanded = expandedLeave === 4 || expandedLeave === 5 || expandedLeave === 6 || expandedLeave === 7;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Upcoming WFHs</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: scaleAnims.wfhMain }] }}>
                    <TouchableOpacity
                        style={styles.toggleIcon}
                        activeOpacity={0.7}
                        onPress={() =>
                            onAnimatePress('wfhMain', () => onToggleExpand(isMainExpanded ? null : 4))
                        }
                    >
                        <Feather name={isMainExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#4169E1" />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {isMainExpanded && (
                <View style={styles.grid}>
                    {wfhs.map((wfh, index) => {
                        const animKey = `wfh${index + 1}` as 'wfh1' | 'wfh2' | 'wfh3';

                        return (
                            <View key={wfh.id} style={styles.expandableCard}>
                                <Animated.View style={{ transform: [{ scale: scaleAnims[animKey] }] }}>
                                    <TouchableOpacity
                                        style={styles.card}
                                        activeOpacity={0.7}
                                        onPress={() =>
                                            onAnimatePress(animKey, () =>
                                                onToggleExpand(expandedLeave === wfh.id ? 4 : wfh.id)
                                            )
                                        }
                                    >
                                        <View style={styles.profileImage}>
                                            <Feather name="user" size={24} color="#4169E1" />
                                        </View>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle}>{wfh.name}</Text>
                                            <Text style={styles.cardSubtitle}>WFH • {wfh.dates}</Text>
                                        </View>
                                        <View style={styles.statusIcon}>
                                            <Feather
                                                name={expandedLeave === wfh.id ? 'chevron-up' : 'chevron-down'}
                                                size={24}
                                                color="#666"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>

                                {expandedLeave === wfh.id && (
                                    <View style={styles.expandedContent}>
                                        <View style={styles.detailRow}>
                                            <Feather name="calendar" size={16} color="#4289f4ff" />
                                            <Text style={styles.detailText}>Duration: {wfh.duration}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Feather name="file-text" size={16} color="#4289f4ff" />
                                            <Text style={styles.detailText}>Reason: {wfh.reason}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Feather name="clock" size={16} color="#ff9800" />
                                            <Text style={styles.detailTextPending}>Status: {wfh.status}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 20,
        borderWidth: 1,
        backgroundColor: '#FFF',
        borderColor: '#fbfbfbff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    header: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1565c0',
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

export default UpcomingWFHs;
