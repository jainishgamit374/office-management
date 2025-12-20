import { useTabBar } from '@/constants/TabBarContext';
import { signOut } from '@/lib/appwrite';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {

    const user = {
        name: 'Jainish Gamit',
        email: 'jainish@example.com',
        phone: '+91 98765 43210',
        department: 'Development',
        designation: 'MERN Developer',
        employeeId: 'EMP001',
    };

    // Get tab bar context for scroll animation
    const { scrollY, lastScrollY, tabBarTranslateY } = useTabBar();

    // Handle scroll for tab bar animation
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event: any) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;

                if (diff > 0 && currentScrollY > 50) {
                    // Scrolling down - hide tab bar
                    Animated.spring(tabBarTranslateY, {
                        toValue: 150,
                        useNativeDriver: true,
                        friction: 8,
                        tension: 40,
                    }).start();
                } else if (diff < 0) {
                    // Scrolling up - show tab bar
                    Animated.spring(tabBarTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        friction: 8,
                        tension: 40,
                    }).start();
                }

                lastScrollY.current = currentScrollY;
            },
        }
    );

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace('/(auth)/sign-in');
                    } catch (error: any) {
                        console.error('Logout error:', error);
                        Alert.alert('Error', error.message || 'Failed to logout');
                    }
                }
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 24 }} />
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity>
                        <Feather name="edit-2" size={20} color="#4A90FF" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>JG</Text>
                    </View>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.designation}>{user.designation}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{user.department}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>Present</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>2</Text>
                        <Text style={styles.statLabel}>Absent</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>5</Text>
                        <Text style={styles.statLabel}>Leaves</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Information</Text>

                    <View style={styles.infoRow}>
                        <Feather name="mail" size={20} color="#666" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="phone" size={20} color="#666" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{user.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="credit-card" size={20} color="#666" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Employee ID</Text>
                            <Text style={styles.infoValue}>{user.employeeId}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu</Text>

                    <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/Attendance/AttendenceList')}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Feather name="clock" size={18} color="#2196F3" />
                            </View>
                            <Text style={styles.menuText}>Attendance</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/Requests/Leaveapplyreq')}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Feather name="calendar" size={18} color="#4CAF50" />
                            </View>
                            <Text style={styles.menuText}>Leave Requests</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
                                <Feather name="file-text" size={18} color="#FF9800" />
                            </View>
                            <Text style={styles.menuText}>Documents</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
                                <Feather name="settings" size={18} color="#9C27B0" />
                            </View>
                            <Text style={styles.menuText}>Settings</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#E0F7FA' }]}>
                                <Feather name="help-circle" size={18} color="#00BCD4" />
                            </View>
                            <Text style={styles.menuText}>Help & Support</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Feather name="log-out" size={20} color="#FF5252" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>Version 1.0.0</Text>
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        width: '80%',
        textAlign: 'center',
        fontWeight: '700',
        color: '#333',
    },

    // Profile Card
    profileCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(74, 144, 255, 0.1)',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4A90FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 4,
        borderColor: '#FFF',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 1,
    },
    name: {
        fontSize: 24,
        width: '100%',
        textAlign: 'center',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    designation: {
        fontSize: 15,
        width: '100%',
        textAlign: 'center',
        textTransform: 'uppercase',
        color: '#666',
        marginBottom: 15,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: 'rgba(74, 144, 255, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(74, 144, 255, 0.3)',
    },
    badgeText: {
        fontSize: 13,
        textAlign: 'center',
        width: '50%',
        color: '#4A90FF',
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '700',
        color: '#4A90FF',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
    },

    // Section
    section: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },

    // Info Row
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoContent: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },

    // Menu Row
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        fontSize: 15,
        color: '#333',
    },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    logoutText: {
        fontSize: 15,
        color: '#FF5252',
        fontWeight: '600',
        marginLeft: 10,
    },

    // Version
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#BBB',
        marginBottom: 30,
    },
});

export default Profile;