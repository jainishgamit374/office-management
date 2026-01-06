import { Stack } from 'expo-router';

export default function SupportLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#4A90FF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="Helpandfaq"
                options={{
                    title: 'Help & FAQ',
                }}
            />
            <Stack.Screen
                name="About"
                options={{
                    title: 'About',
                }}
            />
        </Stack>
    );
}
