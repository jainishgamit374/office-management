import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RequestItem {
    id: string;
    title: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
}

const defaultRequests: RequestItem[] = [
    { id: '1', title: 'Leave Approvals', icon: 'check-circle', color: '#12df34ff' },
    { id: '2', title: 'Miss Punch Approvals', icon: 'clock', color: '#f45742ff' },
    { id: '3', title: 'Half Day Approvals', icon: 'calendar', color: '#2cb1f4ff' },
    { id: '4', title: 'Early Check-Out Approvals', icon: 'log-out', color: '#2d58e4ff' },
    { id: '5', title: 'WFH Approval', icon: 'home', color: '#f45742ff' },
];

interface PendingRequestsSectionProps {
    requests?: RequestItem[];
}

const PendingRequestsSection: React.FC<PendingRequestsSectionProps> = ({
    requests = defaultRequests,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Pending Requests</Text>
            </View>

            <View style={styles.grid}>
                {requests.map((request) => (
                    <View key={request.id} style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Feather style={styles.icon} name={request.icon} size={24} color={request.color} />
                        </View>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{request.title}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 20,
        borderWidth: 1,
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
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
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        gap: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    cardHeader: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 10,
        padding: 10,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        width: '80%',
        color: colors.text,
        textAlign: 'left',
    },
});

export default PendingRequestsSection;

