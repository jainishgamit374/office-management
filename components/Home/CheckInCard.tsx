import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Platform, StyleSheet, Text, UIManager, View } from 'react-native';

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
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [hasEverCheckedIn, setHasEverCheckedIn] = useState(false);
  const pan = useRef(new Animated.Value(0)).current;

  // Track current check-in state for pan responder
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);

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
      onPanResponderRelease: (_, gestureState) => {
        // Don't allow any action if checked out
        if (hasCheckedOutRef.current) return;

        if (!isCheckedInRef.current) {
          // Check-in flow (swipe right)
          if (gestureState.dx > SWIPE_THRESHOLD) {
            // Swipe successful - check in
            Animated.spring(pan, {
              toValue: SCREEN_WIDTH - 115,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(() => {
              setIsCheckedIn(true);
              setHasEverCheckedIn(true);
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
            // Swipe successful - check out and DISABLE further swiping
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(() => {
              setIsCheckedIn(false);
              setHasCheckedOut(true); // Disable all future swipes
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
        </Animated.View>
      </View>

      {/* Status indicator when checked out */}
      {hasCheckedOut && (
        <View style={styles.checkedOutStatus}>
          <Feather name="check-circle" size={24} color="#12df34ff" />
          <Text style={styles.checkedOutText}>You have completed your check-in/check-out for today</Text>
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