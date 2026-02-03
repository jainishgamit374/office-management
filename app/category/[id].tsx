import { useTheme } from '@/contexts/ThemeContext';
import { CATEGORIES, FeatureItem } from '@/lib/categories';
import Feather from '@expo/vector-icons/Feather';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════
// FEATURE ITEM COMPONENT
// ═══════════════════════════════════════════════════════════

interface FeatureItemProps {
  feature: FeatureItem;
  index: number;
  colors: any;
  onPress: () => void;
}

const FeatureItemComponent = React.memo(({ feature, index, colors, onPress }: FeatureItemProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    const delay = index * 50;
    
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateXAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacityAnim, translateXAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
      style={{
        opacity: opacityAnim,
        transform: [{ translateX: translateXAnim }, { scale: scaleAnim }],
        marginBottom: 12,
      }}
    >
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
            <Feather name={feature.icon} size={20} color={feature.color} />
          </View>
          
          <View style={styles.featureContent}>
            <View style={styles.featureHeader}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              {feature.badge ? (
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>{feature.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>{feature.subtitle}</Text>
          </View>
          
          <Feather name="chevron-right" size={20} color={colors.textTertiary} />
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const category = CATEGORIES.find(c => c.id === id);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Category not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleFeaturePress = useCallback((feature: FeatureItem) => {
     router.push(feature.route as any);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: category.title,
          headerStyle: { backgroundColor: category.gradient[0] },
          headerTintColor: '#FFF',
          headerShadowVisible: false,
          headerLeft: () => (
             <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
               <Feather name="chevron-left" size={24} color="#FFF" />
               {Platform.OS === 'ios' && <Text style={{ color: '#FFF', fontSize: 17, marginLeft: -4 }}>Back</Text>}
             </Pressable>
          ),
        }} 
      />
      
      <ScrollView
        style={styles.featureList}
        contentContainerStyle={[styles.featureListContent, { paddingTop: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Header Info */}
        <View style={[styles.headerSection, { borderBottomColor: colors.border }]}>
          <View style={[styles.categoryIcon, { backgroundColor: `${category.gradient[0]}15` }]}>
            <Feather name={category.icon} size={32} color={category.gradient[0]} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{category.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {category.subtitle} • {category.features.length} features
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {category.features.map((feature, index) => (
            <FeatureItemComponent
              key={feature.id}
              feature={feature}
              index={index}
              colors={colors}
              onPress={() => handleFeaturePress(feature)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  featureList: {
    flex: 1,
  },
  featureListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  featuresContainer: {
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
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
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    marginRight: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureSubtitle: {
    fontSize: 13,
  },
  featureBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  featureBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
