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
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// 🔑 STORAGE KEYS
const STORAGE_KEY_DATE = '@attendance_date';
const STORAGE_KEY_STATE = '@attendance_state';

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

interface StoredState {
  punchType: 0 | 1 | 2;
  punchInTime: string | null;
  punchOutTime: string | null;
  workingMinutes: number;
  date: string;
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

  // ============ ANIMATION REFS ============
  const pan = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ============ STATE REFS ============
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);
  const isPunchingRef = useRef(false);
  const isLoadingRef = useRef(true);
  const previousPunchType = useRef<0 | 1 | 2>(0);

  useEffect(() => { isCheckedInRef.current = isCheckedIn; }, [isCheckedIn]);
  useEffect(() => { hasCheckedOutRef.current = hasCheckedOut; }, [hasCheckedOut]);
  useEffect(() => { isPunchingRef.current = isPunching; }, [isPunching]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  useEffect(() => {
    if (isInitialized) {
      onCheckInChange?.(isCheckedIn, hasCheckedOut);
    }
  }, [isCheckedIn, hasCheckedOut, isInitialized, onCheckInChange]);

  // ============ THEME COLORS ============
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const cardBorder = isDark ? '#2C2C2E' : '#E5E7EB';
  const trackBg = isDark ? '#2C2C2E' : '#F3F4F6';
  const timeBoxBg = isDark ? '#2C2C2E' : '#F8FAFC';
  const pillarBg = isDark ? '#3A3A3C' : '#E5E7EB';
  const dividerColor = isDark ? '#3A3A3C' : '#F3F4F6';

  // ============ 🆕 STORAGE HELPERS ============
  const saveToStorage = useCallback(async (state: StoredState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
      await AsyncStorage.setItem(STORAGE_KEY_DATE, state.date);
      console.log('💾 Saved to storage:', state);
    } catch (error) {
      console.error('❌ Failed to save:', error);
    }
  }, []);

  const loadFromStorage = useCallback(async (): Promise<StoredState | null> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_STATE);
      if (!stored) return null;
      
      const state: StoredState = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      
      // Only restore if same day
      if (state.date !== today) {
        console.log('🗑️ Storage from different day, clearing');
        await AsyncStorage.multiRemove([STORAGE_KEY_STATE, STORAGE_KEY_DATE]);
        return null;
      }
      
      console.log('📂 Loaded from storage:', state);
      return state;
    } catch (error) {
      console.error('❌ Failed to load:', error);
      return null;
    }
  }, []);

  const clearStorage = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_STATE, STORAGE_KEY_DATE]);
      console.log('🗑️ Storage cleared');
    } catch (error) {
      console.error('❌ Failed to clear:', error);
    }
  }, []);

  // ============ HELPER: Apply state (unified) ============
  const applyState = useCallback((
    type: 0 | 1 | 2,
    inTime: string | null,
    outTime: string | null,
    workingMins: number,
    saveToStore: boolean = true
  ) => {
    const today = new Date().toISOString().split('T')[0];

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
        
        if (saveToStore) {
          saveToStorage({ punchType: 0, punchInTime: null, punchOutTime: null, workingMinutes: 0, date: today });
        }
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

        if (saveToStore) {
          saveToStorage({ punchType: 1, punchInTime: inTime, punchOutTime: null, workingMinutes: workingMins, date: today });
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

        if (saveToStore) {
          saveToStorage({ punchType: 2, punchInTime: inTime, punchOutTime: outTime, workingMinutes: workingMins, date: today });
        }
        break;
    }
  }, [pan, colorAnim, progressAnim, saveToStorage, parsePunchTime, calculateWorkingHours]);

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

  // ============ 🆕 FETCH PUNCH STATUS (REFACTORED) ============
  const fetchPunchStatus = useCallback(async (showLoading = true, isRefresh = false): Promise<void> => {
    try {
      if (showLoading && !isRefresh) setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];

      // 1️⃣ Check for new day
      const lastDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);
      if (lastDate && lastDate !== today) {
        console.log('🌅 New day detected - clearing storage');
        await clearStorage();
        applyState(0, null, null, 0, true);
      }

      // 2️⃣ Try loading from storage first (instant UI)
      if (!isRefresh) {
        const stored = await loadFromStorage();
        if (stored) {
          console.log('⚡ Restoring from storage');
          applyState(stored.punchType, stored.punchInTime, stored.punchOutTime, stored.workingMinutes, false);
        }
      }

      // 3️⃣ Fetch from API (background sync)
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
        newType = (responseData.PunchType ?? 0) as 0 | 1 | 2;
        punchDateTime = responseData.PunchDateTimeISO || responseData.PunchDateTime;
        workingMins = responseData.WorkingMinutes || 0;
        punchInTimeStr = responseData.PunchInTime;
      }

      console.log('📡 API Response:', { newType, punchDateTime });

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

      // 4️⃣ Guard: Check if checkout is from today
      if (newType === 2) {
        const checkoutDate = parsePunchTime(punchDateTime);
        if (checkoutDate) {
          const checkoutDay = checkoutDate.toISOString().split('T')[0];
          if (checkoutDay !== today) {
            console.log('🛡️ Checkout from previous day detected - resetting');
            newType = 0;
            punchDateTime = null;
          }
        }
      }

      // 5️⃣ Apply API state (with storage priority)
      // If we have stored state and API returns checkout, check if it's a manual checkout
      const stored = await loadFromStorage();
      
      if (stored && stored.punchType === 1 && newType === 2) {
        // User was checked in (in storage), but API says checked out
        // This could mean:
        // 1. App was closed and reopened (storage has check-in, API has old checkout)
        // 2. Admin manually checked out the user
        
        // Check if the checkout time is AFTER the stored check-in time
        const storedCheckInDate = parsePunchTime(stored.punchInTime);
        const apiCheckOutDate = parsePunchTime(punchDateTime);
        
        if (storedCheckInDate && apiCheckOutDate && apiCheckOutDate > storedCheckInDate) {
          // API checkout is newer than stored check-in - this is a real checkout
          console.log('✅ API checkout is newer - applying checkout state');
          applyState(2, punchInTimeStr, punchDateTime, workingMins, true);
        } else {
          // API checkout is older or same - keep stored check-in state
          console.log('🛡️ Keeping stored check-in state - API checkout is stale');
          // Don't change anything, storage state is already applied
        }
      } else if (newType !== previousPunchType.current || !isInitialized) {
        // Normal state change or first load
        console.log('🔄 State changed:', previousPunchType.current, '→', newType);
        
        if (newType === 0) {
          applyState(0, null, null, 0, true);
        } else if (newType === 1) {
          applyState(1, punchDateTime, null, workingMins, true);
        } else if (newType === 2) {
          applyState(2, punchInTimeStr, punchDateTime, workingMins, true);
        }
      }

      if (!isInitialized) {
        setIsInitialized(true);
      }

    } catch (error) {
      console.error('❌ Failed to fetch punch status:', error);
      setError(error instanceof Error ? error.message : 'Failed to load status');

      if (!isInitialized) {
        applyState(0, null, null, 0, true);
        setIsInitialized(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    onStatusLoaded,
    onLateEarlyCountChange,
    isInitialized,
    loadFromStorage,
    clearStorage,
    applyState,
    parsePunchTime,
  ]);

  // Initial mount
  useEffect(() => {
    fetchPunchStatus(true);
  }, [fetchPunchStatus]);

  // Screen focus
  useFocusEffect(
    useCallback(() => {
      if (isInitialized && !isPunchingRef.current) {
        console.log('📱 Screen focused - refreshing');
        fetchPunchStatus(false, true);
      }
    }, [fetchPunchStatus, isInitialized])
  );

  // Pull-to-refresh
  useEffect(() => {
    if (isInitialized && refreshKey !== undefined && refreshKey > 0 && !isPunchingRef.current) {
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
    let lastDate = new Date().toISOString().split('T')[0];

    const checkNewDay = async () => {
      const currentDate = new Date().toISOString().split('T')[0];
      if (currentDate !== lastDate) {
        lastDate = currentDate;
        console.log('🌅 Midnight reset');
        await clearStorage();
        applyState(0, null, null, 0, true);
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
  }, [fetchPunchStatus, clearStorage, applyState]);

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
          Alert.alert('Location Required', 'Please enable location to check in.');
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) throw new Error('Unable to get location.');

      const now = new Date();
      const isLate = isLateCheckIn(now);

      if (isLate && remainingLateCheckins <= 0) {
        Alert.alert('Limit Reached', 'You have used all your late check-ins for this month.');
        return false;
      }

      const response: PunchResponse = await recordPunch('IN', false, true);
      const responseData = response.data || (response as any);

      const punchTime = responseData.PunchTimeISO || responseData.PunchTime || now.toISOString();
      const workingMins = responseData.WorkingMinutes || 0;

      // Apply state and save
      applyState(1, punchTime, null, workingMins, true);

      if (responseData.IsLate) {
        Alert.alert(
          'Checked In (Late) ⚠️',
          `You are ${responseData.LateByMinutes} minutes late.\n\nRemaining: ${remainingLateCheckins - 1}/5`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Checked In! ✅', `Punch Time: ${responseData.PunchTime || formatTime(now)}`, [{ text: 'OK' }]);
      }

      Animated.timing(colorAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
      return true;

    } catch (error) {
      console.error('Punch IN error:', error);
      Alert.alert('Check-In Failed', error instanceof Error ? error.message : 'Unable to check in.');
      applyState(0, null, null, 0, true);
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
          Alert.alert('Location Required', 'Please enable location to check out.');
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) throw new Error('Unable to get location.');

      const response: PunchResponse = await recordPunch('OUT', false, true);
      const responseData = response.data || (response as any);

      const punchTime = responseData.PunchTimeISO || responseData.PunchTime || new Date().toISOString();
      const workingMins = responseData.WorkingMinutes || workingMinutes;

      // Apply state and save
      applyState(2, punchInTime, punchTime, workingMins, true);

      const workingHrs = responseData.WorkingHours || getDisplayWorkingHours();
      if (responseData.IsEarly) {
        Alert.alert(
          'Checked Out (Early) ⚠️',
          `Early by ${responseData.EarlyByMinutes} min\n\nWorking: ${workingHrs}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Checked Out! 🏁',
          `Working: ${workingHrs}${responseData.OvertimeHours ? `\nOT: ${responseData.OvertimeHours}` : ''}`,
          [{ text: 'OK' }]
        );
      }

      Animated.timing(colorAnim, { toValue: 2, duration: 800, useNativeDriver: false }).start();
      return true;

    } catch (error) {
      console.error('Punch OUT error:', error);
      Alert.alert('Check-Out Failed', error instanceof Error ? error.message : 'Unknown error');
      applyState(1, punchInTime, null, workingMinutes, true);
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

  // ============ RENDER (UI remains same - keeping rest of code) ============
  return (
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
});

export default CheckInCard;