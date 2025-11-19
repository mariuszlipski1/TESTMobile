import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows, sectionConfig } from '../theme';
import { useProjectStore, useAISuggestionsStore } from '../store';

// Budget Widget Component
const BudgetWidget = () => {
  const { currentProject } = useProjectStore();
  const planned = currentProject?.budgetPlanned || 100000;
  const spent = currentProject?.budgetSpent || 45000;
  const percentage = Math.round((spent / planned) * 100);

  return (
    <View style={[styles.card, styles.budgetCard]}>
      <Text style={styles.cardTitle}>Budżet projektu</Text>
      <View style={styles.budgetNumbers}>
        <View>
          <Text style={styles.budgetLabel}>Planowane</Text>
          <Text style={styles.budgetValue}>{planned.toLocaleString()} zł</Text>
        </View>
        <View>
          <Text style={styles.budgetLabel}>Wydane</Text>
          <Text style={[styles.budgetValue, spent > planned && styles.budgetOverspent]}>
            {spent.toLocaleString()} zł
          </Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: percentage > 100 ? colors.status.error : colors.primary.main,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{percentage}% wykorzystane</Text>
    </View>
  );
};

// AI Suggestions Card
const AISuggestionsCard = () => {
  const { suggestions } = useAISuggestionsStore();
  const activeSuggestion = suggestions.find((s) => !s.dismissed);

  if (!activeSuggestion) {
    return null;
  }

  return (
    <View style={[styles.card, styles.aiCard]}>
      <View style={styles.aiHeader}>
        <Text style={styles.aiIcon}>AI</Text>
        <Text style={styles.aiTitle}>Sugestia asystenta</Text>
      </View>
      <Text style={styles.aiText}>{activeSuggestion.suggestionText}</Text>
      <TouchableOpacity style={styles.aiAction}>
        <Text style={styles.aiActionText}>Dowiedz się więcej</Text>
      </TouchableOpacity>
    </View>
  );
};

// Section Progress Item
const SectionProgressItem = ({
  sectionKey,
  status,
}: {
  sectionKey: keyof typeof sectionConfig;
  status: 'not_started' | 'in_progress' | 'completed';
}) => {
  const config = sectionConfig[sectionKey];
  const statusIcon = status === 'completed' ? '✓' : status === 'in_progress' ? '◐' : '○';

  return (
    <View style={styles.sectionItem}>
      <View style={[styles.sectionIcon, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.sectionIconText, { color: config.color }]}>
          {config.name.charAt(0)}
        </Text>
      </View>
      <Text style={styles.sectionName}>{config.name}</Text>
      <Text
        style={[
          styles.sectionStatus,
          status === 'completed' && styles.statusCompleted,
          status === 'in_progress' && styles.statusInProgress,
        ]}
      >
        {statusIcon}
      </Text>
    </View>
  );
};

// Quick Actions
const QuickActions = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickActionBtn}>
        <Text style={styles.quickActionIcon}>📝</Text>
        <Text style={styles.quickActionText}>Notatka</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionBtn}>
        <Text style={styles.quickActionIcon}>📷</Text>
        <Text style={styles.quickActionText}>Zdjęcie</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionBtn}>
        <Text style={styles.quickActionIcon}>🎤</Text>
        <Text style={styles.quickActionText}>Audio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionBtn}>
        <Text style={styles.quickActionIcon}>📄</Text>
        <Text style={styles.quickActionText}>Wycena</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DashboardScreen() {
  const { currentProject, sections } = useProjectStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {currentProject?.name || 'Mój Remont'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentProject?.address || 'Dodaj adres projektu'}
          </Text>
        </View>

        {/* Budget Widget */}
        <BudgetWidget />

        {/* AI Suggestions */}
        <AISuggestionsCard />

        {/* Progress Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Postęp prac</Text>
          <SectionProgressItem sectionKey="plan" status="completed" />
          <SectionProgressItem sectionKey="electrical" status="in_progress" />
          <SectionProgressItem sectionKey="plumbing" status="not_started" />
          <SectionProgressItem sectionKey="carpentry" status="not_started" />
          <SectionProgressItem sectionKey="finishing" status="not_started" />
          <SectionProgressItem sectionKey="costs" status="in_progress" />
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Szybkie akcje</Text>
          <QuickActions />
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ostatnia aktywność</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityTime}>Dziś, 14:30</Text>
            <Text style={styles.activityText}>Dodano wycenę elektryka</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityTime}>Wczoraj, 10:15</Text>
            <Text style={styles.activityText}>Notatka z inspekcji</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  budgetCard: {},
  budgetNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  budgetLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  budgetValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  budgetOverspent: {
    color: colors.status.error,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  aiCard: {
    backgroundColor: colors.primary.main + '10',
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiIcon: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface.primary,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  aiTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  aiText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  aiAction: {
    marginTop: spacing.md,
  },
  aiActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionIconText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  sectionName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  sectionStatus: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
  },
  statusCompleted: {
    color: colors.status.success,
  },
  statusInProgress: {
    color: colors.status.warning,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionBtn: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  activityItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  activityText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
});
