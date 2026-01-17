import { useTheme } from '@/contexts/ThemeContext';
import { approveRequest, disapproveRequest, PROGRAM_IDS } from '@/lib/approvals';
import Feather from '@expo/vector-icons/Feather';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

// APIs
import { getEarlyCheckoutList } from '@/lib/earlyCheckoutList';
import { getLeaveApplicationsList } from '@/lib/leaves';
import { getMissPunchList } from '@/lib/missPunchList';
import { getWFHApplicationsList } from '@/lib/wfhApprovalHistory';

export type ApprovalType = 'MissedPunch' | 'Leave' | 'EarlyCheckout' | 'WFH';

interface ApprovalListModalProps {
  visible: boolean;
  onClose: () => void;
  type: ApprovalType;
}

interface RequestItem {
  id: string | number; // TranID
  programId: number;
  title: string;
  subtitle: string;
  date: string;
  status: string; // 'Pending', 'Approve', 'Reject'
  rawStatusId?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const ApprovalListModal: React.FC<ApprovalListModalProps> = ({ visible, onClose, type }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'Pending' | 'History'>('Pending');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // To force re-render

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let rawData: RequestItem[] = [];

      if (type === 'MissedPunch') {
        const res = await getMissPunchList();
        if (res.status === 'Success' && res.approval_requests) {
          rawData = res.approval_requests.map((item) => ({
            id: item.TranID || item.MissPunchReqMasterID || 0,
            programId: PROGRAM_IDS.MissedPunch,
            title: item.EmployeeName || 'Unknown Employee',
            subtitle: item.Reason || 'No reason provided',
            date: item.DateTime,
            status: mapStatus(item.ApprovalStatus),
            rawStatusId: item.ApprovalStatus,
          }));
        }
      } else if (type === 'Leave') {
        // Warning: getLeaveApplicationsList parameters might need adjustment based on API
        // Assuming it fetches list of leaves
        const res = await getLeaveApplicationsList({}); 
        // Logic depends on actual response structure of getLeaveApplicationsList which can vary
        // Creating a safe mapping based on expected fields
        const list = Array.isArray(res?.data) ? res.data : (res as any).pending_approvals || [];
        rawData = list.map((item: any) => ({
            id: item.LeaveApplicationMasterID || item.Leave_ID,
            programId: PROGRAM_IDS.Leave,
            title: item.EmployeeName || item.employee_name || 'Unknown',
            subtitle: `${item.LeaveType} - ${item.Reason || ''}`,
            date: item.StartDate || item.start_date,
            status: item.ApprovalStatusName || mapStatus(item.ApprovalStatus),
            rawStatusId: typeof item.ApprovalStatus === 'number' ? item.ApprovalStatus : undefined,
        }));

      } else if (type === 'EarlyCheckout') {
        const res = await getEarlyCheckoutList();
        if (res.status === 'Success' && res.approval_requests) {
             rawData = res.approval_requests.map((item) => ({
                id: item.TranID || item.EarlyCheckoutReqMasterID || 0,
                programId: PROGRAM_IDS.EarlyCheckout,
                title: item.EmployeeName || 'Unknown',
                subtitle: item.Reason || 'No reason',
                date: item.DateTime,
                status: mapStatus(item.ApprovalStatus), // Assuming numeric
                rawStatusId: item.ApprovalStatus,
            }));
        }
      } else if (type === 'WFH') {
         const res = await getWFHApplicationsList();
         if (res.status === 'Success' && res.data) {
             rawData = res.data.map((item: any) => ({
                 id: item.TranID || item.WorkFromHomeReqMasterID,
                 programId: PROGRAM_IDS.WFH,
                 title: `WFH Request`, // Name might not be in this list for self? User wants approvals list, so likely includes names
                 subtitle: item.Reason,
                 date: item.DateTime,
                 status: item.ApprovalStatus, // Often string "Awaiting Approve"
                 rawStatusId: item.ApprovalStatusID,
             }));
         }
      }

      setItems(rawData);
    } catch (err) {
      console.error(err);
      // Alert.alert('Error', 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [type, refreshKey]);

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible, fetchData]);

  // --- Helpers ---
  const mapStatus = (status: number | string): string => {
    // Basic mapping, heuristic
    if (typeof status === 'string') return status;
    if (status === 1) return 'Approve'; // or 'Approved'
    if (status === 2) return 'Reject';
    if (status === 3) return 'Pending'; // 'Awaiting Approve'
    return 'Unknown';
  };

  const isPending = (status: string) => {
    const s = status.toLowerCase();
    return s.includes('pending') || s.includes('awaiting') || s.includes('submitted');
  };

  const filteredItems = items.filter(item => 
    activeTab === 'Pending' ? isPending(item.status) : !isPending(item.status)
  );

  // --- Actions ---
  const handleApprove = async (item: RequestItem) => {
    try {
        await approveRequest({
            ProgramID: item.programId,
            TranID: Number(item.id),
            Reason: 'Approved via App'
        });
        // Optimistic update or refresh
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'Approve' } : p));
        Alert.alert('Success', 'Request Approved');
    } catch (e: any) {
        Alert.alert('Error', e.message);
    }
  };

  const handleDisapprove = async (item: RequestItem) => {
    try {
        await disapproveRequest({
            ProgramID: item.programId,
            TranID: Number(item.id),
        });
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'Reject' } : p));
        Alert.alert('Success', 'Request Disapproved');
    } catch (e: any) {
        Alert.alert('Error', e.message);
    }
  };

  // --- Render ---

  const renderRightActions = (item: RequestItem) => {
    // Swipe Left to Approve (Green) - wait, typically Right Swipe (finger moves right) is Left Action? 
    // Standard: Swipe Left (reveal right side) -> Reject/Delete. Swipe Right (reveal left side) -> Approve/Keep.
    // User said: "swipe right it get dissappropeve and left swipe approve"
    // "Swipe Right" usually means moving finger left-to-right. This reveals the LEFT action.
    // "Left Swipe" usually means moving finger right-to-left. This reveals the RIGHT action.
    
    // So: Left Action (Swipe Right) -> Disapprove ?? 
    // User: "swipe right it get dissappropeve" -> Reveal Left sidebar?
    // User: "left swipe approve" -> Reveal Right sidebar?
    // Let's implement generic sides.

    if (!isPending(item.status)) return null;

    return (
      <View style={{ width: 80, flexDirection: 'row' }}>
         <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
            onPress={() => handleApprove(item)}
         >
             <Feather name="check" size={24} color="#fff" />
         </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (item: RequestItem) => {
    if (!isPending(item.status)) return null;

    return (
      <View style={{ width: 80, flexDirection: 'row' }}>
         <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
            onPress={() => handleDisapprove(item)}
         >
             <Feather name="x" size={24} color="#fff" />
         </TouchableOpacity>
      </View>
    );
  };

  // User logic: "Swipe Right" (finger L->R) -> Disapprove. This calls `renderLeftActions`.
  // "Swipe Left" (finger R->L) -> Approve. This calls `renderRightActions`.
  
  // So renderLeftActions should be Disapprove (Red).
  // renderRightActions should be Approve (Green).

  const renderItem = ({ item }: { item: RequestItem }) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        renderLeftActions={() => renderLeftActions(item)}
        overshootRight={false}
        overshootLeft={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
           <View style={styles.cardHeader}>
             <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
             <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                {new Date(item.date).toDateString()}
             </Text>
           </View>
           <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
           <View style={[styles.statusBadge, { 
               backgroundColor: isPending(item.status) ? '#F59E0B20' : (item.status.includes('Approve') ? '#10B98120' : '#EF444420') 
           }]}>
               <Text style={[styles.statusText, { 
                   color: isPending(item.status) ? '#F59E0B' : (item.status.includes('Approve') ? '#10B981' : '#EF4444') 
               }]}>{item.status}</Text>
           </View>
        </View>
      </Swipeable>
    );
  };

  const getTitle = () => {
      switch(type) {
          case 'MissedPunch': return 'Miss Punch Approvals';
          case 'Leave': return 'Leave Approvals';
          case 'WFH': return 'WFH Approvals';
          case 'EarlyCheckout': return 'Early Checkout Approvals';
          default: return 'Approvals';
      }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{getTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
           <TouchableOpacity 
             style={[styles.tab, activeTab === 'Pending' && { borderBottomColor: colors.primary }]}
             onPress={() => setActiveTab('Pending')}
           >
              <Text style={[styles.tabText, { color: activeTab === 'Pending' ? colors.primary : colors.textSecondary }]}>
                  {getTitle()} (Pending)
              </Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[styles.tab, activeTab === 'History' && { borderBottomColor: colors.primary }]}
             onPress={() => setActiveTab('History')}
           >
              <Text style={[styles.tabText, { color: activeTab === 'History' ? colors.primary : colors.textSecondary }]}>
                  History
              </Text>
           </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        ) : (
            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={{ color: colors.textSecondary }}>No records found</Text>
                    </View>
                }
            />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 0, // Handled by gap
    // Elevation for card look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#fff', 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDate: {
    fontSize: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  actionBtn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 0, 
  }
});

export default ApprovalListModal;
