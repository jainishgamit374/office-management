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
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <Toast />
      </AuthProvider>
    </ThemeProvider>
  );
}