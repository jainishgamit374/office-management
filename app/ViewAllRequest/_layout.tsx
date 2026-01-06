import { Stack } from 'expo-router';

export default function ViewAllRequestLayout() {
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
                name="LeaveApplication"
                options={{
                    title: 'Leave All Requests',
                }}
            />
            <Stack.Screen
                name="EarlyCheckout"
                options={{
                    title: 'Early Check-Out / Late Check-In',
                }}
            />
            <Stack.Screen
                name="Wfhrequest"
                options={{
                    title: 'WFH Requests',
                }}
            />
            <Stack.Screen
                name="ViewAllMisspunch"
                options={{
                    title: 'Miss Punch Requests',
                }}
            />
        </Stack>
    );
}
