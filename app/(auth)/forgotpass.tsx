import CustomModal from '@/components/CustomModal';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import Toast from 'react-native-toast-message';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    // Modal state for custom popup
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
    });

    const handleSendCode = () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Email Required',
                text2: 'Please enter your email address',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        console.log('Sending code to:', email);
        setCodeSent(true);

        // Show success notification
        setModalConfig({
            visible: true,
            type: 'success',
            title: 'Reset Code Sent',
            message: `A password reset code has been sent to ${email}`,
        });
    };

    const handleCreateNewPassword = () => {
        // Validation
        if (!newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all password fields',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Passwords Don\'t Match',
                text2: 'Please make sure both passwords are the same',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (newPassword.length < 8) {
            Toast.show({
                type: 'error',
                text1: 'Password Too Short',
                text2: 'Password must be at least 8 characters',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        console.log('Creating new password for:', email, 'Password:', newPassword);

        // Show success notification
        setModalConfig({
            visible: true,
            type: 'success',
            title: 'Password Created Successfully',
            message: 'Your new password has been set. You can now sign in with your new password.',
        });

        // Navigate to sign-in after showing success
        setTimeout(() => {
            router.push('/sign-in');
        }, 2500);
    };

    const closeModal = () => {
        setModalConfig({ ...modalConfig, visible: false });
    };

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Forgot Password</Text>

                {!codeSent ? (
                    <View style={styles.section}>
                        <Text style={styles.label}>Enter your email to receive a reset code:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.button, !email && styles.buttonDisabled]}
                            onPress={handleSendCode}
                            disabled={!email}
                        >
                            <Text style={styles.buttonText}>Send Code</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.label}>A reset code has been sent to <Text style={styles.emailText}>{email}</Text>.</Text>
                        <Text style={styles.label}>Enter your new password:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <TouchableOpacity
                            style={[styles.button, (!newPassword || !confirmPassword) && styles.buttonDisabled]}
                            onPress={handleCreateNewPassword}
                            disabled={!newPassword || !confirmPassword}
                        >
                            <Text style={styles.buttonText}>Create New Password</Text>
                        </TouchableOpacity>

                    </View>
                )}
            </View>

            {/* Custom Modal Popup */}
            <CustomModal
                visible={modalConfig.visible}
                onClose={closeModal}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 35,
        color: '#333333',
        textAlign: 'center',
    },
    section: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
        color: '#555555',
        lineHeight: 22,
    },
    emailText: {
        fontWeight: '600',
        color: '#007bff',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        fontSize: 16,
        color: '#333333',
    },
    button: {
        width: '100%',
        backgroundColor: '#007bff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#007bff',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    buttonDisabled: {
        backgroundColor: '#a0c8f5',
        ...Platform.select({
            ios: {
                shadowOpacity: 0.1,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    buttonText: {
        width: '100%',
        textAlign: 'center',
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ForgotPassword;