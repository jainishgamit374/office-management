import { ThemeColors } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React, { useMemo, useRef } from 'react';
import { Animated, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  date?: string;
  status?: string;
  employeeName?: string;
  profileImage?: string;
  colors: ThemeColors;

  onPress?: () => void;
  onApprove: () => void;
  onDisapprove: () => void;
};

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 180;

export default function SwipeApprovalRow({
  title,
  subtitle,
  date,
  status,
  employeeName,
  profileImage,
  colors,
  onPress,
  onApprove,
  onDisapprove,
}: Props) {
  const panX = useRef(new Animated.Value(0)).current;

  const bgColor = panX.interpolate({
    inputRange: [-MAX_SWIPE, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, MAX_SWIPE],
    outputRange: ['#EF4444', '#EF4444', colors.background, '#10B981', '#10B981'],
    extrapolate: 'clamp',
  });

  const leftHintOpacity = panX.interpolate({
    inputRange: [0, 40, SWIPE_THRESHOLD],
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  const rightHintOpacity = panX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -40, 0],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 12,
        onPanResponderMove: (_, g) => {
          panX.setValue(Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, g.dx)));
        },
        onPanResponderRelease: (_, g) => {
          const dx = g.dx;

          if (dx <= -SWIPE_THRESHOLD) {
            Animated.timing(panX, { toValue: -MAX_SWIPE, duration: 120, useNativeDriver: false }).start(() => {
              panX.setValue(0);
              onDisapprove();
            });
            return;
          }

          if (dx >= SWIPE_THRESHOLD) {
            Animated.timing(panX, { toValue: MAX_SWIPE, duration: 120, useNativeDriver: false }).start(() => {
              panX.setValue(0);
              onApprove();
            });
            return;
          }

          Animated.spring(panX, { toValue: 0, useNativeDriver: false }).start();
        },
      }),
    [onApprove, onDisapprove, panX]
  );

  // Get initials from employee name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Animated.View style={[styles.wrap, { backgroundColor: bgColor, borderColor: colors.border }]}>
      {/* Swipe hints */}
      <View style={styles.hints} pointerEvents="none">
        <Animated.View style={[styles.hintLeft, { opacity: leftHintOpacity }]}>
          <Feather name="check" size={16} color="#fff" />
          <Text style={styles.hintText}>Approve</Text>
        </Animated.View>

        <Animated.View style={[styles.hintRight, { opacity: rightHintOpacity }]}>
          <Text style={styles.hintText}>Reject</Text>
          <Feather name="x" size={16} color="#fff" />
        </Animated.View>
      </View>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            transform: [{ translateX: panX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.mainRow}>
          {/* Profile Image or Avatar */}
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {getInitials(employeeName)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.textColumn}>
            {/* Top Row: Employee Name + Date */}
            <View style={styles.topRow}>
              <Text style={[styles.employeeName, { color: colors.text }]} numberOfLines={1}>
                {employeeName || 'Unknown'}
              </Text>
              {date && (
                <Text style={[styles.date, { color: colors.textTertiary }]} numberOfLines={1}>
                  {date}
                </Text>
              )}
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
              {title}
            </Text>

            {/* Reason/Subtitle */}
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Chevron */}
          <Feather name="chevron-right" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  hints: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  hintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },

  card: {
    padding: 12,
    borderRadius: 14,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  avatarContainer: {
    width: 42,
    height: 42,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },

  textColumn: {
    flex: 1,
    gap: 3,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
    flex: 1,
  },
  date: {
    fontSize: 10,
    fontWeight: '600',
  },

  title: {
    fontSize: 12,
    fontWeight: '600',
  },

  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    opacity: 0.8,
  },
});