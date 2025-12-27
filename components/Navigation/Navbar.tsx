import { useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Navbar() {
    const { colors } = useTheme();

    const handleProfilePress = () => {
        router.push('/(tabs)/profile');
    };

    return (
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
                <Pressable style={styles.menuButton}>
                    <Image source={require('@/assets/images/Logo.jpg')} style={styles.logoImage} />
                </Pressable>
                <View style={styles.companyNameContainer}>
                    <Text style={[styles.companyName, { color: colors.text }]}>Infinite Soft Tech</Text>
                </View>
            </View>

            <View style={styles.headerRight}>
                <Pressable style={styles.profileButton} onPress={handleProfilePress}>
                    <View style={[styles.profileImage, { backgroundColor: colors.primaryLight }]}>
                        <Feather name="user" size={24} color={colors.primary} />
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        // subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    logoImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        borderRadius: 8,
    },
    companyNameContainer: {
        width: "70%",
        borderRadius: 8,
        padding: 8,
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    profileButton: {
        width: 45,
        height: 45,
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
})
