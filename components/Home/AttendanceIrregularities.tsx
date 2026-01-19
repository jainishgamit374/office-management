import type { AttendanceIrregularity } from '@/lib/attendanceIrregularities';
import { getApprovedEarlyCheckoutDetails } from '@/lib/attendanceIrregularities';
import { getLeaveApplicationsList, LeaveApplicationDetails } from '@/lib/leaves';
import { getMissingPunchDetails, MissPunchDetail } from '@/lib/missPunchList';
import { formatISTTime } from '@/lib/timezone';
import { getWFHApplicationsList, WFHRequest } from '@/lib/wfhApprovalHistory';
import { disapproveAll } from '@/lib/workflow';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AttendanceIrregularitiesProps {
    refreshKey?: number;
}

const AttendanceIrregularities: React.FC<AttendanceIrregularitiesProps> = ({ refreshKey }) => {
    const [lateCheckins, setLateCheckins] = useState<AttendanceIrregularity[]>([]);
    const [earlyCheckouts, setEarlyCheckouts] = useState<AttendanceIrregularity[]>([]);
    const [halfDays, setHalfDays] = useState<AttendanceIrregularity[]>([]);
    
    // New States
    const [missPunches, setMissPunches] = useState<MissPunchDetail[]>([]);
    const [wfhRequests, setWfhRequests] = useState<WFHRequest[]>([]);
    const [leaves, setLeaves] = useState<LeaveApplicationDetails[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIrregularities = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                irregularitiesRes,
                missPunchRes,
                wfhRes,
                leavesRes
            ] = await Promise.allSettled([
                getApprovedEarlyCheckoutDetails(),
                getMissingPunchDetails(),
                getWFHApplicationsList(),
                getLeaveApplicationsList({ status: 'All', limit: 50 }) // Fetch processed/pending leaves
            ]);

            // Handle Attendance Irregularities
            if (irregularitiesRes.status === 'fulfilled' && irregularitiesRes.value.status === 'Success') {
                setLateCheckins(irregularitiesRes.value.data.late_checkins || []);
                setEarlyCheckouts(irregularitiesRes.value.data.early_checkouts || []);
                setHalfDays(irregularitiesRes.value.data.half_days || []);
            } else if (irregularitiesRes.status === 'rejected') {
                console.error('Failed to fetch irregularities:', irregularitiesRes.reason);
            }

            // Handle Miss Punches
            if (missPunchRes.status === 'fulfilled' && missPunchRes.value.data) {
                setMissPunches(missPunchRes.value.data);
            }

            // Handle WFH Requests
            if (wfhRes.status === 'fulfilled' && wfhRes.value.data) {
                setWfhRequests(wfhRes.value.data);
            }

            // Handle Leaves
            if (leavesRes.status === 'fulfilled' && leavesRes.value.data) {
                // Determine if data is Summary or Details (API can return both based on params)
                // Assuming Details for now based on lib/leaves.ts types
                setLeaves(leavesRes.value.data as LeaveApplicationDetails[]);
            }

        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load attendance details');
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    const handleDisapprove = async (programId: number, tranId: number) => {
        Alert.alert(
            'Reject Request',
            'Are you sure you want to reject this request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await disapproveAll({ ProgramID: programId, TranID: tranId });
                            Alert.alert('Success', 'Request rejected successfully');
                            fetchIrregularities(); // Refresh list
                        } catch (error: any) {
                            const errorMessage = error.message || 'Failed to reject request';
                            if (errorMessage.includes('No approval rights')) {
                                Alert.alert('Permission Denied', 'You do not have permission to reject this request.');
                            } else {
                                Alert.alert('Error', errorMessage);
                            }
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            fetchIrregularities();
        }, [fetchIrregularities, refreshKey])
    );

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            day: '2-digit', 
            month: 'short',
            year: 'numeric'
        });
    };

    // Helper to extract date YYYY-MM-DD from various formats
    const getDateString = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
    };

    // Group all items by date
    const groupedByDate = useMemo(() => {
        const grouped: Record<string, {
            date: string;
            lateCheckIn?: AttendanceIrregularity;
            earlyCheckOut?: AttendanceIrregularity;
            halfDay?: AttendanceIrregularity;
            missPunches: MissPunchDetail[];
            wfhRequests: WFHRequest[];
            leaves: LeaveApplicationDetails[];
        }> = {};

        const ensureDateEntry = (date: string) => {
            if (!date) return;
            if (!grouped[date]) {
                grouped[date] = { 
                    date, 
                    missPunches: [], 
                    wfhRequests: [], 
                    leaves: [] 
                };
            }
            return grouped[date];
        };

        // 1. Irregularities
        lateCheckins.forEach(item => {
            const entry = ensureDateEntry(item.attdate);
            if (entry) entry.lateCheckIn = item;
        });

        earlyCheckouts.forEach(item => {
            const entry = ensureDateEntry(item.attdate);
            if (entry) entry.earlyCheckOut = item;
        });

        halfDays.forEach(item => {
            const entry = ensureDateEntry(item.attdate);
            if (entry) entry.halfDay = item;
        });

        // 2. Miss Punches
        missPunches.forEach(item => {
            const date = getDateString(item.datetime);
            const entry = ensureDateEntry(date);
            if (entry) entry.missPunches.push(item);
        });

        // 3. WFH Requests
        wfhRequests.forEach(item => {
            const date = getDateString(item.DateTime);
            const entry = ensureDateEntry(date);
            if (entry) entry.wfhRequests.push(item);
        });

        // 4. Leaves (Expand ranges)
        leaves.forEach(item => {
            const start = new Date(item.StartDate);
            const end = new Date(item.EndDate);
            
            // Limit range to avoid infinite loops on bad data
            const maxDays = 30; 
            let count = 0;
            
            for (let d = new Date(start); d <= end && count < maxDays; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const entry = ensureDateEntry(dateStr);
                if (entry) entry.leaves.push(item);
                count++;
            }
        });

        return Object.values(grouped).sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [lateCheckins, earlyCheckouts, halfDays, missPunches, wfhRequests, leaves]);

    // Track expanded days by date string
    const [expandedDates, setExpandedDates] = useState<string[]>([]);
    
    // Collapse state for the entire section
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Calculated total
    const totalIrregularities = groupedByDate.length;

    const toggleExpand = (date: string) => {
        setExpandedDates(prev => 
            prev.includes(date) 
                ? prev.filter(d => d !== date)
                : [...prev, date]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { borderBottomWidth: 0 }]}>
                    <Feather name="activity" size={20} color="#FF9800" />
                    <Text style={styles.title}>All Attendance Events</Text>
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
                <View style={[styles.header, { borderBottomWidth: 0 }]}>
                    <Feather name="alert-triangle" size={20} color="#FF5252" />
                    <Text style={styles.title}>Attendance Events</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            </View>
        );
    }

    if (totalIrregularities === 0) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { borderBottomWidth: 0 }]}>
                    <Feather name="check-circle" size={20} color="#4CAF50" />
                    <Text style={[styles.title, { color: '#4CAF50' }]}>No Irregularities</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Feather name="smile" size={32} color="#4CAF50" />
                    <Text style={[styles.emptyText, { color: '#4CAF50' }]}>Your attendance is spotless!</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header} 
                onPress={() => setIsCollapsed(!isCollapsed)}
                activeOpacity={0.7}
            >
                <View style={styles.headerTitleRow}>
                    <Feather name="calendar" size={20} color="#4A90FF" />
                    <Text style={styles.title}>Attendance & Requests ({totalIrregularities})</Text>
                </View>
                <Feather 
                    name={isCollapsed ? "chevron-down" : "chevron-up"} 
                    size={20} 
                    color="#666" 
                />
            </TouchableOpacity>

            {!isCollapsed && (
                <View style={styles.listContainer}>
                    {groupedByDate.map((day, index) => {
                        const isExpanded = expandedDates.includes(day.date);
                        return (
                            <View key={`day-${index}`} style={styles.card}>
                                {/* Expandable Header */}
                                <React.Fragment> 
                                    <Text
                                        onPress={() => toggleExpand(day.date)}
                                        style={styles.touchableHeader}
                                    >
                                        <View style={styles.cardHeaderContent}>
                                            <View style={styles.dateContainer}>
                                                <Feather name="calendar" size={14} color="#666" />
                                                <Text style={styles.dateText}>{formatDate(day.date)}</Text>
                                            </View>
                                            <Feather 
                                                name={isExpanded ? "chevron-up" : "chevron-down"} 
                                                size={20} 
                                                color="#999" 
                                            />
                                        </View>
                                    </Text>
                                </React.Fragment>

                                {/* Content Sections */}
                                {isExpanded && (
                                    <View style={styles.cardContent}>
                                        
                                        {/* 1. Leaves */}
                                        {day.leaves.length > 0 && day.leaves.map((leave, i) => (
                                            <View key={`leave-${i}`} style={[styles.eventRow, styles.leaveRow]}>
                                                <View style={styles.eventRowLeft}>
                                                    <Feather name="sun" size={16} color="#FF9800" />
                                                    <View style={styles.eventInfo}>
                                                        <Text style={styles.eventTitle}>
                                                            Leave: {leave.LeaveType} ({leave.ApprovalStatus})
                                                        </Text>
                                                        <Text style={styles.eventSubtitle}>{leave.Reason}</Text>
                                                    </View>
                                                </View>
                                                {!['Rejected', 'Cancelled'].includes(leave.ApprovalStatus) && (
                                                    <TouchableOpacity 
                                                        onPress={() => handleDisapprove(1, leave.LeaveApplicationMasterID)}
                                                        style={styles.rejectButton}
                                                    >
                                                        <Feather name="x-circle" size={18} color="#FF5252" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}

                                        {/* 2. WFH */}
                                        {day.wfhRequests.length > 0 && day.wfhRequests.map((wfh, i) => (
                                            <View key={`wfh-${i}`} style={[styles.eventRow, styles.wfhRow]}>
                                                <View style={styles.eventRowLeft}>
                                                    <Feather name="home" size={16} color="#4A90FF" />
                                                    <View style={styles.eventInfo}>
                                                        <Text style={styles.eventTitle}>
                                                            WFH: {wfh.IsHalfDay ? 'Half Day' : 'Full Day'} ({wfh.ApprovalStatus})
                                                        </Text>
                                                        <Text style={styles.eventSubtitle}>{wfh.Reason}</Text>
                                                    </View>
                                                </View>
                                                {wfh.ApprovalStatus !== 'Rejected' && (
                                                    <TouchableOpacity 
                                                        onPress={() => handleDisapprove(3, wfh.WorkFromHomeReqMasterID)}
                                                        style={styles.rejectButton}
                                                    >
                                                        <Feather name="x-circle" size={18} color="#FF5252" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}

                                        {/* 3. Miss Punches */}
                                        {day.missPunches.length > 0 && day.missPunches.map((punch, i) => (
                                            <View key={`mp-${i}`} style={[styles.eventRow, styles.missPunchRow]}>
                                                <View style={styles.eventRowLeft}>
                                                    <Feather name="alert-circle" size={16} color="#F44336" />
                                                    <View style={styles.eventInfo}>
                                                        <Text style={styles.eventTitle}>
                                                            Missed Punch {punch.PunchType} ({punch.approval_status})
                                                        </Text>
                                                        <Text style={styles.eventSubtitle}>{punch.reason}</Text>
                                                    </View>
                                                </View>
                                                {punch.approval_status !== 'Rejected' && (
                                                    <TouchableOpacity 
                                                        onPress={() => handleDisapprove(4, punch.MissPunchReqMasterID)}
                                                        style={styles.rejectButton}
                                                    >
                                                        <Feather name="x-circle" size={18} color="#FF5252" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}

                                        {/* 4. Irregularities (Late/Early/HalfDay) */}
                                        {day.lateCheckIn && (
                                            <View style={[styles.eventRow, styles.lateRow]}>
                                                <View style={styles.eventRowLeft}>
                                                    <Feather name="clock" size={16} color="#F44336" />
                                                    <View style={styles.eventInfo}>
                                                        <Text style={styles.eventTitle}>Late Check-in</Text>
                                                        <Text style={styles.eventSubtitle}>
                                                            {formatISTTime(day.lateCheckIn.intime)} (Expected 09:30 AM)
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                         {day.earlyCheckOut && (
                                            <View style={[styles.eventRow, styles.earlyRow]}>
                                                <View style={styles.eventRowLeft}>
                                                    <Feather name="clock" size={16} color="#FF9800" />
                                                    <View style={styles.eventInfo}>
                                                        <Text style={styles.eventTitle}>Early Check-out</Text>
                                                        <Text style={styles.eventSubtitle}>
                                                            {formatISTTime(day.earlyCheckOut.outtime)} (Expected 06:30 PM)
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                         {day.halfDay && !day.lateCheckIn && !day.earlyCheckOut && (
                                            <View style={[styles.eventRow, styles.halfDayRow]}>
                                                <View style={styles.eventRowLeft}>
                                                    <Feather name="pie-chart" size={16} color="#2196F3" />
                                                    <View style={styles.eventInfo}>
                                                        <Text style={styles.eventTitle}>Half Day</Text>
                                                        <Text style={styles.eventSubtitle}>
                                                            {formatISTTime(day.halfDay.intime)} - {formatISTTime(day.halfDay.outtime)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )}

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
        marginHorizontal: 16,
        marginBottom: 10,
        marginTop: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        backgroundColor: '#fff',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    listContainer: {
        padding: 16,
        gap: 12,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        backgroundColor: '#FFF',
        overflow: 'hidden',
    },
    // Used inside the text press handler or can use TouchableOpacity
    touchableHeader: {
        width: '100%',
    },
    cardHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        width: '100%',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#555',
    },
    cardContent: {
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    eventRowLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        flex: 1,
    },
    eventInfo: {
        flex: 1,
    },
    rejectButton: {
        padding: 4,
    },
    eventTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    eventSubtitle: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
    },
    
    // Type specific styles
    leaveRow: {
        backgroundColor: '#FFF8E1',
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800',
    },
    wfhRow: {
        backgroundColor: '#E3F2FD',
        borderLeftWidth: 3,
        borderLeftColor: '#4A90FF',
    },
    missPunchRow: {
        backgroundColor: '#FFEBEE',
        borderLeftWidth: 3,
        borderLeftColor: '#F44336',
    },
    lateRow: {
        backgroundColor: '#FFEBEE',
        borderLeftWidth: 3,
        borderLeftColor: '#F44336',
    },
    earlyRow: {
        backgroundColor: '#FFF3E0',
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800',
    },
    halfDayRow: {
        backgroundColor: '#E3F2FD',
        borderLeftWidth: 3,
        borderLeftColor: '#2196F3',
    },
});

export default AttendanceIrregularities;
