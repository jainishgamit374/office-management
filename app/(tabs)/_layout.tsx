import { TabBarProvider } from '@/constants/TabBarContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {

    function TabsLayoutContent() {

        return <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarStyle: {
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 50,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    paddingTop: 15,
                    paddingBottom: 16,
                    paddingHorizontal: 0,
                    marginHorizontal: 20,
                    height: 80,
                    position: 'absolute',
                    bottom: 10,
                    backgroundColor: '#fff',
                    shadowColor: "#1a1a1a",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                } as any,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
                    title: 'Services',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                    title: 'Profile',
                }}
            />
        </Tabs>

    }

    return (
        <TabBarProvider>
            <TabsLayoutContent />
        </TabBarProvider>
    )
}