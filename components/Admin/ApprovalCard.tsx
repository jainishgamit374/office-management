// components/Admin/ApprovalCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ApprovalCardProps {
    title: string;
    count?: number;
    days?: number;
    limit?: number;
    backgroundColor: string;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({
    title,
    count,
    days,
    limit,
    backgroundColor,
}) => {
    const getIconAndColor = () => {
        if (title.includes('Pending')) {
            return { icon: '⏳', color: '#FF9800' };
        } else if (title.includes('Leave')) {
            return { icon: '🌴', color: '#10B981' };
        } else if (title.includes('WFH')) {
            return { icon: '🏠', color: '#4A90FF' };
        }
        return { icon: '📊', color: '#6B7280' };
    };

    const { icon, color } = getIconAndColor();

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
            </View>

            {count !== undefined && (
                <View style={styles.valueContainer}>
                    <Text style={[styles.count, { color }]}>{count}</Text>
                </View>
            )}

            {days !== undefined && (
                <View style={styles.valueContainer}>
                    <View style={styles.daysRow}>
                        <Text style={[styles.days, { color }]}>{days}</Text>
                        <Text style={styles.daysLabel}>days</Text>
                    </View>
                    {limit && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${(days / limit) * 100}%`,
                                            backgroundColor: color
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.limit}>of {limit} days</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default ApprovalCard;

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        minHeight: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 22,
        marginBottom: 6,
    },
    title: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    valueContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    count: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
    },
    daysRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    days: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    daysLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#999',
        marginLeft: 4,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    limit: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
    },
});
