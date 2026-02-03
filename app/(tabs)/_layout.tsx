import { TabBarProvider, useTabBar } from '@/constants/TabBarContext';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';
import "global.css";
import React from 'react';
import Toast from 'react-native-toast-message';

import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// Custom Animated Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { tabBarTranslateY } = useTabBar();

    return (
        <Animated.View
            style={[
                styles.tabBarContainer,
                {
                    transform: [{ translateY: tabBarTranslateY }],
                },
            ]}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Get icon based on route name
                const getIcon = () => {
                    if (route.name === 'index') {
                        return <Ionicons name="home" size={24} color={isFocused ? '#4289f4ff' : '#666'} />;
                    } else if (route.name === 'explore') {
                        return <Ionicons name="compass" size={24} color={isFocused ? '#4289f4ff' : '#666'} />;
                    } else if (route.name === 'profile') {
                        return <Ionicons name="person" size={24} color={isFocused ? '#4289f4ff' : '#666'} />;
                    }
                    return null;
                };

                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabButton}
                    >
                        {getIcon()}
                        <Text style={[
                            styles.tabLabel,
                            { color: isFocused ? '#4289f4ff' : '#666' }
                        ]}>
                            {typeof label === 'string' ? label : ''}
                        </Text>
                    </Pressable>
                );
            })}
        </Animated.View>
    );
}

export default function TabsLayout() {
    const { isLoggedIn, isLoading } = useAuth();

    // Show loading screen while checking authentication
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4289f4ff" />
            </View>
        );
    }

    // Redirect to login if not authenticated
    if (!isLoggedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    function TabsLayoutContent() {
        return (
            <Tabs
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    animation: 'shift',
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        title: 'MySpace',
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                    }}
                />
            </Tabs>
        );
    }

    return (
        <>
            <TabBarProvider>
                <TabsLayoutContent />
            </TabBarProvider>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 12 : 22,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: '#fff',
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        shadowColor: "#1a1a1a",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        ...Platform.select({
            ios: {
                shadowColor: "#1a1a1a",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    tabLabel: {
        fontSize: 12,
        width: '100%',
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
});