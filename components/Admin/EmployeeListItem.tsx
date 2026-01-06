// components/Admin/EmployeeListItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    employee: {
        id: string;
        name: string;
        department: string;
        role: string;
        avatar: string;
    };
    onPress: () => void;
};

const EmployeeListItem: React.FC<Props> = ({ employee, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <Image source={{ uri: employee.avatar }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{employee.name}</Text>
                <Text style={styles.subtitle}>
                    {employee.department} | {employee.role}
                </Text>
            </View>
            <Ionicons name="person-add-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
    );
};

export default EmployeeListItem;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 14,
    },
    info: { flex: 1 },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 3,
        letterSpacing: 0.1,
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
});
