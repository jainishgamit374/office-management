// import { account } from '@/lib/appwrite';
// import { Stack } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, View } from 'react-native';

// export default function RootLayout() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     checkAuthState();
//   }, []);

//   const checkAuthState = async () => {
//     try {
//       const currentUser = await account.get();
//       setIsAuthenticated(!!currentUser);
//     } catch (error) {
//       console.log('No active session');
//       setIsAuthenticated(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
//         <ActivityIndicator size="large" color="#4289f4ff" />
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {!isAuthenticated ? (
//         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//       ) : (
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       )}
//     </Stack>
//   );
// }

// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { RefreshProvider } from '@/contexts/RefreshContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useEffect(() => {
    // Hide Android navigation bar for immersive experience
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RefreshProvider>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <Toast />
        </RefreshProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}