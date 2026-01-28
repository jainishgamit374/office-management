import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getEarlyLatePunchList } from '@/lib/earlyLatePunch';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EarlyCheckoutData {
    id: number;
    dateTime: string;
    reason: string;
    createdDate: string;
    isActive: boolean;
}

interface EarlyCheckoutsProps {
    title: string;
    refreshKey?: number;
}

const EarlyCheckouts: React.FC<EarlyCheckoutsProps> = ({ title, refreshKey }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [checkouts, setCheckouts] = useState<EarlyCheckoutData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchEarlyCheckouts = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔄 [EarlyCheckouts] Fetching from /early-late-punch/ with checkoutType=Early');
            
            // Fetch early checkout records (CheckoutType='Early')
            const response = await getEarlyLatePunchList({
                checkoutType: 'Early',
                limit: 10,
                sortBy: 'DateTime',
                sortOrder: 'desc'
            });

            console.log('📡 [EarlyCheckouts] Raw API response:', JSON.stringify(response, null, 2));

            if (response.status === 'Success' && response.data && response.data.length > 0) {
                console.log(`📊 [EarlyCheckouts] Total items received: ${response.data.length}`);
                
                // Filter for today's records only
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
                
                // Log each item's CheckoutType for debugging
                response.data.forEach((item: any, index: number) => {
                    console.log(`🔍 [EarlyCheckouts] Item ${index}: ID=${item.EarlyLatePunchMasterID}, CheckoutType="${item.CheckoutType}", Date="${item.DateTime.split(' ')[0]}"`);
                });

                const transformedData: EarlyCheckoutData[] = response.data
                    .filter((item: any) => {
                        // Check if the DateTime is today AND CheckoutType is Early
                        const itemDate = item.DateTime.split(' ')[0]; // Get date part
                        const checkoutType = item.CheckoutType?.toString().toLowerCase();
                        const isToday = itemDate === todayStr;
                        const isEarly = checkoutType === 'early';
                        
                        if (!isEarly) {
                            console.log(`⚠️ [EarlyCheckouts] Filtering out item ${item.EarlyLatePunchMasterID} with CheckoutType="${item.CheckoutType}"`);
                        } else if (!isToday) {
                            console.log(`⚠️ [EarlyCheckouts] Filtering out item ${item.EarlyLatePunchMasterID} - not today (${itemDate} vs ${todayStr})`);
                        }
                        
                        return isToday && isEarly;
                    })
                    .map((item: any) => ({
                        id: item.EarlyLatePunchMasterID,
                        dateTime: item.DateTime,
                        reason: item.Reason,
                        createdDate: item.CreatedDate,
                        isActive: item.IsActive,
                    }));

                console.log(`✅ [EarlyCheckouts] Filtered to ${transformedData.length} Early items for today`);
                setCheckouts(transformedData);
            } else {
                setCheckouts([]);
                console.log('ℹ️ [EarlyCheckouts] No data in response');
            }
        } catch (error: any) {
            console.error('❌ [EarlyCheckouts] Failed to fetch:', error);
            setCheckouts([]);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    // Fetch data on mount and when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchEarlyCheckouts();
        }, [fetchEarlyCheckouts, refreshKey])
    );

    const formatDateTime = (dateTimeStr: string): string => {
        try {
            // Handle format like "2025-04-20 12:00:28 PM"
            return dateTimeStr;
        } catch {
            return dateTimeStr;
        }
    };

    const getStatusColor = (status: string): string => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('approve') && !statusLower.includes('awaiting')) {
            return '#4CAF50'; // Green for approved
        } else if (statusLower.includes('awaiting') || statusLower.includes('pending')) {
            return '#FF9800'; // Orange for pending
        } else if (statusLower.includes('reject')) {
            return '#FF5252'; // Red for rejected
        }
        return '#9E9E9E'; // Gray for unknown
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>
                    {title} {checkouts.length > 0 && `(${checkouts.length})`}
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
                    ) : checkouts.length > 0 ? (
                        <View style={styles.grid}>
                            {checkouts.map((checkout, index) => (
                                <View key={checkout.id || index} style={styles.card}>
                                    <View style={styles.iconContainer}>
                                        <Feather name="log-out" size={24} color="#2196F3" />
                                    </View>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Early Checkout #{checkout.id}</Text>
                                        <View style={styles.detailsRow}>
                                            <Feather name="clock" size={14} color={colors.textSecondary} />
                                            <Text style={styles.detailText}>{formatDateTime(checkout.dateTime)}</Text>
                                        </View>
                                        <View style={styles.detailsRow}>
                                            <Feather name="info" size={14} color={colors.textSecondary} />
                                            <Text style={styles.detailText} numberOfLines={1}>
                                                {checkout.reason}
                                            </Text>
                                        </View>
                                        <View style={styles.statusContainer}>
                                            <View
                                                style={[
                                                    styles.statusDot,
                                                    { backgroundColor: checkout.isActive ? '#4CAF50' : '#9E9E9E' },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: checkout.isActive ? '#4CAF50' : '#9E9E9E' },
                                                ]}
                                            >
                                                {checkout.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Feather name="check-circle" size={32} color="#4CAF50" />
                            <Text style={styles.emptyText}>No one leaving early today</Text>
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
    cardHeader: {
        flex: 1,
        gap: 6,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
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

export default EarlyCheckouts;
