import { useTheme } from '@/contexts/ThemeContext';
import { getCurrentLocation, getPunchStatus, hasLocationPermission, isEarlyCheckOut, isLateCheckIn, recordPunch, requestLocationPermission } from '@/lib/attendance';
import { saveAttendanceRecord } from '@/lib/attendanceStorage';
import { formatWorkingHours } from '@/lib/dateUtils';
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
    UIManager,
    View,
    type GestureResponderEvent,
    type PanResponderGestureState,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = 20; // swipeContainer padding
const SECTION_PADDING = 16; // swipeSection padding
const TRACK_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2) - (SECTION_PADDING * 2);
const BUTTON_SIZE = 64;
const BUTTON_MARGIN = 3; // left margin in arrowContainer
const MAX_SWIPE_DISTANCE = TRACK_WIDTH - BUTTON_SIZE - (BUTTON_MARGIN * 2);
const SWIPE_THRESHOLD = MAX_SWIPE_DISTANCE * 0.6;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CheckInCardProps {
  onCheckInChange?: (isCheckedIn: boolean, hasCheckedOut: boolean) => void;
  onLateEarlyCountChange?: (lateCount: number, earlyCount: number) => void;
}

const CheckInCard: React.FC<CheckInCardProps> = ({ onCheckInChange, onLateEarlyCountChange }) => {
  const { colors, theme } = useTheme();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [hasEverCheckedIn, setHasEverCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState<string | null>(null);
  const [expectedCheckout, setExpectedCheckout] = useState<string | null>(null);
  const [overtimeHours, setOvertimeHours] = useState<string | null>(null);
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [punchInLocation, setPunchInLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [punchOutLocation, setPunchOutLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [lateCheckInCount, setLateCheckInCount] = useState<number>(0);
  const [earlyCheckOutCount, setEarlyCheckOutCount] = useState<number>(0);
  const [elapsedHours, setElapsedHours] = useState<number>(0);
  const [currentHourProgress, setCurrentHourProgress] = useState<number>(0);
  const pan = useRef(new Animated.Value(0)).current;

  // Animated color value for smooth transitions
  const colorAnim = useRef(new Animated.Value(0)).current;
  
  // Progress animation for track (0 to 1 over 9 hours)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Track current check-in state for pan responder
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);
  const isPunchingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    isCheckedInRef.current = isCheckedIn;
  }, [isCheckedIn]);

  useEffect(() => {
    hasCheckedOutRef.current = hasCheckedOut;
  }, [hasCheckedOut]);

  useEffect(() => {
    onCheckInChange?.(isCheckedIn, hasCheckedOut);
  }, [isCheckedIn, hasCheckedOut, onCheckInChange]);

  // Load punch status function
  const loadPunchStatus = useCallback(async () => {
    try {
      const forceReset = await AsyncStorage.getItem('forceResetMode');
      if (forceReset === 'true') {
        await AsyncStorage.removeItem('forceResetMode');
        setIsCheckedIn(false);
        setHasCheckedOut(false);
        setHasEverCheckedIn(false);
        setPunchInTime(null);
        setPunchOutTime(null);
        setWorkingHours(null);
        pan.setValue(0);
        colorAnim.setValue(0);
        return;
      }

      const response = await getPunchStatus();
      const punchData = response.data?.punch;
      const punchType = punchData?.PunchType;
      const punchDateTime = punchData?.PunchDateTime;

      // Load late/early counts from API response
      if (response.data?.lateEarly) {
        setLateCheckInCount(response.data.lateEarly.lateCheckins || 0);
        setEarlyCheckOutCount(response.data.lateEarly.earlyCheckouts || 0);
        onLateEarlyCountChange?.(
          response.data.lateEarly.lateCheckins || 0,
          response.data.lateEarly.earlyCheckouts || 0
        );
      }

      if (punchType === 1) {
        setIsCheckedIn(true);
        setHasEverCheckedIn(true);
        setHasCheckedOut(false);
        if (punchDateTime) setPunchInTime(punchDateTime);
        if (punchData?.WorkingHours) setWorkingHours(punchData.WorkingHours);
        if (punchData?.ExpectedCheckout) setExpectedCheckout(punchData.ExpectedCheckout);
        if (punchData?.OvertimeHours) setOvertimeHours(punchData.OvertimeHours);
        pan.setValue(MAX_SWIPE_DISTANCE);
        Animated.timing(colorAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
      } else if (punchType === 2) {
        setIsCheckedIn(false);
        setHasCheckedOut(true);
        setHasEverCheckedIn(true);
        if (punchDateTime) setPunchOutTime(punchDateTime);
        if (punchData?.WorkingHours) setWorkingHours(punchData.WorkingHours);
        if (punchData?.OvertimeHours) setOvertimeHours(punchData.OvertimeHours);
        pan.setValue(0);
        Animated.timing(colorAnim, { toValue: 2, duration: 800, useNativeDriver: false }).start();
      } else {
        setIsCheckedIn(false);
        setHasCheckedOut(false);
        setHasEverCheckedIn(false);
        setPunchInTime(null);
        setPunchOutTime(null);
        setWorkingHours(null);
        pan.setValue(0);
        colorAnim.setValue(0);
      }
    } catch (error) {
      console.error('❌ Failed to load punch status:', error);
      setIsCheckedIn(false);
      setHasCheckedOut(false);
      setHasEverCheckedIn(false);
      pan.setValue(0);
      colorAnim.setValue(0);
    }
  }, [pan, colorAnim, onLateEarlyCountChange]);

  // Load initial punch status on mount
  useEffect(() => {
    loadPunchStatus();
  }, [loadPunchStatus]);

  // Reload status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPunchStatus();
    }, [loadPunchStatus])
  );

  // Auto-reset at midnight
  useEffect(() => {
    const checkAndResetAtMidnight = () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];

      AsyncStorage.getItem('lastResetDate').then((lastResetDate) => {
        if (lastResetDate !== currentDate) {
          console.log('🌅 New day detected! Resetting check-in/out state...');

          setIsCheckedIn(false);
          setHasCheckedOut(false);
          setHasEverCheckedIn(false);
          setPunchInTime(null);
          setPunchOutTime(null);
          setWorkingHours(null);
          setExpectedCheckout(null);
          setOvertimeHours(null);
          setTasksCompleted(0);
          pan.setValue(0);
          colorAnim.setValue(0);

          AsyncStorage.setItem('lastResetDate', currentDate);
          console.log('✅ State reset complete for new day:', currentDate);
        }
      });
    };

    const getMillisecondsUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    };

    checkAndResetAtMidnight();

    const intervalId = setInterval(checkAndResetAtMidnight, 60000);

    const msUntilMidnight = getMillisecondsUntilMidnight();
    const midnightTimeout = setTimeout(() => {
      checkAndResetAtMidnight();
      const dailyInterval = setInterval(checkAndResetAtMidnight, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => {
      clearInterval(intervalId);
      clearTimeout(midnightTimeout);
    };
  }, [pan, colorAnim]);

  // Real-time working hours progress tracker
  useEffect(() => {
    const updateWorkingProgress = () => {
      if (!isCheckedIn || !punchInTime || hasCheckedOut) {
        setElapsedHours(0);
        setCurrentHourProgress(0);
        return;
      }

      const now = new Date();
      
      const workStart = new Date(now);
      workStart.setHours(9, 30, 0, 0);
      
      const workEnd = new Date(now);
      workEnd.setHours(18, 30, 0, 0);

      const msSinceWorkStart = now.getTime() - workStart.getTime();
      const minutesSinceWorkStart = msSinceWorkStart / (1000 * 60);
      const hoursSinceWorkStart = minutesSinceWorkStart / 60;

      if (hoursSinceWorkStart < 0) {
        setElapsedHours(0);
        setCurrentHourProgress(0);
        return;
      }

      if (hoursSinceWorkStart >= 9) {
        setElapsedHours(9);
        setCurrentHourProgress(0);
        return;
      }

      const completedHours = Math.floor(hoursSinceWorkStart);
      setElapsedHours(completedHours);

      const currentHourMinutes = minutesSinceWorkStart % 60;
      const progress = currentHourMinutes / 60;
      setCurrentHourProgress(progress);
      
      // Update progress animation (0 to 1 over 9 hours)
      const totalProgress = Math.min(hoursSinceWorkStart / 9, 1);
      Animated.timing(progressAnim, {
        toValue: totalProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    };

    updateWorkingProgress();

    const interval = setInterval(updateWorkingProgress, 60000);

    return () => clearInterval(interval);
  }, [isCheckedIn, punchInTime, hasCheckedOut]);

  // Lunch break alert at 1:00 PM
  useEffect(() => {
    const checkLunchTime = async () => {
      if (!isCheckedIn || hasCheckedOut) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (currentHour === 13 && currentMinute === 0) {
        const today = now.toISOString().split('T')[0];
        const lastLunchAlert = await AsyncStorage.getItem('lastLunchAlert');

        if (lastLunchAlert !== today) {
          Alert.alert(
            '🍽️ Lunch Break Time!',
            'It\'s 1:00 PM - Time for your lunch break!\n\nRemember to take a proper break and recharge.',
            [{ text: 'Thanks!' }]
          );
          await AsyncStorage.setItem('lastLunchAlert', today);
        }
      }
    };

    checkLunchTime();

    const interval = setInterval(checkLunchTime, 60000);

    return () => clearInterval(interval);
  }, [isCheckedIn, hasCheckedOut]);

  // Function to handle punch in API call
  const handlePunchIn = async (): Promise<boolean> => {
    try {
      if (isPunchingRef.current) {
        console.log('⚠️ Punch IN already in progress, skipping duplicate call');
        return false;
      }

      isPunchingRef.current = true;
      setIsLoading(true);

      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to check in.',
            [{ text: 'OK' }]
          );
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
          }).start();
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) {
        throw new Error('Unable to get location. Please enable location services.');
      }

      const now = new Date();
      const isLate = isLateCheckIn(now);

      if (isLate && lateCheckInCount >= 5) {
        Alert.alert(
          'Late Check-In Limit Reached',
          'You have reached the maximum limit of 5 late check-ins for this month. Please check in on time.',
          [{ text: 'OK' }]
        );
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();
        return false;
      }

      console.log('📝 Recording Punch IN via API...');
      const punchResponse = await recordPunch('IN', false, true);

      setPunchInLocation({ latitude: location.latitude, longitude: location.longitude });

      const timestamp = now.toISOString();
      const dateStr = now.toISOString().split('T')[0];
      setPunchInTime(timestamp);

      try {
        await saveAttendanceRecord(dateStr, 'IN', timestamp, location);
        console.log('✅ Punch IN saved to local storage');
      } catch (storageError) {
        console.error('⚠️ Failed to save punch IN locally:', storageError);
      }

      // Backend handles late check-in counting
      // The count will be updated when HomeScreen refreshes from API

      if (punchResponse.data?.IsLate && punchResponse.data?.LateByMinutes > 0) {
        Alert.alert(
          'Checked In (Late) ⚠️',
          `You are ${punchResponse.data.LateByMinutes} minute${punchResponse.data.LateByMinutes > 1 ? 's' : ''} late.\n\nYour late check-in has been recorded.`,
          [{ text: 'OK' }]
        );
      } else if (isLate) {
        Alert.alert(
          'Checked In (Late) ⚠️',
          `You checked in after 9:30 AM.\n\nYour late check-in has been recorded.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Checked In Successfully! ✅',
          'Your attendance has been recorded.',
          [{ text: 'OK' }]
        );
      }

      Animated.timing(colorAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
      return true;
    } catch (error: unknown) {
      console.error('❌ Punch IN error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unable to check in. Please try again.';
      console.error('Showing error message:', errorMessage);

      Alert.alert(
        'Check-In Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();

      return false;
    } finally {
      isPunchingRef.current = false;
      setIsLoading(false);
    }
  };

  // Function to handle punch out API call
  const handlePunchOut = async (): Promise<boolean> => {
    try {
      if (isPunchingRef.current) {
        console.log('⚠️ Punch OUT already in progress, skipping duplicate call');
        return false;
      }

      isPunchingRef.current = true;
      setIsLoading(true);

      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to check out.',
            [{ text: 'OK' }]
          );
          Animated.spring(pan, {
            toValue: MAX_SWIPE_DISTANCE,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
          }).start();
          return false;
        }
      }

      const location = await getCurrentLocation();
      if (!location) {
        throw new Error('Unable to get location. Please enable location services.');
      }

      const now = new Date();
      const isEarly = isEarlyCheckOut(now);

      if (isEarly && earlyCheckOutCount >= 5) {
        Alert.alert(
          'Early Check-Out Limit Reached',
          'You have reached the maximum limit of 5 early check-outs for this month. Please check out after 6:30 PM.',
          [{ text: 'OK' }]
        );
        Animated.spring(pan, {
          toValue: MAX_SWIPE_DISTANCE,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();
        return false;
      }

      console.log('💾 Recording Punch OUT via API...');
      const punchResponse = await recordPunch('OUT', false, true);
      console.log('✅ Punch OUT recorded via API successfully');

      setPunchOutLocation({ latitude: location.latitude, longitude: location.longitude });

      const timestamp = now.toISOString();
      const dateStr = now.toISOString().split('T')[0];
      setPunchOutTime(timestamp);

      try {
        await saveAttendanceRecord(dateStr, 'OUT', timestamp, location);
        console.log('✅ Punch OUT saved to local storage');
      } catch (storageError) {
        console.error('⚠️ Failed to save punch OUT locally:', storageError);
      }

      if (punchResponse.data?.WorkingHours) {
        setWorkingHours(punchResponse.data.WorkingHours);
      }
      if (punchResponse.data?.OvertimeHours) {
        setOvertimeHours(punchResponse.data.OvertimeHours);
      }

      // Backend handles early check-out counting
      // The count will be updated when HomeScreen refreshes from API

      if (punchResponse.data?.IsEarly && punchResponse.data?.EarlyByMinutes > 0) {
        Alert.alert(
          'Checked Out (Early) ⚠️',
          `You are leaving ${punchResponse.data.EarlyByMinutes} minute${punchResponse.data.EarlyByMinutes > 1 ? 's' : ''} early.\n\nYour early check-out has been recorded.`,
          [{ text: 'OK' }]
        );
      } else if (isEarly) {
        Alert.alert(
          'Checked Out (Early) ⚠️',
          `You checked out before 6:30 PM.\n\nYour early check-out has been recorded.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Checked Out Successfully! 🏁',
          'Your attendance has been recorded.',
          [{ text: 'OK' }]
        );
      }

      Animated.timing(colorAnim, { toValue: 2, duration: 800, useNativeDriver: false }).start();
      return true;
    } catch (error: unknown) {
      console.error('❌ Punch OUT error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unable to check out. Please try again.';
      
      Alert.alert(
        'Check-Out Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      Animated.spring(pan, {
        toValue: MAX_SWIPE_DISTANCE,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();

      return false;
    } finally {
      isPunchingRef.current = false;
      setIsLoading(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return !hasCheckedOutRef.current;
      },
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (hasCheckedOutRef.current) return false;
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (hasCheckedOutRef.current) return;

        if (!isCheckedInRef.current && gestureState.dx >= 0) {
          const maxSwipe = MAX_SWIPE_DISTANCE;
          pan.setValue(Math.min(gestureState.dx, maxSwipe));
        } else if (isCheckedInRef.current && gestureState.dx <= 0) {
          const newValue = MAX_SWIPE_DISTANCE + gestureState.dx;
          pan.setValue(Math.max(newValue, 0));
        }
      },
      onPanResponderRelease: async (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (hasCheckedOutRef.current || isPunchingRef.current) {
          console.log('⚠️ Pan responder blocked:', {
            hasCheckedOut: hasCheckedOutRef.current,
            isPunching: isPunchingRef.current
          });
          return;
        }

        if (!isCheckedInRef.current) {
          if (gestureState.dx > SWIPE_THRESHOLD) {
            Animated.spring(pan, {
              toValue: MAX_SWIPE_DISTANCE,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(async () => {
              const success = await handlePunchIn();
              if (success) {
                setIsCheckedIn(true);
                setHasEverCheckedIn(true);
              }
            });
          } else {
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start();
          }
        } else {
          // Check-out - allow at any time
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Allow checkout at any time - no minimum hours required
            // Text and colors are just for visual feedback
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(async () => {
              const success = await handlePunchOut();
              if (success) {
                setIsCheckedIn(false);
                setHasCheckedOut(true);
              }
            });
          } else {
            Animated.spring(pan, {
              toValue: MAX_SWIPE_DISTANCE,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start();
          }
        }
      },
    })
  ).current;

  const getSwipeText = (): string => {
    if (hasCheckedOut) {
      return 'Already Checked Out for Today';
    }
    if (isCheckedIn) {
      // Calculate worked hours
      if (punchInTime) {
        const now = new Date();
        const punchIn = new Date(punchInTime);
        
        // Calculate actual worked time from punch-in
        const workedMinutes = (now.getTime() - punchIn.getTime()) / (1000 * 60);
        const workedHours = workedMinutes / 60;
        
        if (workedHours < 4.5) {
          // Calculate remaining time for half-day
          const remainingMinutes = Math.ceil((4.5 - workedHours) * 60);
          const hours = Math.floor(remainingMinutes / 60);
          const minutes = remainingMinutes % 60;
          
          if (hours > 0 && minutes > 0) {
            return `Work ${hours}h ${minutes}m More to Check-Out`;
          } else if (hours > 0) {
            return `Work ${hours}h More to Check-Out`;
          } else {
            return `Work ${minutes}m More to Check-Out`;
          }
        } else if (workedHours < 9) {
          // Calculate remaining time for full-day
          const remainingMinutes = Math.ceil((9 - workedHours) * 60);
          const hours = Math.floor(remainingMinutes / 60);
          const minutes = remainingMinutes % 60;
          
          if (hours > 0 && minutes > 0) {
            return `Half-Day Ready • ${hours}h ${minutes}m to Full-Day`;
          } else if (hours > 0) {
            return `Half-Day Ready • ${hours}h to Full-Day`;
          } else {
            return `Half-Day Ready • ${minutes}m to Full-Day`;
          }
        } else {
          // 9+ hours completed - show completion message
          return '🎉 Full Day Complete! Swipe Left to Check-Out';
        }
      }
      return 'Swipe Left to Check-Out';
    }
    return 'Swipe Right to Check-In';
  };

  const getButtonColor = () => {
    if (isCheckedIn && !hasCheckedOut) {
      // When checked in, use progress-based color (red → yellow → green)
      return progressAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['#EF4444', '#F59E0B', '#10B981'],
      });
    }
    
    // Default colors for other states
    return colorAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['#1472d6ff', '#EF4444', '#999999'],
    });
  };
  
  const getProgressBarColor = () => {
    return progressAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['rgba(239, 68, 68, 0.15)', 'rgba(245, 158, 11, 0.15)', 'rgba(16, 185, 129, 0.15)'],
    });
  };
  
  const getTextColor = () => {
    if (isCheckedIn && !hasCheckedOut) {
      // Change text color based on progress (darker colors for better contrast)
      return progressAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['#DC2626', '#D97706', '#059669'],
      });
    }
    return '#6366F1'; // Default indigo color
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={[
        styles.swipebody,
        hasCheckedOut && styles.swipebodyDisabled
      ]}>
        {/* Swipe Button Section */}
        <View style={styles.swipeSection}>
          <View style={styles.swipeTrack}>
            {/* Progress Bar Background */}
            {isCheckedIn && !hasCheckedOut && (
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getProgressBarColor(),
                  },
                ]}
              />
            )}
            
            {/* Background text */}
            <View style={styles.swipeTextContainer} pointerEvents="none">
              <Animated.Text style={[
                styles.swipeText,
                hasCheckedOut && styles.swipeTextDisabled,
                isCheckedIn && !hasCheckedOut && { color: getTextColor() }
              ]}>
                {getSwipeText()}
              </Animated.Text>
            </View>

            {/* Swipeable button */}
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [{ translateX: pan }],
                  backgroundColor: getButtonColor(),
                  opacity: hasCheckedOut ? 0.6 : 1,
                },
              ]}
              {...(hasCheckedOut ? {} : panResponder.panHandlers)}
            >
              {isLoading ? (
                <ActivityIndicator color={isCheckedIn ? '#000' : '#fff'} size="small" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: hasCheckedOut ? '#fff' : isCheckedIn ? '#ffffff' : '#ffffff',
                    }
                  ]}
                >
                  {hasCheckedOut ? '✓' : isCheckedIn ? 'OUT' : 'IN'}
                </Text>
              )}
            </Animated.View>
          </View>

          {/* Time Info Boxes - Show when checked in or checked out */}
          {(isCheckedIn || hasCheckedOut) && (
            <View style={styles.timeInfoSection}>
              <View style={styles.topRow}>
                {/* Check-in */}
                <View style={[styles.timeBox, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check-In</Text>
                  <Text style={[styles.timeValue, { color: '#4CAF50' }]}>
                    {punchInTime
                      ? new Date(punchInTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                      : '--'}
                  </Text>
                </View>

                {/* Working Hours */}
                <View style={[styles.timeBox, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Working Hours</Text>
                  <Text style={[styles.timeValue, { color: '#2196F3' }]}>
                    {formatWorkingHours(punchInTime, punchOutTime)}
                  </Text>
                </View>

                {/* Check-out */}
                <View style={[styles.timeBox, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Check-Out</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {punchOutTime
                      ? new Date(punchOutTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                      : '--'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Hour Pillars Section - Separate from swipe */}
        {isCheckedIn && !hasCheckedOut && (
          <View style={styles.pillarsSection}>
            <View style={styles.pillarsRow}>
              {Array.from({ length: 9 }).map((_, index) => {
                const isFilled = index < elapsedHours;
                const isCurrentHour = index === elapsedHours;
                const fillPercentage = isCurrentHour ? currentHourProgress : (isFilled ? 1 : 0);

                return (
                  <View key={index} style={styles.pillarWrapper}>
                    <View style={styles.pillarContainer}>
                      <View style={styles.pillarBackground}>
                        <Animated.View
                          style={[
                            styles.pillarFill,
                            {
                              height: `${fillPercentage * 100}%`,
                              backgroundColor: isFilled || isCurrentHour
                                ? (index < 3 ? '#2196F3' : index < 6 ? '#00BCD4' : '#4CAF50')
                                : 'transparent',
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.pillarLabel}>{index + 1}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.pillarsStatus}>
              {elapsedHours === 0 && currentHourProgress < 0.1
                ? '9:30 AM - 6:30 PM (9 hours)'
                : elapsedHours >= 9
                ? '🎉 Full workday completed!'
                : `Hour ${elapsedHours + 1}/9 • ${9 - elapsedHours}h remaining`
              }
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  swipebody: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  swipebodyDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.9,
  },
  swipeSection: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  swipeTrack: {
    width: '100%',
    height: 70,
    backgroundColor: '#F8F9FE',
    borderRadius: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 40,
  },
  swipeTextContainer: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',

  },
  swipeText: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    width: '100%',
  },
  swipeTextDisabled: {
    color: '#9CA3AF',
  },
  arrowContainer: {
    position: 'absolute',
    left: 3,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timeInfoSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pillarsSection: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 12,
  },
  pillarWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pillarContainer: {
    width: '100%',
    height: 50,
    justifyContent: 'flex-end',
  },
  pillarBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  pillarFill: {
    width: '100%',
    borderRadius: 6,
  },
  pillarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1',
    opacity: 0.7,
  },
  pillarsStatus: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#6366F1',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  checkoutSummary: {
    marginTop: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryContent: {
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 4,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    opacity: 0.6,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default CheckInCard;