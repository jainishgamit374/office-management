// app/(auth)/sign-in.tsx
import Custominputs from '@/components/Custominputs';
import CustomModal from '@/components/CustomModal';
import { login } from '@/lib/auth';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '' as string | undefined,
    });

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        const newErrors = {
            email: '',
            password: '',
        };
        let isValid = true;

        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(form.email)) {
            newErrors.email = 'Please enter a valid email';
            isValid = false;
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const submit = async () => {
        if (!validateForm()) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please fix the errors below',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await login({
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });

            console.log('✅ Login successful:', response);

            // Check if we received JWT tokens
            if (response.access && response.refresh) {
                console.log('✅ JWT Tokens received and stored');
            }

            // Show success toast
            Toast.show({
                type: 'success',
                text1: 'Welcome Back! 👋',
                text2: response.message || 'Login successful',
                position: 'top',
                visibilityTime: 1500,
            });

            // Navigate to main app
            setTimeout(() => {
                router.replace('/'); // Adjust based on your app structure
            }, 1000);

        } catch (error: any) {
            console.error('❌ Sign in error:', error);

            // Handle specific error messages
            let errorTitle = 'Login Failed';
            let errorMessage = error.message || 'Invalid email or password.';

            if (errorMessage.toLowerCase().includes('credentials')) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (errorMessage.toLowerCase().includes('network')) {
                errorTitle = 'Connection Error';
                errorMessage = 'Please check your internet connection and try again.';
            } else if (errorMessage.toLowerCase().includes('not found') ||
                errorMessage.toLowerCase().includes('no active account')) {
                errorMessage = 'No account found with this email. Please sign up first.';
            }

            setModalConfig({
                visible: true,
                type: 'error',
                title: errorTitle,
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
    };

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleForgotPassword = () => {
        router.push('/(auth)/forgotpass');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Custominputs
                            placeholder="Enter your email"
                            value={form.email}
                            onChangeText={(text) => handleChange('email', text)}
                            label="Email Address"
                            keyboardType="email-address"
                            error={errors.email}
                            autoCapitalize="none"
                            autoComplete="email"
                        />

                        <Custominputs
                            placeholder="Enter your password"
                            value={form.password}
                            onChangeText={(text) => handleChange('password', text)}
                            label="Password"
                            secureTextEntry
                            error={errors.password}
                        />

                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            style={styles.forgotPasswordContainer}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={submit}
                            style={[styles.button, isSubmitting && styles.buttonDisabled]}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color="#fff" size="small" />
                                    <Text style={styles.buttonText}>Signing In...</Text>
                                </View>
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    {/* <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View> */}

                    {/* Social Login
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                            <Text style={styles.socialIcon}>🔵</Text>
                            <Text style={styles.socialButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                            <Text style={styles.socialIcon}>🍎</Text>
                            <Text style={styles.socialButtonText}>Continue with Apple</Text>
                        </TouchableOpacity>
                    </View> */}

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <Link href="/(auth)/sign-up" style={styles.footerLink}>
                            Sign Up
                        </Link>
                    </View>
                </View>

                <CustomModal
                    visible={modalConfig.visible}
                    onClose={closeModal}
                    type={modalConfig.type}
                    title={modalConfig.title}
                    message={modalConfig.message}
                />
            </ScrollView>
            <Toast />
        </KeyboardAvoidingView>
    );
};

export default SignIn;

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#f8f9fa',
    },
    container: {
        width: '92%',
        maxWidth: 420,
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        fontSize: 56,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 6,
    },
    formContainer: {
        gap: 4,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 8,
        width: '100%',
    },
    forgotPasswordText: {
        width: '100%',
        textAlign: 'center',
        fontSize: 14,
        color: '#007bff',
        fontWeight: '500',
    },
    button: {
        width: '100%',
        backgroundColor: '#007bff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e5e5',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 13,
        fontWeight: '500',
    },
    socialContainer: {
        gap: 14,
    },
    socialButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e5e5e5',
        backgroundColor: '#fafafa',
        gap: 10,
    },
    socialIcon: {
        fontSize: 18,
    },
    socialButtonText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
        gap: 8,
    },
    footerText: {
        fontSize: 15,
        color: '#666',
    },
    footerLink: {
        fontSize: 15,
        width: '20%',
        color: '#007bff',
        fontWeight: '600',
    },
});