import { useTheme } from '@/contexts/ThemeContext';
import { getCurrentLocation, getPunchStatus, hasLocationPermission, recordPunch, requestLocationPermission } from '@/lib/attendance';
import { saveAttendanceRecord } from '@/lib/attendanceStorage';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, PanResponder, Platform, StyleSheet, Text, UIManager, View } from 'react-native';
import Checkoutdets from './Checkoutdets';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of container width for easier swiping

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CheckInCardProps {
  onCheckInChange?: (isCheckedIn: boolean, hasCheckedOut: boolean) => void;
}

const CheckInCard: React.FC<CheckInCardProps> = ({ onCheckInChange }) => {
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
  const pan = useRef(new Animated.Value(0)).current;

  // Animated color value for smooth transitions
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Track current check-in state for pan responder
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);
  const isPunchingRef = useRef(false); // Prevent duplicate API calls

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

      if (punchType === 1) {
        setIsCheckedIn(true);
        setHasEverCheckedIn(true);
        setHasCheckedOut(false);
        if (punchDateTime) setPunchInTime(punchDateTime);
        if (punchData?.WorkingHours) setWorkingHours(punchData.WorkingHours);
        if (punchData?.ExpectedCheckout) setExpectedCheckout(punchData.ExpectedCheckout);
        if (punchData?.OvertimeHours) setOvertimeHours(punchData.OvertimeHours);
        pan.setValue(SCREEN_WIDTH - 115);
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
  }, [pan]);

  // Load initial punch status on mount
  useEffect(() => {
    loadPunchStatus();
  }, [loadPunchStatus]);

  // Reload status when screen comes into focus (e.g., after reset)
  useFocusEffect(
    useCallback(() => {
      loadPunchStatus();
    }, [loadPunchStatus])
  );

  // Auto-reset at midnight (12 AM IST)
  useEffect(() => {
    const checkAndResetAtMidnight = () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];

      // Get the last reset date from AsyncStorage
      AsyncStorage.getItem('lastResetDate').then((lastResetDate) => {
        if (lastResetDate !== currentDate) {
          // It's a new day - reset everything
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

          // Update the last reset date
          AsyncStorage.setItem('lastResetDate', currentDate);
          console.log('✅ State reset complete for new day:', currentDate);
        }
      });
    };

    // Calculate milliseconds until next midnight
    const getMillisecondsUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    };

    // Check immediately on mount
    checkAndResetAtMidnight();

    // Set up interval to check every minute
    const intervalId = setInterval(checkAndResetAtMidnight, 60000); // Check every minute

    // Also set a timeout for exactly midnight
    const msUntilMidnight = getMillisecondsUntilMidnight();
    const midnightTimeout = setTimeout(() => {
      checkAndResetAtMidnight();
      // After midnight reset, set up daily interval
      const dailyInterval = setInterval(checkAndResetAtMidnight, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      clearTimeout(midnightTimeout);
    };
  }, [pan, colorAnim]);

  // Function to handle punch in API call
  const handlePunchIn = async () => {
    try {
      // Prevent duplicate calls
      if (isPunchingRef.current) {
        console.log('⚠️ Punch IN already in progress, skipping duplicate call');
        return false;
      }

      isPunchingRef.current = true;
      setIsLoading(true);

      // Check location permission
      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to check in.',
            [{ text: 'OK' }]
          );
          // Reset animation
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
          }).start();
          return false;
        }
      }

      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        throw new Error('Unable to get location. Please enable location services.');
      }

      // Record punch IN via API
      console.log('📝 Recording Punch IN via API...');
      const punchResponse = await recordPunch('IN', false, true);

      // Save to local storage
      const now = new Date();
      const timestamp = now.toISOString();
      const dateStr = now.toISOString().split('T')[0];
      setPunchInTime(timestamp);

      try {
        await saveAttendanceRecord(dateStr, 'IN', timestamp, location);
        console.log('✅ Punch IN saved to local storage');
      } catch (storageError) {
        console.error('⚠️ Failed to save punch IN locally:', storageError);
      }

      // Check if late
      if (punchResponse.data?.IsLate && punchResponse.data?.LateByMinutes > 0) {
        Alert.alert(
          'Checked In (Late) ⚠️',
          `You are ${punchResponse.data.LateByMinutes} minute${punchResponse.data.LateByMinutes > 1 ? 's' : ''} late.`,
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
    } catch (error: any) {
      console.error('❌ Punch IN error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      const errorMessage = error?.message || error?.toString() || 'Unable to check in. Please try again.';
      console.error('Showing error message:', errorMessage);

      Alert.alert(
        'Check-In Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      // Reset animation on error
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
  const handlePunchOut = async () => {
    try {
      // Prevent duplicate calls
      if (isPunchingRef.current) {
        console.log('⚠️ Punch OUT already in progress, skipping duplicate call');
        return false;
      }

      isPunchingRef.current = true;
      setIsLoading(true);

      // Check location permission
      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to check out.',
            [{ text: 'OK' }]
          );
          // Reset animation
          Animated.spring(pan, {
            toValue: SCREEN_WIDTH - 115,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
          }).start();
          return false;
        }
      }

      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        throw new Error('Unable to get location. Please enable location services.');
      }

      // Record punch OUT via API
      console.log('💾 Recording Punch OUT via API...');
      const punchResponse = await recordPunch('OUT', false, true);
      console.log('✅ Punch OUT recorded via API successfully');

      // Save to local storage
      const now = new Date();
      const timestamp = now.toISOString();
      const dateStr = now.toISOString().split('T')[0];
      setPunchOutTime(timestamp);

      try {
        await saveAttendanceRecord(dateStr, 'OUT', timestamp, location);
        console.log('✅ Punch OUT saved to local storage');
      } catch (storageError) {
        console.error('⚠️ Failed to save punch OUT locally:', storageError);
      }

      // Store working hours from response
      if (punchResponse.data?.WorkingHours) {
        setWorkingHours(punchResponse.data.WorkingHours);
      }
      if (punchResponse.data?.OvertimeHours) {
        setOvertimeHours(punchResponse.data.OvertimeHours);
      }

      // Check if early
      if (punchResponse.data?.IsEarly && punchResponse.data?.EarlyByMinutes > 0) {
        Alert.alert(
          'Checked Out (Early) ⚠️',
          `You are leaving ${punchResponse.data.EarlyByMinutes} minute${punchResponse.data.EarlyByMinutes > 1 ? 's' : ''} early.`,
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
    } catch (error: any) {
      console.error('❌ Punch OUT error:', error);
      Alert.alert(
        'Check-Out Failed',
        error.message || 'Unable to check out. Please try again.',
        [{ text: 'OK' }]
      );

      // Reset animation on error
      Animated.spring(pan, {
        toValue: SCREEN_WIDTH - 115,
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
        // Don't allow swipe if already checked out
        return !hasCheckedOutRef.current;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Don't allow swipe if already checked out
        if (hasCheckedOutRef.current) return false;

        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Don't allow any movement if checked out
        if (hasCheckedOutRef.current) return;

        if (!isCheckedInRef.current && gestureState.dx >= 0) {
          // Swiping right when not checked in
          const maxSwipe = SCREEN_WIDTH - 115;
          pan.setValue(Math.min(gestureState.dx, maxSwipe));
        } else if (isCheckedInRef.current && gestureState.dx <= 0) {
          // Swiping left when checked in
          const newValue = SCREEN_WIDTH - 115 + gestureState.dx;
          pan.setValue(Math.max(newValue, 0));
        }
      },
      onPanResponderRelease: async (_, gestureState) => {
        // Don't allow any action if checked out, loading, or already punching
        if (hasCheckedOutRef.current || isLoading || isPunchingRef.current) {
          console.log('⚠️ Pan responder blocked:', {
            hasCheckedOut: hasCheckedOutRef.current,
            isLoading,
            isPunching: isPunchingRef.current
          });
          return;
        }

        if (!isCheckedInRef.current) {
          // Check-in flow (swipe right)
          if (gestureState.dx > SWIPE_THRESHOLD) {
            // Swipe successful - animate to end position
            Animated.spring(pan, {
              toValue: SCREEN_WIDTH - 115,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(async () => {
              // Call API after animation
              const success = await handlePunchIn();
              if (success) {
                setIsCheckedIn(true);
                setHasEverCheckedIn(true);
              }
            });
          } else {
            // Swipe not far enough - reset
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start();
          }
        } else {
          // Check-out flow (swipe left)
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Swipe successful - animate to start position
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(async () => {
              // Call API after animation
              const success = await handlePunchOut();
              if (success) {
                setIsCheckedIn(false);
                setHasCheckedOut(true); // Disable all future swipes
              }
            });
          } else {
            // Swipe not far enough - reset to checked in position
            Animated.spring(pan, {
              toValue: SCREEN_WIDTH - 115,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start();
          }
        }
      },
    })
  ).current;

  // Function to get the swipe text
  const getSwipeText = () => {
    if (hasCheckedOut) {
      return 'Already Checked Out for Today';
    }
    if (isCheckedIn) {
      return 'Swipe Left to Check-Out';
    }
    return 'Swipe Right to Check-In';
  };

  // Function to get button background color with animation
  const getButtonColor = () => {
    return colorAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['#1472d6ff', '#ffe23dff', '#999'],
    });
  };

  // Function to get button icon
  const getButtonIcon = (): "arrow-right" | "arrow-left" | "check" => {
    if (hasCheckedOut) {
      return 'check'; // Check mark when completed
    }
    if (isCheckedIn) {
      return 'arrow-left';
    }
    return 'arrow-right';
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={[
        styles.swipebody,
        hasCheckedOut && styles.swipebodyDisabled
      ]}>
        {/* Background text */}
        <View style={styles.swipeTextContainer}>
          <Text style={[
            styles.swipeText,
            hasCheckedOut && styles.swipeTextDisabled
          ]}>
            {getSwipeText()}
          </Text>
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
            <Feather
              style={[
                styles.arrow,
                {
                  color: hasCheckedOut ? '#fff' : isCheckedIn ? '#000000ff' : '#ffff',
                }
              ]}
              name={getButtonIcon()}
              size={24}
            />
          )}
        </Animated.View>
      </View>

      {/* Checkout Summary - Using Checkoutdets Component */}
      {hasCheckedOut && (
        <Checkoutdets
          punchInTime={punchInTime}
          punchOutTime={punchOutTime}
          workingHours={workingHours}
          overtimeHours={overtimeHours}
          tasksCompleted={tasksCompleted}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  swipebody: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: "#bfbfbfff",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 50,
    position: 'relative',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  swipebodyDisabled: {
    backgroundColor: "#e0e0e0",
  },
  arrowContainer: {
    position: 'absolute',
    left: 5,
    backgroundColor: "Blue",
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#ffff',
  },
  swipeTextContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 14,
    color: '#ffff',
    marginTop: 5,
  },
  swipeTextDisabled: {
    color: '#888',
  },
  // Checked out status
  checkedOutStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    gap: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    // Shadow for Android
    elevation: 2,
  },
  checkedOutText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    flex: 1,
  },
  // Summary Card
  summaryCard: {
    marginTop: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryContent: {
    padding: 20,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryFooter: {
    padding: 16,
    alignItems: 'center',
  },
  summaryFooterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CheckInCard;