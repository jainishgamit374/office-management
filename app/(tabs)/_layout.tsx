import { TabBarProvider } from '@/constants/TabBarContext';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {

  function TabsLayout() {

    return <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          paddingTop: 22,
          marginHorizontal: 20,
          height: 80,
          position: 'absolute',
          bottom: 40,
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
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
    </Tabs>

  }

  return (
    // <Stack screenOptions={{ headerShown: false }}>
    //   <Stack.Screen name="index" />
    //   <Stack.Screen name="explore" />
    // </Stack>
    <TabBarProvider>
      <TabsLayout />
    </TabBarProvider>
  )
}