import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Quick Access Button to Test Late/Early APIs
 * 
 * Add this component to your HomeScreen to easily access the test screen.
 * 
 * Usage:
 * import QuickTestButton from '@/components/QuickTestButton';
 * 
 * Then add in your HomeScreen:
 * <QuickTestButton />
 */
const QuickTestButton: React.FC = () => {
    const { colors } = useTheme();
    const router = useRouter();

    const navigateToTest = () => {
        router.push('/(auth)/test-late-early-screen');
    };

    const styles = StyleSheet.create({
        container: {
            padding: 16,
            marginTop: 10,
        },
        button: {
            backgroundColor: colors.warning,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#F59E0B',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        buttonText: {
            color: '#000',
            fontSize: 16,
            fontWeight: '700',
        },
        subtitle: {
            color: '#000',
            fontSize: 12,
            marginTop: 4,
            opacity: 0.8,
        },
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={navigateToTest}>
                <Text style={styles.buttonText}>🧪 Test Late/Early APIs</Text>
                <Text style={styles.subtitle}>Tap to run endpoint tests</Text>
            </TouchableOpacity>
        </View>
    );
};

export default QuickTestButton;
