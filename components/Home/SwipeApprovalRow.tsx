import { ThemeColors } from '@/contexts/ThemeContext';
import Feather from '@expo/vector-icons/Feather';
import React, { useMemo, useRef } from 'react';
import { Animated, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  date?: string;
  status?: string;
  profileImage?: string; // New prop
  colors: ThemeColors;

  onPress?: () => void;
  onApprove: () => void;     // swipe left
  onDisapprove: () => void;  // swipe right
};

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 180;

export default function SwipeApprovalRow({
  title,
  subtitle,
  date,
  status,
  profileImage,
  colors,
  onPress,
  onApprove,
  onDisapprove,
}: Props) {
  const panX = useRef(new Animated.Value(0)).current;

  const bgColor = panX.interpolate({
    inputRange: [-MAX_SWIPE, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, MAX_SWIPE],
    outputRange: ['#EF4444', '#EF4444', colors.background, '#10B981', '#10B981'], // Red left, Green right
    extrapolate: 'clamp',
  });

  const leftHintOpacity = panX.interpolate({
    inputRange: [0, 40, SWIPE_THRESHOLD], // Positive -> Swipe Right -> Approve
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  const rightHintOpacity = panX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -40, 0], // Negative -> Swipe Left -> Disapprove
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
            // Swiped Left -> Disapprove
            Animated.timing(panX, { toValue: -MAX_SWIPE, duration: 120, useNativeDriver: false }).start(() => {
              panX.setValue(0);
              onDisapprove();
            });
            return;
          }

          if (dx >= SWIPE_THRESHOLD) {
            // Swiped Right -> Approve
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

  return (
    <Animated.View style={[styles.wrap, { backgroundColor: bgColor, borderColor: colors.border }]}>
      {/* Swipe hints */}
      <View style={styles.hints} pointerEvents="none">
        <Animated.View style={[styles.hintLeft, { opacity: leftHintOpacity }]}>
          <Feather name="check" size={16} color="#fff" />
          <Text style={styles.hintText}>Approve</Text>
        </Animated.View>

        <Animated.View style={[styles.hintRight, { opacity: rightHintOpacity }]}>
          <Text style={styles.hintText}>Disapprove</Text>
          <Feather name="x" size={16} color="#fff" />
        </Animated.View>
      </View>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.background,
            transform: [{ translateX: panX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.mainRow}>
          {/* Profile Image */}
          {!!profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}
          
          <View style={styles.textColumn}>
            <View style={styles.top}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              {!!date && (
                <Text style={[styles.date, { color: colors.textSecondary }]} numberOfLines={1}>
                  {date}
                </Text>
              )}
            </View>

            {!!subtitle && (
              <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
                {subtitle}
              </Text>
            )}

            {!!status && (
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.status, { color: '#F59E0B' }]}>{status}</Text>
              </View>
            )}
          </View>
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
  },
  hints: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  hintLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  card: { padding: 12 },
  mainRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  profileImage: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
  textColumn: { flex: 1 },
  
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' },
  title: { fontSize: 14, fontWeight: '900', flex: 1 },
  date: { fontSize: 11, fontWeight: '700' },
  sub: { marginTop: 4, fontSize: 12, fontWeight: '600', lineHeight: 16 },
  statusRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  status: { fontSize: 11, fontWeight: '800' },
});