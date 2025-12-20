import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const MissedPunchSection: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.mainTextContainer}>
                <Text style={styles.mainText}>Missed Pushed/ Check-Out</Text>
            </View>
            <View style={styles.textContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.textContainerRight}>
                        <Text style={styles.text}>07 / Dec / 2025</Text>
                    </View>
                    <View style={styles.textContainerRight}>
                        <Text style={styles.text}>07 / Dec / 2025</Text>
                    </View>
                    <View style={styles.textContainerRight}>
                        <Text style={styles.text}>07 / Dec / 2025</Text>
                    </View>
                    <View style={styles.textContainerRight}>
                        <Text style={styles.text}>07 / Dec / 2025</Text>
                    </View>
                    <View style={styles.textContainerRight}>
                        <Text style={styles.text}>07 / Dec / 2025</Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: colors.primary,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 15,
        gap: 15,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    mainTextContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 10,
    },
    mainText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 10,
    },
    scrollViewContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    textContainerRight: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        width: '110%',
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
});

export default MissedPunchSection;

