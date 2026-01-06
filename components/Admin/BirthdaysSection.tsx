// components/Admin/BirthdaysSection.tsx
import { Birthday } from '@/lib/adminApi';
import Feather from '@expo/vector-icons/Feather';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BirthdayCard from './BirthdayCard';

interface BirthdaysSectionProps {
    birthdays: Birthday[];
}

const PLACEHOLDER_BIRTHDAYS = [
    { name: 'Amit R.', age: 30, date: 'Today', isToday: true },
    { name: 'Emily K.', age: undefined, date: 'Apr 27', isToday: false },
    { name: 'John D.', age: undefined, date: 'May 15', isToday: false },
] as const;

const BirthdaysSection: React.FC<BirthdaysSectionProps> = ({ birthdays }) => {
    const formatDate = useMemo(() => {
        return (dateStr: string): string => {
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                    return 'Invalid Date';
                }
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return 'Invalid Date';
            }
        };
    }, []);

    const displayBirthdays = useMemo(() => {
        if (!Array.isArray(birthdays) || birthdays.length === 0) {
            return null;
        }
        return birthdays.slice(0, 5);
    }, [birthdays]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Feather name="gift" size={20} color="#F59E0B" />
                <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                >
                    Upcoming Birthdays
                </Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.birthdaysScroll}
                accessibilityLabel="Upcoming birthdays list"
            >
                {displayBirthdays ? (
                    displayBirthdays.map((birthday) => (
                        <View
                            key={`${birthday.employee_id}-${birthday.date_of_birth}`}
                            style={styles.birthdayCardWrapper}
                        >
                            <BirthdayCard
                                employeeName={birthday.employee_name || 'Unknown'}
                                age={birthday.age}
                                date={formatDate(birthday.date_of_birth)}
                                isToday={birthday.days_until_birthday === 0}
                            />
                        </View>
                    ))
                ) : (
                    <>
                        {PLACEHOLDER_BIRTHDAYS.map((placeholder, index) => (
                            <View
                                key={`placeholder-${index}`}
                                style={styles.birthdayCardWrapper}
                            >
                                <BirthdayCard
                                    employeeName={placeholder.name}
                                    age={placeholder.age}
                                    date={placeholder.date}
                                    isToday={placeholder.isToday}
                                />
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default React.memo(BirthdaysSection, (prevProps, nextProps) => {
    if (prevProps.birthdays.length !== nextProps.birthdays.length) {
        return false;
    }
    return prevProps.birthdays.every((prev, index) =>
        prev.employee_id === nextProps.birthdays[index]?.employee_id
    );
});

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.3,
    },
    birthdaysScroll: {
        paddingVertical: 4,
        paddingRight: 16,
    },
    birthdayCardWrapper: {
        width: 210,
        marginRight: 12,
    },
});
