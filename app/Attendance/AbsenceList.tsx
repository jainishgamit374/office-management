import { getAbsenceData } from '@/lib/api';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const AbsenceList = () => {
    const [absenceData, setAbsenceData] = useState<{
        absent: number;
        absentees: string[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch absence data from API
    const fetchAbsenceData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('📅 Fetching absence data from API...');
            const response = await getAbsenceData();

            if (response.status === 'Success' && response.data) {
                setAbsenceData(response.data);
                console.log('✅ Absence data loaded:', response.data);
            } else {
                setAbsenceData(null);
            }
        } catch (err: any) {
            console.error('❌ Error fetching absence data:', err);
            setError(err.message || 'Failed to load absence data');
            setAbsenceData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchAbsenceData();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Feather name="user-x" size={28} color="#FF5252" />
                    </View>
                    <Text style={styles.headerTitle}>Today's Absences</Text>
                    <Text style={styles.headerSubtitle}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>

                {/* Loading State */}
                {isLoading && (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#FF5252" />
                        <Text style={styles.loadingText}>Loading absence data...</Text>
                    </View>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={48} color="#FF5252" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Data Display */}
                {!isLoading && !error && absenceData && (
                    <>
                        {/* Summary Card */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryIconContainer}>
                                <Feather name="users" size={32} color="#FF5252" />
                            </View>
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryLabel}>Total Absences</Text>
                                <Text style={styles.summaryValue}>{absenceData.absent}</Text>
                            </View>
                        </View>

                        {/* Absentees List */}
                        {absenceData.absentees.length > 0 ? (
                            <View style={styles.listContainer}>
                                <Text style={styles.sectionTitle}>Absent Employees</Text>
                                {absenceData.absentees.map((name, index) => (
                                    <View key={index} style={styles.absenteeCard}>
                                        <View style={styles.absenteeAvatar}>
                                            <Text style={styles.absenteeInitials}>
                                                {name
                                                    .split(' ')
                                                    .map(n => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </Text>
                                        </View>
                                        <View style={styles.absenteeInfo}>
                                            <Text style={styles.absenteeName}>{name}</Text>
                                            <View style={styles.absenteeStatus}>
                                                <View style={styles.statusDot} />
                                                <Text style={styles.statusText}>Absent</Text>
                                            </View>
                                        </View>
                                        <View style={styles.absenteeIcon}>
                                            <Feather name="user-x" size={20} color="#FF5252" />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Feather name="check-circle" size={48} color="#4CAF50" />
                                <Text style={styles.emptyText}>Perfect Attendance!</Text>
                                <Text style={styles.emptySubtext}>
                                    No absences recorded for today
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 20,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },

    // Summary Card
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    summaryIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    summaryContent: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FF5252',
    },

    // Section Title
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },

    // List Container
    listContainer: {
        marginBottom: 20,
    },

    // Absentee Card
    absenteeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    absenteeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    absenteeInitials: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF5252',
    },
    absenteeInfo: {
        flex: 1,
    },
    absenteeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    absenteeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
    },
    statusText: {
        fontSize: 13,
        color: '#FF5252',
        fontWeight: '500',
    },
    absenteeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Loading, Error, and Empty States
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    errorText: {
        fontSize: 15,
        color: '#FF5252',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
        marginTop: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default AbsenceList;
