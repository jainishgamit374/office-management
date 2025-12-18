import Custominputs from '@/components/Custominputs';
import { createUser } from '@/lib/appwrite';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const signup = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const submit = async () => {
        const { name, email, phone, password } = form;

        if (!name || !email || !phone || !password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'All fields are required',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await createUser({ name, email, phone, password });
            Toast.show({
                type: 'success',
                text1: 'Account Created! 🎉',
                text2: 'Please verify your email before signing in',
                position: 'top',
                visibilityTime: 5000,
            });

            // Navigate to sign-in page after a short delay
            setTimeout(() => {
                router.replace('/(auth)/sign-in');
            }, 1500);
        } catch (error: any) {
            console.error('Sign up error:', error);
            Toast.show({
                type: 'error',
                text1: 'Sign Up Failed',
                text2: error.message || 'Failed to create account',
                position: 'top',
                visibilityTime: 4000,
            });
            setIsSubmitting(false);
        }
    }

    const handleSignIn = () => {
        router.push('/(auth)/sign-in');
    }
    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>

            <View style={styles.container}>
                <Text style={styles.title}>Create Account</Text>

                <Custominputs
                    placeholder="Enter Full Name"
                    value={form.name}
                    onChangeText={(text) => handleChange('name', text)}
                    label="Full Name"
                />
                <Custominputs
                    placeholder="Enter Email"
                    value={form.email}
                    onChangeText={(text) => handleChange('email', text)}
                    label="Email"
                    keyboardType="email-address"
                />
                <Custominputs
                    placeholder="Enter Phone Number"
                    value={form.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    label="Phone Number"
                    keyboardType="phone-pad"
                />
                <Custominputs
                    placeholder="Enter Password"
                    value={form.password}
                    onChangeText={(text) => handleChange('password', text)}
                    label="Password"
                    secureTextEntry
                />

                <TouchableOpacity
                    onPress={submit}
                    style={styles.button}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        Already have an account?
                    </Text>

                    <Link onPress={handleSignIn} href="/sign-in" style={styles.footerLink}>
                        Sign In
                    </Link>
                </View>

            </View>
        </ScrollView>
    )
}

export default signup


const styles = StyleSheet.create({
    scrollContent: {
        justifyContent: 'center',
        paddingVertical: 20,
    },
    container: {
        width: '90%',
        maxWidth: 400,
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 15, // Increased gap for better spacing
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        width: '100%',
        textAlign: 'center',
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        textDecorationLine: 'underline',
    },
    footerLink: {
        textAlign: 'center',
        width: '20%',
        fontSize: 14,
        color: '#007bff',
        fontWeight: '600',
    },
})