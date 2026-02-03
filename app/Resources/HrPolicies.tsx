import { useTheme } from '@/contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ═══════════════════════════════════════════════════════════
// DATA (Please populate this with the content from the scanned PDF)
// ═══════════════════════════════════════════════════════════

interface PolicySection {
  id: string;
  title: string;
  content: string;
}

const HR_POLICIES: PolicySection[] = [
  {
    id: '1',
    title: '1. Introduction',
    content: `Welcome to the company. We are committed to providing a professional and supportive work environment.

(Please update this section with the actual content from the scanned PDF/Document.)`,
  },
  {
    id: '2',
    title: '2. Employment Regulations',
    content: `Details regarding employment terms, working hours, and general conduct.

(Paste content here...)`,
  },
  {
    id: '3',
    title: '3. Leave Policy',
    content: `Information about annual leave, sick leave, and other types of leaves.

(Paste content here...)`,
  },
  {
    id: '4',
    title: '4. Code of Conduct',
    content: `Guidelines for professional behavior and ethics.

(Paste content here...)`,
  },
];

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

const PolicyCard = ({ item, index, colors }: { item: PolicySection; index: number; colors: any }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable onPress={toggleExpand} style={styles.cardHeader}>
        <View style={styles.cardHeaderContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.indexText, { color: colors.primary }]}>{index + 1}</Text>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>
      {expanded && (
        <View style={styles.cardBody}>
          <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
            {item.content}
          </Text>
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════

const HrPolicies = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>HR Policies</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Review the company's rules, regulations, and policies below.
        </Text>

        <View style={styles.list}>
          {HR_POLICIES.map((item, index) => (
            <PolicyCard
              key={item.id}
              item={item}
              index={index}
              colors={colors}
            />
          ))}
        </View>
        
        {/* Placeholder for missing content */}
        <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
            <Feather name="info" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={[styles.infoText, { color: colors.text }]}>
                I found the PDF file "HR Policy 1.pdf" but could not automatically extract the text. Please copy the text from your document and update the content in this file.
            </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HrPolicies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginTop: 24,
      borderWidth: 1,
  },
  infoText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
  }
});