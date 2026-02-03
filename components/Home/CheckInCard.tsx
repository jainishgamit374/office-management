// components/CheckInCard.tsx
import { useTheme } from '@/contexts/ThemeContext';
import {
    API_BASE_URL,
    formatMinutesToHours,
    getCurrentLocation,
    getPunchStatus,
    hasLocationPermission,
    isLateCheckIn,
    requestLocationPermission,
    type PunchStatusResponse
} from '@/lib/attendance';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    AppState,
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

// Persist punch state so check-in/out details survive app restarts
// v3: Uses timestamps (numbers) instead of strings for reliable rehydration
const CHECKIN_STORAGE_KEY = '@checkin_card_state_v3';

type PersistedPunchState = {
  punchType: 1 | 2 | 3;
  punchInTs: number | null;    // Unix timestamp (ms) - lossless
  punchOutTs: number | null;   // Unix timestamp (ms) - lossless
  punchInTime: string | null;  // Keep for display fallback
  punchOutTime: string | null; // Keep for display fallback
  workingMinutes: number;
  date: string; // YYYY-MM-DD for quick staleness checks
};



if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============ TYPES ============
interface CheckInCardProps {
  onCheckInChange?: (isCheckedIn: boolean, hasCheckedOut: boolean) => void;
  onLateEarlyCountChange?: (lateCount: number, earlyCount: number) => void;
  onStatusLoaded?: (status: PunchStatusResponse) => void;
  refreshKey?: number;
  onRefreshRequest?: () => void; // Optional callback to trigger parent refresh
}

// ============ COMPONENT ============
const CheckInCard: React.FC<CheckInCardProps> = ({
  onCheckInChange,
  onLateEarlyCountChange,
  onStatusLoaded,
  refreshKey,
  onRefreshRequest,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  // ============ STATE ============
  const [punchType, setPunchType] = useState<1 | 2 | 3>(3); // 3 = Null/Nothing, 1 = In, 2 = Out
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

  const [completedWorkingHours, setCompletedWorkingHours] = useState<number>(0);

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
  const refreshRotation = useRef(new Animated.Value(0)).current; // For refresh button animation
  const [isRefreshing, setIsRefreshing] = useState(false); // For manual refresh state
  const persistedStateRef = useRef<PersistedPunchState | null>(null);

  // ============ STATE REFS ============
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);
  const isPunchingRef = useRef(false);
  const isLoadingRef = useRef(true);
  const isInitializedRef = useRef(false); // NEW: Stable ref to prevent stale closure
  const punchTypeRef = useRef<1 | 2 | 3>(3); // NEW: Ref to track punchType for stale closures
  const previousPunchType = useRef<1 | 2 | 3>(3);
  const punchInDateRef = useRef<Date | null>(null); // Ref to track punchInDate for stale closure prevention
  const punchOutDateRef = useRef<Date | null>(null); // Ref to track punchOutDate for stale closure prevention
  const lastPunchTime = useRef<number>(0); // Timestamp of last punch action
  const lastPunchAction = useRef<'IN' | 'OUT' | null>(null); // Last punch action type
  const COOLDOWN_MS = 300000; // 5 minute cooldown to ignore conflicting API responses
  const COOLDOWN_DISPLAY = `${Math.round(COOLDOWN_MS / 60000)} minute${COOLDOWN_MS >= 120000 ? 's' : ''}`; // Human-readable cooldown
  const isStateLocked = useRef(false); // Lock state changes during critical operations
  const stateLockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null); // Cleanup ref for state lock timeout
  const isFetchingRef = useRef(false); // Prevent overlapping fetches
  const lastFetchTime = useRef<number>(0); // Throttle API calls
  const FETCH_THROTTLE_MS = 5000; // Minimum 5 seconds between API calls
  const hasHydratedRef = useRef(false); // Track if we've hydrated from storage

  useEffect(() => { isCheckedInRef.current = isCheckedIn; }, [isCheckedIn]);
  useEffect(() => { hasCheckedOutRef.current = hasCheckedOut; }, [hasCheckedOut]);
  useEffect(() => { isPunchingRef.current = isPunching; }, [isPunching]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { isInitializedRef.current = isInitialized; }, [isInitialized]);
  useEffect(() => { punchTypeRef.current = punchType; }, [punchType]);
  useEffect(() => { punchInDateRef.current = punchInDate; }, [punchInDate]);
  useEffect(() => { punchOutDateRef.current = punchOutDate; }, [punchOutDate]);

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
  const dividerColor = isDark ? '#3A3A3C' : '#F3F4F6';

  // ============ DATE HELPER ============
  const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ============ HELPER: Parse Time (moved before applyState) ============
  const parsePunchTime = useCallback((timeString: string | null | undefined): Date | null => {
    if (!timeString) return null;

    try {
      console.log('🔍 Parsing time string:', timeString);

      // Handle ISO format
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          console.log('✅ Parsed ISO:', date);
          return date;
        }
      }

      // Handle YYYY-MM-DD HH:mm:ss AM/PM (API format: "2025-12-24 11:49:46 AM")
      const matchYYYYMMDD = timeString.match(/^(\d{4})[-/](\d{2})[-/](\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (matchYYYYMMDD) {
        const [, year, month, day, hours, minutes, seconds, period] = matchYYYYMMDD;
        let hour = parseInt(hours, 10);
        const min = parseInt(minutes, 10);
        const sec = seconds ? parseInt(seconds, 10) : 0;
        
        if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, min, sec);
        console.log('✅ Parsed YYYY-MM-DD Format:', date);
        return date;
      }

      // Handle DD-MM-YYYY HH:mm:ss AM/PM (alternate format)
      // Flexible regex: separators can be - or /, optional AM/PM, optional seconds
      const matchDDMMYYYY = timeString.match(/^(\d{2})[-/](\d{2})[-/](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (matchDDMMYYYY) {
        const [, day, month, year, hours, minutes, seconds, period] = matchDDMMYYYY;
        let hour = parseInt(hours, 10);
        const min = parseInt(minutes, 10);
        const sec = seconds ? parseInt(seconds, 10) : 0;
        
        if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, min, sec);
        console.log('✅ Parsed DD-MM-YYYY Format:', date);
        return date;
      }
      
      // Fallback: try standard Date constructor
      const fallbackDate = new Date(timeString);
      if (!isNaN(fallbackDate.getTime())) {
        console.log('✅ Parsed via Constructor:', fallbackDate);
        return fallbackDate;
      }

      console.warn('❌ Failed to parse date:', timeString);
      return null;
    } catch (e) {
      console.error('❌ Error parsing date:', e);
      return null;
    }
  }, []);

  // ============ HELPER: Calculate working hours (moved before applyState) ============
  const calculateWorkingHours = useCallback((checkInTime: Date | null): number => {
    if (!checkInTime) return 0;

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    // Calculate effective start time: later of office start (9:30) or actual check-in
    const officeStart = OFFICE_START_HOUR + OFFICE_START_MINUTE / 60;
    const checkInHour = checkInTime.getHours() + checkInTime.getMinutes() / 60;
    const effectiveStart = Math.max(officeStart, checkInHour);

    // If current time is before effective start, return 0
    if (currentHour <= effectiveStart) return 0;

    // Calculate duration with lunch break deduction
    const totalDuration = currentHour - effectiveStart;
    
    // Calculate overlap with lunch break [13:00 - 14:00]
    const overlapStart = Math.max(effectiveStart, BREAK_START_HOUR);
    const overlapEnd = Math.min(currentHour, BREAK_END_HOUR);
    const lunchOverlap = Math.max(0, overlapEnd - overlapStart);
    
    const workingHours = totalDuration - lunchOverlap;

    return Math.max(0, Math.min(workingHours, TOTAL_WORKING_HOURS));
  }, []);

  // ============ HELPER: Check if date is today ============
  const isToday = useCallback((date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }, []);

  // Persist latest punch state so check-in/out info survives app restarts
  // Uses timestamps (numbers) for reliable rehydration - no parsing required
  const persistPunchState = useCallback(async (
    type: 1 | 2 | 3,
    inTime: string | null,
    outTime: string | null,
    workingMins: number
  ) => {
    try {
      if (type === 3) {
        persistedStateRef.current = null;
        await AsyncStorage.removeItem(CHECKIN_STORAGE_KEY);
        return;
      }

      // Parse dates and convert to timestamps (lossless)
      let inDate = inTime ? parsePunchTime(inTime) : null;
      let outDate = outTime ? parsePunchTime(outTime) : null;

      // Use refs to get current values (avoids stale closure)
      const currentPunchInDate = punchInDateRef.current;
      const currentPunchOutDate = punchOutDateRef.current;
      const existingCached = persistedStateRef.current;

      // Fallback chain for inDate: parsed string → ref → existing cache
      if (!inDate && currentPunchInDate && !isNaN(currentPunchInDate.getTime())) {
        inDate = currentPunchInDate;
      }
      if (!inDate && existingCached?.punchInTs) {
        inDate = new Date(existingCached.punchInTs);
      }
      
      // Fallback chain for outDate: parsed string → ref → existing cache  
      if (!outDate && currentPunchOutDate && !isNaN(currentPunchOutDate.getTime())) {
        outDate = currentPunchOutDate;
      }
      if (!outDate && existingCached?.punchOutTs) {
        outDate = new Date(existingCached.punchOutTs);
      }
      
      const dateStr = getLocalDateString(inDate || outDate || new Date());

      const payload: PersistedPunchState = {
        punchType: type,
        punchInTs: inDate ? inDate.getTime() : null,
        punchOutTs: outDate ? outDate.getTime() : null,
        punchInTime: inTime || (inDate ? inDate.toISOString() : null),   // Keep strings for display fallback
        punchOutTime: outTime || (outDate ? outDate.toISOString() : null), // Keep strings for display fallback
        workingMinutes: workingMins || 0,
        date: dateStr,
      };

      console.log('💾 Persisting state with timestamps:', {
        type,
        inTs: payload.punchInTs,
        outTs: payload.punchOutTs,
        date: dateStr,
      });

      persistedStateRef.current = payload;
      await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('⚠️ Failed to persist punch state', err);
    }
  }, [getLocalDateString, parsePunchTime]);

  // ============ HELPER: Apply state (unified) ============
  const applyState = useCallback((
    type: 1 | 2 | 3,
    inTime: string | null,
    outTime: string | null,
    workingMins: number
  ) => {
    console.log('🔄 Applying state:', { type, inTime, outTime, workingMins });

    switch (type) {
      case 3: {
        pan.setValue(0);
        colorAnim.setValue(0);
        progressAnim.setValue(0);
        setIsCheckedIn(false);
        setHasCheckedOut(false);
        setPunchInTime(null);
        setPunchOutTime(null);
        setPunchInDate(null);
        setPunchOutDate(null);
        // Also clear refs immediately
        punchInDateRef.current = null;
        punchOutDateRef.current = null;
        setWorkingMinutes(0);
        setCompletedWorkingHours(0);
        setPunchType(3);
        previousPunchType.current = 3;
        break;
      }
      case 1: {
        const parsedIn = parsePunchTime(inTime);
        // CRITICAL: If parsing fails, use current time as fallback - we MUST have a valid check-in date
        const checkInDate = parsedIn && !isNaN(parsedIn.getTime()) ? parsedIn : new Date();
        
        console.log('✅ Applying Check-In State:', { 
          inTime, 
          parsedIn: parsedIn?.toISOString(),
          parsedInValid: parsedIn && !isNaN(parsedIn.getTime()),
          finalCheckInDate: checkInDate.toISOString(),
        });
        
        pan.setValue(MAX_SWIPE_DISTANCE);
        colorAnim.setValue(1);
        
        setIsCheckedIn(true);
        setHasCheckedOut(false);
        setPunchInTime(inTime || checkInDate.toISOString());
        setPunchInDate(checkInDate);
        // CRITICAL: Update ref immediately for checkout to use later - MUST be valid Date
        punchInDateRef.current = checkInDate;
        console.log('🔐 punchInDateRef SET to:', punchInDateRef.current?.toISOString());
        
        setPunchOutTime(null);
        setPunchOutDate(null);
        punchOutDateRef.current = null;
        setWorkingMinutes(workingMins);
        setPunchType(1);
        previousPunchType.current = 1;

        if (checkInDate) {
          const progress = calculateWorkingHours(checkInDate) / TOTAL_WORKING_HOURS;
          progressAnim.setValue(progress);
        } else {
          progressAnim.setValue(0);
        }
        break;
      }
      case 2: {
        const parsedOut = parsePunchTime(outTime);
        const parsedIn2 = parsePunchTime(inTime);
        const cachedState = persistedStateRef.current;
        // Use refs for current punchInDate/punchOutDate to avoid stale closure issues
        const currentPunchInDate = punchInDateRef.current;
        const currentPunchOutDate = punchOutDateRef.current;
        
        // Build fallback chain - MUST have a check-in time for checkout to make sense
        let fallbackIn = parsedIn2
          || currentPunchInDate
          || (cachedState?.punchInTs ? new Date(cachedState.punchInTs) : null);
        
        // If still no check-in time, this is a problem - but show something rather than blank
        // This shouldn't happen in normal flow, but prevents "--:--" display
        if (!fallbackIn) {
          console.warn('⚠️ CRITICAL: No check-in time found during checkout! Creating placeholder.');
          // Create a placeholder time (8 hours before checkout)
          const checkoutTime = parsedOut || new Date();
          fallbackIn = new Date(checkoutTime.getTime() - (8 * 60 * 60 * 1000));
        }
        
        const fallbackOut = parsedOut
          || currentPunchOutDate
          || (cachedState?.punchOutTs ? new Date(cachedState.punchOutTs) : null)
          || new Date(); // Default to now for checkout time
        
        console.log('📋 Checkout state debug:', {
          inTime,
          outTime,
          parsedIn2: parsedIn2?.toISOString(),
          parsedOut: parsedOut?.toISOString(),
          currentPunchInDate: currentPunchInDate?.toISOString(),
          cachedPunchInTs: cachedState?.punchInTs,
          fallbackIn: fallbackIn?.toISOString(),
          fallbackOut: fallbackOut?.toISOString(),
        });

        pan.setValue(0);
        colorAnim.setValue(2);
        progressAnim.setValue(0);

        setIsCheckedIn(false);
        setHasCheckedOut(true);
        setPunchOutTime(outTime || fallbackOut.toISOString());
        setPunchOutDate(fallbackOut);
        // Update ref immediately
        punchOutDateRef.current = fallbackOut;
        
        setPunchInTime(inTime || fallbackIn.toISOString());
        setPunchInDate(fallbackIn);
        // Update ref immediately
        punchInDateRef.current = fallbackIn;
        
        setWorkingMinutes(workingMins);
        setCompletedWorkingHours(0);
        setPunchType(2);
        previousPunchType.current = 2;
        break;
      }
    }

    // Persist latest state so we can restore it on next app launch
    void persistPunchState(type, inTime, outTime, workingMins);
  }, [
    pan,
    colorAnim,
    progressAnim,
    parsePunchTime,
    calculateWorkingHours,
    persistPunchState,
  ]);

  // Hydrate from persisted state on mount (same-day only)
  // Uses timestamps directly - NO string parsing required (lossless)
  useEffect(() => {
    const hydrateFromStorage = async () => {
      if (hasHydratedRef.current) return; // Only hydrate once
      hasHydratedRef.current = true;

      try {
        const raw = await AsyncStorage.getItem(CHECKIN_STORAGE_KEY);
        if (!raw) {
          console.log('💾 No cached state found');
          return;
        }

        const cached: PersistedPunchState = JSON.parse(raw);
        console.log('💾 Found cached state:', cached);
        
        if (cached.date !== getLocalDateString()) {
          console.log('💾 Cached state is stale (different day), removing');
          await AsyncStorage.removeItem(CHECKIN_STORAGE_KEY);
          return;
        }

        // Reconstruct Date objects from timestamps (lossless - no parsing!)
        const inDate = cached.punchInTs ? new Date(cached.punchInTs) : null;
        const outDate = cached.punchOutTs ? new Date(cached.punchOutTs) : null;

        console.log('💾 Hydrating from timestamps:', {
          punchType: cached.punchType,
          inTs: cached.punchInTs,
          outTs: cached.punchOutTs,
          inDate: inDate?.toISOString(),
          outDate: outDate?.toISOString(),
        });

        // Set Date objects directly (bypassing string parsing)
        // IMPORTANT: Set refs FIRST before state to avoid stale closure issues
        punchInDateRef.current = inDate;
        punchOutDateRef.current = outDate;
        setPunchInDate(inDate);
        setPunchOutDate(outDate);

        persistedStateRef.current = cached;
        
        // Apply state with ISO strings for display (Date objects already set above)
        const inTimeStr = inDate?.toISOString() ?? cached.punchInTime;
        const outTimeStr = outDate?.toISOString() ?? cached.punchOutTime;
        
        console.log('💾 Applying cached state:', cached.punchType, inTimeStr, outTimeStr);
        applyState(cached.punchType, inTimeStr, outTimeStr, cached.workingMinutes || 0);
        
        setIsInitialized(true);
        isInitializedRef.current = true;
        setIsLoading(false);
        setLastUpdated(new Date());
      } catch (err) {
        console.warn('⚠️ Failed to hydrate punch state', err);
      }
    };

    hydrateFromStorage();
  }, [applyState, getLocalDateString]);

  const formatTime = (date: Date | null): string => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // ============ HELPER: Validate API response is from today ============
  const isApiResponseFromToday = useCallback((punchDateTime: string | null, punchInTime: string | null): boolean => {
    const timeToCheck = punchDateTime || punchInTime;
    if (!timeToCheck) return false;
    
    const parsedDate = parsePunchTime(timeToCheck);
    if (!parsedDate) return false;
    
    return isToday(parsedDate);
  }, [parsePunchTime, isToday]);

  // ============ FETCH PUNCH STATUS (API-ONLY) ============
  const fetchPunchStatus = useCallback(async (showLoading = true, isRefresh = false, forceRefresh = false): Promise<void> => {
    try {
      // Prevent overlapping fetches
      if (isFetchingRef.current && !forceRefresh) {
        console.log('⏳ Skipping fetch - already in flight');
        return;
      }

      // Throttle API calls (except for force refresh)
      const now = Date.now();
      if (!forceRefresh && (now - lastFetchTime.current) < FETCH_THROTTLE_MS) {
        console.log('⏳ Skipping fetch - throttled (last fetch was', Math.round((now - lastFetchTime.current) / 1000), 's ago)');
        return;
      }

      isFetchingRef.current = true;
      lastFetchTime.current = now;

      const hasCachedState = persistedStateRef.current?.date === getLocalDateString();
      if (showLoading && !isRefresh && !hasCachedState) setIsLoading(true);
      setError(null);

      // If force refresh, clear state locks and cooldown
      if (forceRefresh) {
        console.log('🔄 FORCE REFRESH: Bypassing cooldown and state lock protections');
        isStateLocked.current = false;
        lastPunchTime.current = 0; // Reset cooldown
        lastPunchAction.current = null;
      }

      // Fetch from API
      const response: PunchStatusResponse = await getPunchStatus();
      onStatusLoaded?.(response);
      setLastUpdated(new Date());

      const responseData = response.data || (response as any);
      
      // Handle both nested and flat API structures
      let newType: 1 | 2 | 3 = 3; // Default to 3 (null/nothing)
      let punchDateTime: string | null = null;
      let workingMins = 0;
      let punchInTimeStr: string | null = null;
      let punchOutTimeStr: string | null = null; // NEW: Track punch out time separately

      const cached = persistedStateRef.current;

      if (responseData.punch) {
        newType = (responseData.punch.PunchType ?? 3) as 1 | 2 | 3; // Default to 3 (null/nothing)
        punchDateTime = responseData.punch.PunchDateTimeISO || responseData.punch.PunchDateTime || null;
        workingMins = responseData.punch.WorkingMinutes || 0;
        // FIXED: Properly extract PunchInTime - this is crucial for showing check-in time after checkout
        punchInTimeStr = responseData.punch.PunchInTime || responseData.punch.PunchInTimeISO || null;
        punchOutTimeStr = responseData.punch.PunchOutTime || responseData.punch.PunchOutTimeISO || null;
        
        // If PunchType is 2 (checked out) and PunchInTime is missing, try to derive from PunchDateTime if it's not the checkout time
        if (newType === 2 && !punchInTimeStr && punchDateTime) {
          // For checkout state, PunchDateTime is usually the checkout time, so we need PunchInTime from the API
          console.log('⚠️ Checkout state but PunchInTime missing - check API response structure');
        }
      } else {
        const flatData = responseData as any;
        newType = (flatData.PunchType ?? 3) as 1 | 2 | 3; // Default to 3 (null/nothing)
        punchDateTime = flatData.PunchDateTimeISO || flatData.PunchDateTime || null;
        workingMins = flatData.WorkingMinutes || 0;
        punchInTimeStr = flatData.PunchInTime || flatData.PunchInTimeISO || null;
        punchOutTimeStr = flatData.PunchOutTime || flatData.PunchOutTimeISO || null;
      }

      // If API checkout payload is missing check-in info, fallback to cached same-day data
      if (newType === 2 && cached && cached.date === getLocalDateString()) {
        if (!punchInTimeStr && cached.punchInTime) {
          punchInTimeStr = cached.punchInTime;
        }
        if (!punchInTimeStr && cached.punchInTs) {
          punchInTimeStr = new Date(cached.punchInTs).toISOString();
        }
        if (!punchOutTimeStr && cached.punchOutTime) {
          punchOutTimeStr = cached.punchOutTime;
        }
        if (!punchOutTimeStr && cached.punchOutTs) {
          punchOutTimeStr = new Date(cached.punchOutTs).toISOString();
        }
        if (!workingMins && cached.workingMinutes) {
          workingMins = cached.workingMinutes;
        }
      }

      console.log('📡 API Response:', { newType, punchDateTime, punchInTimeStr, punchOutTimeStr, workingMins });
      console.log('🔍 DEBUG - Full API responseData:', JSON.stringify(responseData, null, 2));
      console.log('🔍 DEBUG - Previous PunchType:', previousPunchType.current, '| New PunchType:', newType);

      // ⚠️ DATE VALIDATION: Check if API response data is from today
      const apiDataIsFromToday = isApiResponseFromToday(punchDateTime, punchInTimeStr);
      console.log('📅 API data is from today:', apiDataIsFromToday);

      // If API returns checkout (type 2) but data is not from today, treat as fresh day (type 3)
      if (newType === 2 && !apiDataIsFromToday) {
        console.log('🛡️ PROTECTION: API returned checkout from previous day - treating as fresh day');
        newType = 3;
        punchDateTime = null;
        punchInTimeStr = null;
        workingMins = 0;
      }

      // If API returns checked-in (type 1) but data is not from today, treat as fresh day
      // BUT: Only reset if we're NOT currently checked in locally (to prevent auto-reset after user checks in)
      // SKIP this protection for force refresh - trust the API response
      if (newType === 1 && !apiDataIsFromToday && !forceRefresh) {
        if (!isCheckedInRef.current) {
          // Safe to reset - user is not checked in locally
          console.log('🛡️ PROTECTION: API returned check-in from previous day - treating as fresh day');
          newType = 3;
          punchDateTime = null;
          punchInTimeStr = null;
          workingMins = 0;
        } else {
          // User IS checked in locally - ignore stale API data completely
          console.log('🛡️ PROTECTION: API returned old check-in data but user is CURRENTLY CHECKED IN - ignoring API response');
          setLastUpdated(new Date());
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }
      }

      // ⚠️ STATE LOCK PROTECTION: Absolutely prevent state changes during lock period (unless force refresh)
      if (isStateLocked.current && !forceRefresh) {
        console.log('🔒 STATE LOCKED: Ignoring ALL API responses during lock period');
        console.log(`   Current local state: ${previousPunchType.current}, API wants: ${newType}`);
        setLastUpdated(new Date());
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // ⚠️ COOLDOWN PROTECTION: Ignore API responses that conflict with recent punch action (unless force refresh)
      const timeSinceLastPunch = Date.now() - lastPunchTime.current;
      const isInCooldown = timeSinceLastPunch < COOLDOWN_MS && !forceRefresh;
      
      if (isInCooldown && lastPunchAction.current === 'IN' && (newType === 2 || newType === 3)) {
        console.log('🛡️ PROTECTION: Ignoring conflicting API response (within cooldown period)');
        console.log(`   Last punch: IN, ${Math.round(timeSinceLastPunch / 1000)}s ago`);
        console.log(`   API returned PunchType: ${newType} but we just checked IN - ignoring`);
        setLastUpdated(new Date());
        setIsLoading(false);
        isFetchingRef.current = false;
        return; // Don't apply this state change
      }
      
      if (isInCooldown && lastPunchAction.current === 'OUT' && (newType === 1 || newType === 3)) {
        console.log('🛡️ PROTECTION: Ignoring conflicting API response (within cooldown period)');
        console.log(`   Last punch: OUT, ${Math.round(timeSinceLastPunch / 1000)}s ago`);
        console.log(`   API returned PunchType: ${newType} but we just checked OUT - ignoring`);
        setLastUpdated(new Date());
        setIsLoading(false);
        isFetchingRef.current = false;
        return; // Don't apply this state change
      }

      // ⚠️ LOCAL STATE PROTECTION: If we're currently checked in, don't auto-checkout OR auto-reset from API (unless force refresh)
      if (!forceRefresh && isCheckedInRef.current && !hasCheckedOutRef.current && (newType === 2 || newType === 3)) {
        // CRITICAL: Block BOTH checkout (type 2) AND reset (type 0) when checked in
        
        if (newType === 3) {
          // API is trying to reset state to "not punched" while we're checked in
          console.log(`🛡️ PROTECTION: API returned PunchType ${newType} but we are CHECKED IN - ignoring`);
          console.log(`   Current local state: Checked In (type 1)`);
          console.log(`   API wants to reset to: Not Punched (type ${newType})`);
          setLastUpdated(new Date());
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }
        
        if (newType === 2) {
          // Only allow checkout if the checkout time is from today and recent (within last 5 minutes)
          const checkoutDate = parsePunchTime(punchDateTime);
          if (checkoutDate) {
            const timeSinceCheckout = Date.now() - checkoutDate.getTime();
            const fiveMinutes = 5 * 60 * 1000;
            // Check both time recency AND if it's from today
            if (timeSinceCheckout > fiveMinutes || !isToday(checkoutDate)) {
              console.log('🛡️ PROTECTION: Ignoring stale/old checkout from API (checkout was more than 5 min ago or not from today)');
              setLastUpdated(new Date());
              setIsLoading(false);
              isFetchingRef.current = false;
              return;
            }
          }
        }
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
      console.log('✅ Applying API state:', previousPunchType.current, '→', newType);
      
      if (newType === 3) {
        applyState(3, null, null, 0); // Type 3 = not punched
      } else if (newType === 1) {
        // For check-in, punchDateTime is the check-in time
        // Also try punchInTimeStr in case API returns it differently
        const checkInTime = punchInTimeStr || punchDateTime;
        applyState(1, checkInTime, null, workingMins);
      } else if (newType === 2) {
        // For check-out, punchInTimeStr is the check-in time, punchOutTimeStr or punchDateTime is the check-out time
        const checkOutTime = punchOutTimeStr || punchDateTime;
        // FIXED: Pass punchInTimeStr correctly to preserve check-in time after app restart
        console.log('📥 Applying checkout state with PunchInTime:', punchInTimeStr, 'PunchOutTime:', checkOutTime);
        applyState(2, punchInTimeStr, checkOutTime, workingMins);
      }

      if (!isInitializedRef.current) {
        setIsInitialized(true);
        isInitializedRef.current = true;
      }

    } catch (error) {
      console.error('❌ Failed to fetch punch status:', error);
      setError(error instanceof Error ? error.message : 'Failed to load status');
      
      if (!isInitializedRef.current) {
        applyState(3, null, null, 0);
        setIsInitialized(true);
        isInitializedRef.current = true;
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [
    onStatusLoaded,
    onLateEarlyCountChange,
    applyState,
    isApiResponseFromToday,
    parsePunchTime,
    getLocalDateString,
  ]);

  // Initial mount - delay slightly to let hydration happen first
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only fetch if we don't have valid cached state already applied
      if (!persistedStateRef.current || persistedStateRef.current.date !== getLocalDateString()) {
        console.log('🚀 Initial mount fetch (no valid cache)');
        fetchPunchStatus(true);
      } else {
        console.log('🚀 Initial mount - using cached state, background refresh in 3s');
        // Still do a background refresh after a delay
        setTimeout(() => fetchPunchStatus(false, true), 3000);
      }
    }, 100); // Small delay to let hydration complete first
    return () => clearTimeout(timer);
  }, [fetchPunchStatus, getLocalDateString]);

  // Screen focus
  const isFirstFocus = useRef(true); // Track first focus to prevent double call on mount
  useFocusEffect(
    useCallback(() => {
      // Skip first focus (already handled by initial mount useEffect)
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      
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

  // Refresh when the app returns to the foreground so users don't need to force-close
  useEffect(() => {
    let lastActiveTime = Date.now();
    
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && !isPunchingRef.current) {
        const now = Date.now();
        // Only refresh if app was in background for at least 10 seconds
        if (now - lastActiveTime > 10000) {
          console.log('📱 App returned to foreground after', Math.round((now - lastActiveTime) / 1000), 's');
          fetchPunchStatus(false, true, false); // Not force refresh, let throttle work
        }
        lastActiveTime = now;
      } else if (state === 'background') {
        lastActiveTime = Date.now();
      }
    });

    return () => sub.remove();
  }, [fetchPunchStatus]);

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
        // Check if we're in cooldown period
        const timeSinceLastPunch = Date.now() - lastPunchTime.current;
        if (timeSinceLastPunch < COOLDOWN_MS) {
          console.log('⏰ Background polling - skipping (in cooldown)');
          return;
        }
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
        applyState(3, null, null, 0);
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

  // Cleanup state lock timeout on unmount
  useEffect(() => {
    return () => {
      if (stateLockTimeout.current) {
        clearTimeout(stateLockTimeout.current);
      }
    };
  }, []);

  // Progress update - simplified without slot progress
  useEffect(() => {
    const updateProgress = () => {
      if (!isCheckedIn || !punchInDate || hasCheckedOut) {
        setCompletedWorkingHours(0);
        progressAnim.setValue(0);
        return;
      }

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
    const interval = setInterval(updateProgress, 60 * 1000); // Update every minute instead of 30 seconds
    return () => clearInterval(interval);
  }, [isCheckedIn, punchInDate, hasCheckedOut, progressAnim, calculateWorkingHours]);

  // ============ PUNCH HANDLER WITH STATE VALIDATION ============
  const handlePunch = async (): Promise<boolean> => {
    if (isPunchingRef.current) return false;

    try {
      setIsPunching(true);
      isPunchingRef.current = true;

      const currentPunchType = punchTypeRef.current;

      // DEBUG: Log current state at punch attempt
      console.log('🎯 handlePunch called - Current state:', {
        punchTypeState: punchType,
        punchTypeRef: currentPunchType,
        isCheckedIn,
        hasCheckedOut,
        isCheckedInRef: isCheckedInRef.current,
        hasCheckedOutRef: hasCheckedOutRef.current,
      });

      // STATE TRANSITION VALIDATION USING IF/ELSE/ELSEIF
      if (currentPunchType === 3) {
        // State 3: Can only transition to 1 (Check-In) - means "not punched"
        console.log(`🔄 Current state: ${currentPunchType} (Not Punched) → Attempting transition to 1 (Check-In)`);
        
        // Check location permission
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

        // Get auth token
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication required. Please login again.');
        }

        // Prepare request body
        const requestBody = {
          PunchType: 1, // Check-In
          Latitude: location.latitude.toString(),
          Longitude: location.longitude.toString(),
          IsAway: false,
        };

        console.log('📤 Sending CHECK-IN request with Axios:', requestBody);

        // Make API call using Axios
        const response = await axios.post(
          `${API_BASE_URL}/emp-punch/`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const responseData = response.data;
        console.log('✅ Check-in successful:', responseData);

        // API returns flat structure: { status, message, PunchTime }
        // Try both flat and nested structures for compatibility
        const punchTime = responseData.PunchTimeISO || responseData.PunchTime 
          || responseData.data?.PunchTimeISO || responseData.data?.PunchTime 
          || now.toISOString();
        const workingMins = responseData.WorkingMinutes || responseData.data?.WorkingMinutes || 0;
        
        console.log('📥 Parsed check-in time:', punchTime);

        // Set STRICT cooldown protection with state lock
        lastPunchTime.current = Date.now();
        lastPunchAction.current = 'IN';
        isStateLocked.current = true; // LOCK THE STATE
        console.log(`🔒 STATE LOCKED + Cooldown protection for ${COOLDOWN_DISPLAY}`);

        // Apply state
        applyState(1, punchTime, null, workingMins);

        // Unlock state after cooldown period with cleanup
        if (stateLockTimeout.current) {
          clearTimeout(stateLockTimeout.current);
        }
        stateLockTimeout.current = setTimeout(() => {
          isStateLocked.current = false;
          console.log('🔓 State unlocked - API responses will be accepted again');
          stateLockTimeout.current = null;
        }, COOLDOWN_MS);

        const wasLateCheckIn = responseData.IsLate || responseData.data?.IsLate;
        const lateByMins = responseData.LateByMinutes || responseData.data?.LateByMinutes || 'a few';
        
        if (wasLateCheckIn) {
          showNotification(
            'warning',
            'Late Check-In',
            `You're ${lateByMins} min late • ${remainingLateCheckins - 1} remaining`
          );
        } else {
          showNotification(
            'success',
            'Checked In Successfully',
            'Have a productive day! 🚀'
          );
        }

        Animated.timing(colorAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
        
        // Update status immediately from server (force refresh to bypass cooldown)
        await fetchPunchStatus(false, true, true);
        
        // Trigger parent refresh to update all components on the home screen
        onRefreshRequest?.();
        
        return true;

      } else if (currentPunchType === 1) {
        // State 1: Can only transition to 2 (Check-Out)
        console.log('🔄 Current state: 1 (Checked-In) → Attempting transition to 2 (Check-Out)');
        
        // Check location permission
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

        // Get auth token
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication required. Please login again.');
        }

        // Prepare request body
        const requestBody = {
          PunchType: 2, // Check-Out
          Latitude: location.latitude.toString(),
          Longitude: location.longitude.toString(),
          IsAway: false,
        };

        console.log('📤 Sending CHECK-OUT request with Axios:', requestBody);

        // Make API call using Axios
        const response = await axios.post(
          `${API_BASE_URL}/emp-punch/`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const responseData = response.data;
        console.log('✅ Check-out successful:', responseData);

        // API returns flat structure: { status, message, PunchTime }
        // Try both flat and nested structures for compatibility
        const punchTime = responseData.PunchTimeISO || responseData.PunchTime 
          || responseData.data?.PunchTimeISO || responseData.data?.PunchTime 
          || new Date().toISOString();
        const workingMins = responseData.WorkingMinutes || responseData.data?.WorkingMinutes || workingMinutes;
        
        console.log('📥 Parsed check-out time:', punchTime);

        // Set STRICT cooldown protection with state lock
        lastPunchTime.current = Date.now();
        lastPunchAction.current = 'OUT';
        isStateLocked.current = true; // LOCK THE STATE
        console.log(`🔒 STATE LOCKED + Cooldown protection for ${COOLDOWN_DISPLAY}`);

        // IMPORTANT: Get check-in time with multiple fallbacks to ensure we don't lose it
        // Priority: 1) Ref (most current), 2) State, 3) Cached timestamp
        const cachedData = persistedStateRef.current;
        const currentPunchInDateForCheckout = punchInDateRef.current 
          || punchInDate 
          || (cachedData?.punchInTs ? new Date(cachedData.punchInTs) : null);
        
        const punchInTimeForCheckout = currentPunchInDateForCheckout 
          ? currentPunchInDateForCheckout.toISOString() 
          : null;
        
        console.log('📋 Checkout - check-in time sources:', {
          fromRef: punchInDateRef.current?.toISOString(),
          fromState: punchInDate?.toISOString(),
          fromCache: cachedData?.punchInTs ? new Date(cachedData.punchInTs).toISOString() : null,
          final: punchInTimeForCheckout,
        });

        // Apply state with the check-in time
        applyState(2, punchInTimeForCheckout, punchTime, workingMins);

        // Unlock state after cooldown period with cleanup
        if (stateLockTimeout.current) {
          clearTimeout(stateLockTimeout.current);
        }
        stateLockTimeout.current = setTimeout(() => {
          isStateLocked.current = false;
          console.log('🔓 State unlocked - API responses will be accepted again');
          stateLockTimeout.current = null;
        }, COOLDOWN_MS);

        const workingHrs = responseData.WorkingHours || responseData.data?.WorkingHours || getDisplayWorkingHours();
        const isEarly = responseData.IsEarly || responseData.data?.IsEarly;
        const earlyByMins = responseData.EarlyByMinutes || responseData.data?.EarlyByMinutes || 'a few';
        const overtimeHrs = responseData.OvertimeHours || responseData.data?.OvertimeHours;
        
        if (isEarly) {
          showNotification(
            'warning',
            'Early Check-Out',
            `Left ${earlyByMins} min early • Worked ${workingHrs}`
          );
        } else {
          showNotification(
            'success',
            'Checked Out Successfully',
            `Great work today! Total: ${workingHrs}${overtimeHrs ? ` (+${overtimeHrs} OT)` : ''} ✨`
          );
        }

        Animated.timing(colorAnim, { toValue: 2, duration: 800, useNativeDriver: false }).start();

        // Update status immediately from server (force refresh to bypass cooldown)
        await fetchPunchStatus(false, true, true);
        
        // Trigger parent refresh to update all components on the home screen
        onRefreshRequest?.();
        
        return true;

      } else if (currentPunchType === 2) {
        // State 2: Already checked out, can only reset to 0 (handled by midnight reset or new day)
        console.log('⚠️ Current state: 2 (Checked-Out) → No manual transition allowed');
        showNotification(
          'info',
          'Already Checked Out',
          'You have already checked out for today. See you tomorrow! 👋'
        );
        return false;

      } else {
        // Invalid state
        console.error('❌ Invalid punch state:', currentPunchType);
        showNotification(
          'error',
          'Invalid State',
          'Please refresh and try again'
        );
        return false;
      }

    } catch (error: unknown) {
      console.error('❌ Punch error:', error);
      
      let errorMessage = 'Something went wrong';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showNotification(
        'error',
        punchTypeRef.current === 3 ? 'Check-In Failed' : 'Check-Out Failed',
        errorMessage
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
      onStartShouldSetPanResponder: () => {
        console.log('👆 PanResponder START - refs:', {
          isCheckedIn: isCheckedInRef.current,
          hasCheckedOut: hasCheckedOutRef.current,
          isPunching: isPunchingRef.current,
          isLoading: isLoadingRef.current,
        });
        return !hasCheckedOutRef.current && !isPunchingRef.current && !isLoadingRef.current;
      },
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        const shouldSet = !hasCheckedOutRef.current && !isPunchingRef.current && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10;
        console.log('👆 PanResponder MOVE_SHOULD_SET:', { shouldSet, dx: g.dx, dy: g.dy });
        return shouldSet;
      },
      onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (hasCheckedOutRef.current || isPunchingRef.current) return;
        if (!isCheckedInRef.current && g.dx >= 0) pan.setValue(Math.min(g.dx, MAX_SWIPE_DISTANCE));
        else if (isCheckedInRef.current && g.dx <= 0) pan.setValue(Math.max(MAX_SWIPE_DISTANCE + g.dx, 0));
      },
      onPanResponderRelease: async (_: GestureResponderEvent, g: PanResponderGestureState) => {
        console.log('👆 PanResponder RELEASE:', {
          dx: g.dx,
          SWIPE_THRESHOLD,
          isCheckedIn: isCheckedInRef.current,
          hasCheckedOut: hasCheckedOutRef.current,
          isPunching: isPunchingRef.current,
          checkInCondition: !isCheckedInRef.current && g.dx > SWIPE_THRESHOLD,
          checkOutCondition: isCheckedInRef.current && g.dx < -SWIPE_THRESHOLD,
        });
        
        if (hasCheckedOutRef.current || isPunchingRef.current) {
          console.log('⛔ Blocked - already checked out or punching');
          return;
        }

        if (!isCheckedInRef.current && g.dx > SWIPE_THRESHOLD) {
          console.log('✅ Triggering CHECK-IN');
          Animated.spring(pan, { toValue: MAX_SWIPE_DISTANCE, useNativeDriver: false, friction: 8, tension: 40 }).start();
          const success = await handlePunch();
          if (!success) resetToStart();
        } else if (isCheckedInRef.current && g.dx < -SWIPE_THRESHOLD) {
          console.log('✅ Triggering CHECK-OUT');
          Animated.spring(pan, { toValue: 0, useNativeDriver: false, friction: 8, tension: 40 }).start();
          const success = await handlePunch();
          if (!success) resetToCheckedIn();
        } else {
          console.log('↩️ Resetting - threshold not met');
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
    if (hasCheckedOut) {
      // Show check-out time and date
      if (punchOutDate) {
        const date = punchOutDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        });
        const time = formatTime(punchOutDate);
        return `Checked Out • ${date} at ${time} ✓`;
      }
      return 'Checked Out for Today ✓';
    }
    if (isCheckedIn) {
      // Show check-in time and date with swipe instruction
      if (punchInDate) {
        const date = punchInDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        });
        const time = formatTime(punchInDate);
        return `In: ${date} at ${time} ← Swipe to Out`;
      }
      return '← Swipe Left to Check-Out';
    }
    return 'Swipe Right to Check-In →';
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
    // Priority 1: Use workingMinutes if available from API
    if (workingMinutes > 0) return formatMinutesToHours(workingMinutes);
    
    // Priority 2: Calculate from punchInDate (must exist and be valid)
    if (!punchInDate || !(punchInDate instanceof Date) || isNaN(punchInDate.getTime())) {
      return '--:--';
    }

    const end = punchOutDate || new Date();
    const diffMs = end.getTime() - punchInDate.getTime();
    
    // Guard against negative or invalid durations
    if (diffMs <= 0) return '--:--';
    
    let mins = Math.floor(diffMs / (1000 * 60));

    // Subtract break time if applicable (1PM-2PM)
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

  // ============ MANUAL REFRESH HANDLER ============
  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing || isPunchingRef.current) return;
    
    setIsRefreshing(true);
    
    // Animate the refresh icon
    Animated.loop(
      Animated.timing(refreshRotation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      { iterations: 2 }
    ).start();

    try {
      // Use forceRefresh=true to bypass cooldown and state lock protections
      await fetchPunchStatus(false, true, true);
      showNotification('success', 'Refreshed', 'Data updated successfully');
    } catch (error) {
      showNotification('error', 'Refresh Failed', 'Please try again');
    } finally {
      setIsRefreshing(false);
      refreshRotation.setValue(0);
    }
    
    // Also trigger parent refresh if callback provided
    onRefreshRequest?.();
  }, [isRefreshing, fetchPunchStatus, refreshRotation, showNotification, onRefreshRequest]);

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
              {/* Check-In Box - Emerald/Green gradient */}
              <View style={[
                styles.timeBox,
                { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#065F46' : '#A7F3D0', borderWidth: 1 }
              ]}>
                <Text style={[styles.timeLabel, { color: isDark ? '#6EE7B7' : '#6B7280' }]}>Check-In</Text>
                <Text style={[styles.timeValue, { color: isDark ? '#34D399' : '#10B981' }]}>
                  {formatTime(punchInDate)}
                </Text>
              </View>

              {/* Working Box - Blue/Indigo gradient */}
              <View style={[
                styles.timeBox,
                { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderColor: isDark ? '#312E81' : '#C7D2FE', borderWidth: 1 }
              ]}>
                <Text style={[styles.timeLabel, { color: isDark ? '#A5B4FC' : '#6B7280' }]}>Working</Text>
                <Text style={[styles.timeValue, { color: isDark ? '#818CF8' : '#3B82F6' }]}>
                  {getDisplayWorkingHours()}
                </Text>
              </View>

              {/* Check-Out Box - Gray gradient */}
              <View style={[
                styles.timeBox,
                { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#E5E7EB', borderWidth: 1 }
              ]}>
                <Text style={[styles.timeLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Check-Out</Text>
                <Text style={[styles.timeValue, { color: hasCheckedOut ? (isDark ? '#D1D5DB' : '#374151') : (isDark ? '#6B7280' : '#9CA3AF') }]}>
                  {formatTime(punchOutDate)}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  refreshButton: { padding: 8, borderRadius: 8 },
  lastUpdatedWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  swipeTrack: { width: '100%', height: 70, borderRadius: 35, position: 'relative', justifyContent: 'center', overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' },
  progressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 35 },
  swipeTextWrapper: { position: 'absolute', width: '100%', paddingHorizontal: 80, alignItems: 'center' },
  swipeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
  swipeButton: { position: 'absolute', left: 4, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  swipeButtonText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  timeSection: { paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, paddingTop: 20 },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeBox: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, gap: 6 },
  timeLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  timeValue: { fontSize: 14, fontWeight: '800' },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginBottom: 20, padding: 14, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  warningIconWrapper: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  warningText: { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 18 },
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