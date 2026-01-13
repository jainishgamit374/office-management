import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getEarlyLatePunchList } from '@/lib/earlyLatePunch';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LateArrivalData {
    id: number;
    dateTime: string;
    reason: string;
    createdDate: string;
    isActive: boolean;
}

interface LateArrivalsProps {
    title: string;
}

const LateArrivals: React.FC<LateArrivalsProps> = ({ title }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [arrivals, setArrivals] = useState<LateArrivalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchLateArrivals = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching late arrivals from /early-late-punch/...');
            
            // Fetch only Late checkout type (which represents late arrivals)
            const response = await getEarlyLatePunchList({
                checkoutType: 'Late',
                limit: 10,
                sortBy: 'DateTime',
                sortOrder: 'desc'
            });

            console.log('📡 Late arrivals response:', JSON.stringify(response, null, 2));

            if (response.status === 'Success' && response.data && response.data.length > 0) {
                const transformedData: LateArrivalData[] = response.data.map((item: any) => ({
                    id: item.EarlyLatePunchMasterID,
                    dateTime: item.DateTime,
                    reason: item.Reason,
                    createdDate: item.CreatedDate,
                    isActive: item.IsActive,
                }));

                setArrivals(transformedData);
                console.log('✅ Late arrivals loaded:', transformedData.length);
            } else {
                setArrivals([]);
                console.log('ℹ️ No late arrivals found');
            }
        } catch (error) {
            console.error('❌ Failed to fetch late arrivals:', error);
            setArrivals([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchLateArrivals();
        }, [fetchLateArrivals])
    );

    const formatDateTime = (dateTimeStr: string): string => {
        try {
            // Handle format like "2025-01-10 04:00:00 PM"
            return dateTimeStr;
        } catch {
            return dateTimeStr;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    {title} {arrivals.length > 0 && `(${arrivals.length})`}
                </Text>
                <Feather 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.primary} 
                />
            </TouchableOpacity>

            {isExpanded && (
                <>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    ) : arrivals.length > 0 ? (
                        <View style={styles.grid}>
                            {arrivals.map((arrival, index) => (
                                <View key={arrival.id || index} style={styles.card}>
                                    <View style={styles.iconContainer}>
                                        <Feather name="clock" size={24} color="#FF9800" />
                                    </View>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Late Arrival #{arrival.id}</Text>
                                        <View style={styles.detailsRow}>
                                            <Feather name="clock" size={14} color={colors.textSecondary} />
                                            <Text style={styles.detailText}>{formatDateTime(arrival.dateTime)}</Text>
                                        </View>
                                        <View style={styles.reasonRow}>
                                            <Feather name="info" size={14} color={colors.textSecondary} />
                                            <Text style={styles.reasonText} numberOfLines={1}>
                                                {arrival.reason}
                                            </Text>
                                        </View>
                                        <View style={styles.statusContainer}>
                                            <View
                                                style={[
                                                    styles.statusDot,
                                                    { backgroundColor: arrival.isActive ? '#4CAF50' : '#9E9E9E' },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: arrival.isActive ? '#4CAF50' : '#9E9E9E' },
                                                ]}
                                            >
                                                {arrival.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Feather name="check-circle" size={32} color="#4CAF50" />
                            <Text style={styles.emptyText}>No late arrivals</Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
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
    cardHeader: {
        flex: 1,
        gap: 6,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
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
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reasonText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
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

export default LateArrivals;
