// app/(tabs)/explore.tsx
import { useTabBar } from '@/constants/TabBarContext';
import { useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ExploreCard = ({
  icon,
  title,
  description,
  route,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  route?: string;
}) => {
  const { colors, theme } = useTheme();

  const handlePress = () => {
    if (route) router.push(route);
  };

  return (
    <Pressable onPress={handlePress} disabled={!route}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.cardIcon, { backgroundColor: colors.primaryLight }]}>
          <Feather name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        {route && <Feather name="chevron-right" size={18} color={colors.textTertiary} />}
      </View>
    </Pressable>
  );
};

export default function ExploreScreen() {
  const { colors } = useTheme();

  // Get tab bar context for scroll animation
  const { scrollY, lastScrollY, tabBarTranslateY } = useTabBar();

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
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Feather name="grid" size={60} color={colors.textTertiary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          MySpace
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tools and resources to manage your work.
        </Text>

        {/* Attendance & Time */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Attendance & Time
          </Text>

          <ExploreCard
            icon="clock"
            title="Attendance History"
            description="View your check-in and check-out records"
            route="/Attendance/AttendenceList"

          />
          <ExploreCard
            icon="calendar"
            title="Leave Calendar"
            description="See upcoming leaves and holidays"
            route="/Attendance/LeaveCalender"
          />

          <ExploreCard
            icon="user-x"
            title="Absence List"
            description="View employee absences"
            route="/Attendance/AbsenceList"
          />

          <ExploreCard
            icon="log-out"
            title="Early Checkout List"
            description="View early checkout requests"
            route="/Attendance/EarlyCheckoutList"
          />

          <ExploreCard
            icon="alert-circle"
            title="Missed Punch List"
            description="View missed punch requests"
            route="/Attendance/MissPunchList"
          />

          <ExploreCard
            icon="user-x"
            title="Is Away List"
            description="View is away requests"
            route="/Attendance/IsAwayList"
          />

          <ExploreCard
            icon="check-circle"
            title="Leave Approval List"
            description="View leave approval requests"
            route="/Attendance/LeaveApprovalList"
          />

          <ExploreCard
            icon="home"
            title="Work From Home"
            description="Manage your WFH requests"
            route="/Attendance/Wfhlist"
          />
        </View>

        {/* Requests */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Requests
          </Text>

          <ExploreCard
            icon="file-plus"
            title="Apply Leave Application"
            description="Apply for leave"
            route="/Requests/Leaveapplyreq"
          />
          <ExploreCard
            icon="alert-circle"
            title="Miss Punch Request"
            description="Report a missed check-in or check-out"
            route="/Requests/Misspunchreq"
          />
          <ExploreCard
            icon="log-out"
            title="Early Check-Out/ Late check In"
            description="Request to leave early or late check in"
            route="/Requests/Earlycheckoutreq"
          />
          <ExploreCard
            icon="home"
            title="Apply WFH"
            description="Apply for work from home"
            route="/Requests/Wfhapplyreq"
          />
        </View>

        {/* View All Requests */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            View All  Requests
          </Text>

          <ExploreCard
            icon="file-plus"
            title="Leave Requests"
            description="View all leave applications"
            route="/ViewAllRequest/LeaveApplication"
          />
          <ExploreCard
            icon="log-out"
            title="Early Checkout Requests/Late CheckIn Requests"
            description="View all early checkout requests or late checkIn requests"
            route="/ViewAllRequest/EarlyCheckout"
          />
          <ExploreCard
            icon="home"
            title="WFH Requests"
            description="View all WFH requests"
            route="/ViewAllRequest/Wfhrequest"
          />
          <ExploreCard
            icon="alert-circle"
            title="View Miss Punch Requests"
            description="View all miss punch requests"
            route="/ViewAllRequest/ViewAllMisspunch"
          />
        </View>

        {/* Resources */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Resources
          </Text>

          <ExploreCard
            icon="file-text"
            title="HR Policies"
            description="Company rules and guidelines"
            route="/Resources/HrPolicies"
          />
          <ExploreCard
            icon="users"
            title="Team Directory"
            description="Find teammates and contacts"
            route="/Resources/TeamDirectory"
          />
        </View>

        {/* Support */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support
          </Text>

          <ExploreCard
            icon="help-circle"
            title="Help & FAQ"
            description="Get answers to common questions"
            route="/Support/Helpandfaq"
          />
          <ExploreCard
            icon="info"
            title="About"
            description="App version and info"
            route="/Support/About"
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Extra padding for tab bar
  },
  headerContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    // soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    ...Platform.select({ android: { elevation: 3 } }),
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
  },
});
