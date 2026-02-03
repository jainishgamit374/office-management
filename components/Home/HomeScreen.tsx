import Navbar from '@/components/Navigation/Navbar';
import { useTabBar } from '@/constants/TabBarContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AllBirthdays from './AllBirthdays';
import AttendanceTrackingCards from './AttendanceTrackingCards';
import CheckInCard from './CheckInCard';
import EarlyCheckouts from './EarlyCheckouts';
import EmployeeOfTheMonthSection from './EmployeeOfTheMonthSection';
import EmployeesOnLeaveToday from './EmployeesOnLeaveToday';
import EmployeesWFHToday from './EmployeesWFHToday';
import LateArrivals from './LateArrivals';
import LeaveBalanceSection from './LeaveBalanceSection';
import MissedPunchSection from './MissedPunchSection';
import NotificationBanner from './NotificationBanner';
import PendingRequestsSection from './PendingRequestsSection';
import UpcomingLeaves from './UpcomingLeaves';
import UpcomingWFHs from './UpcomingWFHs';

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { refreshKey, triggerRefresh } = useRefresh();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [hasEverCheckedIn, setHasEverCheckedIn] = useState(false);
  const [expandedLeave, setExpandedLeave] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const totalTasks = 12;
  const tasksToComplete = 4;

  // Get tab bar context for scroll animation
  const { scrollY, lastScrollY, tabBarTranslateY } = useTabBar();

  // Animated scale values for press feedback
  const scaleAnims = useRef({
    leave1: new Animated.Value(1),
    leave2: new Animated.Value(1),
    leave3: new Animated.Value(1),
    wfhMain: new Animated.Value(1),
    wfh1: new Animated.Value(1),
    wfh2: new Animated.Value(1),
    wfh3: new Animated.Value(1),
    wfhToday: new Animated.Value(1),
    birthday: new Animated.Value(1),
  }).current;

  // Helper function for press animation
  const animatePress = (animKey: keyof typeof scaleAnims, callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnims[animKey], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[animKey], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  const handleCheckInChange = (checkedIn: boolean, checkedOut: boolean) => {
    console.log('🔔 [handleCheckInChange] Called with:', { checkedIn, checkedOut });
    setIsCheckedIn(checkedIn);
    setHasCheckedOut(checkedOut);
    if (checkedIn) {
      setHasEverCheckedIn(true);
    }
  };

  const handleExpandToggle = (newValue: number | null) => {
    setExpandedLeave(newValue);
  };

  // Handle scroll for tab bar animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;

        if (diff > 0 && currentScrollY > 50) {
          // Scrolling down - hide tab bar
          Animated.spring(tabBarTranslateY, {
            toValue: 150,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        } else if (diff < 0) {
          // Scrolling up - show tab bar
          Animated.spring(tabBarTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        }

        lastScrollY.current = currentScrollY;
      },
    }
  );
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    triggerRefresh();
    
    // Simulate a delay for the refresh animation
    // The actual components will refresh via the refreshKey prop
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [triggerRefresh]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.mainContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <Navbar />

        {/* Office Notifications */}
        <NotificationBanner />

        {/* Main content */}
        {/* <GreetingSection /> */}

        {/* Leave Balance Sheet */}
        <LeaveBalanceSection refreshKey={refreshKey} />

        {/* Attendance Tracking Cards - Now manages its own state */}
        <AttendanceTrackingCards refreshKey={refreshKey} />

        {/* Check In Card */}
        <CheckInCard
          onCheckInChange={handleCheckInChange}
          refreshKey={refreshKey}
          onRefreshRequest={onRefresh}
        />


        {/* Missed Punch Section */}
        <MissedPunchSection refreshKey={refreshKey} />

        {/* Attendance Irregularities */}
        {/* <AttendanceIrregularities refreshKey={refreshKey} /> */}

  
        {/* My pending requests */}
        <PendingRequestsSection refreshKey={refreshKey} />

        {/* Late arrivals */}
        <LateArrivals title="Late Arrivals Today" refreshKey={refreshKey} />

        {/* Leave Early Today */}
        <EarlyCheckouts title="Leaving Early Today" refreshKey={refreshKey} />

     

        {/* Upcoming Leaves */}
        <UpcomingLeaves
          expandedLeave={expandedLeave}
          onToggleExpand={handleExpandToggle}
          onAnimatePress={animatePress}
          scaleAnims={{
            leave1: scaleAnims.leave1,
            leave2: scaleAnims.leave2,
            leave3: scaleAnims.leave3,
          }}
          refreshKey={refreshKey}
        />

        {/* Upcoming WFHs */}
        <UpcomingWFHs
          expandedLeave={expandedLeave}
          onToggleExpand={handleExpandToggle}
          onAnimatePress={animatePress}
          scaleAnims={{
            wfhMain: scaleAnims.wfhMain,
            wfh1: scaleAnims.wfh1,
            wfh2: scaleAnims.wfh2,
            wfh3: scaleAnims.wfh3,
          }}
          refreshKey={refreshKey}
        />

        {/* Employees WFH Today */}
        <EmployeesWFHToday
          isExpanded={expandedLeave === 8}
          onToggleExpand={() => handleExpandToggle(expandedLeave === 8 ? null : 8)}
          onAnimatePress={animatePress}
          scaleAnim={scaleAnims.wfhToday}
          refreshKey={refreshKey}
        />

           {/* Employees on Leave Today */}
        <EmployeesOnLeaveToday refreshKey={refreshKey} />

        {/* Employee of the Month */}
        <EmployeeOfTheMonthSection refreshKey={refreshKey} />

        {/* All Birthdays */}
        <AllBirthdays
          isExpanded={expandedLeave === 9}
          onToggleExpand={() => handleExpandToggle(expandedLeave === 9 ? null : 9)}
          onAnimatePress={animatePress}
          scaleAnim={scaleAnims.birthday}
          refreshKey={refreshKey}
        />

      </ScrollView>

      {/* Pass tab bar animation value to parent via context if needed */}
      {/* This will be handled in the tabs layout */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding for tab bar
  },
});

export default HomeScreen;