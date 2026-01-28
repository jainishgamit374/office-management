// app/(tabs)/explore.tsx
import { useTabBar } from '@/constants/TabBarContext';
import { useTheme } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CardItem {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  route: string;
  gradient: [string, string];
  badge?: string;
}

interface CategoryData {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  count: number;
  items: CardItem[];
}

const FeatureCard = ({ item }: { item: CardItem }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Use first gradient color as accent
  const accentColor = item.gradient[0];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push(item.route as any);
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
            <Feather name={item.icon} size={22} color={accentColor} />
          </View>
          {item.badge && (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const CollapsibleSection = ({ category }: { category: CategoryData }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(animatedHeight, {
        toValue,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
    ]).start();

    setExpanded(!expanded);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1000],
  });

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Pressable onPress={toggleExpand}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name={category.icon} size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {category.title}
              </Text>
              <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                {category.count} items
              </Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Feather name="chevron-down" size={24} color={colors.textSecondary} />
          </Animated.View>
        </View>
      </Pressable>

      <Animated.View style={[styles.collapsibleContent, { maxHeight, opacity: animatedHeight }]}>
        <View style={styles.cardGrid}>
          {category.items.map((item, index) => (
            <FeatureCard key={index} item={item} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default function ExploreScreen() {
  const { colors } = useTheme();

  // Get tab bar context for scroll animation
  const { scrollY, lastScrollY, tabBarTranslateY } = useTabBar();

  // Category data
  const categories: CategoryData[] = [
    {
      title: 'Attendance & Time',
      icon: 'clock',
      count: 8,
      items: [
        {
          icon: 'clock',
          title: 'Attendance History',
          description: 'View check-in records',
          route: '/Attendance/AttendenceList',
          gradient: ['#667eea', '#764ba2'],
          badge: 'New',
        },
        {
          icon: 'calendar',
          title: 'Leave Calendar',
          description: 'Leaves & holidays',
          route: '/Attendance/LeaveCalender',
          gradient: ['#f093fb', '#f5576c'],
        },
        {
          icon: 'user-x',
          title: 'Absence List',
          description: 'Employee absences',
          route: '/Attendance/AbsenceList',
          gradient: ['#4facfe', '#00f2fe'],
        },
        {
          icon: 'log-out',
          title: 'Early Checkout',
          description: 'Early checkout list',
          route: '/Attendance/EarlyCheckoutList',
          gradient: ['#43e97b', '#38f9d7'],
        },
        {
          icon: 'alert-circle',
          title: 'Missed Punch',
          description: 'Missed punch list',
          route: '/Attendance/MissPunchList',
          gradient: ['#fa709a', '#fee140'],
        },
        {
          icon: 'user-x',
          title: 'Is Away List',
          description: 'Away requests',
          route: '/Attendance/IsAwayList',
          gradient: ['#30cfd0', '#330867'],
        },
        {
          icon: 'check-circle',
          title: 'Leave Approval',
          description: 'Approval requests',
          route: '/Attendance/LeaveApprovalList',
          gradient: ['#a8edea', '#fed6e3'],
        },
        {
          icon: 'home',
          title: 'Work From Home',
          description: 'WFH requests',
          route: '/Attendance/Wfhlist',
          gradient: ['#ffecd2', '#fcb69f'],
        },
      ],
    },
    {
      title: 'Leave Management',
      icon: 'calendar',
      count: 4,
      items: [
        {
          icon: 'file-plus',
          title: 'Apply Leave',
          description: 'Submit leave request',
          route: '/Requests/Leaveapplyreq',
          gradient: ['#667eea', '#764ba2'],
        },
        {
          icon: 'file-text',
          title: 'Leave Requests',
          description: 'All leave applications',
          route: '/ViewAllRequest/LeaveApplication',
          gradient: ['#f093fb', '#f5576c'],
        },
        {
          icon: 'check-circle',
          title: 'Leave Approval',
          description: 'Pending approvals',
          route: '/Attendance/LeaveApprovalList',
          gradient: ['#4facfe', '#00f2fe'],
          badge: '3',
        },
        {
          icon: 'calendar',
          title: 'Leave Calendar',
          description: 'View calendar',
          route: '/Attendance/LeaveCalender',
          gradient: ['#43e97b', '#38f9d7'],
        },
      ],
    },
    {
      title: 'Requests',
      icon: 'send',
      count: 7,
      items: [
        {
          icon: 'alert-circle',
          title: 'Miss Punch',
          description: 'Report missed punch',
          route: '/Requests/Misspunchreq',
          gradient: ['#fa709a', '#fee140'],
        },
        {
          icon: 'log-out',
          title: 'Early Checkout',
          description: 'Request early leave',
          route: '/Requests/Earlycheckoutreq',
          gradient: ['#30cfd0', '#330867'],
        },
        {
          icon: 'home',
          title: 'Apply WFH',
          description: 'Work from home',
          route: '/Requests/Wfhapplyreq',
          gradient: ['#a8edea', '#fed6e3'],
        },
        {
          icon: 'log-out',
          title: 'Early/Late Requests',
          description: 'View all requests',
          route: '/ViewAllRequest/EarlyCheckout',
          gradient: ['#ffecd2', '#fcb69f'],
        },
        {
          icon: 'home',
          title: 'WFH Requests',
          description: 'All WFH requests',
          route: '/ViewAllRequest/Wfhrequest',
          gradient: ['#667eea', '#764ba2'],
        },
        {
          icon: 'alert-circle',
          title: 'Miss Punch Requests',
          description: 'View all requests',
          route: '/ViewAllRequest/ViewAllMisspunch',
          gradient: ['#f093fb', '#f5576c'],
        },
        {
          icon: 'file-plus',
          title: 'Apply Leave',
          description: 'Submit leave',
          route: '/Requests/Leaveapplyreq',
          gradient: ['#4facfe', '#00f2fe'],
        },
      ],
    },
    {
      title: 'Resources & Support',
      icon: 'info',
      count: 4,
      items: [
        {
          icon: 'file-text',
          title: 'HR Policies',
          description: 'Company guidelines',
          route: '/Resources/HrPolicies',
          gradient: ['#43e97b', '#38f9d7'],
        },
        {
          icon: 'users',
          title: 'Team Directory',
          description: 'Find teammates',
          route: '/Resources/TeamDirectory',
          gradient: ['#fa709a', '#fee140'],
        },
        {
          icon: 'help-circle',
          title: 'Help & FAQ',
          description: 'Get help',
          route: '/Support/Helpandfaq',
          gradient: ['#30cfd0', '#330867'],
        },
        {
          icon: 'info',
          title: 'About',
          description: 'App info',
          route: '/Support/About',
          gradient: ['#a8edea', '#fed6e3'],
        },
      ],
    },
  ];

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
          <Feather name="grid" size={60} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          MySpace
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your work efficiently with organized tools
        </Text>

        {/* Collapsible Sections */}
        {categories.map((category, index) => (
          <CollapsibleSection key={index} category={category} />
        ))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  headerContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    ...Platform.select({ android: { elevation: 4 } }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionCount: {
    fontSize: 13,
  },
  collapsibleContent: {
    overflow: 'hidden',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingTop: 0,
    gap: 12,
  },
  cardWrapper: {
    width: '48%',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});

