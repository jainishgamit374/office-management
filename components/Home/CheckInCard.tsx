import { useTheme } from '@/contexts/ThemeContext';
import { getCurrentLocation, getPunchStatus, hasLocationPermission, recordPunch, requestLocationPermission } from '@/lib/attendance';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, PanResponder, Platform, StyleSheet, Text, UIManager, View } from 'react-native';

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
  const pan = useRef(new Animated.Value(0)).current;

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
      console.log('📊 Loading punch status from API...');
      const response = await getPunchStatus();
      console.log('📊 API Punch status:', response);

      // PunchType: 0 = Not In/Out, 1 = IN, 2 = OUT
      if (response.data.PunchType === 1) {
        // User is currently punched IN
        console.log('✅ User is punched IN');
        setIsCheckedIn(true);
        setHasEverCheckedIn(true);
        setHasCheckedOut(false);
        // Animate to checked-in position
        pan.setValue(SCREEN_WIDTH - 115);
      } else if (response.data.PunchType === 2) {
        // User has punched OUT for the day
        console.log('✅ User is punched OUT');
        setIsCheckedIn(false);
        setHasCheckedOut(true);
        setHasEverCheckedIn(true);
        pan.setValue(0);
      } else {
        // Not punched in yet (PunchType === 0)
        console.log('✅ User not punched in yet');
        setIsCheckedIn(false);
        setHasCheckedOut(false);
        setHasEverCheckedIn(false);
        pan.setValue(0);
      }
    } catch (error) {
      console.error('❌ Failed to load punch status:', error);
      // Continue with default state if loading fails
      setIsCheckedIn(false);
      setHasCheckedOut(false);
      setHasEverCheckedIn(false);
      pan.setValue(0);
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
      await recordPunch('IN', false, true);
      // Success log is already in recordPunch function

      Alert.alert(
        'Checked In Successfully! ✅',
        'Your attendance has been recorded.',
        [{ text: 'OK' }]
      );

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

      // Save punch OUT locally
      console.log('� Saving Punch OUT locally...');
      await recordPunch('OUT', false, true);
      console.log('✅ Punch OUT recorded via API successfully');

      Alert.alert(
        'Checked Out Successfully! 🏁',
        'Your attendance has been recorded.',
        [{ text: 'OK' }]
      );

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

  // Function to get button background color
  const getButtonColor = () => {
    if (hasCheckedOut) {
      return '#999'; // Gray when disabled
    }
    if (isCheckedIn) {
      return '#ffe23dff'; // Yellow when checked in
    }
    return '#1472d6ff'; // Blue when not checked in
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

      {/* Status indicator when checked out */}
      {hasCheckedOut && (
        <View style={[styles.checkedOutStatus, { backgroundColor: theme === 'dark' ? '#1B3A2A' : '#e8f5e9' }]}>
          <Feather name="check-circle" size={24} color="#12df34ff" />
          <Text style={[styles.checkedOutText, { color: theme === 'dark' ? '#66BB6A' : '#2e7d32' }]}>You have completed your check-in/check-out for today</Text>
        </View>
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
});

export default CheckInCard;