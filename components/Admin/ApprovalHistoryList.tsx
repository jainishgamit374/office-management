import { ApprovalHistoryItem, getApprovalHistory } from '@/lib/workflow';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface ApprovalHistoryListProps {
    tranId?: number;
    progId?: number;
}

const ApprovalHistoryList: React.FC<ApprovalHistoryListProps> = ({ tranId, progId }) => {
    const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await getApprovalHistory(tranId, progId);
                if (response.status === 'Success') {
                    setHistory(response.history);
                } else {
                    setError('Failed to load approval history');
                }
            } catch (err: any) {
                console.error('Error fetching approval history:', err);
                setError(err.message || 'An error occurred while fetching history');
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch if IDs are provided OR if no IDs are provided (assuming global history)
        // If one is provided but not success, API might fail, but let's allow it.
        fetchHistory();
    }, [tranId, progId]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'awaiting approve':
            case 'pending':
                return '#FF9800';
            case 'approved':
                return '#4CAF50';
            case 'disapproved':
            case 'rejected':
                return '#FF5252';
            default:
                return '#666';
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color="#4A90FF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (history.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No approval history found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {history.map((item, index) => (
                <View key={`${item.TranID}-${index}`} style={styles.historyItem}>
                    <View style={styles.timeline}>
                        <View style={[styles.dot, { backgroundColor: getStatusColor(item.ApprovalStatus) }]} />
                        {index < history.length - 1 && <View style={styles.line} />}
                    </View>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={[styles.status, { color: getStatusColor(item.ApprovalStatus) }]}>
                                {item.ApprovalStatus}
                            </Text>
                            <Text style={styles.date}>{item.UpdatedDate}</Text>
                        </View>
                        <Text style={styles.employeeName}>
                            By: {item.EmpName}
                        </Text>
                        <View style={styles.footer}>
                            <View style={styles.infoRow}>
                                <Feather name="file-text" size={12} color="#999" />
                                <Text style={styles.infoText}>Tran ID: {item.TranID}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Feather name="tag" size={12} color="#999" />
                                <Text style={styles.infoText}>Prog ID: {item.ProgramID}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#FF5252',
        fontSize: 14,
        textAlign: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
    },
    historyItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    timeline: {
        width: 20,
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
        zIndex: 1,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        marginTop: -4,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    status: {
        fontSize: 14,
        fontWeight: '700',
    },
    date: {
        fontSize: 11,
        color: '#999',
    },
    employeeName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#DEE2E6',
        paddingTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 11,
        color: '#6C757D',
    },
});

export default ApprovalHistoryList;
