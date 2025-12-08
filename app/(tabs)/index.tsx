import Navbar from '@/components/Navigation/Navbar';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.5; // 50% of container width
const AUTO_RESET_TIME = 60000; // 1 minute in milliseconds

const index = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const checkOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userName = 'Jainish'
  const tasksToComplete = 4
  const totalTasks = 12
  const totalReminders = 3

  // Auto-reset after check-out
  useEffect(() => {
    // Clear any existing timers when component unmounts
    return () => {
      if (checkOutTimerRef.current) {
        clearTimeout(checkOutTimerRef.current);
      }
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isOnCooldown,
      onMoveShouldSetPanResponder: () => !isOnCooldown,
      onPanResponderMove: (_, gestureState) => {
        if (!isCheckedIn && !isOnCooldown && gestureState.dx >= 0) {
          // Swiping right when not checked in and not on cooldown
          pan.setValue(gestureState.dx);
        } else if (isCheckedIn && gestureState.dx <= 0) {
          // Swiping left when checked in
          pan.setValue(SCREEN_WIDTH - 115 + gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isCheckedIn) {
          // Check-in flow (swipe right)
          if (gestureState.dx > SWIPE_THRESHOLD) {
            // Swipe successful - check in
            // Clear any existing timer
            if (checkOutTimerRef.current) {
              clearTimeout(checkOutTimerRef.current);
              checkOutTimerRef.current = null;
            }

            Animated.spring(pan, {
              toValue: SCREEN_WIDTH - 115,
              useNativeDriver: false,
            }).start(() => {
              setIsCheckedIn(true);
            });
          } else {
            // Swipe not far enough - reset
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          }
        } else {
          // Check-out flow (swipe left)
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Swipe successful - check out
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
            }).start(() => {
              setIsCheckedIn(false);
              setIsOnCooldown(true);
              setCooldownSeconds(60); // 60 seconds = 1 minute

              // Countdown interval
              let secondsLeft = 60;
              cooldownIntervalRef.current = setInterval(() => {
                secondsLeft -= 1;
                setCooldownSeconds(secondsLeft);

                if (secondsLeft <= 0) {
                  if (cooldownIntervalRef.current) {
                    clearInterval(cooldownIntervalRef.current);
                  }
                  setIsOnCooldown(false);
                  setCooldownSeconds(0);
                }
              }, 1000);

              // Main timeout to end cooldown
              checkOutTimerRef.current = setTimeout(() => {
                setIsOnCooldown(false);
                setCooldownSeconds(0);
                if (cooldownIntervalRef.current) {
                  clearInterval(cooldownIntervalRef.current);
                }
              }, AUTO_RESET_TIME);
            });
          } else {
            // Swipe not far enough - reset to checked in position
            Animated.spring(pan, {
              toValue: SCREEN_WIDTH - 115,
              useNativeDriver: false,
            }).start();
          }
        }
      },
    })
  ).current;


  return (
    <SafeAreaView style={styles.container}>


      {/*  Header */}
      <Navbar />


      {/*  main content */}
      <View style={styles.mainContainer}>
        <View style={styles.greetingSection}>
          <Text style={styles.helloText}>Hello {userName}!</Text>
          <Text style={styles.goodMorningText}>Good Morning</Text>
        </View>

        <View style={styles.swipeContainer}>
          <View style={styles.swipebody}>
            {/* Background text */}
            <View style={styles.swipeTextContainer}>
              <Text style={styles.swipeText}>
                {isCheckedIn
                  ? 'Swipe Left to Check-Out'
                  : isOnCooldown
                    ? `Wait ${cooldownSeconds}s to Check-In`
                    : 'Swipe Right to Check-In'}
              </Text>
            </View>

            {/* Swipeable button */}
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [{ translateX: pan }],
                  backgroundColor: isCheckedIn ? '#ffe23dff' : isOnCooldown ? '#999' : '#1472d6ff',
                  opacity: isOnCooldown ? 0.6 : 1,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Feather

                style={[styles.arrow, {
                  color: isCheckedIn ? '#000000ff' : isOnCooldown ? '#999' : '#ffff',
                }
                ]}
                name={isCheckedIn ? "arrow-left" : isOnCooldown ? "clock" : "arrow-right"}
                size={24}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.taskSection}>
          <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
          <Text style={styles.taskCountText}>
            You've to complete <Text style={styles.taskCountBold}>{tasksToComplete} tasks</Text> today.
          </Text>
          <Text style={styles.taskCountText}>
            Task remaining {totalTasks - tasksToComplete}
          </Text>
        </View>

      </View>

    </SafeAreaView >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f2f5',
  },
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
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f2f5',
  },
  taskSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  taskText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  taskCountText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  helloText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  goodMorningText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  taskCountBold: {
    fontWeight: '700',
    color: '#000',
  },
})

export default index