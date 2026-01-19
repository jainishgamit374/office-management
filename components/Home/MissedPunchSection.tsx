import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { getMissingPunchOut } from '@/lib/attendance';
import { getMissingPunchDetails, submitMissPunch } from '@/lib/missPunchList';

import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface MissedPunch {
  id: number;
  date: string;
  dateFormatted: string;
  type: 'check-in' | 'check-out';
  reason: string;
  status: string;
}

interface MissingPunchOut {
  date: string;
  dateFormatted: string;
}

type MissPunchFormType = 'check-in' | 'check-out';

interface MissedPunchSectionProps {
  refreshKey?: number;
}

const MissedPunchSection: React.FC<MissedPunchSectionProps> = ({ refreshKey }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isLoading, setIsLoading] = useState(true);
  const [missedPunches, setMissedPunches] = useState<MissedPunch[]>([]);
  const [missingPunchOuts, setMissingPunchOuts] = useState<MissingPunchOut[]>([]);

  // Modal / form state
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<MissPunchFormType>('check-in');
  const [formDateTimeISO, setFormDateTimeISO] = useState<string>(''); // store ISO or raw string
  const [formDateTimeLabel, setFormDateTimeLabel] = useState<string>(''); // display formatted
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMissedPunches = useCallback(async () => {
    try {
      setIsLoading(true);

      const [missedPunchResponse, missingPunchOutResponse] = await Promise.all([
        getMissingPunchDetails(),
        getMissingPunchOut(),
      ]);

      if (missedPunchResponse.status === 'Success' && missedPunchResponse.data) {
        const missedPunchData: MissedPunch[] = missedPunchResponse.data.map((item: any) => {
          const date = new Date(item.datetime);
          const punchType = item.PunchType === '1' ? 'check-in' : 'check-out';

          return {
            id: item.MissPunchReqMasterID,
            date: item.datetime,
            dateFormatted: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            type: punchType,
            reason: item.reason || 'No reason provided',
            status: item.approval_status,
          };
        });

        setMissedPunches(missedPunchData);
      } else {
        setMissedPunches([]);
      }

      if (missingPunchOutResponse.status === 'Success' && missingPunchOutResponse.data) {
        const missingPunchOutData: MissingPunchOut[] = missingPunchOutResponse.data.map((item: any) => {
          const date = new Date(item.missing_date);
          return {
            date: item.missing_date,
            dateFormatted: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          };
        });

        setMissingPunchOuts(missingPunchOutData);
      } else {
        setMissingPunchOuts([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch missed punches:', error);
      setMissedPunches([]);
      setMissingPunchOuts([]);
    } finally {
      setIsLoading(false);
    }
  }, [refreshKey]);

  useFocusEffect(
    useCallback(() => {
      fetchMissedPunches();
    }, [fetchMissedPunches, refreshKey])
  );

  const formatDateTime = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const openSubmitModalForRequest = (punch: MissedPunch) => {
    setFormType(punch.type);                       // check-in/check-out
    setFormDateTimeISO(punch.date);                // prefill
    setFormDateTimeLabel(formatDateTime(punch.date));
    setReason('');                                  // user must write new reason
    setShowModal(true);
  };

  const openSubmitModalForMissingOut = (punchOut: MissingPunchOut) => {
    // Missing Punch-Out: typically user forgot OUT, default type = check-out
    // We can set time to 06:30 PM by default if backend expects datetime.
    // If your API accepts date only, keep it as date.
    const defaultDate = new Date(punchOut.date);
    defaultDate.setHours(18, 30, 0, 0); // 6:30 PM default suggestion

    const iso = defaultDate.toISOString();

    setFormType('check-out');
    setFormDateTimeISO(iso);
    setFormDateTimeLabel(formatDateTime(iso));
    setReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setReason('');
    setIsSubmitting(false);
  };

  const submit = async () => {
    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Extract date in YYYY-MM-DD format
      const dateObj = new Date(formDateTimeISO);
      const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

      await submitMissPunch({
        Date: formattedDate,
        PunchType: formType === 'check-in' ? 1 : 2,
        Reason: reason.trim(),
      });

      Alert.alert('Submitted', 'Your miss punch request has been submitted and sent for approval.');
      closeModal();
      fetchMissedPunches(); // refresh
    } catch (e: any) {
      console.error(e);
      Alert.alert('Failed', e?.message || 'Unable to submit miss punch request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoading && missedPunches.length === 0 && missingPunchOuts.length === 0) {
    return null;
  }

  const totalCount = missedPunches.length + missingPunchOuts.length;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.mainTextContainer}>
          <Text style={styles.mainText}>
            Missed Punches {totalCount > 0 && `(${totalCount})`}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <View style={styles.textContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
              {/* Missing Punch-Outs */}
              {missingPunchOuts.map((punchOut, index) => (
                <TouchableOpacity
                  key={`missing-${index}`}
                  style={styles.warningContainer}
                  onPress={() => openSubmitModalForMissingOut(punchOut)}
                  activeOpacity={0.7}
                >
                  <Feather name="alert-circle" size={16} color="#FF5252" style={styles.icon} />
                  <Text style={styles.warningText}>{punchOut.dateFormatted}</Text>
                  <Text style={styles.warningTypeText}>Missing Punch-Out</Text>
                  <Text style={styles.tapHint}>Tap to submit</Text>
                </TouchableOpacity>
              ))}

              {/* Missed Punch Requests */}
              {missedPunches.map((punch, index) => (
                <TouchableOpacity
                  key={`request-${index}`}
                  style={styles.textContainerRight}
                  onPress={() => openSubmitModalForRequest(punch)}
                  activeOpacity={0.7}
                >
                  <Feather name={punch.type === 'check-in' ? 'log-in' : 'log-out'} size={16} color={colors.primary} style={styles.icon} />
                  <Text style={styles.text}>{punch.dateFormatted}</Text>
                  <Text style={styles.typeText}>{punch.type === 'check-in' ? 'Check-In' : 'Check-Out'}</Text>
                  <Text style={styles.tapHint}>Tap to submit</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Submit Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Miss Punch</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Status selector */}
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentBtn, formType === 'check-in' && styles.segmentBtnActive]}
                onPress={() => setFormType('check-in')}
                activeOpacity={0.8}
              >
                <Feather name="log-in" size={14} color={formType === 'check-in' ? '#fff' : colors.text} />
                <Text style={[styles.segmentText, formType === 'check-in' && styles.segmentTextActive]}>
                  Check-In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, formType === 'check-out' && styles.segmentBtnActive]}
                onPress={() => setFormType('check-out')}
                activeOpacity={0.8}
              >
                <Feather name="log-out" size={14} color={formType === 'check-out' ? '#fff' : colors.text} />
                <Text style={[styles.segmentText, formType === 'check-out' && styles.segmentTextActive]}>
                  Check-Out
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date & Time box */}
            <Text style={styles.fieldLabel}>Date & Time</Text>
            <View style={styles.dateTimeBox}>
              <Feather name="calendar" size={16} color={colors.primary} />
              <Text style={styles.dateTimeText}>{formDateTimeLabel || '--'}</Text>
            </View>
            {/* If you want editable date/time later, we can add a DateTimePicker here */}

            {/* Reason */}
            <Text style={styles.fieldLabel}>Reason</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Enter reason..."
              placeholderTextColor={colors.textSecondary}
              multiline
              style={styles.reasonInput}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
              onPress={submit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closeModal} activeOpacity={0.8}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: 16,
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 16,
      gap: 15,
    },
    mainTextContainer: { width: '100%', alignItems: 'flex-start' },
    mainText: { fontSize: 16, fontWeight: '600', color: '#fff' },

    loadingContainer: { paddingVertical: 20, alignItems: 'center' },

    textContainer: { width: '100%' },
    scrollViewContent: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 5 },

    textContainerRight: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 150,
      gap: 5,
    },
    warningContainer: {
      backgroundColor: '#FFEBEE',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 150,
      gap: 5,
      borderWidth: 1,
      borderColor: '#FF5252',
    },
    icon: { marginBottom: 4 },

    text: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    typeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
      textTransform: 'uppercase',
    },

    warningText: { fontSize: 14, fontWeight: '700', color: '#FF5252', textAlign: 'center' },
    warningTypeText: { fontSize: 11, fontWeight: '700', color: '#D32F2F', textAlign: 'center', textTransform: 'uppercase' },

    tapHint: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
      opacity: 0.8,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      width: '100%',
      maxWidth: 420,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },

    fieldLabel: {
      marginTop: 10,
      marginBottom: 6,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    segment: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 4,
      gap: 6,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    segmentBtnActive: {
      backgroundColor: colors.primary,
    },
    segmentText: { fontSize: 13, fontWeight: '700', color: colors.text },
    segmentTextActive: { color: '#fff' },

    dateTimeBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    dateTimeText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },

    reasonInput: {
      minHeight: 90,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.background,
      color: colors.text,
      textAlignVertical: 'top',
    },

    submitButton: {
      marginTop: 14,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    submitButtonText: { fontSize: 15, fontWeight: '800', color: '#fff' },

    cancelButton: {
      marginTop: 10,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.06)',
    },
    cancelButtonText: { fontSize: 14, fontWeight: '700', color: colors.text },
  });

export default MissedPunchSection;