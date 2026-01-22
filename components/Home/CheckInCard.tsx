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
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';

// ============ CONSTANTS ============
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = 16;
const SECTION_PADDING = 20;
const TRACK_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2) - (SECTION_PADDING * 2) - 2;
const BUTTON_SIZE = 64;
const BUTTON_MARGIN = 4;
const MAX_SWIPE_DISTANCE = TRACK_WIDTH - BUTTON_SIZE - (BUTTON_MARGIN * 2);
const SWIPE_THRESHOLD = MAX_SWIPE_DISTANCE * 0.6;

const OFFICE_START_HOUR = 9;
const OFFICE_START_MINUTE = 30;
const BREAK_START_HOUR = 13;
const BREAK_END_HOUR = 14;
const TOTAL_WORKING_HOURS = 8;

const TIME_SLOTS = [
  { label: '9:30', start: 9.5, end: 10.5, isBreak: false },
  { label: '10:30', start: 10.5, end: 11.5, isBreak: false },
  { label: '11:30', start: 11.5, end: 12.5, isBreak: false },
  { label: '12:30', start: 12.5, end: 13, isBreak: false },
  { label: '🍽️', start: 13, end: 14, isBreak: true },
  { label: '2:00', start: 14, end: 15, isBreak: false },
  { label: '3:00', start: 15, end: 16, isBreak: false },
  { label: '4:00', start: 16, end: 17, isBreak: false },
  { label: '5:00', start: 17, end: 18.5, isBreak: false },
];



if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============ TYPES ============
interface CheckInCardProps {
  onCheckInChange?: (isCheckedIn: boolean, hasCheckedOut: boolean) => void;
  onLateEarlyCountChange?: (lateCount: number, earlyCount: number) => void;
  onStatusLoaded?: (status: PunchStatusResponse) => void;
  refreshKey?: number;
}

interface SlotProgress {
  filled: boolean;
  current: boolean;
  progress: number;
  isBreak: boolean;
}



// ============ COMPONENT ============
const CheckInCard: React.FC<CheckInCardProps> = ({
  onCheckInChange,
  onLateEarlyCountChange,
  onStatusLoaded,
  refreshKey,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

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

  const [slotProgresses, setSlotProgresses] = useState<SlotProgress[]>([]);
  const [completedWorkingHours, setCompletedWorkingHours] = useState<number>(0);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const [lateCheckInCount, setLateCheckInCount] = useState<number>(0);
  const [earlyCheckOutCount, setEarlyCheckOutCount] = useState<number>(0);
  const [remainingLateCheckins, setRemainingLateCheckins] = useState<number>(5);

  const [error, setError] = useState<string | null>(null);

  // ============ NOTIFICATION STATE ============
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    time: string;
    type: 'success' | 'warning' | 'error' | 'info';
  }>({ visible: false, title: '', message: '', time: '', type: 'success' });
  const [notificationKey, setNotificationKey] = useState(0);

  // ============ ANIMATION REFS ============
  const pan = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const notificationTranslateY = useRef(new Animated.Value(-120)).current;
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationScale = useRef(new Animated.Value(0.9)).current;
  const notificationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============ STATE REFS ============
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);
  const isPunchingRef = useRef(false);
  const isLoadingRef = useRef(true);
  const previousPunchType = useRef<0 | 1 | 2>(0);
  const lastPunchTime = useRef<number>(0); // Timestamp of last punch action
  const lastPunchAction = useRef<'IN' | 'OUT' | null>(null); // Last punch action type
  const COOLDOWN_MS = 60000; // 60 second cooldown to ignore conflicting API responses

  useEffect(() => { isCheckedInRef.current = isCheckedIn; }, [isCheckedIn]);
  useEffect(() => { hasCheckedOutRef.current = hasCheckedOut; }, [hasCheckedOut]);
  useEffect(() => { isPunchingRef.current = isPunching; }, [isPunching]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  useEffect(() => {
    if (isInitialized) {
      onCheckInChange?.(isCheckedIn, hasCheckedOut);
    }
  }, [isCheckedIn, hasCheckedOut, isInitialized, onCheckInChange]);

  // ============ NOTIFICATION HELPERS ============
  const showNotification = useCallback((type: 'success' | 'warning' | 'error' | 'info', title: string, message: string, time?: string) => {
    // Clear existing timeout
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }

    // Get current time if not provided
    const displayTime = time || new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Reset animation values immediately
    notificationTranslateY.setValue(-150);
    notificationOpacity.setValue(0);
    notificationScale.setValue(0.8);

    // Force re-render with new key
    setNotificationKey(prev => prev + 1);
    setNotification({ visible: true, title, message, time: displayTime, type });

    // Small delay then animate in with smooth spring
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(notificationTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(notificationOpacity, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(notificationScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }, 50);

    // Auto dismiss after 4 seconds
    notificationTimeout.current = setTimeout(() => {
      hideNotification();
    }, 4000);
  }, [notificationTranslateY, notificationOpacity, notificationScale]);

  const hideNotification = useCallback(() => {
    Animated.parallel([
      Animated.spring(notificationTranslateY, {
        toValue: -150,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(notificationScale, {
        toValue: 0.8,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    });
  }, [notificationTranslateY, notificationOpacity, notificationScale]);

  // ============ THEME COLORS ============
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const cardBorder = isDark ? '#2C2C2E' : '#E5E7EB';
  const trackBg = isDark ? '#2C2C2E' : '#F3F4F6';
  const timeBoxBg = isDark ? '#2C2C2E' : '#F8FAFC';
  const pillarBg = isDark ? '#3A3A3C' : '#E5E7EB';
  const dividerColor = isDark ? '#3A3A3C' : '#F3F4F6';

  // ============ DATE HELPER ============
  const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  // ============ HELPER: Apply state (unified) ============
  const applyState = useCallback((
    type: 0 | 1 | 2,
    inTime: string | null,
    outTime: string | null,
    workingMins: number
  ) => {
    console.log('🔄 Applying state:', { type, inTime, outTime, workingMins });

    switch (type) {
      case 0: // Reset
        pan.setValue(0);
        colorAnim.setValue(0);
        progressAnim.setValue(0);
        setIsCheckedIn(false);
        setHasCheckedOut(false);
        setPunchInTime(null);
        setPunchOutTime(null);
        setPunchInDate(null);
        setPunchOutDate(null);
        setWorkingMinutes(0);
        setSlotProgresses([]);
        setCompletedWorkingHours(0);
        setPunchType(0);
        previousPunchType.current = 0;
        break;

      case 1: // Checked In
        const parsedIn = parsePunchTime(inTime);
        
        pan.setValue(MAX_SWIPE_DISTANCE);
        colorAnim.setValue(1);
        
        setIsCheckedIn(true);
        setHasCheckedOut(false);
        setPunchInTime(inTime);
        setPunchInDate(parsedIn || new Date());
        setPunchOutTime(null);
        setPunchOutDate(null);
        setWorkingMinutes(workingMins);
        setPunchType(1);
        previousPunchType.current = 1;

        if (parsedIn) {
          const progress = calculateWorkingHours(parsedIn) / TOTAL_WORKING_HOURS;
          progressAnim.setValue(progress);
        }
        break;

      case 2: // Checked Out
        const parsedOut = parsePunchTime(outTime);
        const parsedIn2 = parsePunchTime(inTime);

        pan.setValue(0);
        colorAnim.setValue(2);
        progressAnim.setValue(0);

        setIsCheckedIn(false);
        setHasCheckedOut(true);
        setPunchOutTime(outTime);
        setPunchOutDate(parsedOut || new Date());
        
        if (inTime) {
          setPunchInTime(inTime);
          setPunchInDate(parsedIn2);
        }
        
        setWorkingMinutes(workingMins);
        setSlotProgresses([]);
        setCompletedWorkingHours(0);
        setPunchType(2);
        previousPunchType.current = 2;
        break;
    }
  }, [pan, colorAnim, progressAnim, parsePunchTime, calculateWorkingHours]);

  // ============ HELPER: Calculate slot progress ============
  const calculateSlotProgresses = useCallback((checkInTime: Date | null): SlotProgress[] => {
    if (!checkInTime) {
      return TIME_SLOTS.map(slot => ({
        filled: false,
        current: false,
        progress: 0,
        isBreak: slot.isBreak,
      }));
    }

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    return TIME_SLOTS.map(slot => {
      const slotStart = slot.start;
      const slotEnd = slot.end;

      if (currentHour >= slotEnd) {
        return { filled: true, current: false, progress: 1, isBreak: slot.isBreak };
      } else if (currentHour >= slotStart && currentHour < slotEnd) {
        const progress = (currentHour - slotStart) / (slotEnd - slotStart);
        return { filled: false, current: true, progress: Math.min(progress, 1), isBreak: slot.isBreak };
      } else {
        return { filled: false, current: false, progress: 0, isBreak: slot.isBreak };
      }
    });
  }, []);

  // ============ HELPER: Calculate working hours ============
  const calculateWorkingHours = useCallback((checkInTime: Date | null): number => {
    if (!checkInTime) return 0;

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    // Always start from office start time (9:30 AM = 9.5)
    const effectiveStart = OFFICE_START_HOUR + OFFICE_START_MINUTE / 60;

    // If current time is before office start, return 0
    if (currentHour <= effectiveStart) return 0;

    let workingHours = 0;

    if (currentHour <= BREAK_START_HOUR) {
      // Before lunch break
      workingHours = currentHour - effectiveStart;
    } else if (currentHour <= BREAK_END_HOUR) {
      // During lunch break
      workingHours = BREAK_START_HOUR - effectiveStart;
    } else {
      // After lunch break
      workingHours = (BREAK_START_HOUR - effectiveStart) + (currentHour - BREAK_END_HOUR);
    }

    return Math.max(0, Math.min(workingHours, TOTAL_WORKING_HOURS));
  }, []);

  // ============ HELPER: Parse Time ============
  const parsePunchTime = useCallback((timeString: string | null | undefined): Date | null => {
    if (!timeString) return null;

    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) return date;
      }

      const match1 = timeString.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
      if (match1) {
        const [, year, month, day, hours, minutes, seconds, period] = match1;
        let hour = parseInt(hours, 10);
        if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds)));
      }

      const match2 = timeString.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
      if (match2) {
        const [, day, month, year, hours, minutes, seconds, period] = match2;
        let hour = parseInt(hours, 10);
        if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds)));
      }

      const nativeDate = new Date(timeString);
      if (!isNaN(nativeDate.getTime())) return nativeDate;

      return null;
    } catch (error) {
      console.error('Error parsing time:', timeString, error);
      return null;
    }
  }, []);

  const formatTime = (date: Date | null): string => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // ============ FETCH PUNCH STATUS (API-ONLY) ============
  const fetchPunchStatus = useCallback(async (showLoading = true, isRefresh = false): Promise<void> => {
    try {
      if (showLoading && !isRefresh) setIsLoading(true);
      setError(null);

      // Fetch from API
      const response: PunchStatusResponse = await getPunchStatus();
      onStatusLoaded?.(response);
      setLastUpdated(new Date());

      const responseData = response.data || (response as any);
      
      // Handle both nested and flat API structures
      let newType: 0 | 1 | 2 = 0;
      let punchDateTime: string | null = null;
      let workingMins = 0;
      let punchInTimeStr: string | null = null;

      if (responseData.punch) {
        newType = (responseData.punch.PunchType ?? 0) as 0 | 1 | 2;
        punchDateTime = responseData.punch.PunchDateTimeISO || responseData.punch.PunchDateTime;
        workingMins = responseData.punch.WorkingMinutes || 0;
        punchInTimeStr = responseData.punch.PunchInTime;
      } else {
        const flatData = responseData as any;
        newType = (flatData.PunchType ?? 0) as 0 | 1 | 2;
        punchDateTime = flatData.PunchDateTimeISO || flatData.PunchDateTime;
        workingMins = flatData.WorkingMinutes || 0;
        punchInTimeStr = flatData.PunchInTime;
      }

      console.log('📡 API Response:', { newType, punchDateTime, punchInTimeStr, workingMins });
      console.log('🔍 DEBUG - Full API responseData:', JSON.stringify(responseData, null, 2));
      console.log('🔍 DEBUG - Previous PunchType:', previousPunchType.current, '| New PunchType:', newType);

      // ⚠️ COOLDOWN PROTECTION: Ignore API responses that conflict with recent punch action
      const timeSinceLastPunch = Date.now() - lastPunchTime.current;
      const isInCooldown = timeSinceLastPunch < COOLDOWN_MS;
      
      if (isInCooldown && lastPunchAction.current === 'IN' && newType === 2) {
        console.log('🛡️ PROTECTION: Ignoring auto-checkout from API (within cooldown period)');
        console.log(`   Last punch: IN, ${Math.round(timeSinceLastPunch / 1000)}s ago`);
        console.log('   API returned PunchType: 2 but we just checked IN - ignoring');
        setLastUpdated(new Date());
        setIsLoading(false);
        return; // Don't apply this state change
      }
      
      if (isInCooldown && lastPunchAction.current === 'IN' && newType === 0) {
        console.log('🛡️ PROTECTION: Ignoring reset from API (within cooldown period)');
        console.log(`   Last punch: IN, ${Math.round(timeSinceLastPunch / 1000)}s ago`);
        console.log('   API returned PunchType: 0 but we just checked IN - ignoring');
        setLastUpdated(new Date());
        setIsLoading(false);
        return; // Don't apply this state change
      }

      // Update late/early counts
      const lateEarly = responseData.lateEarly ?? {
        lateCheckins: 0,
        earlyCheckouts: 0,
        remainingLateCheckins: 5,
      };

      setLateCheckInCount(lateEarly.lateCheckins);
      setEarlyCheckOutCount(lateEarly.earlyCheckouts);
      setRemainingLateCheckins(lateEarly.remainingLateCheckins);
      onLateEarlyCountChange?.(lateEarly.lateCheckins, lateEarly.earlyCheckouts);

      // Apply API state - always trust the API response
      console.log('� Applying API state:', previousPunchType.current, '→', newType);
      
      if (newType === 0) {
        applyState(0, null, null, 0);
      } else if (newType === 1) {
        // For check-in, punchDateTime is the check-in time
        applyState(1, punchDateTime, null, workingMins);
      } else if (newType === 2) {
        // For check-out, punchInTimeStr is the check-in time, punchDateTime is the check-out time
        applyState(2, punchInTimeStr, punchDateTime, workingMins);
      }

      if (!isInitialized) {
        setIsInitialized(true);
      }

    } catch (error) {
      console.error('❌ Failed to fetch punch status:', error);
      setError(error instanceof Error ? error.message : 'Failed to load status');
      
      if (!isInitialized) {
        applyState(0, null, null, 0);
        setIsInitialized(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    onStatusLoaded,
    onLateEarlyCountChange,
    isInitialized,
    applyState,
  ]);

  // Initial mount
  useEffect(() => {
    fetchPunchStatus(true);
  }, [fetchPunchStatus]);

  // Screen focus
  useFocusEffect(
    useCallback(() => {
      if (isInitialized && !isPunchingRef.current) {
        // Check if we're in cooldown period
        const timeSinceLastPunch = Date.now() - lastPunchTime.current;
        if (timeSinceLastPunch < COOLDOWN_MS) {
          console.log('📱 Screen focused - skipping refresh (in cooldown)');
          return;
        }
        console.log('📱 Screen focused - refreshing');
        fetchPunchStatus(false, true);
      }
    }, [fetchPunchStatus, isInitialized])
  );

  // Pull-to-refresh
  useEffect(() => {
    if (isInitialized && refreshKey !== undefined && refreshKey > 0 && !isPunchingRef.current) {
      // Check if we're in cooldown period
      const timeSinceLastPunch = Date.now() - lastPunchTime.current;
      if (timeSinceLastPunch < COOLDOWN_MS) {
        console.log('🔄 Pull-to-refresh - skipping (in cooldown)');
        return;
      }
      console.log('🔄 Pull-to-refresh');
      fetchPunchStatus(false, true);
    }
  }, [refreshKey, isInitialized, fetchPunchStatus]);

  // Background polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPunchingRef.current && !isLoadingRef.current && isInitialized) {
        fetchPunchStatus(false, true);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPunchStatus, isInitialized]);

  // Midnight reset
  useEffect(() => {
    let lastDate = getLocalDateString();

    const checkNewDay = () => {
      const currentDate = getLocalDateString();
      if (currentDate !== lastDate) {
        lastDate = currentDate;
        console.log('🌅 Midnight reset');
        applyState(0, null, null, 0);
        fetchPunchStatus(true);
      }
    };

    const interval = setInterval(checkNewDay, 60 * 1000);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const midnightTimeout = setTimeout(checkNewDay, tomorrow.getTime() - now.getTime());

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, [fetchPunchStatus, applyState]);

  // Progress update
  useEffect(() => {
    const updateProgress = () => {
      if (!isCheckedIn || !punchInDate || hasCheckedOut) {
        setSlotProgresses([]);
        setCompletedWorkingHours(0);
        setIsOnBreak(false);
        progressAnim.setValue(0);
        return;
      }

      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;

      setIsOnBreak(currentHour >= BREAK_START_HOUR && currentHour < BREAK_END_HOUR);

      const progresses = calculateSlotProgresses(punchInDate);
      setSlotProgresses(progresses);

      const workingHrs = calculateWorkingHours(punchInDate);
      setCompletedWorkingHours(workingHrs);

      const progressValue = workingHrs / TOTAL_WORKING_HOURS;

      Animated.timing(progressAnim, {
        toValue: progressValue,
        duration: 500,
        useNativeDriver: false,
      }).start();
    };

    updateProgress();
    const interval = setInterval(updateProgress, 30 * 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, punchInDate, hasCheckedOut, progressAnim, calculateSlotProgresses, calculateWorkingHours]);

  // ============ PUNCH HANDLERS ============
  const handlePunchIn = async (): Promise<boolean> => {
    if (isPunchingRef.current) return false;

    try {
      setIsPunching(true);
      isPunchingRef.current = true;

      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          showNotification('error', 'Location Required', 'Please enable location to check in');
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) throw new Error('Unable to get location.');

      const now = new Date();
      const isLate = isLateCheckIn(now);

      if (isLate && remainingLateCheckins <= 0) {
        showNotification('error', 'Limit Reached', 'You have used all late check-ins this month');
        return false;
      }

      console.log('📤 Sending punch-in request...');
      const response: PunchResponse = await recordPunch('IN', false, true);
      const responseData = response.data || (response as any);

      const punchTime = responseData.PunchTimeISO || responseData.PunchTime || now.toISOString();
      const workingMins = responseData.WorkingMinutes || 0;

      console.log('✅ Punch-in successful:', { punchTime, workingMins });
      console.log('🔍 DEBUG - Backend returned PunchType:', responseData.PunchType, '| Expected: 1 (IN)');

      // Set cooldown protection
      lastPunchTime.current = Date.now();
      lastPunchAction.current = 'IN';
      console.log('🛡️ Cooldown protection activated for 30 seconds');

      // Apply state
      applyState(1, punchTime, null, workingMins);

      if (responseData.IsLate) {
        showNotification(
          'warning',
          'Late Check-In',
          `You're ${responseData.LateByMinutes || 'a few'} min late • ${remainingLateCheckins - 1} remaining`
        );
      } else {
        showNotification(
          'success',
          'Checked In Successfully',
          'Have a productive day! 🚀'
        );
      }

      Animated.timing(colorAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
      
      // ⚠️ DISABLED: Auto-refresh was causing automatic checkout because backend returns wrong PunchType
      // The backend is likely returning PunchType: 0 or 2 instead of 1 after check-in
      // Uncomment this ONLY after backend is fixed to return correct PunchType
      // setTimeout(() => {
      //   console.log('🔄 Auto-refreshing after check-in...');
      //   fetchPunchStatus(false, true);
      // }, 1000);
      
      return true;

    } catch (error) {
      console.error('❌ Punch IN error:', error);
      showNotification(
        'error',
        'Check-In Failed',
        error instanceof Error ? error.message : 'Unable to check in'
      );
      
      // Refresh to get actual state from server
      fetchPunchStatus(false, true);
      return false;
    } finally {
      setIsPunching(false);
      isPunchingRef.current = false;
    }
  };

  const handlePunchOut = async (): Promise<boolean> => {
    if (isPunchingRef.current) return false;

    try {
      setIsPunching(true);
      isPunchingRef.current = true;

      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          showNotification('error', 'Location Required', 'Please enable location to check out');
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) throw new Error('Unable to get location.');

      console.log('📤 Sending punch-out request...');
      const response: PunchResponse = await recordPunch('OUT', false, true);
      const responseData = response.data || (response as any);

      const punchTime = responseData.PunchTimeISO || responseData.PunchTime || new Date().toISOString();
      const workingMins = responseData.WorkingMinutes || workingMinutes;

      console.log('✅ Punch-out successful:', { punchTime, workingMins });

      // Set cooldown protection
      lastPunchTime.current = Date.now();
      lastPunchAction.current = 'OUT';
      console.log('🛡️ Cooldown protection activated for 30 seconds');

      // Apply state
      applyState(2, punchInTime, punchTime, workingMins);

      const workingHrs = responseData.WorkingHours || getDisplayWorkingHours();
      if (responseData.IsEarly) {
        showNotification(
          'warning',
          'Early Check-Out',
          `Left ${responseData.EarlyByMinutes || 'a few'} min early • Worked ${workingHrs}`
        );
      } else {
        showNotification(
          'success',
          'Checked Out Successfully',
          `Great work today! Total: ${workingHrs}${responseData.OvertimeHours ? ` (+${responseData.OvertimeHours} OT)` : ''} ✨`
        );
      }

      Animated.timing(colorAnim, { toValue: 2, duration: 800, useNativeDriver: false }).start();
      
      // ⚠️ DISABLED: Auto-refresh disabled to prevent state inconsistencies
      // Uncomment this ONLY after backend is fixed to return correct PunchType
      // setTimeout(() => {
      //   console.log('🔄 Auto-refreshing after check-out...');
      //   fetchPunchStatus(false, true);
      // }, 1000);
      
      return true;

    } catch (error) {
      console.error('❌ Punch OUT error:', error);
      showNotification(
        'error',
        'Check-Out Failed',
        error instanceof Error ? error.message : 'Something went wrong'
      );
      
      // Refresh to get actual state from server
      fetchPunchStatus(false, true);
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
          Animated.spring(pan, { toValue: MAX_SWIPE_DISTANCE, useNativeDriver: false, friction: 8, tension: 40 }).start();
          const success = await handlePunchIn();
          if (!success) resetToStart();
        } else if (isCheckedInRef.current && g.dx < -SWIPE_THRESHOLD) {
          Animated.spring(pan, { toValue: 0, useNativeDriver: false, friction: 8, tension: 40 }).start();
          const success = await handlePunchOut();
          if (!success) resetToCheckedIn();
        } else {
          isCheckedInRef.current ? resetToCheckedIn() : resetToStart();
        }
      },
    })
  ).current;

  // ============ UI HELPERS ============
  const formatCheckInDateTime = (): string => {
    if (!punchInDate) return '';
    const date = punchInDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const time = formatTime(punchInDate);
    return `${date} • ${time}`;
  };

  const getSwipeText = (): string => {
    if (hasCheckedOut) return 'Checked Out for Today ✓';
    if (isOnBreak) return '🍽️ Lunch Break';
    if (isCheckedIn) {
      const remaining = TOTAL_WORKING_HOURS - completedWorkingHours;
      if (remaining <= 0) return '🎉 Full Day Complete!';
      return formatCheckInDateTime();
    }
    return 'Swipe to Check-In →';
  };

  const getButtonColor = () => {
    if (isCheckedIn && !hasCheckedOut) {
      return progressAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['#EF4444', '#F59E0B', '#10B981']
      });
    }
    return colorAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [colors.primary, colors.primary, '#9CA3AF']
    });
  };

  const getDisplayWorkingHours = (): string => {
    if (workingMinutes > 0) return formatMinutesToHours(workingMinutes);
    if (punchInDate) {
      const end = punchOutDate || new Date();
      let mins = Math.floor((end.getTime() - punchInDate.getTime()) / (1000 * 60));

      const startHour = punchInDate.getHours() + punchInDate.getMinutes() / 60;
      const endHour = end.getHours() + end.getMinutes() / 60;

      if (startHour < BREAK_END_HOUR && endHour > BREAK_START_HOUR) {
        const breakMins = Math.min(
          (Math.min(endHour, BREAK_END_HOUR) - Math.max(startHour, BREAK_START_HOUR)) * 60,
          60
        );
        mins -= Math.max(0, breakMins);
      }

      if (mins >= 0) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
      }
    }
    return '--:--';
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

  const getPillarColor = (index: number, isBreak: boolean, filled: boolean, current: boolean): string => {
    if (isBreak) return filled || current ? '#F59E0B' : 'transparent';
    if (!filled && !current) return 'transparent';
    if (index < 4) return '#EF4444';
    if (index < 7) return '#F59E0B';
    return '#10B981';
  };

  // ============ LOADING STATE ============
  if (isLoading && !isInitialized) {
    return (
      <View style={styles.container}>
        <View style={[
          styles.card,
          styles.loadingCard,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            ...Platform.select({
              ios: {
                shadowColor: isDark ? '#000' : '#6366F1',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 16,
              },
              android: {
                elevation: 8,
              },
            }),
          }
        ]}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading attendance...
          </Text>
        </View>
      </View>
    );
  }

  // ============ ERROR STATE ============
  if (error && !isInitialized) {
    return (
      <View style={styles.container}>
        <View style={[
          styles.card,
          styles.errorCard,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            ...Platform.select({
              ios: {
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
              },
              android: {
                elevation: 8,
              },
            }),
          }
        ]}>
          <View style={[styles.errorIconWrapper, { backgroundColor: isDark ? '#3A1A1A' : '#FEE2E2' }]}>
            <Feather name="alert-circle" size={28} color="#EF4444" />
          </View>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: isDark ? '#2A2A2E' : '#F3F4F6' }]}
            onPress={() => fetchPunchStatus(true)}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={14} color="#6366F1" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============ NOTIFICATION COLORS ============
  const getNotificationColors = () => {
    const colors = {
      success: {
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
        border: '#10B981',
        iconBg: isDark ? '#10B981' : '#D1FAE5',
        iconColor: isDark ? '#fff' : '#10B981',
        title: isDark ? '#6EE7B7' : '#065F46',
        message: isDark ? '#A7F3D0' : '#047857',
      },
      warning: {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
        border: '#F59E0B',
        iconBg: isDark ? '#F59E0B' : '#FEF3C7',
        iconColor: isDark ? '#fff' : '#F59E0B',
        title: isDark ? '#FCD34D' : '#92400E',
        message: isDark ? '#FDE68A' : '#B45309',
      },
      error: {
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
        border: '#EF4444',
        iconBg: isDark ? '#EF4444' : '#FEE2E2',
        iconColor: isDark ? '#fff' : '#EF4444',
        title: isDark ? '#FCA5A5' : '#991B1B',
        message: isDark ? '#FECACA' : '#B91C1C',
      },
      info: {
        bg: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
        border: '#6366F1',
        iconBg: isDark ? '#6366F1' : '#E0E7FF',
        iconColor: isDark ? '#fff' : '#6366F1',
        title: isDark ? '#A5B4FC' : '#3730A3',
        message: isDark ? '#C7D2FE' : '#4338CA',
      },
    };
    return colors[notification.type] || colors.info;
  };

  const notificationColors = getNotificationColors();
  const notificationIcon = notification.type === 'success' ? 'check-circle' 
    : notification.type === 'warning' ? 'alert-circle' 
    : notification.type === 'error' ? 'x-circle' 
    : 'info';

  // ============ RENDER ============
  return (
    <>
      {/* NOTIFICATION TOAST - Modern Minimal Design */}
      {notification.visible && (
        <Animated.View
          key={notificationKey}
          style={[
            styles.notificationContainer,
            {
              transform: [
                { translateY: notificationTranslateY },
                { scale: notificationScale },
              ],
              opacity: notificationOpacity,
            },
          ]}
          pointerEvents="box-only"
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideNotification}
            style={[
              styles.notification,
              {
                backgroundColor: notificationColors.bg,
                borderColor: notificationColors.border,
              },
            ]}
          >
            {/* Accent Line */}
            <View style={[styles.notificationAccent, { backgroundColor: notificationColors.border }]} />
            
            {/* Icon */}
            <View style={[
              styles.notificationIconWrapper,
              { backgroundColor: notificationColors.iconBg },
            ]}>
              <Feather
                name={notificationIcon}
                size={20}
                color={notificationColors.iconColor}
              />
            </View>
            
            {/* Content */}
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={[
                  styles.notificationTitle,
                  { color: notificationColors.title },
                ]} numberOfLines={1}>
                  {notification.title}
                </Text>
                <View style={styles.notificationTimeBadge}>
                  <Text style={[styles.notificationTime, { color: notificationColors.message }]}>
                    {notification.time}
                  </Text>
                </View>
              </View>
              {notification.message ? (
                <Text style={[
                  styles.notificationMessage,
                  { color: notificationColors.message },
                ]} numberOfLines={2}>
                  {notification.message}
                </Text>
              ) : null}
            </View>
            
            {/* Close Button */}
            <TouchableOpacity
              onPress={hideNotification}
              style={styles.notificationClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={16} color={notificationColors.message} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.container}>
      {lastUpdated && (
        <View style={styles.lastUpdatedWrapper}>
          <Feather name="clock" size={10} color={colors.textSecondary} />
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            {formatLastUpdated()}
          </Text>
        </View>
      )}

      <View style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderWidth: isDark ? 1 : 0,
          ...Platform.select({
            ios: {
              shadowColor: isDark ? '#000' : '#6366F1',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.5 : 0.12,
              shadowRadius: 20,
            },
            android: {
              elevation: isDark ? 12 : 8,
            },
          }),
        },
        hasCheckedOut && { opacity: 0.9 }
      ]}>

        <View style={styles.swipeSection}>
          <View style={[styles.swipeTrack, { backgroundColor: trackBg }]}>
            {isCheckedIn && !hasCheckedOut && (
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    backgroundColor: progressAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['#EF4444', '#F59E0B', '#10B981']
                    }),
                    opacity: 0.6,
                  },
                ]}
              />
            )}

            <View style={styles.swipeTextWrapper}>
              <Text style={[
                styles.swipeText,
                { color: hasCheckedOut ? colors.textSecondary : (isDark ? '#A5B4FC' : '#6366F1') }
              ]}>
                {getSwipeText()}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.swipeButton,
                {
                  transform: [{ translateX: pan }],
                  backgroundColor: getButtonColor(),
                  opacity: hasCheckedOut ? 0.5 : 1,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 8,
                    },
                  }),
                },
              ]}
              {...(hasCheckedOut ? {} : panResponder.panHandlers)}
            >
              {isPunching ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.swipeButtonText}>
                  {hasCheckedOut ? '✓' : isCheckedIn ? 'OUT' : 'IN'}
                </Text>
              )}
            </Animated.View>
          </View>
        </View>

        {(isCheckedIn || hasCheckedOut) && (
          <View style={[styles.timeSection, { borderTopColor: dividerColor }]}>
            <View style={styles.timeRow}>
              <View style={[styles.timeBox, { backgroundColor: timeBoxBg }]}>
                <View style={[styles.timeIconWrapper, { backgroundColor: isDark ? '#1E1E3F' : '#EEF2FF' }]}>
                  <Feather name="log-in" size={12} color={colors.primary} />
                </View>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check In</Text>
                <Text style={[styles.timeValue, { color: colors.primary }]}>
                  {formatTime(punchInDate)}
                </Text>
              </View>

              <View style={[styles.timeBox, { backgroundColor: timeBoxBg }]}>
                <View style={[styles.timeIconWrapper, { backgroundColor: isDark ? '#1E1E3F' : '#EEF2FF' }]}>
                  <Feather name="clock" size={12} color="#818CF8" />
                </View>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Working</Text>
                <Text style={[styles.timeValue, { color: '#818CF8' }]}>
                  {getDisplayWorkingHours()}
                </Text>
              </View>

              <View style={[styles.timeBox, { backgroundColor: timeBoxBg }]}>
                <View style={[styles.timeIconWrapper, { backgroundColor: isDark ? '#1E1E3F' : '#EEF2FF' }]}>
                  <Feather name="log-out" size={12} color={hasCheckedOut ? '#A5B4FC' : colors.textSecondary} />
                </View>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check Out</Text>
                <Text style={[styles.timeValue, { color: hasCheckedOut ? '#A5B4FC' : colors.textSecondary }]}>
                  {formatTime(punchOutDate)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isCheckedIn && !hasCheckedOut && slotProgresses.length > 0 && (
          <View style={[styles.pillarsSection, { borderTopColor: dividerColor }]}>
            {isOnBreak && (
              <View style={[styles.breakBanner, { backgroundColor: isDark ? '#2E2A1A' : '#FEF3C7' }]}>
                <Text style={styles.breakEmoji}>🍽️</Text>
                <Text style={[styles.breakText, { color: isDark ? '#FCD34D' : '#D97706' }]}>
                  Lunch Break (1:00 - 2:00 PM)
                </Text>
              </View>
            )}

            <View style={styles.pillarsContainer}>
              {TIME_SLOTS.map((slot, index) => {
                const progress = slotProgresses[index];
                const color = getPillarColor(index, slot.isBreak, progress?.filled || false, progress?.current || false);

                return (
                  <View key={index} style={styles.pillarWrapper}>
                    <View style={[
                      styles.pillarOuter,
                      { backgroundColor: pillarBg },
                      slot.isBreak && [styles.pillarBreak, { borderColor: isDark ? '#FCD34D' : '#F59E0B' }],
                      progress?.current && [styles.pillarActive, { borderColor: color }]
                    ]}>
                      <View
                        style={[
                          styles.pillarFill,
                          {
                            height: `${(progress?.progress || 0) * 100}%`,
                            backgroundColor: color,
                          },
                        ]}
                      />
                      {slot.isBreak && !progress?.filled && !progress?.current && (
                        <View style={styles.breakIconWrapper}>
                          <Text style={styles.breakIconText}>🍽️</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.pillarLabel,
                      { color: colors.textSecondary },
                      progress?.current && { color: color, fontWeight: '700' },
                    ]}>
                      {slot.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={[styles.progressSummary, { backgroundColor: timeBoxBg }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  Progress
                </Text>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {completedWorkingHours.toFixed(1)} / {TOTAL_WORKING_HOURS}h
                </Text>
              </View>
              <View style={[styles.progressBarSmall, { backgroundColor: pillarBg }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(completedWorkingHours / TOTAL_WORKING_HOURS) * 100}%`,
                      backgroundColor: completedWorkingHours >= 8 ? '#10B981' :
                        completedWorkingHours >= 4 ? '#F59E0B' : '#EF4444'
                    }
                  ]}
                />
              </View>
              <View style={styles.progressMilestones}>
                <Text style={[styles.milestoneText, { color: colors.textSecondary }]}>
                  Half Day: 4h
                </Text>
                <Text style={[styles.milestoneText, { color: colors.textSecondary }]}>
                  Full Day: 8h
                </Text>
              </View>
            </View>
          </View>
        )}

        {isCheckedIn && !hasCheckedOut && remainingLateCheckins <= 2 && remainingLateCheckins > 0 && (
          <View style={[
            styles.warningBox,
            { backgroundColor: isDark ? '#2E2A1A' : '#FFF7ED' }
          ]}>
            <View style={[styles.warningIconWrapper, { backgroundColor: isDark ? '#3E3A2A' : '#FFEDD5' }]}>
              <Feather name="alert-circle" size={14} color="#F59E0B" />
            </View>
            <Text style={[styles.warningText, { color: isDark ? '#FCD34D' : '#D97706' }]}>
              {remainingLateCheckins} late check-in{remainingLateCheckins > 1 ? 's' : ''} remaining this month
            </Text>
          </View>
        )}

        {isCheckedIn && !hasCheckedOut && remainingLateCheckins === 0 && (
          <View style={[
            styles.warningBox,
            { backgroundColor: isDark ? '#2E1A1A' : '#FEF2F2' }
          ]}>
            <View style={[styles.warningIconWrapper, { backgroundColor: isDark ? '#3E2A2A' : '#FECACA' }]}>
              <Feather name="alert-triangle" size={14} color="#EF4444" />
            </View>
            <Text style={[styles.warningText, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
              No late check-ins remaining. Please be on time!
            </Text>
          </View>
        )}
      </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  lastUpdatedWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 8, paddingRight: 4 },
  lastUpdated: { fontSize: 11, fontWeight: '500' },
  card: { borderRadius: 24, overflow: 'hidden' },
  loadingCard: { minHeight: 160, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 14, fontWeight: '600' },
  errorCard: { minHeight: 160, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  errorIconWrapper: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  retryText: { fontSize: 14, fontWeight: '600', color: '#6366F1' },
  swipeSection: { padding: 20, paddingBottom: 16 },
  swipeTrack: { width: '100%', height: 72, borderRadius: 36, position: 'relative', justifyContent: 'center', overflow: 'hidden' },
  progressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 36 },
  swipeTextWrapper: { position: 'absolute', width: '100%', paddingHorizontal: 80, alignItems: 'center' },
  swipeText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
  swipeButton: { position: 'absolute', left: 4, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  swipeButtonText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  timeSection: { paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, paddingTop: 16 },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeBox: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, borderRadius: 16, gap: 8 },
  timeIconWrapper: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  timeLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  timeValue: { fontSize: 14, fontWeight: '800' },
  pillarsSection: { paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, paddingTop: 16 },
  breakBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginBottom: 16 },
  breakEmoji: { fontSize: 16 },
  breakText: { fontSize: 13, fontWeight: '600' },
  pillarsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 16 },
  pillarWrapper: { flex: 1, alignItems: 'center', gap: 8 },
  pillarOuter: { width: '100%', height: 52, borderRadius: 10, overflow: 'hidden', justifyContent: 'flex-end' },
  pillarBreak: { borderWidth: 2, borderStyle: 'dashed' },
  pillarActive: { borderWidth: 2 },
  pillarFill: { width: '100%', borderRadius: 8 },
  breakIconWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  breakIconText: { fontSize: 14 },
  pillarLabel: { fontSize: 9, fontWeight: '600' },
  progressSummary: { padding: 14, borderRadius: 14, gap: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  progressValue: { fontSize: 14, fontWeight: '800' },
  progressBarSmall: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressMilestones: { flexDirection: 'row', justifyContent: 'space-between' },
  milestoneText: { fontSize: 10, fontWeight: '500' },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginBottom: 20, padding: 14, borderRadius: 14 },
  warningIconWrapper: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  warningText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  // Notification styles - Modern Minimal Design
  notificationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 12,
    right: 12,
    zIndex: 99999,
    elevation: 99999,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 0,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  notificationAccent: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  notificationIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
    flex: 1,
  },
  notificationTimeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  notificationMessage: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    opacity: 0.9,
  },
  notificationClose: {
    padding: 4,
    marginLeft: 4,
    opacity: 0.6,
  },
  notificationTime: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CheckInCard;