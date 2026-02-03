import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

interface AnimatedListItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  index?: number;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}

/**
 * AnimatedListItem - A reusable list item component with staggered entrance animations
 * 
 * Features:
 * - Staggered fade in based on index
 * - Subtle scale animation on press
 * - Optimized for lists with many items
 * 
 * Usage:
 * {items.map((item, index) => (
 *   <AnimatedListItem key={item.id} index={index} onPress={() => handlePress(item)}>
 *     <YourListItemContent />
 *   </AnimatedListItem>
 * ))}
 */
export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  onPress,
  index = 0,
  style,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50, // Stagger by 50ms per item
      useNativeDriver: true,
    }).start();
  }, [index, opacityAnim]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    transform: [{ scale: scaleAnim }],
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
