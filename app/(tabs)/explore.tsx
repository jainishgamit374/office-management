// app/(tabs)/explore.tsx - MySpace Screen
import { useTheme } from '@/contexts/ThemeContext';
import { formatTimeForDisplay, getPunchStatus, type PunchStatusResponse } from '@/lib/attendance';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 32 - 14) / 2;

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

import { CATEGORIES, Category } from '@/lib/categories';

// Quick stats configuration (values will be filled from API)
const QUICK_STATS_CONFIG = [
  { id: 'checkin', icon: 'clock' as const, label: 'Check-in' },
  { id: 'leave', icon: 'calendar' as const, label: 'Leaves Left' },
  { id: 'pending', icon: 'bell' as const, label: 'Pending' },
];

// ═══════════════════════════════════════════════════════════
// QUICK STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════

interface QuickStatData {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
}

const QuickStatCard = React.memo(({ stat, colors }: { stat: QuickStatData; colors: any }) => (
  <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
      <Feather name={stat.icon} size={18} color={colors.primary} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
  </View>
));

// Category Modal Component has been replaced by app/category/[id].tsx route

// ═══════════════════════════════════════════════════════════
// CATEGORY CARD COMPONENT
// ═══════════════════════════════════════════════════════════

interface CategoryCardProps {
  category: Category;
  index: number;
  onPress: () => void;
  colors: any;
}

const CategoryCard = React.memo(({ category, index, onPress, colors }: CategoryCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  // Use the first gradient color as the accent color
  const accentColor = category.gradient[0];

  useEffect(() => {
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacityAnim, translateYAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Badge */}
          {category.badge && (
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{category.badge}</Text>
            </View>
          )}

          {/* Icon */}
          <View style={[styles.cardIconContainer, { backgroundColor: `${accentColor}15` }]}>
            <Feather name={category.icon} size={28} color={accentColor} />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{category.title}</Text>
            <View style={styles.cardSubtitleRow}>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{category.subtitle}</Text>
              <Feather name="chevron-right" size={14} color={colors.textSecondary} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function MySpaceScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [quickStats, setQuickStats] = useState<QuickStatData[]>([
    { id: 'checkin', icon: 'clock', value: '--:--', label: 'Check-in' },
    { id: 'leave', icon: 'calendar', value: '--', label: 'Leaves Left' },
    { id: 'pending', icon: 'bell', value: '--', label: 'Pending' },
  ]);

  // Fetch real data from API
  const fetchQuickStats = useCallback(async () => {
    try {
      const response: PunchStatusResponse = await getPunchStatus();
      
      if (response.status === 'Success' && response.data) {
        // Get punch type: 0 = Not punched, 1 = Checked In, 2 = Checked Out
        const punchType = response.data.punch?.PunchType ?? 0;
        
        // Determine what time to show based on punch status
        let timeLabel = 'Shift Start';
        let timeValue = '09:30 AM'; // Default shift start
        let timeIcon: keyof typeof Feather.glyphMap = 'clock';
        
        // Get shift start time from API if available
        const shiftStartTime = response.data.today?.shift?.StartTime;
        if (shiftStartTime) {
          // Convert 24hr format "09:30" to 12hr format "09:30 AM"
          const [hours, minutes] = shiftStartTime.split(':');
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          timeValue = `${hour12}:${minutes} ${ampm}`;
        }
        
        if (punchType === 2) {
          // Checked out - show checkout time
          const checkOutTime = response.data.punch?.PunchOutTime || 
                              response.data.punch?.PunchOutTimeISO || 
                              response.data.punch?.PunchDateTime;
          timeValue = checkOutTime ? formatTimeForDisplay(checkOutTime) : timeValue;
          timeLabel = 'Check-out';
          timeIcon = 'log-out';
        } else if (punchType === 1) {
          // Checked in - show check-in time
          const checkInTime = response.data.punch?.PunchInTime || 
                             response.data.punch?.PunchInTimeISO || 
                             response.data.punch?.PunchDateTime;
          timeValue = checkInTime ? formatTimeForDisplay(checkInTime) : timeValue;
          timeLabel = 'Check-in';
          timeIcon = 'log-in';
        }
        
        // Calculate total leave balance
        let totalLeaves = 0;
        if (response.data.leaveBalance) {
          Object.values(response.data.leaveBalance).forEach((leave: any) => {
            if (leave.available) {
              totalLeaves += leave.available;
            }
          });
        }
        
        // Get pending requests count
        const pendingCount = response.data.pendingRequests?.total || 0;
        
        setQuickStats([
          { id: 'checkin', icon: timeIcon, value: timeValue, label: timeLabel },
          { id: 'leave', icon: 'calendar', value: totalLeaves.toString(), label: 'Leaves Left' },
          { id: 'pending', icon: 'bell', value: pendingCount.toString(), label: 'Pending' },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch quick stats:', error);
    }
  }, []);

  // Fetch data when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchQuickStats();
    }, [fetchQuickStats])
  );

  const handleCategoryPress = useCallback((category: Category) => {
    router.push(`/category/${category.id}`);
  }, []);

  const themedColors = { ...colors, isDark: colors.background === '#000000' || colors.background === '#111111' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Space</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Quick access to all features
            </Text>
          </View>
          <Pressable
            style={[styles.settingsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/profile')}
          >
            <Feather name="settings" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {quickStats.map((stat) => (
            <QuickStatCard key={stat.id} stat={stat} colors={colors} />
          ))}
        </View>

        {/* Categories */}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onPress={() => handleCategoryPress(category)}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // Quick Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 13,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  cardWrapper: {
    width: CARD_SIZE,
  },
  categoryCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    flex: 1,
  },
  cardSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Modal
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalHeaderLeft: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '400',
    marginLeft: -2,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  modalCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  modalBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },

  // Feature List
  featureList: {
    flex: 1,
  },
  featureListContent: {
    padding: 16,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  featureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
