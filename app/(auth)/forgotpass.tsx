import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    const handleSendCode = () => {
        console.log('Sending code to:', email);
        setCodeSent(true);
    };

    const handleCreateNewPassword = () => {
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Creating new password for:', email, 'Password:', newPassword);
        alert('Password reset successfully!');
        router.push('/sign-in');
    };

    return (
        <View style={styles.outerContainer}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e7eb',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 25,
        alignItems: 'center',
        // ...Platform.select({
        //     ios: {
        //         shadowColor: '#000',
        //         shadowOffset: { width: 0, height: 4 },
        //         shadowOpacity: 0.1,
        //         shadowRadius: 8,
        //     },
        //     android: {
        //         elevation: 8,
        //     },
        // }),
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
        // ...Platform.select({
        //     ios: {
        //         shadowColor: '#007bff',
        //         shadowOffset: { width: 0, height: 2 },
        //         shadowOpacity: 0.3,
        //         shadowRadius: 4,
        //     },
        //     android: {
        //         elevation: 5,
        //     },
        // }),
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