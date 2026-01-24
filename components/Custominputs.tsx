import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CustomInputProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    label?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    error?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoComplete?: string;
    maxLength?: number;
}

const Custominputs = ({
    placeholder = "Enter text",
    value,
    onChangeText,
    label,
    secureTextEntry,
    keyboardType = "default",
    error,
    autoCapitalize = 'none',
    autoComplete,
    maxLength
}: CustomInputProps) => {

    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputWrapper}>
                <TextInput
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    placeholderTextColor="#888"
                    maxLength={maxLength}
                    style={[
                        styles.input,
                        secureTextEntry && styles.inputWithIcon,
                        isFocused ? styles.inputFocused : styles.inputBlurred,
                        error ? styles.inputError : null
                    ]}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather
                            name={isPasswordVisible ? 'eye' : 'eye-off'}
                            size={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
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
    inputWrapper: {
        position: 'relative',
        width: '100%',
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
    inputWithIcon: {
        paddingRight: 48,
    },
    inputBlurred: {
        borderColor: '#D1D5DB',
    },
    inputFocused: {
        borderColor: '#3B82F6',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    }
});

export default Custominputs;