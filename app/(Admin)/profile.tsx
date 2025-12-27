import { signOut } from '@/lib/appwrite';
import { getUser, User } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminProfileScreen = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            const u = await getUser();
            setUser(u);
        })();
    }, []);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    router.replace('/(auth)/sign-in');
                },
            },
        ]);
    };

    const fullName = `${user?.first_name ?? 'Alex'} ${user?.last_name ?? 'Johnson'}`;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Profile</Text>
                <TouchableOpacity style={styles.headerRight}>
                    <Text style={styles.headerRightText}>Edit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Top card with avatar and role */}
                <View style={styles.card}>
                    <View style={styles.topRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.first_name?.[0] ?? 'A'}
                                {user?.last_name?.[0] ?? 'J'}
                            </Text>
                        </View>
                        <View style={styles.topInfo}>
                            <Text style={styles.name}>{fullName}</Text>
                            <Text style={styles.role}>Senior System Administrator</Text>
                            <Text style={styles.empId}>EMP-00123</Text>
                        </View>
                    </View>
                </View>

                {/* Personal Details */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-circle-outline" size={20} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Full Name:</Text>
                        <Text style={styles.value}>{fullName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Department:</Text>
                        <Text style={styles.value}>IT & Operations</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date of Birth:</Text>
                        <Text style={styles.value}>Jan 15, 1985</Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="call-outline" size={20} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>
                            {user?.email ?? 'alex.johnson@company.com'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.value}>+1 (555) 123-4567</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Office Location:</Text>
                        <Text style={styles.value}>HQ, Building A, Floor 4</Text>
                    </View>
                </View>

                {/* Administrative Roles */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="briefcase-outline" size={20} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Administrative Roles</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Current Roles:</Text>
                        <Text style={styles.value}>
                            Super Admin, HR Manager Access
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Permissions:</Text>
                        <Text style={styles.value}>
                            Full System Access, User Management, Reports
                        </Text>
                    </View>
                </View>

                {/* Logout button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.2,
    },
    headerRight: { padding: 4 },
    headerRightText: {
        fontSize: 16,
        color: '#007AFF',
    },

    scroll: { flex: 1 },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4A90FF',
    },
    topInfo: { flex: 1 },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.2,
    },
    role: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    empId: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },

    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.2,
    },
    row: {
        flexDirection: 'row',
        marginTop: 6,
    },
    label: {
        width: 120,
        fontSize: 13,
        color: '#777',
    },
    value: {
        flex: 1,
        fontSize: 13,
        color: '#1a1a1a',
        fontWeight: '500',
    },

    logoutButton: {
        marginTop: 8,
        backgroundColor: '#FF3B30',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        width: '100%',
        textAlign: 'center',
        fontWeight: '600',
    },
});