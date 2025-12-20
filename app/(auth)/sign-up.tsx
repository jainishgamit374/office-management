// app/(auth)/sign-up.tsx
import Custominputs from '@/components/Custominputs';
import CustomModal from '@/components/CustomModal';
import { register } from '@/lib/auth';
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

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '' as string | undefined,
    });

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    };

    const validatePassword = (password: string): { valid: boolean; message: string } => {
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true, message: '' };
    };

    const validateForm = (): boolean => {
        const newErrors = {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        };
        let isValid = true;

        // Name validation
        if (!form.name.trim()) {
            newErrors.name = 'Full name is required';
            isValid = false;
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
            isValid = false;
        }

        // Email validation
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(form.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Phone validation
        if (!form.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        } else if (!validatePhone(form.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
            isValid = false;
        }

        // Password validation
        if (!form.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else {
            const passwordValidation = validatePassword(form.password);
            if (!passwordValidation.valid) {
                newErrors.password = passwordValidation.message;
                isValid = false;
            }
        }

        // Confirm password validation
        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await register({
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim().replace(/\D/g, ''),
                password: form.password,
                password2: form.confirmPassword,
            });

            console.log('✅ Registration successful:', response);

            // Show success modal
            setModalConfig({
                visible: true,
                type: 'success',
                title: 'Account Created! 🎉',
                message: response.message || 'Your account has been created successfully. Please sign in to continue.',
            });

            // Clear form
            setForm({
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
            });

            // Navigate to sign-in after delay
            setTimeout(() => {
                setModalConfig((prev) => ({ ...prev, visible: false }));
                router.replace('/(auth)/sign-in');
            }, 2500);

        } catch (error: any) {
            console.error('❌ Sign up error:', error);

            // Handle specific error messages
            let errorMessage = error.message || 'Unable to create account. Please try again.';

            // Check for common error patterns
            if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
                errorMessage = 'An account with this email already exists. Please sign in or use a different email.';
            }

            setModalConfig({
                visible: true,
                type: 'error',
                title: 'Registration Failed',
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
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
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
                            placeholder="Enter your full name"
                            value={form.name}
                            onChangeText={(text) => handleChange('name', text)}
                            label="Full Name"
                            error={errors.name}
                            autoCapitalize="words"
                            autoComplete="name"
                        />

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
                            placeholder="Enter your phone number"
                            value={form.phone}
                            onChangeText={(text) => handleChange('phone', text)}
                            label="Phone Number"
                            keyboardType="phone-pad"
                            error={errors.phone}
                            maxLength={10}
                        />

                        <Custominputs
                            placeholder="Create a password"
                            value={form.password}
                            onChangeText={(text) => handleChange('password', text)}
                            label="Password"
                            secureTextEntry
                            error={errors.password}
                        />

                        <Custominputs
                            placeholder="Confirm your password"
                            value={form.confirmPassword}
                            onChangeText={(text) => handleChange('confirmPassword', text)}
                            label="Confirm Password"
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        {/* Password Requirements */}
                        <View style={styles.passwordRequirements}>
                            <Text style={styles.requirementsTitle}>Password must contain:</Text>
                            <Text style={[
                                styles.requirement,
                                form.password.length >= 8 && styles.requirementMet
                            ]}>
                                {form.password.length >= 8 ? '✓' : '○'} At least 8 characters
                            </Text>
                            <Text style={[
                                styles.requirement,
                                /[A-Z]/.test(form.password) && styles.requirementMet
                            ]}>
                                {/[A-Z]/.test(form.password) ? '✓' : '○'} One uppercase letter
                            </Text>
                            <Text style={[
                                styles.requirement,
                                /[a-z]/.test(form.password) && styles.requirementMet
                            ]}>
                                {/[a-z]/.test(form.password) ? '✓' : '○'} One lowercase letter
                            </Text>
                            <Text style={[
                                styles.requirement,
                                /[0-9]/.test(form.password) && styles.requirementMet
                            ]}>
                                {/[0-9]/.test(form.password) ? '✓' : '○'} One number
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={submit}
                            style={[styles.button, isSubmitting && styles.buttonDisabled]}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color="#fff" size="small" />
                                    <Text style={styles.buttonText}>Creating Account...</Text>
                                </View>
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text style={styles.termsText}>
                            By signing up, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <Link href="/(auth)/sign-in" style={styles.footerLink}>
                            Sign In
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

export default SignUp;

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
        marginBottom: 28,
    },
    logo: {
        fontSize: 56,
        marginBottom: 12,
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
    passwordRequirements: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    requirementsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    requirement: {
        fontSize: 12,
        color: '#999',
        marginVertical: 2,
    },
    requirementMet: {
        color: '#28a745',
    },
    button: {
        width: '100%',
        backgroundColor: '#007bff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
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
        width: "50%",
        textAlign: 'center',
    },
    termsText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 18,
    },
    termsLink: {
        color: '#007bff',
        fontWeight: '500',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    footerLink: {
        fontSize: 14,
        width: "20%",
        color: '#007bff',
        fontWeight: '600',
    },
});