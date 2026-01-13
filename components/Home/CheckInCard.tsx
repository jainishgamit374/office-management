// components/CheckInCard.tsx
import { useTheme } from '@/contexts/ThemeContext';
import {
  formatMinutesToHours,
  getCurrentLocation,
  getPunchStatus,
  hasLocationPermission,
  isLateCheckIn,
  recordPunch,
  requestLocationPermission,
  type PunchResponse,
  type PunchStatusResponse
} from '@/lib/attendance';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  UIManager,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';

// ============ CONSTANTS ============
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = 20;
const SECTION_PADDING = 16;
const TRACK_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2) - (SECTION_PADDING * 2);
const BUTTON_SIZE = 64;
const BUTTON_MARGIN = 3;
const MAX_SWIPE_DISTANCE = TRACK_WIDTH - BUTTON_SIZE - (BUTTON_MARGIN * 2);
const SWIPE_THRESHOLD = MAX_SWIPE_DISTANCE * 0.6;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============ TYPES ============
interface CheckInCardProps {
  onCheckInChange?: (isCheckedIn: boolean, hasCheckedOut: boolean) => void;
  onLateEarlyCountChange?: (lateCount: number, earlyCount: number) => void;
  onStatusLoaded?: (status: PunchStatusResponse) => void;
}

// ============ COMPONENT ============
const CheckInCard: React.FC<CheckInCardProps> = ({
  onCheckInChange,
  onLateEarlyCountChange,
  onStatusLoaded,
}) => {
  const { colors, theme } = useTheme();

  // ============ STATE ============
  const [punchType, setPunchType] = useState<0 | 1 | 2>(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPunching, setIsPunching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [punchInDate, setPunchInDate] = useState<Date | null>(null);
  const [punchOutDate, setPunchOutDate] = useState<Date | null>(null);
  const [workingMinutes, setWorkingMinutes] = useState<number>(0);

  const [elapsedHours, setElapsedHours] = useState<number>(0);
  const [currentHourProgress, setCurrentHourProgress] = useState<number>(0);

  const [lateCheckInCount, setLateCheckInCount] = useState<number>(0);
  const [earlyCheckOutCount, setEarlyCheckOutCount] = useState<number>(0);
  const [remainingLateCheckins, setRemainingLateCheckins] = useState<number>(5);

  const [error, setError] = useState<string | null>(null);

  // ============ ANIMATION REFS ============
  const pan = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ============ STATE REFS ============
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);
  const isPunchingRef = useRef(false);
  const isLoadingRef = useRef(true);

  useEffect(() => { isCheckedInRef.current = isCheckedIn; }, [isCheckedIn]);
  useEffect(() => { hasCheckedOutRef.current = hasCheckedOut; }, [hasCheckedOut]);
  useEffect(() => { isPunchingRef.current = isPunching; }, [isPunching]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  useEffect(() => {
    if (isInitialized) {
      onCheckInChange?.(isCheckedIn, hasCheckedOut);
    }
  }, [isCheckedIn, hasCheckedOut, isInitialized, onCheckInChange]);

  // ============ HELPER: Parse Time ============
  const parsePunchTime = (timeString: string | null | undefined): Date | null => {
    if (!timeString) return null;

    try {
      // ISO format
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) return date;
      }

      // YYYY-MM-DD HH:MM:SS AM/PM
      const match1 = timeString.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
      if (match1) {
        const [, year, month, day, hours, minutes, seconds, period] = match1;
        let hour = parseInt(hours, 10);
        if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds));
      }

      // DD-MM-YYYY HH:MM:SS AM/PM
      const match2 = timeString.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
      if (match2) {
        const [, day, month, year, hours, minutes, seconds, period] = match2;
        let hour = parseInt(hours, 10);
        if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds));
      }

      const nativeDate = new Date(timeString);
      if (!isNaN(nativeDate.getTime())) return nativeDate;

      return null;
    } catch (error) {
      console.error('Error parsing time:', timeString, error);
      return null;
    }
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return '--';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // ============ FETCH PUNCH STATUS FROM API (SINGLE SOURCE OF TRUTH) ============
  const fetchPunchStatus = useCallback(async (showLoading = true, isRefresh = false): Promise<void> => {
    try {
      if (showLoading && !isRefresh) setIsLoading(true);
      setError(null);

      console.log('📡 Fetching punch status from API...');
      const response: PunchStatusResponse = await getPunchStatus();

      onStatusLoaded?.(response);
      setLastUpdated(new Date());

      const { punch, lateEarly, today } = response.data;

      console.log(`📦 Punch Type: ${punch.PunchType}, DateTime: ${punch.PunchDateTime}`);

      // Update late/early counts
      setLateCheckInCount(lateEarly.lateCheckins);
      setEarlyCheckOutCount(lateEarly.earlyCheckouts);
      setRemainingLateCheckins(lateEarly.remainingLateCheckins);
      onLateEarlyCountChange?.(lateEarly.lateCheckins, lateEarly.earlyCheckouts);

      setPunchType(punch.PunchType);

      switch (punch.PunchType) {
        case 0:
          console.log('⏳ NO PUNCH TODAY');
          setIsCheckedIn(false);
          setHasCheckedOut(false);
          setPunchInTime(null);
          setPunchOutTime(null);
          setPunchInDate(null);
          setPunchOutDate(null);
          setWorkingMinutes(0);
          setElapsedHours(0);
          setCurrentHourProgress(0);
          pan.setValue(0);
          colorAnim.setValue(0);
          progressAnim.setValue(0);
          break;

        case 1:
          console.log('✅ CHECKED IN');
          setIsCheckedIn(true);
          setHasCheckedOut(false);

          const inTimeStr = punch.PunchDateTimeISO || punch.PunchDateTime;
          setPunchInTime(inTimeStr);

          const parsedInTime = parsePunchTime(inTimeStr);
          setPunchInDate(parsedInTime);

          setPunchOutTime(null);
          setPunchOutDate(null);
          setWorkingMinutes(punch.WorkingMinutes || 0);

          pan.setValue(MAX_SWIPE_DISTANCE);
          Animated.timing(colorAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
          break;

        case 2:
          console.log('🔒 CHECKED OUT');
          setIsCheckedIn(false);
          setHasCheckedOut(true);

          const outTimeStr = punch.PunchDateTimeISO || punch.PunchDateTime;
          setPunchOutTime(outTimeStr);

          const parsedOutTime = parsePunchTime(outTimeStr);
          setPunchOutDate(parsedOutTime);

          if (punch.PunchInTime) {
            setPunchInTime(punch.PunchInTime);
            setPunchInDate(parsePunchTime(punch.PunchInTime));
          }

          setWorkingMinutes(punch.WorkingMinutes || 0);

          pan.setValue(0);
          Animated.timing(colorAnim, { toValue: 2, duration: 300, useNativeDriver: false }).start();
          break;
      }

      setIsInitialized(true);

    } catch (error) {
      console.error('❌ Failed to fetch punch status:', error);
      setError(error instanceof Error ? error.message : 'Failed to load status');
      setPunchType(0);
      setIsCheckedIn(false);
      setHasCheckedOut(false);
      setPunchInDate(null);
      setPunchOutDate(null);
      pan.setValue(0);
      colorAnim.setValue(0);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, [pan, colorAnim, progressAnim, onLateEarlyCountChange, onStatusLoaded]);

  // ============ LOAD ON MOUNT ============
  useEffect(() => {
    fetchPunchStatus(true);
  }, [fetchPunchStatus]);

  // ============ AUTO REFRESH ON SCREEN FOCUS ============
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        console.log('🔄 Screen focused - refreshing...');
        fetchPunchStatus(false, true);
      }
    }, [fetchPunchStatus, isInitialized])
  );

  // ============ PERIODIC REFRESH (Every 5 minutes) ============
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPunchingRef.current && !isLoadingRef.current) {
        console.log('🔄 Periodic refresh (5 min)...');
        fetchPunchStatus(false, true);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPunchStatus]);

  // ============ MIDNIGHT RESET ============
  useEffect(() => {
    let lastDate = new Date().toISOString().split('T')[0];

    const checkNewDay = () => {
      const currentDate = new Date().toISOString().split('T')[0];
      if (currentDate !== lastDate) {
        console.log('🌅 NEW DAY! Refreshing...');
        lastDate = currentDate;
        fetchPunchStatus(true);
      }
    };

    const interval = setInterval(checkNewDay, 60 * 1000);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 100);

    const midnightTimeout = setTimeout(() => {
      fetchPunchStatus(true);
    }, tomorrow.getTime() - now.getTime());

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, [fetchPunchStatus]);

  // ============ PROGRESS UPDATE ============
  useEffect(() => {
    const updateProgress = () => {
      if (!isCheckedIn || !punchInDate || hasCheckedOut) {
        setElapsedHours(0);
        setCurrentHourProgress(0);
        progressAnim.setValue(0);
        return;
      }

      const now = new Date();
      const hoursWorked = (now.getTime() - punchInDate.getTime()) / (1000 * 60 * 60);

      if (hoursWorked < 0) {
        setElapsedHours(0);
        setCurrentHourProgress(0);
        progressAnim.setValue(0);
        return;
      }

      const maxHours = 9;
      const clamped = Math.min(hoursWorked, maxHours);
      const completedHours = Math.floor(clamped);
      const hourProgress = clamped - completedHours;

      setElapsedHours(completedHours);
      setCurrentHourProgress(hourProgress);

      Animated.timing(progressAnim, {
        toValue: clamped / maxHours,
        duration: 500,
        useNativeDriver: false,
      }).start();
    };

    updateProgress();
    const interval = setInterval(updateProgress, 30 * 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, punchInDate, hasCheckedOut, progressAnim]);

  // ============ PUNCH IN HANDLER ============
  const handlePunchIn = async (): Promise<boolean> => {
    if (isPunchingRef.current) return false;

    try {
      setIsPunching(true);
      isPunchingRef.current = true;

      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert('Location Required', 'Please enable location to check in.');
          resetToStart();
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) throw new Error('Unable to get location.');

      const now = new Date();
      const isLate = isLateCheckIn(now);

      if (isLate && remainingLateCheckins <= 0) {
        Alert.alert('Limit Reached', 'You have used all your late check-ins for this month.');
        resetToStart();
        return false;
      }

      console.log('📝 Recording Punch IN...');
      const response: PunchResponse = await recordPunch('IN', false, true);

      if (response.data) {
        const punchTime = response.data.PunchTimeISO || response.data.PunchTime;
        setPunchInTime(punchTime);

        const parsedDate = parsePunchTime(punchTime);
        if (parsedDate) {
          setPunchInDate(parsedDate);
        } else {
          setPunchInDate(new Date());
        }

        if (response.data.IsLate) {
          Alert.alert(
            'Checked In (Late) ⚠️',
            `You are ${response.data.LateByMinutes} minutes late.\n\nRemaining late check-ins: ${remainingLateCheckins - 1}/5`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Checked In! ✅', `Punch Time: ${response.data.PunchTime}`, [{ text: 'OK' }]);
        }
      } else {
        setPunchInDate(new Date());
        setPunchInTime(new Date().toISOString());
      }

      Animated.timing(colorAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
      return true;

    } catch (error) {
      console.error('❌ Punch IN error:', error);
      Alert.alert('Check-In Failed', error instanceof Error ? error.message : 'Unable to check in.');
      resetToStart();
      return false;
    } finally {
      setIsPunching(false);
      isPunchingRef.current = false;
    }
  };

  // ============ PUNCH OUT HANDLER ============
  const handlePunchOut = async (): Promise<boolean> => {
    if (isPunchingRef.current) return false;

    try {
      setIsPunching(true);
      isPunchingRef.current = true;

      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert('Location Required', 'Please enable location to check out.');
          resetToCheckedIn();
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) throw new Error('Unable to get location.');

      console.log('💾 Recording Punch OUT...');
      const response: PunchResponse = await recordPunch('OUT', false, true);

      if (response.data) {
        const punchTime = response.data.PunchTimeISO || response.data.PunchTime;
        setPunchOutTime(punchTime);

        const parsedOutDate = parsePunchTime(punchTime);
        if (parsedOutDate) setPunchOutDate(parsedOutDate);

        if (response.data.WorkingHours) {
          const match = response.data.WorkingHours.match(/(\d+)h\s*(\d+)m/);
          if (match) {
            const h = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            setWorkingMinutes(h * 60 + m);
          }
        } else if (punchInDate && parsedOutDate) {
          const mins = Math.floor((parsedOutDate.getTime() - punchInDate.getTime()) / (1000 * 60));
          if (mins > 0) setWorkingMinutes(mins);
        }

        const workingHrs = response.data.WorkingHours || getDisplayWorkingHours();
        if (response.data.IsEarly) {
          Alert.alert(
            'Checked Out (Early) ⚠️',
            `Early by ${response.data.EarlyByMinutes} min\n\nWorking: ${workingHrs}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Checked Out! 🏁',
            `Working: ${workingHrs}${response.data.OvertimeHours ? `\nOT: ${response.data.OvertimeHours}` : ''}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        setPunchOutTime(new Date().toISOString());
        setPunchOutDate(new Date());
      }

      Animated.timing(colorAnim, { toValue: 2, duration: 800, useNativeDriver: false }).start();
      return true;

    } catch (error) {
      console.error('❌ Punch OUT error:', error);
      Alert.alert('Check-Out Failed', error instanceof Error ? error.message : 'Unknown error');
      resetToCheckedIn();
      return false;
    } finally {
      setIsPunching(false);
      isPunchingRef.current = false;
    }
  };

  const resetToStart = () => {
    Animated.spring(pan, { toValue: 0, useNativeDriver: false, friction: 8, tension: 40 }).start();
  };

  const resetToCheckedIn = () => {
    Animated.spring(pan, { toValue: MAX_SWIPE_DISTANCE, useNativeDriver: false, friction: 8, tension: 40 }).start();
  };

  // ============ PAN RESPONDER ============
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !hasCheckedOutRef.current && !isPunchingRef.current && !isLoadingRef.current,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, g: PanResponderGestureState) =>
        !hasCheckedOutRef.current && !isPunchingRef.current && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10,
      onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (hasCheckedOutRef.current || isPunchingRef.current) return;
        if (!isCheckedInRef.current && g.dx >= 0) pan.setValue(Math.min(g.dx, MAX_SWIPE_DISTANCE));
        else if (isCheckedInRef.current && g.dx <= 0) pan.setValue(Math.max(MAX_SWIPE_DISTANCE + g.dx, 0));
      },
      onPanResponderRelease: async (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (hasCheckedOutRef.current || isPunchingRef.current) return;

        if (!isCheckedInRef.current && g.dx > SWIPE_THRESHOLD) {
          Animated.spring(pan, { toValue: MAX_SWIPE_DISTANCE, useNativeDriver: false, friction: 8, tension: 40 }).start(async () => {
            const success = await handlePunchIn();
            if (success) { setIsCheckedIn(true); setHasCheckedOut(false); setPunchType(1); }
          });
        } else if (isCheckedInRef.current && g.dx < -SWIPE_THRESHOLD) {
          Animated.spring(pan, { toValue: 0, useNativeDriver: false, friction: 8, tension: 40 }).start(async () => {
            const success = await handlePunchOut();
            if (success) { setIsCheckedIn(false); setHasCheckedOut(true); setPunchType(2); }
          });
        } else {
          isCheckedInRef.current ? resetToCheckedIn() : resetToStart();
        }
      },
    })
  ).current;

  // ============ UI HELPERS ============
  const getSwipeText = (): string => {
    if (hasCheckedOut) return 'Checked Out for Today ✓';
    if (isCheckedIn && punchInDate) {
      const hours = (new Date().getTime() - punchInDate.getTime()) / (1000 * 60 * 60);
      if (hours < 4.5) return `${Math.ceil((4.5 - hours) * 60)}m to Half-Day`;
      if (hours < 9) return `Half-Day ✓ • ${Math.ceil((9 - hours) * 60)}m to Full`;
      return '🎉 Full Day! Swipe Left';
    }
    return isCheckedIn ? 'Swipe Left to Check-Out' : 'Swipe Right to Check-In';
  };

  const getButtonColor = () => {
    if (isCheckedIn && !hasCheckedOut) {
      return progressAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['#EF4444', '#F59E0B', '#10B981'] });
    }
    return colorAnim.interpolate({ inputRange: [0, 1, 2], outputRange: ['#3B82F6', '#EF4444', '#9CA3AF'] });
  };

  const getProgressBarColor = () => {
    return progressAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['rgba(239,68,68,0.15)', 'rgba(245,158,11,0.15)', 'rgba(16,185,129,0.15)'],
    });
  };

  const getDisplayWorkingHours = (): string => {
    if (workingMinutes > 0) return formatMinutesToHours(workingMinutes);
    if (punchInDate) {
      const end = punchOutDate || new Date();
      const mins = Math.floor((end.getTime() - punchInDate.getTime()) / (1000 * 60));
      if (mins > 0) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
      }
    }
    return '--';
  };

  const formatLastUpdated = (): string => {
    if (!lastUpdated) return '';
    const diffMs = new Date().getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  // ============ LOADING STATE ============
  if (isLoading && !isInitialized) {
    return (
      <View style={styles.swipeContainer}>
        <View style={[styles.swipebody, styles.loadingBody]}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading attendance...</Text>
        </View>
      </View>
    );
  }

  // ============ ERROR STATE ============
  if (error && !isInitialized) {
    return (
      <View style={styles.swipeContainer}>
        <View style={[styles.swipebody, styles.errorBody]}>
          <Feather name="alert-circle" size={32} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPunchStatus(true)}>
            <Text style={styles.retryText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============ RENDER ============
  return (
    <View style={styles.swipeContainer}>
      {lastUpdated && (
        <Text style={[styles.lastUpdatedText, { color: colors.textSecondary }]}>
          Updated {formatLastUpdated()}
        </Text>
      )}
      
      <View style={[styles.swipebody, hasCheckedOut && styles.swipebodyDisabled]}>
        <View style={styles.swipeSection}>
          <View style={styles.swipeTrack}>
            {isCheckedIn && !hasCheckedOut && (
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: getProgressBarColor(),
                  },
                ]}
              />
            )}

            <View style={styles.swipeTextContainer} pointerEvents="none">
              <Text style={[styles.swipeText, hasCheckedOut && styles.swipeTextDisabled]}>
                {getSwipeText()}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [{ translateX: pan }],
                  backgroundColor: getButtonColor(),
                  opacity: hasCheckedOut ? 0.5 : 1,
                },
              ]}
              {...(hasCheckedOut ? {} : panResponder.panHandlers)}
            >
              {isPunching ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {hasCheckedOut ? '✓' : isCheckedIn ? 'OUT' : 'IN'}
                </Text>
              )}
            </Animated.View>
          </View>

          {(isCheckedIn || hasCheckedOut) && (
            <View style={styles.timeInfoSection}>
              <View style={styles.topRow}>
                <View style={[styles.timeBox, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check-In</Text>
                  <Text style={[styles.timeValue, { color: '#10B981' }]}>{formatTime(punchInDate)}</Text>
                </View>

                <View style={[styles.timeBox, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Working</Text>
                  <Text style={[styles.timeValue, { color: '#3B82F6' }]}>{getDisplayWorkingHours()}</Text>
                </View>

                <View style={[styles.timeBox, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check-Out</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>{formatTime(punchOutDate)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {isCheckedIn && !hasCheckedOut && (
          <View style={styles.pillarsSection}>
            <View style={styles.pillarsRow}>
              {Array.from({ length: 9 }).map((_, i) => {
                const filled = i < elapsedHours;
                const current = i === elapsedHours;
                const percent = current ? currentHourProgress : filled ? 1 : 0;
                const color = filled || current ? (i < 3 ? '#3B82F6' : i < 6 ? '#06B6D4' : '#10B981') : 'transparent';
                return (
                  <View key={i} style={styles.pillarWrapper}>
                    <View style={styles.pillarContainer}>
                      <View style={styles.pillarBackground}>
                        <View style={[styles.pillarFill, { height: `${percent * 100}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                    <Text style={styles.pillarLabel}>{i + 1}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.pillarsStatus}>
              {elapsedHours >= 9 ? '🎉 9 hours completed!' : `Hour ${elapsedHours + 1}/9 • ${9 - elapsedHours}h remaining`}
            </Text>
          </View>
        )}

        {/* Low Balance Warning */}
        {isCheckedIn && !hasCheckedOut && remainingLateCheckins <= 2 && remainingLateCheckins > 0 && (
          <View style={styles.warningBox}>
            <Feather name="alert-circle" size={12} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Only {remainingLateCheckins} late check-ins remaining!
            </Text>
          </View>
        )}

        {/* Zero Balance Warning */}
        {isCheckedIn && !hasCheckedOut && remainingLateCheckins === 0 && (
          <View style={[styles.warningBox, { backgroundColor: '#ffebee', borderLeftColor: colors.error }]}>
            <Feather name="alert-triangle" size={12} color={colors.error} />
            <Text style={[styles.warningText, { color: colors.error }]}>
              No late check-ins remaining! Please be on time.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  lastUpdatedText: { fontSize: 10, textAlign: 'right', marginBottom: 4, opacity: 0.6 },
  swipebody: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  swipebodyDisabled: { backgroundColor: '#F9FAFB' },
  loadingBody: { minHeight: 120, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6366F1', fontWeight: '500' },
  errorBody: { minHeight: 120, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 12 },
  errorText: { fontSize: 13, textAlign: 'center' },
  retryButton: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#3B82F615', borderRadius: 8 },
  retryText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  swipeSection: { width: '100%', paddingVertical: 16, paddingHorizontal: 16 },
  swipeTrack: { width: '100%', height: 70, backgroundColor: '#F3F4F6', borderRadius: 40, position: 'relative', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  progressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 40 },
  swipeTextContainer: { position: 'absolute', width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 80 },
  swipeText: { fontSize: 12, color: '#6366F1', fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
  swipeTextDisabled: { color: '#9CA3AF' },
  arrowContainer: { position: 'absolute', left: 3, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
  buttonText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  timeInfoSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  timeBox: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 },
  timeLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  timeValue: { fontSize: 14, fontWeight: '800' },
  pillarsSection: { width: '100%', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  pillarsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 12 },
  pillarWrapper: { flex: 1, alignItems: 'center', gap: 6 },
  pillarContainer: { width: '100%', height: 50, justifyContent: 'flex-end' },
  pillarBackground: { width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: 'rgba(99,102,241,0.08)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.15)' },
  pillarFill: { width: '100%', borderRadius: 6 },
  pillarLabel: { fontSize: 10, fontWeight: '700', color: '#6366F1', opacity: 0.7 },
  pillarsStatus: { fontSize: 11, fontWeight: '600', textAlign: 'center', color: '#6366F1' },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginTop: 12, marginBottom: 8, padding: 10, backgroundColor: '#fff3e0', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#FF9800' },
  warningText: { flex: 1, fontSize: 11, fontWeight: '600' },
});

export default CheckInCard;