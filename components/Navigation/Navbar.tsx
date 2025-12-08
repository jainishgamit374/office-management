import Feather from '@expo/vector-icons/Feather'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

export default function Navbar() {
    return (
        <View style={styles.header}>
            <Pressable style={styles.menuButton}>
                <Feather name="menu" size={24} color="black" />
            </Pressable>

            <View style={styles.headerRight}>
                <Pressable style={styles.profileButton}>
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
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
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