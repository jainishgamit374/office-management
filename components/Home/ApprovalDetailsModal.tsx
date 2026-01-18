import { ThemeColors } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ApprovalDetails = {
  title: string;
  employeeName?: string;
  profileImage?: string; // New
  date?: string;
  reason?: string;
  status?: string;
  programId: number;
  tranId: number;
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{details.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Employee Info with optional Image */}
          {(!!details.employeeName || !!details.profileImage) && (
            <View style={styles.employeeSection}>
              {!!details.profileImage && (
                <Image source={{ uri: details.profileImage }} style={styles.profileImage} />
              )}
              <View style={styles.employeeText}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>EMPLOYEE</Text>
                <Text style={[styles.value, { color: colors.text }]}>{details.employeeName || 'Unknown'}</Text>
              </View>
            </View>
          )}

          {!!details.date && <Row label="Date & Time" value={details.date} colors={colors} />}
          {!!details.reason && <Row label="Reason" value={details.reason} colors={colors} />}
          {!!details.status && <Row label="Status" value={details.status} colors={colors} />}

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#EF4444' }]} onPress={onDisapprove}>
              <Feather name="x" size={16} color="#fff" />
              <Text style={styles.btnText}>Disapprove</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, { backgroundColor: '#10B981' }]} onPress={onApprove}>
              <Feather name="check" size={16} color="#fff" />
              <Text style={styles.btnText}>Approve</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Tip: Swipe left to approve, swipe right to disapprove.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  card: { borderRadius: 18, borderWidth: 1, padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '900', flex: 1, paddingRight: 8 },

  employeeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  employeeText: {
    flex: 1,
    justifyContent: 'center',
  },

  row: { marginTop: 10 },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { marginTop: 4, fontSize: 13, fontWeight: '700' },

  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '900' },
  hint: { marginTop: 10, fontSize: 11, fontWeight: '600', textAlign: 'center', opacity: 0.8 },
});