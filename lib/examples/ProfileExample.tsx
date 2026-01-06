// 📝 Example: How to use protected APIs in your components

import { logout } from '@/lib/auth';
import { getUserProfile, updateUserProfile } from '@/lib/user';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 📥 Load user profile on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setProfile(data);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
            });

            // If session expired, redirect to login
            if (error.message.includes('Session expired')) {
                router.replace('/(auth)/sign-in');
            }
        } finally {
            setLoading(false);
        }
    };

    // 📝 Update profile
    const handleUpdateProfile = async () => {
        try {
            const updated = await updateUserProfile({
                name: 'Updated Name',
            });
            setProfile(updated);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile updated successfully',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
            });
        }
    };

    // 🚪 Logout
    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/sign-in');
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                {profile?.name || 'User'}
            </Text>
            <Text>{profile?.email}</Text>

            <TouchableOpacity
                onPress={handleUpdateProfile}
                style={{ marginTop: 20, padding: 15, backgroundColor: '#007bff', borderRadius: 8 }}
            >
                <Text style={{ color: '#fff', textAlign: 'center' }}>Update Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleLogout}
                style={{ marginTop: 10, padding: 15, backgroundColor: '#dc3545', borderRadius: 8 }}
            >
                <Text style={{ color: '#fff', textAlign: 'center' }}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
