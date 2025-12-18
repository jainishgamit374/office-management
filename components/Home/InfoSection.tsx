import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoSectionProps {
    title: string;
    emptyMessage?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({
    title,
    emptyMessage = 'No record available',
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Feather style={styles.icon} name="user" size={24} color="#4169E1" />
                    </View>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{emptyMessage}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fafcff',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: '#e3f2fd',
        // Shadow for iOS
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        // Shadow for Android
        elevation: 4,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1565c0',
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        gap: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cececeff',
    },
    cardHeader: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 10,
        padding: 10,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
    },
    icon: {
        fontSize: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        width: '80%',
        color: '#000000ff',
        textAlign: 'left',
    },
});

export default InfoSection;
