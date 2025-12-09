import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
    const userName = 'Jainish Gamit';
    const userEmail = 'jainish@example.com';
    const userPhone = '+91 98765 43210';
    const userLocation = 'Ahmedabad, Gujarat';

    const handleBackPress = () => {
        router.back();
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        // Add logout logic here
                        console.log('Logging out...');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                            <Feather name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>User Profile</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* User Avatar and Info */}
                    <View style={styles.userInfoContainer}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Feather name="user" size={40} color="#4289f4ff" />
                            </View>
                        </View>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.userEmail}>{userEmail}</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Total Tasks</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>8</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>4</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                    </View>
                </View>

                {/* Account Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Details</Text>

                    {/* Email Field */}
                    <View style={styles.detailCard}>
                        <View style={styles.iconContainer}>
                            <Feather name="mail" size={20} color="#4289f4ff" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{userEmail}</Text>
                        </View>
                    </View>

                    {/* Phone Field */}
                    <View style={styles.detailCard}>
                        <View style={styles.iconContainer}>
                            <Feather name="phone" size={20} color="#4289f4ff" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{userPhone}</Text>
                        </View>
                    </View>

                    {/* Location Field */}
                    <View style={styles.detailCard}>
                        <View style={styles.iconContainer}>
                            <Feather name="map-pin" size={20} color="#4289f4ff" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Location</Text>
                            <Text style={styles.detailValue}>{userLocation}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    {/* Attendance History */}
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                        <View style={styles.actionLeft}>
                            <View style={styles.iconContainer}>
                                <Feather name="clock" size={20} color="#4289f4ff" />
                            </View>
                            <Text style={styles.actionText}>Attendance History</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>

                    {/* Leave Requests */}
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                        <View style={styles.actionLeft}>
                            <View style={styles.iconContainer}>
                                <Feather name="calendar" size={20} color="#4289f4ff" />
                            </View>
                            <Text style={styles.actionText}>Leave Requests</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>

                    {/* Settings */}
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                        <View style={styles.actionLeft}>
                            <View style={styles.iconContainer}>
                                <Feather name="settings" size={20} color="#4289f4ff" />
                            </View>
                            <Text style={styles.actionText}>Settings</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        activeOpacity={0.7}
                        onPress={handleLogout}
                    >
                        <Feather name="log-out" size={20} color="#DC2626" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#4289f4ff',
        paddingTop: 20,
        paddingBottom: 60,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 50,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        width: 44,
        height: 44,
    },
    userInfoContainer: {
        alignItems: 'center',
    },
    avatarContainer: {
        backgroundColor: '#fff',
        padding: 4,
        borderRadius: 60,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        width: '50%',
        textAlign: 'center',
        fontWeight: '700',
        color: '#fff',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    statsContainer: {
        paddingHorizontal: 20,
        marginTop: -40,
        marginBottom: 20,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4289f4ff',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e0e0e0',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 15,
    },
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        backgroundColor: 'rgba(66, 137, 244, 0.1)',
        padding: 12,
        borderRadius: 50,
        marginRight: 15,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    detailValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    logoutContainer: {
        paddingHorizontal: 20,
    },
    logoutButton: {
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#DC2626',
        marginLeft: 10,
    },
});

export default Profile;