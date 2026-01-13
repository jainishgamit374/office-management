// app/(auth)/sign-up.tsx
import Custominputs from '@/components/Custominputs';
import CustomModal from '@/components/CustomModal';
import { register } from '@/lib/auth';
import { dateStringToBackendFormat } from '@/lib/dateUtils';
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

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '' as string | undefined,
    });

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        joining_date: '',
        password: '',
        confirm_password: '',
    });

    const [errors, setErrors] = useState({
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        joining_date: '',
        password: '',
        confirm_password: '',
    });

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): { valid: boolean; message: string } => {
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one special character' };
        }
        return { valid: true, message: '' };
    };



    const validateForm = (): boolean => {
        const newErrors = {
            first_name: '',
            last_name: '',
            email: '',
            date_of_birth: '',
            joining_date: '',
            password: '',
            confirm_password: '',
        };
        let isValid = true;

        // First name validation
        if (!form.first_name.trim()) {
            newErrors.first_name = 'First name is required';
            isValid = false;
        } else if (form.first_name.trim().length < 2 || form.first_name.trim().length > 50) {
            newErrors.first_name = 'First name must be between 2-50 characters';
            isValid = false;
        }

        // Last name validation
        if (!form.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
            isValid = false;
        } else if (form.last_name.trim().length < 2 || form.last_name.trim().length > 50) {
            newErrors.last_name = 'Last name must be between 2-50 characters';
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

        // Date of birth validation
        if (!form.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required';
            isValid = false;
        }

        // Joining date validation
        if (!form.joining_date) {
            newErrors.joining_date = 'Joining date is required';
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
        if (!form.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
            isValid = false;
        } else if (form.password !== form.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const submit = async () => {
        if (!validateForm()) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please fix the errors in the form',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await register({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim().toLowerCase(),
                date_of_birth: dateStringToBackendFormat(form.date_of_birth),
                joining_date: dateStringToBackendFormat(form.joining_date),
                password: form.password,
                confirm_password: form.confirm_password,
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
                first_name: '',
                last_name: '',
                email: '',
                date_of_birth: '',
                joining_date: '',
                password: '',
                confirm_password: '',
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

    const handleChange = (field: string, value: string | boolean) => {
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
                            placeholder="Enter your first name"
                            value={form.first_name}
                            onChangeText={(text) => handleChange('first_name', text)}
                            label="First Name"
                            error={errors.first_name}
                            autoCapitalize="words"
                            autoComplete="name"
                        />

                        <Custominputs
                            placeholder="Enter your last name"
                            value={form.last_name}
                            onChangeText={(text) => handleChange('last_name', text)}
                            label="Last Name"
                            error={errors.last_name}
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
                            placeholder="YYYY-MM-DD"
                            value={form.date_of_birth}
                            onChangeText={(text) => handleChange('date_of_birth', text)}
                            label="Date of Birth"
                            error={errors.date_of_birth}
                            autoCapitalize="none"
                        />

                        <Custominputs
                            placeholder="YYYY-MM-DD"
                            value={form.joining_date}
                            onChangeText={(text) => handleChange('joining_date', text)}
                            label="Joining Date"
                            error={errors.joining_date}
                            autoCapitalize="none"
                        />

                        <Custominputs
                            placeholder="Create a password"
                            value={form.password}
                            onChangeText={(text) => handleChange('password', text)}
                            label="Password"
                            secureTextEntry
                            error={errors.password}
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
                                /[0-9]/.test(form.password) && styles.requirementMet
                            ]}>
                                {/[0-9]/.test(form.password) ? '✓' : '○'} One number
                            </Text>
                            <Text style={[
                                styles.requirement,
                                /[!@#$%^&*(),.?":{}|<>]/.test(form.password) && styles.requirementMet
                            ]}>
                                {/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? '✓' : '○'} One special character
                            </Text>
                        </View>

                        <Custominputs
                            placeholder="Confirm your password"
                            value={form.confirm_password}
                            onChangeText={(text) => handleChange('confirm_password', text)}
                            label="Confirm Password"
                            secureTextEntry
                            error={errors.confirm_password}
                        />

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
        </KeyboardAvoidingView>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#ffffff',
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
    adminToggleContainer: {
        marginVertical: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    adminToggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    adminToggleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    adminToggleSubtitle: {
        fontSize: 12,
        color: '#666',
        maxWidth: '80%',
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e5e5e5',
        padding: 2,
        justifyContent: 'center',
    },
    toggleSwitchActive: {
        backgroundColor: '#007bff',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
});