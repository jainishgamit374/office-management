import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
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
    const { colors } = useTheme();
    const styles = createStyles(colors);
    
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

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    Upcoming WFHs {wfhs.length > 0 && `(${wfhs.length})`}
                </Text>
                <Feather 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.primary} 
                />
            </TouchableOpacity>

            {isExpanded && (
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading WFH applications...</Text>
                    </View>
                ) : wfhs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="calendar" size={32} color={colors.textTertiary} />
                        <Text style={styles.emptyText}>No WFH applications found</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {wfhs.map((wfh, index) => (
                            <View key={wfh.id || index} style={styles.card}>
                                <View style={styles.iconContainer}>
                                    <Feather name="home" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{wfh.name}</Text>
                                    <View style={styles.detailsRow}>
                                        <Feather name="calendar" size={14} color={colors.textSecondary} />
                                        <Text style={styles.detailText}>{wfh.dates}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Feather name="clock" size={14} color={colors.textSecondary} />
                                        <Text style={styles.detailText}>{wfh.duration}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'left',
    },
    grid: {
        flexDirection: 'column',
        gap: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default UpcomingWFHs;
