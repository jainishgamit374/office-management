import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoSectionProps {
    title: string;
    emptyMessage?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({
    title,
    emptyMessage = 'No record available',
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Feather style={styles.icon} name="user" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{emptyMessage}</Text>
                    </View>
                </View>
            </View>
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
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'left',
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
        color: colors.textSecondary,
        textAlign: 'left',
    },
});

export default InfoSection;

