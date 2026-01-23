import { ThemeColors } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <View style={[styles.header, { borderBottomColor: '#F1F5F9' }]}>
            <View style={styles.headerLeft}>
              <View style={styles.statusIndicator} />
              <Text style={[styles.headerTitle, { color: '#0F172A' }]}>Leave Request</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Feather name="x" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Employee Section */}
              <View style={styles.employeeSection}>
                {details.profileImage ? (
                  <Image source={{ uri: details.profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{getInitials(details.employeeName)}</Text>
                  </View>
                )}
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{details.employeeName || 'Unknown'}</Text>
                  <Text style={styles.leaveType}>{details.leaveType || details.title}</Text>
                </View>
              </View>

              {/* Timeline Section */}
              {(details.startDate || details.endDate) && (
                <View style={styles.timelineSection}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>Start Date</Text>
                      <Text style={styles.timelineValue}>{details.startDate}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>End Date</Text>
                      <Text style={styles.timelineValue}>{details.endDate}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Meta Info Row */}
              <View style={styles.metaRow}>
                {days && (
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={14} color="#64748B" />
                    <Text style={styles.metaText}>
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </Text>
                  </View>
                )}
                {details.isHalfDay && (
                  <View style={styles.halfDayChip}>
                    <Feather name="clock" size={12} color="#F59E0B" />
                    <Text style={styles.halfDayText}>
                      {details.isFirstHalf ? 'First Half' : 'Second Half'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Reason Section */}
              {details.reason && (
                <View style={styles.reasonSection}>
                  <Text style={styles.reasonLabel}>Reason</Text>
                  <Text style={styles.reasonText}>{details.reason}</Text>
                </View>
              )}

              {/* Applied Date */}
              {details.appliedOn && (
                <View style={styles.appliedRow}>
                  <Feather name="info" size={12} color="#94A3B8" />
                  <Text style={styles.appliedText}>Applied on {details.appliedOn}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: '#F1F5F9' }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={onDisapprove}
              activeOpacity={0.85}
            >
              <Feather name="x-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={onApprove}
              activeOpacity={0.85}
            >
              <Feather name="check-circle" size={18} color="#fff" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 3,
    height: 24,
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },

  // Content
  scrollContent: {
    maxHeight: '70%',
  },
  content: {
    padding: 20,
    gap: 20,
  },

  // Employee Section
  employeeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  employeeInfo: {
    flex: 1,
    gap: 4,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  leaveType: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },

  // Timeline
  timelineSection: {
    paddingVertical: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
    marginTop: 5,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
    marginVertical: 6,
  },
  timelineContent: {
    flex: 1,
    gap: 3,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  halfDayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  halfDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },

  // Reason
  reasonSection: {
    gap: 8,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 21,
  },

  // Applied
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});