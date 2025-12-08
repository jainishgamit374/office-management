import Custominputs from '@/components/Custominputs';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const signup = () => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
    });

    const submit = async () => {
        const { name, username, email, phone, password } = form;

        if (!form.name || !form.username || !form.email || !form.phone || !form.password) {
            return Alert.alert('Error', 'All fields are required');
        }

        setIsSubmitting(true);
        try {
            // Your user creation logic here
            Alert.alert('Success', 'User registered successfully!');
        } catch (error) {
            Alert.alert('Error', (error as Error).message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>

            <View style={styles.Imageheader}>
                <Image source={require('@/assets/images/image.png')} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.container}>
                <Text style={styles.title}>Create Account</Text>

                <Custominputs
                    placeholder="Enter Full Name"
                    value={form.name}
                    onChangeText={(text) => handleChange('name', text)}
                    label="Full Name"
                />
                <Custominputs
                    placeholder="Enter Username"
                    value={form.username}
                    onChangeText={(text) => handleChange('username', text)}
                    label="Username"
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

                    <Link href="/sign-in" style={styles.footerLink}>
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
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: '#f8f8f8',
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