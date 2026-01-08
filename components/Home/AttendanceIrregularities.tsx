import type { AttendanceIrregularity } from '@/lib/attendanceIrregularities';
import { getApprovedEarlyCheckoutDetails } from '@/lib/attendanceIrregularities';
import { formatISTTime } from '@/lib/timezone';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const AttendanceIrregularities = () => {
    const [lateCheckins, setLateCheckins] = useState<AttendanceIrregularity[]>([]);
    const [earlyCheckouts, setEarlyCheckouts] = useState<AttendanceIrregularity[]>([]);
    const [halfDays, setHalfDays] = useState<AttendanceIrregularity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIrregularities = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getApprovedEarlyCheckoutDetails();

            if (response.status === 'Success') {
                setLateCheckins(response.data.late_checkins || []);
                setEarlyCheckouts(response.data.early_checkouts || []);
                setHalfDays(response.data.half_days || []);
            }
        } catch (err: any) {
            console.error('Error fetching irregularities:', err);
            setError(err.message || 'Failed to load attendance irregularities');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchIrregularities();
        }, [fetchIrregularities])
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            day: '2-digit', 
            month: 'short',
            year: 'numeric'
        });
    };

    const totalIrregularities = lateCheckins.length + earlyCheckouts.length + halfDays.length;

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Feather name="alert-triangle" size={20} color="#FF9800" />
                    <Text style={styles.title}>Attendance Alerts</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF9800" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Feather name="alert-triangle" size={20} color="#FF9800" />
                    <Text style={styles.title}>Attendance Alerts</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Feather name="alert-circle" size={32} color="#999" />
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            </View>
        );
    }

    if (totalIrregularities === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Feather name="check-circle" size={20} color="#4CAF50" />
                    <Text style={[styles.title, { color: '#4CAF50' }]}>All Good!</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Feather name="smile" size={32} color="#4CAF50" />
                    <Text style={styles.emptyText}>No attendance irregularities</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Feather name="alert-triangle" size={20} color="#FF9800" />
                <Text style={styles.title}>Attendance Alerts</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{totalIrregularities}</Text>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {/* Late Check-ins */}
                {lateCheckins.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="clock" size={16} color="#FF5252" />
                            <Text style={styles.sectionTitle}>Late Check-ins ({lateCheckins.length})</Text>
                        </View>
                        {lateCheckins.map((item, index) => (
                            <View key={`late-${index}`} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.dateText}>{formatDate(item.attdate)}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: '#FFEBEE' }]}>
                                        <Text style={[styles.statusText, { color: '#FF5252' }]}>Late</Text>
                                    </View>
                                </View>
                                <View style={styles.cardContent}>
                                    <View style={styles.timeRow}>
                                        <Feather name="log-in" size={14} color="#666" />
                                        <Text style={styles.timeLabel}>Check-in:</Text>
                                        <Text style={styles.timeValue}>{formatISTTime(item.intime)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Early Checkouts */}
                {earlyCheckouts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="log-out" size={16} color="#FF9800" />
                            <Text style={styles.sectionTitle}>Early Checkouts ({earlyCheckouts.length})</Text>
                        </View>
                        {earlyCheckouts.map((item, index) => (
                            <View key={`early-${index}`} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.dateText}>{formatDate(item.attdate)}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}>
                                        <Text style={[styles.statusText, { color: '#FF9800' }]}>Early</Text>
                                    </View>
                                </View>
                                <View style={styles.cardContent}>
                                    <View style={styles.timeRow}>
                                        <Feather name="log-in" size={14} color="#666" />
                                        <Text style={styles.timeLabel}>Check-in:</Text>
                                        <Text style={styles.timeValue}>{formatISTTime(item.intime)}</Text>
                                    </View>
                                    <View style={styles.timeRow}>
                                        <Feather name="log-out" size={14} color="#666" />
                                        <Text style={styles.timeLabel}>Check-out:</Text>
                                        <Text style={styles.timeValue}>{formatISTTime(item.outtime)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Half Days */}
                {halfDays.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="calendar" size={16} color="#2196F3" />
                            <Text style={styles.sectionTitle}>Half Days ({halfDays.length})</Text>
                        </View>
                        {halfDays.map((item, index) => (
                            <View key={`half-${index}`} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.dateText}>{formatDate(item.attdate)}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]}>
                                        <Text style={[styles.statusText, { color: '#2196F3' }]}>Half Day</Text>
                                    </View>
                                </View>
                                <View style={styles.cardContent}>
                                    <View style={styles.timeRow}>
                                        <Feather name="log-in" size={14} color="#666" />
                                        <Text style={styles.timeLabel}>Check-in:</Text>
                                        <Text style={styles.timeValue}>{formatISTTime(item.intime)}</Text>
                                    </View>
                                    <View style={styles.timeRow}>
                                        <Feather name="log-out" size={14} color="#666" />
                                        <Text style={styles.timeLabel}>Check-out:</Text>
                                        <Text style={styles.timeValue}>{formatISTTime(item.outtime)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FFE0B2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        maxHeight: 400,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF9800',
        flex: 1,
    },
    badge: {
        backgroundColor: '#FF9800',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    scrollView: {
        maxHeight: 320,
    },
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    card: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardContent: {
        gap: 6,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
        width: 70,
    },
    timeValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        gap: 8,
    },
    emptyText: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
});

export default AttendanceIrregularities;
