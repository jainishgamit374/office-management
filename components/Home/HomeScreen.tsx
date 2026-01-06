import Navbar from '@/components/Navigation/Navbar';
import { useTabBar } from '@/constants/TabBarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getLateCheckinCount } from '@/lib/earlyLatePunch';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AllBirthdays from './AllBirthdays';
import AttendanceTrackingCards from './AttendanceTrackingCards';
import CheckInCard from './CheckInCard';
import EmployeesOnLeaveToday from './EmployeesOnLeaveToday';
import EmployeesWFHToday from './EmployeesWFHToday';
import InfoSection from './InfoSection';
import LeaveBalanceSection from './LeaveBalanceSection';
import MissedPunchSection from './MissedPunchSection';
import NotificationBanner from './NotificationBanner';
import PendingRequestsSection from './PendingRequestsSection';
import UpcomingLeaves from './UpcomingLeaves';
import UpcomingWFHs from './UpcomingWFHs';

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [hasEverCheckedIn, setHasEverCheckedIn] = useState(false);
  const [expandedLeave, setExpandedLeave] = useState<number | null>(null);
  const [lateCheckInCount, setLateCheckInCount] = useState<number>(0);
  const [earlyCheckOutCount, setEarlyCheckOutCount] = useState<number>(0);

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

  // Fetch late/early counts from API
  const fetchAttendanceCounts = useCallback(async () => {
    try {
      // Get current month and year
      const now = new Date();
      const month = (now.getMonth() + 1).toString();
      const year = now.getFullYear().toString();

      console.log('📊 Fetching late check-in count for:', { month, year });

      // Fetch late check-in count from /late-checkin-count/ API
      const lateResponse = await getLateCheckinCount(month, year);

      console.log('📊 Late check-in API response:', JSON.stringify(lateResponse, null, 2));

      if (lateResponse?.data?.late_checkin_count !== undefined) {
        console.log('✅ Setting late check-in count to:', lateResponse.data.late_checkin_count);
        setLateCheckInCount(lateResponse.data.late_checkin_count);
      } else {
        console.log('⚠️ No late_checkin_count in API response');
      }

      // Note: Early checkout count API endpoint doesn't exist yet
      // The backend needs to provide an endpoint like /early-checkout-count/
      // Until then, early checkout count will remain at initial value (0)
      // Do NOT manually set or override these counts - they come from API only

    } catch (error) {
      console.error('❌ Error fetching attendance counts:', error);
      // Don't show error to user, just log it
    }
  }, []);

  // Fetch counts on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAttendanceCounts();
    }, [fetchAttendanceCounts])
  );

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
    setIsCheckedIn(checkedIn);
    setHasCheckedOut(checkedOut);
    if (checkedIn) {
      setHasEverCheckedIn(true);
    }
    // Refresh attendance counts after check-in/out
    fetchAttendanceCounts();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.mainContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <Navbar />

        {/* Office Notifications */}
        <NotificationBanner />

        {/* Main content */}
        {/* <GreetingSection /> */}

        {/* Leave Balance Sheet */}
        <LeaveBalanceSection />

        {/* Missed Punch Section */}
        <MissedPunchSection />

        {/* Attendance Tracking Cards */}
        <AttendanceTrackingCards
          lateCheckIns={lateCheckInCount}
          earlyCheckOuts={earlyCheckOutCount}
        />

        {/* Check In Card */}
        <CheckInCard
          onCheckInChange={handleCheckInChange}
        />

        {/* My pending requests */}
        <PendingRequestsSection />

        {/* Late arrivals */}
        <InfoSection title="Late Arrivals Today" />

        {/* Leave Early Today */}
        <InfoSection title="Leaving Early Today" />

        {/* Employees on Leave Today */}
        <EmployeesOnLeaveToday />

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
        />

        {/* Employees WFH Today */}
        <EmployeesWFHToday
          isExpanded={expandedLeave === 8}
          onToggleExpand={() => handleExpandToggle(expandedLeave === 8 ? null : 8)}
          onAnimatePress={animatePress}
          scaleAnim={scaleAnims.wfhToday}
        />

        {/* All Birthdays */}
        <AllBirthdays
          isExpanded={expandedLeave === 9}
          onToggleExpand={() => handleExpandToggle(expandedLeave === 9 ? null : 9)}
          onAnimatePress={animatePress}
          scaleAnim={scaleAnims.birthday}
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