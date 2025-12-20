import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LeaveBalance {
    privilegeLeave: number;
    casualLeave: number;
    sickLeave: number;
    absent: number;
}

interface LeaveBalanceSectionProps {
    leaveBalance?: LeaveBalance;
}

const LeaveBalanceSection: React.FC<LeaveBalanceSectionProps> = ({
    leaveBalance = {
        privilegeLeave: 10,
        casualLeave: 10,
        sickLeave: 10,
        absent: 0,
    },
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Leave Balance</Text>
            </View>

            <View style={styles.grid}>
                {/* Privilege Leave (PL) */}
                <View style={styles.card}>
                    <View style={[styles.badge, { backgroundColor: '#4caf50' }]}>
                        <Text style={styles.badgeText}>PL</Text>
                    </View>
                    <Text style={styles.count}>{leaveBalance.privilegeLeave}</Text>
                </View>

                {/* Casual Leave (CL) */}
                <View style={styles.card}>
                    <View style={[styles.badge, { backgroundColor: '#2196f3' }]}>
                        <Text style={styles.badgeText}>CL</Text>
                    </View>
                    <Text style={styles.count}>{leaveBalance.casualLeave}</Text>
                </View>

                {/* Sick Leave (SL) */}
                <View style={styles.card}>
                    <View style={[styles.badge, { backgroundColor: '#ff9800' }]}>
                        <Text style={styles.badgeText}>SL</Text>
                    </View>
                    <Text style={styles.count}>{leaveBalance.sickLeave}</Text>
                </View>

                {/* Absent (AB) */}
                <View style={styles.card}>
                    <View style={[styles.badge, { backgroundColor: '#f44336' }]}>
                        <Text style={styles.badgeText}>AB</Text>
                    </View>
                    <Text style={styles.count}>{leaveBalance.absent}</Text>
                </View>
            </View>
        </View>
    );
};


const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 15,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    badge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    badgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        width: '50%',
        textAlign: 'center',
    },
    count: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        width: '50%',
        textAlign: 'center',
    },
});

export default LeaveBalanceSection;
