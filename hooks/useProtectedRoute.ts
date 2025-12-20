// hooks/useProtectedRoute.ts
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

export const useProtectedRoute = () => {
    const { isLoggedIn, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.replace('/(auth)/sign-in');
        }
    }, [isLoggedIn, isLoading]);

    return { isLoading, isLoggedIn };
};