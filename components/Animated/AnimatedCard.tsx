import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}

/**
 * AnimatedCard - A reusable card component with smooth entrance and press animations
 * 
 * Features:
 * - Fade in + slide up entrance animation
 * - Scale down on press with spring physics
 * - Customizable delay for staggered animations
 * 
 * Usage:
 * <AnimatedCard onPress={() => navigate('/somewhere')} delay={100}>
 *   <YourContent />
 * </AnimatedCard>
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  delay = 0,
  style,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation
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
  }, [delay, opacityAnim, translateYAnim]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
  };

  if (onPress && !disabled) {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};
