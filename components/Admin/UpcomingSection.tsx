// components/Admin/UpcomingSection.tsx
import { LeaveRequest, WFHRequest } from '@/lib/adminApi';
import Feather from '@expo/vector-icons/Feather';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import UpcomingCard from './UpcomingCard';

interface UpcomingSectionProps {
    upcomingLeaves: LeaveRequest[];
    upcomingWFH: WFHRequest[];
}

const UpcomingSection: React.FC<UpcomingSectionProps> = ({
    upcomingLeaves,
    upcomingWFH,
}) => {
    const formatDateRange = useMemo(() => {
        return (fromDate: string, toDate: string): string => {
            try {
                const from = new Date(fromDate);
                const to = new Date(toDate);

                if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                    return 'Invalid Date';
                }

                const fromStr = from.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });
                const toStr = to.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });
                return `${fromStr} - ${toStr}`;
            } catch (error) {
                console.error('Date range formatting error:', error);
                return 'Invalid Date';
            }
        };
    }, []);

    const formatDate = useMemo(() => {
        return (dateStr: string): string => {
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                    return 'Invalid Date';
                }
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return 'Invalid Date';
            }
        };
    }, []);

    const hasLeaves = Array.isArray(upcomingLeaves) && upcomingLeaves.length > 0;
    const hasWFH = Array.isArray(upcomingWFH) && upcomingWFH.length > 0;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Feather name="calendar" size={20} color="#8B5CF6" />
                <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                >
                    Upcoming Schedule
                </Text>
            </View>
            <View style={styles.upcomingRow}>
                <View style={styles.upcomingColumn}>
                    <View style={styles.upcomingHeader}>
                        <View style={styles.headerIconContainer}>
                            <Feather name="calendar" size={18} color="#4A90FF" />
                        </View>
                        <Text style={styles.upcomingTitle}>Leaves</Text>
                    </View>
                    {hasLeaves ? (
                        upcomingLeaves.map((leave) => (
                            <UpcomingCard
                                key={`leave-${leave.id}`}
                                employeeName={leave.employee_name || 'Unknown'}
                                dateRange={formatDateRange(leave.from_date, leave.to_date)}
                                type="leave"
                            />
                        ))
                    ) : (
                        <View style={styles.upcomingPlaceholder}>
                            <View style={styles.placeholderAvatar}>
                                <Text style={styles.placeholderAvatarText}>JS</Text>
                            </View>
                            <View style={styles.placeholderInfo}>
                                <Text style={styles.placeholderName}>Jake S.</Text>
                                <Text style={styles.placeholderDate}>Apr 25 - Apr 26</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.upcomingColumn}>
                    <View style={styles.upcomingHeader}>
                        <View style={styles.headerIconContainer}>
                            <Feather name="home" size={18} color="#4A90FF" />
                        </View>
                        <Text style={styles.upcomingTitle}>WFH</Text>
                    </View>
                    {hasWFH ? (
                        upcomingWFH.map((wfh) => (
                            <UpcomingCard
                                key={`wfh-${wfh.id}`}
                                employeeName={wfh.employee_name || 'Unknown'}
                                dateRange={formatDate(wfh.date)}
                                type="wfh"
                            />
                        ))
                    ) : (
                        <View style={styles.upcomingPlaceholder}>
                            <View style={styles.placeholderAvatar}>
                                <Text style={styles.placeholderAvatarText}>SM</Text>
                            </View>
                            <View style={styles.placeholderInfo}>
                                <Text style={styles.placeholderName}>Sarah M.</Text>
                                <Text style={styles.placeholderDate}>Apr 28</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default React.memo(UpcomingSection, (prevProps, nextProps) => {
    return (
        prevProps.upcomingLeaves.length === nextProps.upcomingLeaves.length &&
        prevProps.upcomingWFH.length === nextProps.upcomingWFH.length &&
        prevProps.upcomingLeaves.every((prev, index) =>
            prev.id === nextProps.upcomingLeaves[index]?.id
        ) &&
        prevProps.upcomingWFH.every((prev, index) =>
            prev.id === nextProps.upcomingWFH[index]?.id
        )
    );
});

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.3,
    },
    upcomingRow: {
        flexDirection: 'row',
        gap: 12,
    },
    upcomingColumn: {
        flex: 1,
    },
    upcomingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    headerIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    upcomingTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        letterSpacing: 0.2,
    },
    upcomingPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    placeholderAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    placeholderAvatarText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A90FF',
    },
    placeholderInfo: {
        flex: 1,
    },
    placeholderName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    placeholderDate: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});
