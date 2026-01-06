// utils/themeStyles.ts
import { ThemeColors } from '@/contexts/ThemeContext';

/**
 * Creates common card styles with theme colors
 */
export const createCardStyles = (colors: ThemeColors) => ({
    container: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingVertical: 20,
        borderWidth: 1,
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
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: colors.text,
    },
    text: {
        color: colors.text,
    },
    textSecondary: {
        color: colors.textSecondary,
    },
    textTertiary: {
        color: colors.textTertiary,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
});
