import React, { useState } from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

interface CustomInputProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    label?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
}

const Custominputs = ({
    placeholder = "Enter text",
    value,
    onChangeText,
    label,
    secureTextEntry,
    keyboardType = "default"
}: CustomInputProps) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                autoCapitalize='none'
                autoCorrect={false}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor="#888"
                style={[
                    styles.input,
                    isFocused ? styles.inputFocused : styles.inputBlurred
                ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#F9FAFB',
        color: '#111827',
    },
    inputBlurred: {
        borderColor: '#D1D5DB',
    },
    inputFocused: {
        borderColor: '#3B82F6',
    }
});

export default Custominputs;