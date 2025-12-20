import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type LeaveType = 'PL' | 'CL' | 'SL' | 'AB';
type LeaveStatus = 'Approved' | 'Pending' | 'Rejected';
type DateFilter = 'All' | 'Today' | 'Tomorrow';
type LeaveTypeFilter = 'All' | 'PL' | 'CL' | 'SL' | 'AB';

interface ApprovalHistoryItem {
  approver: string;
  role: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  date: string;
  comment?: string;
}

interface LeaveItem {
  id: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  reason: string;
  fromDate: string;
  toDate: string;
  duration: string;
  appliedDate: string;
  approvalHistory: ApprovalHistoryItem[];
}

// Reusable Dropdown Component
interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onSelect, icon = 'chevron-down' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: string) => {
    onSelect(option);
    toggleDropdown();
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(options.length * 50, 250)],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <Feather name={icon as any} size={20} color="#4A90FF" />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View
          style={[
            styles.dropdownList,
            {
              height: dropdownHeight,
              opacity: animation,
            },
          ]}
        >
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  option === value && styles.dropdownItemActive,
                ]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    option === value && styles.dropdownItemTextActive,
                  ]}
                >
                  {option}
                </Text>
                {option === value && (
                  <Feather name="check" size={18} color="#4A90FF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

// Reusable Leave Card Component
interface LeaveCardProps {
  leave: LeaveItem;
  onPress: () => void;
  isExpanded: boolean;
}

const LeaveCard: React.FC<LeaveCardProps> = ({ leave, onPress, isExpanded }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [expandAnim] = useState(new Animated.Value(isExpanded ? 1 : 0));

  React.useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [isExpanded]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case 'PL': return '#4A90FF';
      case 'CL': return '#FF9800';
      case 'SL': return '#FF5252';
      case 'AB': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Rejected': return '#FF5252';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case 'Approved': return 'check-circle';
      case 'Pending': return 'clock';
      case 'Rejected': return 'x-circle';
      default: return 'circle';
    }
  };

  const approvalHistoryHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, leave.approvalHistory.length * 80 + 40],
  });

  return (
    <Animated.View
      style={[
        styles.leaveCard,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header: Leave Type and Status */}
        <View style={styles.leaveCardHeader}>
          <View style={styles.leaveTypeContainer}>
            <View
              style={[
                styles.leaveTypeBadge,
                { backgroundColor: `${getLeaveTypeColor(leave.leaveType)}20` },
              ]}
            >
              <Feather
                name="calendar"
                size={16}
                color={getLeaveTypeColor(leave.leaveType)}
              />
              <Text
                style={[
                  styles.leaveTypeText,
                  { color: getLeaveTypeColor(leave.leaveType) },
                ]}
              >
                {leave.leaveType}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(leave.status)}15` },
            ]}
          >
            <Feather
              name={getStatusIcon(leave.status) as any}
              size={14}
              color={getStatusColor(leave.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(leave.status) },
              ]}
            >
              {leave.status}
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.leaveSection}>
          <Text style={styles.leaveSectionLabel}>Reason</Text>
          <Text style={styles.leaveReason} numberOfLines={2}>
            {leave.reason}
          </Text>
        </View>

        {/* Date Range */}
        <View style={styles.leaveSection}>
          <Text style={styles.leaveSectionLabel}>Date</Text>
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateBox}>
              <Feather name="calendar" size={14} color="#4A90FF" />
              <Text style={styles.dateText}>{leave.fromDate}</Text>
            </View>
            <Feather name="arrow-right" size={16} color="#999" />
            <View style={styles.dateBox}>
              <Feather name="calendar" size={14} color="#4A90FF" />
              <Text style={styles.dateText}>{leave.toDate}</Text>
            </View>
          </View>
        </View>

        {/* Duration */}
        <View style={styles.leaveSection}>
          <Text style={styles.leaveSectionLabel}>Duration</Text>
          <View style={styles.durationContainer}>
            <Feather name="clock" size={14} color="#666" />
            <Text style={styles.durationText}>{leave.duration}</Text>
          </View>
        </View>

        {/* Approval History Dropdown Toggle */}
        <View style={styles.approvalHistoryToggle}>
          <Text style={styles.approvalHistoryLabel}>Approval History</Text>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            }}
          >
            <Feather name="chevron-down" size={20} color="#4A90FF" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Approval History Content */}
      <Animated.View
        style={[
          styles.approvalHistoryContent,
          {
            height: isExpanded ? approvalHistoryHeight : 0,
            opacity: expandAnim,
          },
        ]}
      >
        {leave.approvalHistory.map((item, index) => (
          <View key={index} style={styles.approvalHistoryItem}>
            <View style={styles.approvalHistoryLeft}>
              <View
                style={[
                  styles.approvalStatusIcon,
                  { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}
              >
                <Feather
                  name={getStatusIcon(item.status) as any}
                  size={16}
                  color={getStatusColor(item.status)}
                />
              </View>
              <View style={styles.approvalHistoryInfo}>
                <Text style={styles.approverName}>{item.approver}</Text>
                <Text style={styles.approverRole}>{item.role}</Text>
                {item.comment && (
                  <Text style={styles.approverComment}>{item.comment}</Text>
                )}
              </View>
            </View>
            <View style={styles.approvalHistoryRight}>
              <Text
                style={[
                  styles.approvalStatus,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
              <Text style={styles.approvalDate}>{item.date}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

// Main Component
const LeaveCalendar = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<LeaveTypeFilter>('All');
  const [expandedLeaveId, setExpandedLeaveId] = useState<string | null>(null);

  // Sample data
  const leaveData: LeaveItem[] = [
    {
      id: '1',
      leaveType: 'PL',
      status: 'Approved',
      reason: 'Family function - attending wedding ceremony',
      fromDate: '25 Dec 2025',
      toDate: '27 Dec 2025',
      duration: '3 Days',
      appliedDate: '15 Dec 2025',
      approvalHistory: [
        {
          approver: 'John Smith',
          role: 'Team Lead',
          status: 'Approved',
          date: '16 Dec 2025',
          comment: 'Approved. Enjoy your time!',
        },
        {
          approver: 'Sarah Johnson',
          role: 'HR Manager',
          status: 'Approved',
          date: '16 Dec 2025',
        },
      ],
    },
    {
      id: '2',
      leaveType: 'SL',
      status: 'Pending',
      reason: 'Medical appointment with specialist doctor',
      fromDate: '20 Dec 2025',
      toDate: '20 Dec 2025',
      duration: '1 Day',
      appliedDate: '18 Dec 2025',
      approvalHistory: [
        {
          approver: 'John Smith',
          role: 'Team Lead',
          status: 'Pending',
          date: '18 Dec 2025',
        },
      ],
    },
    {
      id: '3',
      leaveType: 'CL',
      status: 'Rejected',
      reason: 'Personal work',
      fromDate: '15 Dec 2025',
      toDate: '16 Dec 2025',
      duration: '2 Days',
      appliedDate: '10 Dec 2025',
      approvalHistory: [
        {
          approver: 'John Smith',
          role: 'Team Lead',
          status: 'Rejected',
          date: '11 Dec 2025',
          comment: 'Critical project deadline. Please reschedule.',
        },
      ],
    },
    {
      id: '4',
      leaveType: 'AB',
      status: 'Approved',
      reason: 'Emergency - power outage at home',
      fromDate: '12 Dec 2025',
      toDate: '12 Dec 2025',
      duration: '0.5 Day',
      appliedDate: '12 Dec 2025',
      approvalHistory: [
        {
          approver: 'John Smith',
          role: 'Team Lead',
          status: 'Approved',
          date: '12 Dec 2025',
        },
      ],
    },
  ];

  const filteredLeaves = leaveData.filter((leave) => {
    // Filter by leave type
    if (leaveTypeFilter !== 'All' && leave.leaveType !== leaveTypeFilter) {
      return false;
    }
    // Date filter logic would go here (simplified for demo)
    return true;
  });

  const handleLeavePress = (leaveId: string) => {
    setExpandedLeaveId(expandedLeaveId === leaveId ? null : leaveId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Feather name="calendar" size={28} color="#4A90FF" />
            <Text style={styles.headerTitle}>Leave Calendar</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Track and manage your leave requests
          </Text>
        </View>

        {/* Status Summary */}
        <View style={styles.statusSummary}>
          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: '#4CAF5020' }]}>
              <Feather name="check-circle" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statusCount}>2</Text>
            <Text style={styles.statusLabel}>Approved</Text>
          </View>
          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: '#FF980020' }]}>
              <Feather name="clock" size={20} color="#FF9800" />
            </View>
            <Text style={styles.statusCount}>1</Text>
            <Text style={styles.statusLabel}>Pending</Text>
          </View>
          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: '#FF525220' }]}>
              <Feather name="x-circle" size={20} color="#FF5252" />
            </View>
            <Text style={styles.statusCount}>1</Text>
            <Text style={styles.statusLabel}>Rejected</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Dropdown
            label="Date Filter"
            value={dateFilter}
            options={['All', 'Today', 'Tomorrow']}
            onSelect={(value) => setDateFilter(value as DateFilter)}
          />

          <Dropdown
            label="Leave Type"
            value={leaveTypeFilter}
            options={['All', 'PL', 'CL', 'SL', 'AB']}
            onSelect={(value) => setLeaveTypeFilter(value as LeaveTypeFilter)}
          />
        </View>

        {/* Leave List */}
        <View style={styles.leaveListContainer}>
          <Text style={styles.leaveListTitle}>
            All Leaves ({filteredLeaves.length})
          </Text>

          {filteredLeaves.map((leave) => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              onPress={() => handleLeavePress(leave.id)}
              isExpanded={expandedLeaveId === leave.id}
            />
          ))}

          {filteredLeaves.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No leaves found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    width: '100%',
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginLeft: 40,
  },

  // Status Summary
  statusSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
  },

  // Dropdown
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    width: '60%',

  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemActive: {
    backgroundColor: '#F0F8FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#666',
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: '#4A90FF',
  },

  // Filters
  filtersContainer: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Leave List
  leaveListContainer: {
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Leave Card
  leaveCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  leaveCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leaveTypeContainer: {
    flex: 1,
  },
  leaveTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  leaveTypeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Leave Sections
  leaveSection: {
    marginBottom: 16,
  },
  leaveSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  leaveReason: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },

  // Date Range
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Duration
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  // Approval History
  approvalHistoryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  approvalHistoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90FF',
  },
  approvalHistoryContent: {
    overflow: 'hidden',
  },
  approvalHistoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  approvalHistoryLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  approvalStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalHistoryInfo: {
    flex: 1,
  },
  approverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  approverRole: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  approverComment: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  approvalHistoryRight: {
    alignItems: 'flex-end',
  },
  approvalStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  approvalDate: {
    fontSize: 12,
    color: '#999',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 4,
  },
});

export default LeaveCalendar;