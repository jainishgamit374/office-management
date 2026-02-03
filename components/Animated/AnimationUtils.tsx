import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * FadeInView - Simple fade in animation
 * 
 * Usage:
 * <FadeInView delay={200} duration={500}>
 *   <YourContent />
 * </FadeInView>
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, duration, opacityAnim]);

  return <Animated.View style={[{ opacity: opacityAnim }, style]}>{children}</Animated.View>;
};

interface SlideInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: 'left' | 'right' | 'top' | 'bottom';
  distance?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * SlideInView - Slide in animation from any direction
 * 
 * Usage:
 * <SlideInView from="right" distance={100} delay={150}>
 *   <YourContent />
 * </SlideInView>
 */
export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  delay = 0,
  duration = 400,
  from = 'bottom',
  distance = 30,
  style,
}) => {
  const translateAnim = useRef(new Animated.Value(distance)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, opacityAnim, translateAnim]);

  const getTransform = () => {
    switch (from) {
      case 'left':
        return [{ translateX: translateAnim.interpolate({ inputRange: [0, distance], outputRange: [0, -distance] }) }];
      case 'right':
        return [{ translateX: translateAnim }];
      case 'top':
        return [{ translateY: translateAnim.interpolate({ inputRange: [0, distance], outputRange: [0, -distance] }) }];
      case 'bottom':
      default:
        return [{ translateY: translateAnim }];
    }
  };

  return (
    <Animated.View style={[{ opacity: opacityAnim, transform: getTransform() }, style]}>
      {children}
    </Animated.View>
  );
};

interface ScaleInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * ScaleInView - Scale up animation with fade in
 * 
 * Usage:
 * <ScaleInView delay={100}>
 *   <YourContent />
 * </ScaleInView>
 */
export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 80,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, opacityAnim, scaleAnim]);

  return (
    <Animated.View style={[{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};
