import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  variant?: 'scale' | 'bounce' | 'subtle';
}

/**
 * AnimatedButton - A reusable button component with smooth press animations
 * 
 * Variants:
 * - 'scale': Standard scale down (0.95)
 * - 'bounce': Bouncy spring animation
 * - 'subtle': Minimal scale (0.98)
 * 
 * Usage:
 * <AnimatedButton onPress={handleSubmit} variant="bounce">
 *   <Text>Submit</Text>
 * </AnimatedButton>
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  variant = 'scale',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getScaleValue = () => {
    switch (variant) {
      case 'bounce':
        return 0.92;
      case 'subtle':
        return 0.98;
      case 'scale':
      default:
        return 0.95;
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: getScaleValue(),
      friction: variant === 'bounce' ? 5 : 8,
      tension: variant === 'bounce' ? 120 : 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: variant === 'bounce' ? 5 : 8,
      tension: variant === 'bounce' ? 120 : 100,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
