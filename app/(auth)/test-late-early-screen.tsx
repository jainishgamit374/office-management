import { useTheme } from '@/contexts/ThemeContext';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { compareApis, runAllTests, testLateCheckinCount, testLateEarlyCount } from '../../test-late-early-apis';

const TestLateEarlyScreen: React.FC = () => {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [testResults, setTestResults] = useState<string>('');

    const captureConsoleOutput = () => {
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args: any[]) => {
            logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
            originalLog(...args);
        };

        console.error = (...args: any[]) => {
            logs.push('ERROR: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
            originalError(...args);
        };

        return {
            getLogs: () => logs.join('\n'),
            restore: () => {
                console.log = originalLog;
                console.error = originalError;
            }
        };
    };

    const runTest = async (testFn: () => Promise<any>, testName: string) => {
        setIsLoading(true);
        setTestResults('Running test...\n');

        const capture = captureConsoleOutput();

        try {
            await testFn();
            const output = capture.getLogs();
            setTestResults(output);
        } catch (error) {
            const output = capture.getLogs();
            setTestResults(output + '\n\nERROR: ' + (error instanceof Error ? error.message : String(error)));
            Alert.alert('Test Failed', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            capture.restore();
            setIsLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        buttonContainer: {
            gap: 12,
            marginBottom: 20,
        },
        button: {
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
        },
        buttonSecondary: {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
        },
        buttonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },
        buttonTextSecondary: {
            color: colors.text,
        },
        resultsContainer: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 200,
        },
        resultsTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
        },
        resultsText: {
            fontSize: 12,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
            color: colors.textSecondary,
            lineHeight: 18,
        },
        loadingContainer: {
            padding: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        loadingText: {
            marginTop: 12,
            fontSize: 14,
            color: colors.textSecondary,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>API Endpoint Tests</Text>
                <Text style={styles.subtitle}>Test Late Check-In & Early Check-Out APIs</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => runTest(testLateCheckinCount, 'Late Check-In Count')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Test Late Check-In API</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => runTest(testLateEarlyCount, 'Late/Early Count')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Test Late/Early Count API</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => runTest(compareApis, 'Compare APIs')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Compare Both APIs</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={() => runTest(runAllTests, 'All Tests')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.text} />
                        ) : (
                            <>
                                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                                    Run All Tests
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={() => setTestResults('')}
                        disabled={isLoading}
                    >
                        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Clear Results</Text>
                    </TouchableOpacity>
                </View>

                {testResults ? (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>Test Results:</Text>
                        <ScrollView style={{ maxHeight: 400 }}>
                            <Text style={styles.resultsText}>{testResults}</Text>
                        </ScrollView>
                    </View>
                ) : (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>Test Results:</Text>
                        <Text style={[styles.resultsText, { textAlign: 'center', marginTop: 40 }]}>
                            No tests run yet. Click a button above to start testing.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TestLateEarlyScreen;
