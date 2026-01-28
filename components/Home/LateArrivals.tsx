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
    employeeName?: string;
}

interface LateArrivalsProps {
    title: string;
    refreshKey?: number;
}

const LateArrivals: React.FC<LateArrivalsProps> = ({ title, refreshKey }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [arrivals, setArrivals] = useState<LateArrivalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchLateArrivals = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const response = await getEarlyLatePunchList({
                checkoutType: 'Late',
                limit: 10,
                sortBy: 'DateTime',
                sortOrder: 'desc'
            });

            if (response.status === 'Success' && response.data && response.data.length > 0) {
                const transformedData: LateArrivalData[] = response.data
                    .filter((item: any) => {
                        const checkoutType = item.CheckoutType?.toString().toLowerCase();
                        return checkoutType === 'late';
                    })
                    .map((item: any) => ({
                        id: item.EarlyLatePunchMasterID,
                        dateTime: item.DateTime,
                        reason: item.Reason || 'No reason provided',
                        employeeName: item.EmployeeName || 'Employee',
                    }));

                setArrivals(transformedData);
            } else {
                setArrivals([]);
            }
        } catch (error) {
            setArrivals([]);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    useFocusEffect(
        useCallback(() => {
            fetchLateArrivals();
        }, [fetchLateArrivals, refreshKey])
    );

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
                            {arrivals.map((arrival) => (
                                <View key={arrival.id} style={styles.card}>
                                    <View style={styles.iconContainer}>
                                        <Feather name="clock" size={24} color="#FF9800" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{arrival.employeeName}</Text>
                                        <View style={styles.detailsRow}>
                                            <Feather name="clock" size={14} color={colors.textSecondary} />
                                            <Text style={styles.detailText}>{arrival.dateTime}</Text>
                                        </View>
                                        <View style={styles.detailsRow}>
                                            <Feather name="info" size={14} color={colors.textSecondary} />
                                            <Text style={styles.detailText} numberOfLines={1}>
                                                {arrival.reason}
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
        gap: 10,
        paddingTop: 8,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    detailText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: 6,
        flex: 1,
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
