import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { authApiRequest } from '@/lib/api';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApprovalHistoryModal from '../../components/Admin/ApprovalHistoryModal';

// Types
interface WorkflowItem {
    Approve_name: string;
    Priority: number;
    status: string;
}

interface WFHRequest {
    WorkFromHomeReqMasterID: number;
    EmployeeID: number;
    EmployeeName?: string;
    ProfileImage?: string;
    ApprovalStatusID: number;
    ApprovalStatus: string;
    Reason: string;
    DateTime: string;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
    workflow_list: WorkflowItem[];
}

type FilterType = 'All' | 'FullDay' | 'HalfDay';

const Wfhrequest = () => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const [requests, setRequests] = useState<WFHRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // History Modal State
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<WFHRequest | null>(null);

    // Fetch WFH requests from API
    const fetchWFHRequests = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const response = await authApiRequest<{
                status: string;
                statusCode: number;
                data: WFHRequest[];
            }>('/workfromhomeapplicationslist/', {
                method: 'GET',
            });

            if (response.status === 'Success' && response.data) {
                setRequests(response.data);
            }
        } catch (error: any) {
            console.error('❌ Error fetching WFH requests:', error);
            Alert.alert('Error', error.message || 'Failed to fetch WFH requests');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Fetch data on focus
    useFocusEffect(
        useCallback(() => {
            fetchWFHRequests();
        }, [fetchWFHRequests])
    );

    // Client-side filtering
    const filteredRequests = useMemo(() => {
        if (selectedFilter === 'All') return requests;
        if (selectedFilter === 'FullDay') return requests.filter(r => !r.IsHalfDay);
        if (selectedFilter === 'HalfDay') return requests.filter(r => r.IsHalfDay);
        return requests;
    }, [requests, selectedFilter]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusStyle = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        // Amber/Orange for Pending/Awaiting
        if (statusLower.includes('pending') || statusLower.includes('await')) {
            return { color: '#F57C00', bg: '#FFF3E0', icon: 'clock', label: 'Pending' };
        }
        // Red for Rejected/Disapproved
        if (statusLower.includes('reject') || statusLower.includes('disapprove')) {
            return { color: '#C62828', bg: '#FFEBEE', icon: 'x-circle', label: 'Rejected' };
        }
        // Green for Approved
        if (statusLower.includes('approve')) {
            return { color: '#2E7D32', bg: '#E8F5E9', icon: 'check-circle', label: 'Approved' };
        }
        
        return { color: colors.textSecondary, bg: colors.border, icon: 'info', label: status };
    };

    const handleViewHistory = (item: WFHRequest) => {
        setSelectedRequest(item);
        setHistoryModalVisible(true);
    };

    const renderFilterChip = (label: string, value: FilterType, icon: string) => {
        const isActive = selectedFilter === value;
        return (
            <Pressable
                style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(value)}
            >
                <Feather
                    name={icon as any}
                    size={14}
                    color={isActive ? '#FFF' : colors.textSecondary}
                />
                <Text
                    style={[
                        styles.filterChipText,
                        isActive && styles.filterChipTextActive,
                    ]}
                >
                    {label}
                </Text>
            </Pressable>
        );
    };

    const renderWFHRequestItem = ({ item }: { item: WFHRequest }) => {
        const statusStyle = getStatusStyle(item.ApprovalStatus);
        
        return (
            <View style={styles.requestCard}>
                
                {/* Header: Avatar, Name, Status */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.avatarContainer, { backgroundColor: item.IsHalfDay ? '#FF980015' : '#4A90FF15' }]}>
                            {item.ProfileImage ? (
                                <Image
                                    source={{ uri: item.ProfileImage }}
                                    style={{ width: 44, height: 44, borderRadius: 12 }}
                                />
                            ) : (
                                <Feather 
                                    name={item.IsHalfDay ? "clock" : "home"} 
                                    size={20} 
                                    color={item.IsHalfDay ? '#FF9800' : '#4A90FF'} 
                                />
                            )}
                        </View>
                        <View>
                            <Text style={styles.itemTitle}>{item.EmployeeName || `Employee ID: ${item.EmployeeID}`}</Text>
                            <Text style={styles.itemSubtitle}>
                                {item.IsHalfDay 
                                    ? (item.IsFirstHalf ? 'First Half WFH' : 'Second Half WFH')
                                    : 'Full Day WFH'}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={[
                        styles.statusBadge, 
                        { backgroundColor: statusStyle.bg, borderColor: `${statusStyle.color}30`, borderWidth: 1 }
                    ]}>
                        <Feather name={statusStyle.icon as any} size={12} color={statusStyle.color} />
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                {/* Body: Date & Reason */}
                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Feather name="calendar" size={14} color={colors.textSecondary} />
                            <Text style={styles.infoLabel}>Date:</Text>
                            <Text style={styles.infoValue}>{formatDate(item.DateTime)}</Text>
                        </View>
                    </View>
                    
                    {item.Reason && (
                         <View style={styles.reasonBlock}>
                             <Text style={styles.reasonText} numberOfLines={2}>
                                {item.Reason}
                             </Text>
                         </View>
                    )}
                </View>

                {/* Footer: Workflow Button Only */}
                <View style={styles.cardFooter}>
                     <Pressable
                        style={({ pressed }) => [styles.historyButton, pressed && { opacity: 0.7 }]}
                        onPress={() => handleViewHistory(item)}
                    >
                         <Feather name="git-merge" size={14} color={colors.primary} />
                         <Text style={styles.historyButtonText}>Workflow</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <Text style={styles.screenTitle}>WFH Requests</Text>
                 <Text style={styles.totalCount}>{filteredRequests.length} Records</Text>
            </View>

            <View style={styles.filterScrollContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {renderFilterChip('All Requests', 'All', 'layers')}
                    {renderFilterChip('Full Day', 'FullDay', 'home')}
                    {renderFilterChip('Half Day', 'HalfDay', 'clock')}
                </ScrollView>
            </View>

            {isLoading && !isRefreshing ? (
                 <View style={styles.centerContainer}>
                     <Text style={styles.loadingText}>Loading requests...</Text>
                 </View>
            ) : filteredRequests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Feather name="inbox" size={40} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.emptyTitle}>No Requests Found</Text>
                    <Text style={styles.emptySubtitle}>
                        No WFH requests match the selected filter.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRequests}
                    renderItem={renderWFHRequestItem}
                    keyExtractor={(item) => item.WorkFromHomeReqMasterID.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefreshing}
                    onRefresh={() => fetchWFHRequests(true)}
                    ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                />
            )}

            {/* Approval History Modal */}
            {selectedRequest && (
                <ApprovalHistoryModal
                    visible={historyModalVisible}
                    onClose={() => setHistoryModalVisible(false)}
                    tranId={selectedRequest.WorkFromHomeReqMasterID}
                    progId={6} // WFH Program ID
                    employeeName={selectedRequest.EmployeeName || `Employee ${selectedRequest.EmployeeID}`}
                />
            )}
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 10,
        },
        screenTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
        },
        totalCount: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            color: colors.textSecondary,
            fontSize: 15,
            fontWeight: '600',
        },
        
        // Filter
        filterScrollContainer: {
            paddingBottom: 12,
        },
        filterRow: {
            paddingHorizontal: 20,
            gap: 10,
        },
        filterChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        filterChipActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        filterChipText: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        filterChipTextActive: {
            color: '#FFF',
        },

        // List
        listContent: {
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        
        // Card
        requestCard: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 3,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
        },
        headerLeft: {
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
            flex: 1,
        },
        avatarContainer: {
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        itemTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 2,
        },
        itemSubtitle: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '500',
        },
        statusBadge: {
             flexDirection: 'row',
             alignItems: 'center',
             gap: 6,
             paddingHorizontal: 12,
             paddingVertical: 6,
             borderRadius: 20,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        
        // Body
        cardBody: {
            gap: 12,
            marginBottom: 16,
        },
        infoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        infoItem: {
             flexDirection: 'row',
             alignItems: 'center',
             gap: 8,
        },
        infoLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '600',
        },
        infoValue: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '700',
        },
        reasonBlock: {
            backgroundColor: `${colors.background}`, 
            padding: 10,
            borderRadius: 8,
        },
        reasonText: {
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 18,
            fontStyle: 'italic',
        },

        // Footer
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        historyButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            padding: 4,
        },
        historyButtonText: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.primary,
        },
        
        // Empty
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80,
            gap: 12,
        },
        emptyIconCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            shadowColor: colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 20,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
        },
        emptySubtitle: {
             fontSize: 14,
             color: colors.textSecondary,
             textAlign: 'center',
             maxWidth: '70%',
        },
    });

export default Wfhrequest;