import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EmployeePerformanceScreen = () => {
    const { id } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Employee Performance</Text>
                <TouchableOpacity style={styles.headerRight}>
                    <Text style={styles.headerRightText}>Add Goal</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Top Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>JS</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>John Smith (ID: {id})</Text>
                            <Text style={styles.subtitle}>Senior Developer</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Rating: Exceeds Expectations</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Q4 Sales</Text>
                            <Text style={styles.statValue}>$150k / $120k</Text>
                            <Text style={styles.statGreen}>(125%)</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Projects Delivered</Text>
                            <Text style={styles.statValue}>4/5</Text>
                            <Text style={styles.statYellow}>(80%)</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Team Feedback</Text>
                            <Text style={styles.statValue}>4.8 / 5</Text>
                        </View>
                    </View>
                </View>

                {/* Trend */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quarterly Performance Trend</Text>
                        <TouchableOpacity>
                            <Text style={styles.link}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.trendPlaceholder}>
                        <Text style={styles.trendPlaceholderText}>
                            Chart placeholder (Q1–Q4 trend)
                        </Text>
                    </View>
                </View>

                {/* Recent Feedback */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Feedback</Text>
                        <TouchableOpacity>
                            <Text style={styles.link}>See All Feedback</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.feedbackRow}>
                        <Text style={styles.feedbackText}>
                            Great leadership on the "Phoenix" project. - Sarah L.
                        </Text>
                        <Text style={styles.feedbackMeta}>Today</Text>
                    </View>
                    <View style={styles.feedbackRow}>
                        <Text style={styles.feedbackText}>
                            Need to improve documentation consistency. - Manager
                        </Text>
                        <Text style={styles.feedbackMeta}>Yesterday</Text>
                    </View>
                </View>

                {/* Current Goals */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Current Goals</Text>
                        <TouchableOpacity>
                            <Text style={styles.link}>Set New Goal</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.goalRow}>
                        <Text style={styles.goalTitle}>Complete React Native Migration</Text>
                        <Text style={styles.goalMeta}>70% complete</Text>
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, { width: '70%' }]} />
                        </View>
                    </View>

                    <View style={styles.goalRow}>
                        <Text style={styles.goalTitle}>Mentor Junior Devs</Text>
                        <Text style={styles.goalMeta}>40% complete</Text>
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFillBlue, { width: '40%' }]} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EmployeePerformanceScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 8,
        backgroundColor: '#F2F2F7',
    },
    headerLeft: { padding: 4 },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: { padding: 4 },
    headerRightText: {
        color: '#007AFF',
        fontSize: 15,
    },

    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 24 },

    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1976D2',
    },
    profileInfo: { flex: 1 },
    name: { fontSize: 18, fontWeight: '700', color: '#111827' },
    subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    badge: {
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: '#E0F7FA',
        alignSelf: 'flex-start',
    },
    badgeText: { fontSize: 12, color: '#00796B', fontWeight: '600' },

    statsRow: {
        flexDirection: 'row',
        marginTop: 16,
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        marginRight: 8,
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    statLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
    statGreen: { fontSize: 11, color: '#10B981', marginTop: 2 },
    statYellow: { fontSize: 11, color: '#F59E0B', marginTop: 2 },

    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
    link: { fontSize: 13, color: '#007AFF' },

    trendPlaceholder: {
        height: 140,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendPlaceholderText: { fontSize: 13, color: '#6B7280' },

    feedbackRow: {
        marginTop: 10,
    },
    feedbackText: { fontSize: 13, color: '#111827' },
    feedbackMeta: {
        marginTop: 4,
        fontSize: 11,
        color: '#9CA3AF',
    },

    goalRow: {
        marginTop: 10,
    },
    goalTitle: { fontSize: 13, color: '#111827', fontWeight: '600' },
    goalMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    progressBg: {
        marginTop: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#22C55E',
    },
    progressFillBlue: {
        height: '100%',
        backgroundColor: '#3B82F6',
    },
});
