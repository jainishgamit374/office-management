import { Stack } from 'expo-router';

export default function AttendanceLayout() {
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
                name="AttendenceList"
                options={{
                    title: 'Attendance History',
                }}
            />
            <Stack.Screen
                name="LeaveCalender"
                options={{
                    title: 'Leave Calendar',
                }}
            />
            <Stack.Screen
                name="Wfhlist"
                options={{
                    title: 'Work From Home',
                }}
            />
        </Stack>
    );
}
