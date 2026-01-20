import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, LayoutAnimation, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';

import {
  approveAny,
  BASE,
  disapproveAny,
  getEarlyCheckoutDetails,
  getLeaveApprovals,
  getMissPunchApprovalHistory,
  getWfhApprovals
} from '@/lib/approvalsApi';
import { getExpectedLateArrivals } from '@/lib/earlyLatePunch';
import ApprovalDetailsModal, { ApprovalDetails } from './ApprovalDetailsModal';
import SwipeApprovalRow from './SwipeApprovalRow';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ApprovalItem = {
  id: number;
  title: string;
  subtitle?: string;
  status?: string;
  date?: string;
  employeeName?: string;
  profileImage?: string;

  // used to call approve/disapprove
  programId: number;
  
  // Additional leave-specific fields
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  appliedOn?: string;
  isHalfDay?: boolean;
  isFirstHalf?: boolean;
};

// ---------- Accordion ----------
function AccordionSection({
  title,
  count,
  icon,
  color,
  children,
  isOpen,
  onToggle,
  styles,
  colors,
}: {
  title: string;
  count: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  styles: any;
  colors: ThemeColors;
}) {
  const rotateAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [isOpen, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.accordionItem, { borderColor: colors.border }]}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            <Feather name={icon} size={18} color={color} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {count > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
          <Animated.View style={{ transform: [{ rotate }], marginLeft: 8 }}>
            <Feather name="chevron-down" size={18} color={colors.textSecondary} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isOpen && <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>{children}</View>}
    </View>
  );
}

function EmptyState({ label, styles, colors }: { label: string; styles: any; colors: ThemeColors }) {
  return (
    <View style={styles.emptyState}>
      <Feather name="check-circle" size={20} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );
}

interface PendingRequestsSectionProps {
  refreshKey?: number;
}

// ---------- Main ----------
const PendingRequestsSection: React.FC<PendingRequestsSectionProps> = ({ refreshKey }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [openSection, setOpenSection] = useState<string | null>('leaves');
  const [loading, setLoading] = useState(false);

  const [leaves, setLeaves] = useState<ApprovalItem[]>([]);
  const [missPunches, setMissPunches] = useState<ApprovalItem[]>([]);
  const [earlyCheckouts, setEarlyCheckouts] = useState<ApprovalItem[]>([]);
  const [wfh, setWfh] = useState<ApprovalItem[]>([]);
  const [lateArrivals, setLateArrivals] = useState<ApprovalItem[]>([]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState<ApprovalDetails | null>(null);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSection(openSection === section ? null : section);
  };

  // Action Modal State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'disapprove'>('approve');
  const [actionItem, setActionItem] = useState<{ programId: number; tranId: number } | null>(null);
  const [actionReason, setActionReason] = useState('');

  const openDetails = (item: ApprovalItem) => {
    setDetails({
      title: item.title,
      employeeName: item.employeeName,
      profileImage: item.profileImage,
      date: item.date,
      reason: item.subtitle,
      status: item.status,
      programId: item.programId,
      tranId: item.id,
      // Additional leave fields
      leaveType: item.leaveType,
      startDate: item.startDate,
      endDate: item.endDate,
      appliedOn: item.appliedOn,
      isHalfDay: item.isHalfDay,
      isFirstHalf: item.isFirstHalf,
    });
    setDetailsOpen(true);
  };

  const initiateAction = (programId: number, tranId: number, type: 'approve' | 'disapprove') => {
    setActionItem({ programId, tranId });
    setActionType(type);
    setActionReason(''); // Reset reason
    setActionModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!actionItem) return;

    // validation
    if (!actionReason.trim()) {
        Alert.alert('Reason Required', `Please enter a reason to ${actionType}.`);
        return;
    }

    try {
        if (actionType === 'approve') {
            await approveAny({ ProgramID: actionItem.programId, TranID: actionItem.tranId, Reason: actionReason });
            Alert.alert('Approved', 'Request approved successfully.');
        } else {
            await disapproveAny({ ProgramID: actionItem.programId, TranID: actionItem.tranId, Reason: actionReason });
            Alert.alert('Disapproved', 'Request disapproved successfully.');
        }
        fetchData();
        setActionModalVisible(false);
        setDetailsOpen(false); // Close details if open
    } catch (e: any) {
        Alert.alert('Error', e?.message || 'Action failed');
    }
  };

  const approve = (programId: number, tranId: number) => initiateAction(programId, tranId, 'approve');
  const disapprove = (programId: number, tranId: number) => initiateAction(programId, tranId, 'disapprove');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [leaveRes, missRes, earlyRes, wfhRes, lateArrivalRes] = await Promise.allSettled([
        getLeaveApprovals(),
        getMissPunchApprovalHistory(),
        getEarlyCheckoutDetails(),
        getWfhApprovals(),
        getExpectedLateArrivals(), // Use the new endpoint
      ]);

      // Leave approvals (ProgramID 2)
      if (leaveRes.status === 'fulfilled' && leaveRes.value.status === 'Success') {
        const data = leaveRes.value.pending_approvals || [];
        console.log('✅ Leave Approvals Data:', JSON.stringify(data, null, 2));
        setLeaves(
          data.map((i) => ({
            id: i.Leave_ID,
            programId: 2,
            employeeName: i.employee_name,
            title: `Leave: ${i.leave_type}`,
            subtitle: `${i.start_date} → ${i.end_date}\n${i.reason}`,
            status: 'Awaiting Approve',
            date: i.applied_on || i.start_date,
            profileImage: i.profile_image ? `${BASE}${i.profile_image}` : undefined,
            // Additional leave fields
            leaveType: i.leave_type,
            startDate: i.start_date,
            endDate: i.end_date,
            appliedOn: i.applied_on,
            isHalfDay: i.IsHalfDay,
            isFirstHalf: i.IsFirstHalf,
          }))
        );
      } else {
        console.log('❌ Leave Approvals Failed:', leaveRes.status === 'fulfilled' ? leaveRes.value : 'Promise rejected');
        setLeaves([]);
      }

      // Miss Punch approvals (ProgramID 1) - Filter for pending only (ApprovalStatus === 3)
      if (missRes.status === 'fulfilled' && missRes.value.status === 'Success') {
        const data = missRes.value.approval_requests || [];
        setMissPunches(
          data
            .filter((i) => i.ApprovalStatus === 3) // Only show pending requests
            .map((i) => ({
              id: i.TranID,
              programId: i.ProgramID,
              employeeName: i.EmployeeName,
              title: 'Miss Punch',
              subtitle: i.Reason,
              status: 'Awaiting Approve',
              date: i.DateTime,
            }))
        );
      } else {
        setMissPunches([]);
      }

      // Early checkout approvals (ProgramID 3)
      if (earlyRes.status === 'fulfilled' && earlyRes.value.status === 'Success') {
        const data = earlyRes.value.data || [];
        console.log('✅ Early Checkout Data:', data.length);
        setEarlyCheckouts(
          data
            .filter((i) => i.ApprovalStatusMasterID === 3 || i.approval_status === 'Pending') // Check both possible status fields
            .map((i) => ({
              id: i.EarlyCheckoutReqMasterID,
              programId: 3,
              employeeName: i.workflow_list?.[0]?.Approve_name || 'Unknown',
              title: 'Early Checkout',
              subtitle: i.Reason,
              status: i.approval_status,
              date: i.datetime,
            }))
        );
      } else {
        setEarlyCheckouts([]);
      }

      // WFH approvals (ProgramID 6)
      if (wfhRes.status === 'fulfilled' && wfhRes.value.status === 'Success') {
        console.log('✅ WFH Response:', JSON.stringify(wfhRes.value, null, 2));
        const data = wfhRes.value.approval_requests || [];
        console.log(`📊 WFH Requests Count: ${data.length}`);
        setWfh(
          data.map((i) => ({
            id: i.WorkFromHomeReqMasterID,
            programId: 6,
            employeeName: i.EmployeeName,
            title: `WFH: ${i.IsHalfDay ? 'Half Day' : 'Full Day'}`,
            subtitle: i.Reason,
            status: 'Awaiting Approve',
            date: i.DateTime,
          }))
        );
      } else {
        console.log('❌ WFH Response Failed:', wfhRes.status === 'fulfilled' ? wfhRes.value : 'Promise rejected');
        setWfh([]);
      }

      // Late Arrivals - Using /expectedlatearrivals/ endpoint
      if (lateArrivalRes.status === 'fulfilled' && lateArrivalRes.value.status === 'Success') {
        const data = lateArrivalRes.value.late_arrivals || [];
        console.log('✅ Late Arrival Response:', JSON.stringify(lateArrivalRes.value, null, 2));
        console.log('📊 Late Arrival Count:', data.length);
        
        setLateArrivals(
          data.map((i: any, index: number) => ({
            id: i.id || i.EarlyLatePunchMasterID || index, // Use index as fallback ID
            programId: 3, // Using ProgramID 3 for late arrivals
            employeeName: i.EmployeeName || 'Unknown', // Backend returns EmployeeName (capitalized)
            title: 'Late Arrival',
            subtitle: i.Reason || 'No reason provided', // Backend returns Reason (capitalized)
            status: i.status || 'Awaiting Approve',
            date: i.PunchTime || new Date().toLocaleTimeString(), // Backend returns PunchTime
          }))
        );
      } else {
        console.log('❌ Late Arrival Response Failed:', lateArrivalRes.status === 'fulfilled' ? lateArrivalRes.value : 'Promise rejected');
        setLateArrivals([]);
      }

    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData, refreshKey])
  );

  const totalCount = leaves.length + missPunches.length + earlyCheckouts.length + lateArrivals.length + wfh.length;

  return (
    <View style={styles.container}>
      <View style={styles.mainHeader}>
        <Text style={styles.sectionHeading}>Pending Approvals</Text>
        <View style={[styles.totalBadge, { backgroundColor: '#F59E0B20' }]}>
          <Text style={[styles.totalBadgeText, { color: '#F59E0B' }]}>
            {loading ? 'Loading...' : `${totalCount} Pending`}
          </Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        {/* Leaves */}
        <AccordionSection
          title="Leave Requests"
          count={leaves.length}
          icon="calendar"
          color="#EC4899"
          isOpen={openSection === 'leaves'}
          onToggle={() => toggleSection('leaves')}
          styles={styles}
          colors={colors}
        >
          {leaves.length > 0 ? (
            leaves.map((item) => (
              <SwipeApprovalRow
                key={`${item.programId}-${item.id}`}
                employeeName={item.employeeName}
                title={item.title}
                subtitle={item.subtitle}
                date={item.date}
                status={item.status}
                profileImage={item.profileImage}
                colors={colors}
                onPress={() => openDetails(item)}
                onApprove={() => approve(item.programId, item.id)}
                onDisapprove={() => disapprove(item.programId, item.id)}
              />
            ))
          ) : (
            <EmptyState label="No pending leave requests" styles={styles} colors={colors} />
          )}
        </AccordionSection>

        {/* Miss Punch */}
        <AccordionSection
          title="Missed Punches"
          count={missPunches.length}
          icon="clock"
          color="#3B82F6"
          isOpen={openSection === 'missPunches'}
          onToggle={() => toggleSection('missPunches')}
          styles={styles}
          colors={colors}
        >
          {missPunches.length > 0 ? (
            missPunches.map((item) => (
              <SwipeApprovalRow
                key={`${item.programId}-${item.id}`}
                employeeName={item.employeeName}
                title={item.title}
                subtitle={item.subtitle}
                date={item.date}
                status={item.status}
                profileImage={item.profileImage}
                colors={colors}
                onPress={() => openDetails(item)}
                onApprove={() => approve(item.programId, item.id)}
                onDisapprove={() => disapprove(item.programId, item.id)}
              />
            ))
          ) : (
            <EmptyState label="No pending punch requests" styles={styles} colors={colors} />
          )}
        </AccordionSection>

        {/* Early Checkout */}
        <AccordionSection
          title="Early Check-outs"
          count={earlyCheckouts.length}
          icon="log-out"
          color="#EF4444"
          isOpen={openSection === 'earlyCheckouts'}
          onToggle={() => toggleSection('earlyCheckouts')}
          styles={styles}
          colors={colors}
        >
          {earlyCheckouts.length > 0 ? (
            earlyCheckouts.map((item) => (
              <SwipeApprovalRow
                key={`${item.programId}-${item.id}`}
                employeeName={item.employeeName}
                title={item.title}
                subtitle={item.subtitle}
                date={item.date}
                status={item.status}
                profileImage={item.profileImage}
                colors={colors}
                onPress={() => openDetails(item)}
                onApprove={() => approve(item.programId, item.id)}
                onDisapprove={() => disapprove(item.programId, item.id)}
              />
            ))
          ) : (
            <EmptyState label="No pending early check-outs" styles={styles} colors={colors} />
          )}
        </AccordionSection>

        {/* Late Arrivals */}
        <AccordionSection
          title="Late Arrivals"
          count={lateArrivals.length}
          icon="clock"
          color="#F59E0B"
          isOpen={openSection === 'lateArrivals'}
          onToggle={() => toggleSection('lateArrivals')}
          styles={styles}
          colors={colors}
        >
          {lateArrivals.length > 0 ? (
            lateArrivals.map((item) => (
              <SwipeApprovalRow
                key={`${item.programId}-${item.id}`}
                employeeName={item.employeeName}
                title={item.title}
                subtitle={item.subtitle}
                date={item.date}
                status={item.status}
                profileImage={item.profileImage}
                colors={colors}
                onPress={() => openDetails(item)}
                onApprove={() => approve(item.programId, item.id)}
                onDisapprove={() => disapprove(item.programId, item.id)}
              />
            ))
          ) : (
            <EmptyState label="No pending late arrivals" styles={styles} colors={colors} />
          )}
        </AccordionSection>

        {/* WFH */}
        <AccordionSection
          title="WFH Requests"
          count={wfh.length}
          icon="home"
          color="#10B981"
          isOpen={openSection === 'wfh'}
          onToggle={() => toggleSection('wfh')}
          styles={styles}
          colors={colors}
        >
          {wfh.length > 0 ? (
            wfh.map((item) => (
              <SwipeApprovalRow
                key={`${item.programId}-${item.id}`}
                employeeName={item.employeeName}
                title={item.title}
                subtitle={item.subtitle}
                date={item.date}
                status={item.status}
                profileImage={item.profileImage}
                colors={colors}
                onPress={() => openDetails(item)}
                onApprove={() => approve(item.programId, item.id)}
                onDisapprove={() => disapprove(item.programId, item.id)}
              />
            ))
          ) : (
            <EmptyState label="No pending WFH requests" styles={styles} colors={colors} />
          )}
        </AccordionSection>
      </View>

      {/* Action Reason Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.actionModalOverlay}>
            <View style={styles.actionModalContent}>
                <View style={styles.actionModalHeader}>
                    <Text style={styles.actionModalTitle}>
                        {actionType === 'approve' ? 'Approve Request' : 'Disapprove Request'}
                    </Text>
                    <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                        <Feather name="x" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.actionInputLabel}>Reason</Text>
                <TextInput
                    style={styles.actionReasonInput}
                    value={actionReason}
                    onChangeText={setActionReason}
                    placeholder={`Enter reason for ${actionType}...`}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                />

                <TouchableOpacity 
                    style={[
                        styles.actionSubmitButton, 
                        { backgroundColor: actionType === 'approve' ? '#4CAF50' : '#EF5350' }
                    ]}
                    onPress={handleConfirmAction}
                >
                    <Text style={styles.actionSubmitButtonText}>
                        {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Disapproval'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <ApprovalDetailsModal
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={details}
        colors={colors}
        onApprove={() => details && approve(details.programId, details.tranId)}
        onDisapprove={() => details && disapprove(details.programId, details.tranId)}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
      gap: 16,
    },
    mainHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    sectionHeading: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: colors.text,
    },
    totalBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    totalBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },
    listContainer: {
      gap: 12,
    },
    accordionItem: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    badge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '900',
    },
    accordionBody: {
      borderTopWidth: 1,
      padding: 12,
      gap: 10,
    },
    emptyState: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 8,
      opacity: 0.7,
    },
    emptyText: {
      fontSize: 13,
      fontWeight: '600',
    },
    // Action Modal Styles
    actionModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    actionModalContent: {
        width: '100%',
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        elevation: 10,
    },
    actionModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    actionModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    actionInputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 8,
    },
    actionReasonInput: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        color: colors.text,
        marginBottom: 20,
    },
    actionSubmitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionSubmitButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
  });

export default PendingRequestsSection;