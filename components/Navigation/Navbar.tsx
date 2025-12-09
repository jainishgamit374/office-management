import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function Navbar() {
    const handleProfilePress = () => {
        router.push('/(tabs)/profile');
    };

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Pressable style={styles.menuButton}>
                    <Image source={require('@/assets/images/Logo.jpg')} style={styles.logoImage} />
                </Pressable>
                <View style={styles.companyNameContainer}>
                    <Text style={styles.companyName}>Infinite 3 Technology</Text>
                </View>
            </View>

            <View style={styles.headerRight}>
                <Pressable style={styles.profileButton} onPress={handleProfilePress}>
                    <View style={styles.profileImage}>
                        <Feather name="user" size={24} color="#4169E1" />
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
        backgroundColor: '#f0f2f5',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
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
        color: '#000',
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
        backgroundColor: '#E0E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
})