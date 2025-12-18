import { Slot } from 'expo-router';
import React from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function AuthLayout() {
    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* Logo Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('@/assets/images/image.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Auth Forms (Sign In / Sign Up) */}
                <View style={styles.formContainer}>
                    <Slot />
                </View>
            </KeyboardAvoidingView>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',

    },
    headerContainer: {
        width: '100%',
        height: Dimensions.get('screen').height * 0.35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 180,
        height: 180,
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
