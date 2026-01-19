import { getUpcomingWFH } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WFHDetail {
    id: number;
    name: string;
    dates: string;
    duration: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Awaiting Approve';
}

interface UpcomingWFHsProps {
    expandedLeave: number | null;
    onToggleExpand: (id: number | null) => void;
    onAnimatePress: (animKey: 'wfhMain' | 'wfh1' | 'wfh2' | 'wfh3', callback: () => void) => void;
    scaleAnims: {
        wfhMain: Animated.Value;
        wfh1: Animated.Value;
        wfh2: Animated.Value;
        wfh3: Animated.Value;
    };
    refreshKey?: number;
}

const UpcomingWFHs: React.FC<UpcomingWFHsProps> = ({
    expandedLeave,
    onToggleExpand,
    onAnimatePress,
    scaleAnims,
    refreshKey,
}) => {
    const [wfhs, setWfhs] = useState<WFHDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWFHApplications = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getUpcomingWFH();

            // Transform API response to component format
            const wfhData: WFHDetail[] = response.data.map((item: any, index: number) => {
                // Map approval status
                let status: 'Pending' | 'Approved' | 'Awaiting Approve' = 'Pending';
                const statusLower = item.approval_status?.toLowerCase() || '';
                
                if (statusLower.includes('await')) {
                    status = 'Awaiting Approve';
                } else if (statusLower.includes('approve')) {
                    status = 'Approved';
                }

                // Format date (format: "DD-MM-YYYY")
                const formatDate = (dateStr: string) => {
                    if (!dateStr) return '';
                    const [day, month, year] = dateStr.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                };

                const formattedDate = formatDate(item.wfh_date);

                return {
                    id: index + 1,
                    name: item.employee_name || 'Employee',
                    dates: formattedDate,
                    duration: item.duration || 'Full Day',
                    reason: 'Work from home', // API doesn't provide reason field
                    status,
                };
            })
            .filter(wfh => wfh.status === 'Approved'); // ✅ Only show approved WFH requests

            setWfhs(wfhData);
            console.log('✅ Approved WFH applications loaded:', wfhData.length);
        } catch (error) {
            console.error('Failed to fetch WFH applications:', error);
            setWfhs([]);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchWFHApplications();
        }, [fetchWFHApplications, refreshKey])
    );

    // Check if main section is expanded
    // Use a special ID (-1) for the main WFH section to avoid conflicts with actual WFH IDs
    const MAIN_WFH_ID = -1;
    const isMainExpanded = expandedLeave === MAIN_WFH_ID || wfhs.some(wfh => expandedLeave === wfh.id);

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
                            onAnimatePress('wfhMain', () => onToggleExpand(isMainExpanded ? null : MAIN_WFH_ID))
                        }
                    >
                        <Feather name={isMainExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#4169E1" />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {isMainExpanded && (
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#4169E1" />
                        <Text style={styles.loadingText}>Loading WFH applications...</Text>
                    </View>
                ) : wfhs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="calendar" size={32} color="#ccc" />
                        <Text style={styles.emptyText}>No WFH applications found</Text>
                    </View>
                ) : (
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
                                                onToggleExpand(expandedLeave === wfh.id ? MAIN_WFH_ID : wfh.id)
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
                )
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
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
});

export default UpcomingWFHs;
