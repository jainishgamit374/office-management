// components/Attendance/PunchButton.tsx
import { hasLocationPermission, punchIn, punchOut, requestLocationPermission } from '@/lib/attendance';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PunchButtonProps {
    onPunchSuccess?: (punchType: 'IN' | 'OUT') => void;
    onPunchError?: (error: string) => void;
}

const PunchButton: React.FC<PunchButtonProps> = ({ onPunchSuccess, onPunchError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [isRemote, setIsRemote] = useState(false);

    const handlePunch = async () => {
        try {
            setIsLoading(true);

            // Check location permission
            const hasPermission = await hasLocationPermission();
            if (!hasPermission) {
                const granted = await requestLocationPermission();
                if (!granted) {
                    Alert.alert(
                        'Location Permission Required',
                        'Please enable location services to punch in/out.',
                        [{ text: 'OK' }]
                    );
                    setIsLoading(false);
                    return;
                }
            }

            // Perform punch
            let response;
            if (isPunchedIn) {
                response = await punchOut(isRemote);
                setIsPunchedIn(false);
            } else {
                response = await punchIn(isRemote);
                setIsPunchedIn(true);
            }

            // Success callback
            if (onPunchSuccess) {
                onPunchSuccess(response.data?.punch_type || (isPunchedIn ? 'OUT' : 'IN'));
            }

            Alert.alert(
                'Success',
                response.message || `Punched ${isPunchedIn ? 'OUT' : 'IN'} successfully!`,
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('Punch error:', error);

            if (onPunchError) {
                onPunchError(error.message);
            }

            Alert.alert(
                'Punch Failed',
                error.message || 'Unable to record punch. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Remote Work Toggle */}
            <TouchableOpacity
                style={styles.remoteToggle}
                onPress={() => setIsRemote(!isRemote)}
                activeOpacity={0.7}
            >
                <View style={[styles.checkbox, isRemote && styles.checkboxChecked]}>
                    {isRemote && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.remoteLabel}>Working Remotely</Text>
            </TouchableOpacity>

            {/* Punch Button */}
            <TouchableOpacity
                style={[
                    styles.punchButton,
                    isPunchedIn ? styles.punchOutButton : styles.punchInButton,
                    isLoading && styles.punchButtonDisabled,
                ]}
                onPress={handlePunch}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.buttonText}>Processing...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.buttonIcon}>{isPunchedIn ? '🏁' : '▶️'}</Text>
                        <Text style={styles.buttonText}>
                            Punch {isPunchedIn ? 'OUT' : 'IN'}
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Status */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, isPunchedIn && styles.statusDotActive]} />
                <Text style={styles.statusText}>
                    {isPunchedIn ? 'Currently Checked In' : 'Not Checked In'}
                </Text>
            </View>
        </View>
    );
};

export default PunchButton;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    remoteToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#007bff',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#007bff',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    remoteLabel: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    punchButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    punchInButton: {
        backgroundColor: '#28a745',
    },
    punchOutButton: {
        backgroundColor: '#dc3545',
    },
    punchButtonDisabled: {
        opacity: 0.6,
    },
    loadingContainer: {
        alignItems: 'center',
        gap: 10,
    },
    buttonIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#999',
        marginRight: 8,
    },
    statusDotActive: {
        backgroundColor: '#28a745',
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});
