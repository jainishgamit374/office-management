import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TestAPIScreen = () => {
    const [results, setResults] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const BASE_URL = 'https://karmyog.pythonanywhere.com';

    const runTests = async () => {
        setLoading(true);
        setResults('🚀 Starting API Tests...\n\n');

        // Test 1: Check API endpoint
        try {
            setResults(prev => prev + '🧪 Test 1: Testing /register endpoint\n');

            const formData = new URLSearchParams({
                name: 'Test User',
                username: `test${Date.now()}`,
                email: `test${Date.now()}@example.com`, // Unique email
                phone: '1234567890',
                password: 'password123',
                password2: 'password123',
            });

            const response = await fetch(`${BASE_URL}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json', // Force JSON response
                },
                body: formData.toString(),
            });

            setResults(prev => prev + `Status: ${response.status} ${response.statusText}\n`);

            const text = await response.text();
            setResults(prev => prev + `Response: ${text}\n\n`);

            try {
                const json = JSON.parse(text);
                setResults(prev => prev + `✅ Parsed JSON:\n${JSON.stringify(json, null, 2)}\n\n`);
            } catch (e) {
                setResults(prev => prev + `❌ Not JSON response\n\n`);
            }

        } catch (error: any) {
            setResults(prev => prev + `❌ Error: ${error.message}\n\n`);
        }

        // Test 2: Check login endpoint
        try {
            setResults(prev => prev + '🧪 Test 2: Testing /login endpoint\n');

            const formData = new URLSearchParams({
                username: 'test@example.com',
                password: 'password123',
            });

            const response = await fetch(`${BASE_URL}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
                body: formData.toString(),
            });

            setResults(prev => prev + `Status: ${response.status} ${response.statusText}\n`);

            const text = await response.text();
            setResults(prev => prev + `Response: ${text.substring(0, 300)}\n\n`);

        } catch (error: any) {
            setResults(prev => prev + `❌ Error: ${error.message}\n\n`);
        }

        setResults(prev => prev + '✅ Tests Complete!');
        setLoading(false);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>API Test Screen</Text>

            <TouchableOpacity
                onPress={runTests}
                style={styles.button}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Running Tests...' : 'Run API Tests'}
                </Text>
            </TouchableOpacity>

            <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>{results}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        minHeight: 200,
    },
    resultsText: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
});

export default TestAPIScreen;
