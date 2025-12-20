import { Stack } from 'expo-router';

export default function ResourcesLayout() {
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
                name="HrPolicies"
                options={{
                    title: 'HR Policies',
                }}
            />
            <Stack.Screen
                name="TeamDirectory"
                options={{
                    title: 'Team Directory',
                }}
            />
        </Stack>
    );
}
