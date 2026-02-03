import { useTabBar } from '@/constants/TabBarContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { signOut } from '@/lib/appwrite';
import { getPunchStatus } from '@/lib/attendance';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Create styles function (defined before component)
const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
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
        color: colors.text,
    },
    profileCard: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 4,
        borderColor: colors.card,
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
        color: colors.text,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    designation: {
        fontSize: 15,
        width: '100%',
        textAlign: 'center',
        textTransform: 'uppercase',
        color: colors.textSecondary,
        marginBottom: 15,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    badgeText: {
        fontSize: 13,
        textAlign: 'center',
        width: '50%',
        color: colors.primary,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textTertiary,
    },
    section: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    infoContent: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.textTertiary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
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
        color: colors.text,
    },
    logoutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.error + '40',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    logoutText: {
        fontSize: 15,
        color: colors.error,
        fontWeight: '600',
        marginLeft: 10,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.textTertiary,
        marginBottom: 30,
    },
});

const Profile = () => {
    const { theme, toggleTheme, colors } = useTheme();
    const { user, refreshUser } = useAuth();
    const [attendanceStats, setAttendanceStats] = useState({
        present: 0,
        absent: 0,
        leaves: 0,
    });

    useEffect(() => {
        // Ensure we have the latest user profile when visiting the profile tab
        refreshUser();
        
        // Fetch attendance stats
        const fetchAttendanceStats = async () => {
            try {
                const response = await getPunchStatus();
                if (response.status === 'Success' && response.data?.attendance?.thisMonth) {
                    const monthData = response.data.attendance.thisMonth;
                    setAttendanceStats({
                        present: monthData.present || 0,
                        absent: monthData.absent || 0,
                        leaves: monthData.leaves || 0,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch attendance stats:', error);
            }
        };
        
        fetchAttendanceStats();
    }, []);

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

    // Create styles with current theme colors
    const styles = createStyles(colors);

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
                    <View style={{ width: 24 }} />
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name
                                ? user.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map(word => word.charAt(0).toUpperCase())
                                    .join('')
                                : '??'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{user?.name || '—'}</Text>
                    {user?.designation ? (
                        <Text style={styles.designation}>{user?.designation}</Text>
                    ) : null}
                    {user?.department ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{user?.department}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{attendanceStats.present}</Text>
                        <Text style={styles.statLabel}>Present</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{attendanceStats.absent}</Text>
                        <Text style={styles.statLabel}>Absent</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{attendanceStats.leaves}</Text>
                        <Text style={styles.statLabel}>Leaves</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Information</Text>

                    <View style={styles.infoRow}>
                        <Feather name="mail" size={20} color={colors.textSecondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user?.email || '—'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="phone" size={20} color={colors.textSecondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{user?.phone || '—'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="credit-card" size={20} color={colors.textSecondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Employee ID</Text>
                            <Text style={styles.infoValue}>{user?.employeeId || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu</Text>

                    <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/Attendance/AttendenceList')}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? '#1E3A5F' : '#E3F2FD' }]}>
                                <Feather name="clock" size={18} color={colors.info} />
                            </View>
                            <Text style={styles.menuText}>Attendance</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/Requests/Leaveapplyreq')}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? '#1B3A2A' : '#E8F5E9' }]}>
                                <Feather name="calendar" size={18} color={colors.success} />
                            </View>
                            <Text style={styles.menuText}>Leave Requests</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={colors.border} />
                    </TouchableOpacity>

                    {/* Admin Dashboard - Only show for admin users */}
                    {user?.is_admin && (
                        <TouchableOpacity
                            style={styles.menuRow}
                            onPress={() => router.push('/Dashboard/AdminDashboard')}
                        >
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? '#1E3A5F' : '#E3F2FD' }]}>
                                    <Feather name="bar-chart-2" size={18} color="#007bff" />
                                </View>
                                <Text style={styles.menuText}>Admin Dashboard</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={colors.border} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? '#3A2A1A' : '#FFF3E0' }]}>
                                <Feather name="file-text" size={18} color={colors.warning} />
                            </View>
                            <Text style={styles.menuText}>Documents</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={colors.border} />
                    </TouchableOpacity>

                    <View style={styles.menuRow}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? '#2A1A3A' : '#F3E5F5' }]}>
                                <Feather name="settings" size={18} color="#9C27B0" />
                            </View>
                            <Text style={styles.menuText}>Settings</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={colors.border} />
                    </View>

                    {/* Theme Toggle */}
                    <View style={styles.menuRow}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#FFF9C4' }]}>
                                <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={18} color={theme === 'dark' ? '#FFD700' : '#FFA000'} />
                            </View>
                            <Text style={styles.menuText}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={theme === 'dark' ? '#FFF' : '#F4F3F4'}
                        />
                    </View>

                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: theme === 'dark' ? '#1A2A3A' : '#E0F7FA' }]}>
                                <Feather name="help-circle" size={18} color="#00BCD4" />
                            </View>
                            <Text style={styles.menuText}>Help & Support</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={colors.border} />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Feather name="log-out" size={20} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>Version 1.0.0</Text>
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

export default Profile;

