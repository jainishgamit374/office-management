import { Stack } from 'expo-router';

export default function RequestsLayout() {
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
                name="Leaveapplyreq"
                options={{
                    title: 'Apply Leave',
                }}
            />
            <Stack.Screen
                name="Misspunchreq"
                options={{
                    title: 'Miss Punch Request',
                }}
            />
            <Stack.Screen
                name="Earlycheckoutreq"
                options={{
                    title: 'Early Checkout / Late Check In',
                }}
            />
            <Stack.Screen
                name="Wfhapplyreq"
                options={{
                    title: 'Apply WFH',
                }}
            />
        </Stack>
    );
}
