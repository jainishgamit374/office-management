import { ThemeColors } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ApprovalDetails = {
  title: string;
  employeeName?: string;
  profileImage?: string;
  date?: string;
  reason?: string;
  status?: string;
  programId: number;
  tranId: number;
  // Additional leave-specific fields
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  appliedOn?: string;
  isHalfDay?: boolean;
  isFirstHalf?: boolean;
};

export default function ApprovalDetailsModal({
  visible,
  onClose,
  details,
  colors,
  onApprove,
  onDisapprove,
}: {
  visible: boolean;
  onClose: () => void;
  details: ApprovalDetails | null;
  colors: ThemeColors;
  onApprove: () => void;
  onDisapprove: () => void;
}) {
  if (!details) return null;

  // Get initials from employee name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate number of days
  const calculateDays = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays(details.startDate, details.endDate);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Leave Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Employee Card */}
            <View style={[styles.employeeCard, { backgroundColor: colors.background }]}>
              {details.profileImage ? (
                <Image source={{ uri: details.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {getInitials(details.employeeName)}
                  </Text>
                </View>
              )}
              <View style={styles.employeeInfo}>
                <Text style={[styles.employeeName, { color: colors.text }]}>
                  {details.employeeName || 'Unknown'}
                </Text>
                <Text style={[styles.leaveType, { color: colors.textSecondary }]}>
                  {details.leaveType || details.title}
                </Text>
              </View>
            </View>

            {/* Leave Duration */}
            {(details.startDate || details.endDate) && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  LEAVE DURATION
                </Text>
                <View style={[styles.durationCard, { backgroundColor: colors.background }]}>
                  <View style={styles.dateRow}>
                    <View style={styles.dateItem}>
                      <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>From</Text>
                      <Text style={[styles.dateValue, { color: colors.text }]}>
                        {details.startDate}
                      </Text>
                    </View>
                    <Feather name="arrow-right" size={16} color={colors.textTertiary} />
                    <View style={styles.dateItem}>
                      <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>To</Text>
                      <Text style={[styles.dateValue, { color: colors.text }]}>
                        {details.endDate}
                      </Text>
                    </View>
                  </View>
                  {days && (
                    <View style={[styles.daysBadge, { backgroundColor: `${colors.primary}15` }]}>
                      <Text style={[styles.daysText, { color: colors.primary }]}>
                        {days} {days === 1 ? 'Day' : 'Days'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Half Day Info */}
            {details.isHalfDay && (
              <View style={[styles.halfDayBadge, { backgroundColor: '#FFF3E0' }]}>
                <Feather name="clock" size={14} color="#F59E0B" />
                <Text style={styles.halfDayText}>
                  Half Day - {details.isFirstHalf ? 'First Half' : 'Second Half'}
                </Text>
              </View>
            )}

            {/* Reason */}
            {details.reason && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  REASON
                </Text>
                <View style={[styles.reasonCard, { backgroundColor: colors.background }]}>
                  <Text style={[styles.reasonText, { color: colors.text }]}>
                    {details.reason}
                  </Text>
                </View>
              </View>
            )}

            {/* Applied On */}
            {details.appliedOn && (
              <View style={styles.appliedRow}>
                <Feather name="calendar" size={12} color={colors.textTertiary} />
                <Text style={[styles.appliedText, { color: colors.textTertiary }]}>
                  Applied on {details.appliedOn}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={onDisapprove}
              activeOpacity={0.8}
            >
              <Feather name="x" size={18} color="#fff" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={onApprove}
              activeOpacity={0.8}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeButton: {
    padding: 4,
  },

  content: {
    padding: 16,
    gap: 14,
  },

  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  employeeInfo: {
    flex: 1,
    gap: 2,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  leaveType: {
    fontSize: 12,
    fontWeight: '600',
  },

  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  durationCard: {
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  daysBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '700',
  },

  halfDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  halfDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },

  reasonCard: {
    padding: 12,
    borderRadius: 10,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  appliedText: {
    fontSize: 11,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});