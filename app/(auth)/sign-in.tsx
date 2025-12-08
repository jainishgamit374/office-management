import Custominputs from '@/components/Custominputs';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const signin = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const submit = async () => {
        const { email, password } = form;

        if (!form.email || !form.password) {
            return Alert.alert('Error', 'Both email and password are required');

        }

        router.push('/');


        setIsSubmitting(true);
        try {
            // Your authentication logic here
            // Example: await signInUser(email, password);
            Alert.alert('Success', 'Signed in successfully!');
            // Navigate to home or dashboard
        } catch (error) {
            Alert.alert('Error', (error as Error).message || 'Something went wrong during sign-in');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.Imageheader}>
                <Image source={require('@/assets/images/image.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back</Text>

                <Custominputs
                    placeholder="Enter Email"
                    value={form.email}
                    onChangeText={(text) => handleChange('email', text)}
                    label="Email"
                    keyboardType="email-address"
                />
                <Custominputs
                    placeholder="Enter Password"
                    value={form.password}
                    onChangeText={(text) => handleChange('password', text)}
                    label="Password"
                    secureTextEntry
                />

                <Link href="/forgotpass" style={styles.forgotPasswordLink}>
                    Forgot Password?
                </Link>

                <TouchableOpacity
                    onPress={submit}
                    style={styles.button}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        Don't have an account?
                    </Text>

                    <Link href="/sign-up" style={styles.footerLink}>
                        Sign Up
                    </Link>
                </View>

            </View>
        </ScrollView>
    )
}

export default signin


const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: '#f8f8f8', // Light background for the whole screen
    },
    Imageheader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
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
    forgotPasswordLink: {
        fontSize: 14,
        color: '#007bff',
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 5,
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