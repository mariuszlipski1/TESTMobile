import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Animated,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows, sectionConfig } from '../theme';
import { useProjectStore, useAISuggestionsStore } from '../store';
import { SectionType, SectionStatus } from '../types';

// Project Header Component with Edit Modal
const ProjectHeader = () => {
  const { currentProject, setCurrentProject } = useProjectStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentProject?.name || 'Mój Remont');
  const [editAddress, setEditAddress] = useState(currentProject?.address || '');

  const handleSave = () => {
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        name: editName.slice(0, 50), // Max 50 characters
        address: editAddress,
      });
    }
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.header} onPress={() => setModalVisible(true)}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {(currentProject?.name || 'MR').charAt(0)}
          </Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentProject?.name || 'Mój Remont'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {currentProject?.address || 'Dodaj adres projektu'}
          </Text>
        </View>
        <Text style={styles.headerEditIcon}>✏️</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edytuj projekt</Text>

            <Text style={styles.inputLabel}>Nazwa projektu</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={(text) => setEditName(text.slice(0, 50))}
              placeholder="Np. Remont Kawalerki Mokotów"
              maxLength={50}
            />
            <Text style={styles.charCount}>{editName.length}/50</Text>

            <Text style={styles.inputLabel}>Adres</Text>
            <TextInput
              style={styles.textInput}
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Np. ul. Mokotowska 12, Warszawa"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSave}
              >
                <Text style={styles.modalBtnSaveText}>Zapisz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Budget Widget Component with color thresholds
const BudgetWidget = () => {
  const navigation = useNavigation();
  const { currentProject } = useProjectStore();
  const planned = currentProject?.budgetPlanned || 100000;
  const spent = currentProject?.budgetSpent || 54000;
  const percentage = Math.round((spent / planned) * 100);
  const remaining = planned - spent;

  // Color logic based on PRD thresholds
  const getProgressColor = () => {
    if (percentage > 95) return colors.status.error;      // Red: >95%
    if (percentage > 80) return colors.status.warning;    // Yellow: 80-95%
    return colors.status.success;                         // Green: 0-80%
  };

  return (
    <TouchableOpacity
      style={[styles.card, styles.budgetCard]}
      onPress={() => navigation.navigate('Costs' as never)}
      activeOpacity={0.7}
    >
      <Text style={styles.cardTitle}>Budżet</Text>
      <View style={styles.budgetNumbers}>
        <View style={styles.budgetColumn}>
          <Text style={styles.budgetLabel}>Planowane</Text>
          <Text style={styles.budgetValue}>{planned.toLocaleString()} zł</Text>
        </View>
        <View style={styles.budgetColumn}>
          <Text style={styles.budgetLabel}>Wydane</Text>
          <Text style={[styles.budgetValue, percentage > 95 && styles.budgetOverspent]}>
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
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>
      <View style={styles.budgetFooter}>
        <Text style={styles.progressText}>{percentage}%</Text>
        <Text style={[styles.remainingText, remaining < 0 && styles.budgetOverspent]}>
          Pozostało: {remaining.toLocaleString()} zł
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// AI Suggestions Card with CTA
const AISuggestionsCard = () => {
  const navigation = useNavigation();
  const { suggestions, dismissSuggestion } = useAISuggestionsStore();
  const activeSuggestion = suggestions.find((s) => !s.dismissed);

  // Default suggestion if none available
  const defaultSuggestion = {
    id: 'default',
    suggestionText: 'Masz 2 wyceny hydraulika - czas je porównać i wybrać!',
    cta: 'Porównaj wyceny',
    targetScreen: 'Plumbing',
  };

  const suggestion = activeSuggestion || defaultSuggestion;

  const handleCTAPress = () => {
    // Navigate to relevant section based on suggestion context
    const targetScreen = (suggestion as any).targetScreen || 'Plumbing';
    navigation.navigate(targetScreen as never);
  };

  const handleDismiss = () => {
    if (activeSuggestion) {
      dismissSuggestion(activeSuggestion.id);
    }
  };

  return (
    <View style={[styles.card, styles.aiCard]}>
      <View style={styles.aiHeaderRow}>
        <View style={styles.aiHeader}>
          <Text style={styles.aiIcon}>💡</Text>
          <Text style={styles.aiTitle}>Następny krok</Text>
        </View>
        {activeSuggestion && (
          <TouchableOpacity onPress={handleDismiss}>
            <Text style={styles.aiDismiss}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.aiText}>
        {suggestion.suggestionText}
      </Text>
      <TouchableOpacity style={styles.aiActionBtn} onPress={handleCTAPress}>
        <Text style={styles.aiActionText}>
          {(suggestion as any).cta || 'Zobacz szczegóły'} →
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Progress Tracker with Global Progress Bar
const ProgressTracker = () => {
  const navigation = useNavigation();
  const { sections } = useProjectStore();

  // Mock data for demo - calculate from actual sections
  const sectionStatuses: Record<SectionType, SectionStatus> = {
    plan: 'completed',
    electrical: 'in_progress',
    plumbing: 'in_progress',
    carpentry: 'not_started',
    finishing: 'not_started',
    costs: 'completed',
  };

  const completedCount = Object.values(sectionStatuses).filter(s => s === 'completed').length;
  const totalCount = Object.keys(sectionStatuses).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleSectionPress = (sectionKey: SectionType) => {
    const screenMap: Record<SectionType, string> = {
      plan: 'Plan',
      electrical: 'Electrical',
      plumbing: 'Plumbing',
      carpentry: 'Electrical', // Using Electrical as placeholder
      finishing: 'Electrical', // Using Electrical as placeholder
      costs: 'Costs',
    };
    navigation.navigate(screenMap[sectionKey] as never);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Postęp projektu</Text>

      {/* Global Progress Bar */}
      <View style={styles.globalProgress}>
        <View style={styles.globalProgressBar}>
          <View
            style={[
              styles.globalProgressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.globalProgressText}>
          {completedCount}/{totalCount} ({progressPercent}%)
        </Text>
      </View>

      {/* Section Items */}
      {(Object.keys(sectionStatuses) as SectionType[]).map((sectionKey) => (
        <SectionProgressItem
          key={sectionKey}
          sectionKey={sectionKey}
          status={sectionStatuses[sectionKey]}
          onPress={() => handleSectionPress(sectionKey)}
        />
      ))}
    </View>
  );
};

// Section Progress Item - Clickable
const SectionProgressItem = ({
  sectionKey,
  status,
  onPress,
}: {
  sectionKey: keyof typeof sectionConfig;
  status: 'not_started' | 'in_progress' | 'completed';
  onPress?: () => void;
}) => {
  const config = sectionConfig[sectionKey];
  const statusIcon = status === 'completed' ? '✅' : status === 'in_progress' ? '🔄' : '🕐';

  return (
    <TouchableOpacity style={styles.sectionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.sectionIcon, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.sectionIconText, { color: config.color }]}>
          {config.name.charAt(0)}
        </Text>
      </View>
      <Text style={styles.sectionName}>{config.name}</Text>
      <Text style={styles.sectionStatusEmoji}>{statusIcon}</Text>
    </TouchableOpacity>
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

// Recent Activity Component
const RecentActivity = () => {
  const activities = [
    { id: '1', time: 'Dziś, 14:30', text: 'Dodano wycenę elektryka', type: 'estimate' },
    { id: '2', time: 'Wczoraj, 10:15', text: 'Notatka z inspekcji', type: 'note' },
    { id: '3', time: '3 dni temu', text: 'Ukończono 5 punktów checklisty', type: 'checklist' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Ostatnia aktywność</Text>
      {activities.map((activity) => (
        <TouchableOpacity key={activity.id} style={styles.activityItem} activeOpacity={0.7}>
          <View style={styles.activityContent}>
            <Text style={styles.activityTime}>{activity.time}</Text>
            <Text style={styles.activityText}>{activity.text}</Text>
          </View>
          <Text style={styles.activityArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function DashboardScreen() {
  const { currentProject, sections, setCurrentProject } = useProjectStore();

  // Initialize default project if not set
  useEffect(() => {
    if (!currentProject) {
      setCurrentProject({
        id: 'default',
        userId: 'user1',
        name: 'Remont Kawalerki Mokotów',
        address: 'ul. Mokotowska 12, Warszawa',
        area: 45,
        floor: 3,
        hasElevator: true,
        marketType: 'secondary',
        budgetPlanned: 90000,
        budgetSpent: 54000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [currentProject, setCurrentProject]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Project Header - Editable */}
        <ProjectHeader />

        {/* Budget Widget - Clickable to Costs */}
        <BudgetWidget />

        {/* AI Suggestions - With CTA */}
        <AISuggestionsCard />

        {/* Progress Tracker - With Global Progress */}
        <ProgressTracker />

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Szybkie akcje</Text>
          <QuickActions />
        </View>

        {/* Recent Activity */}
        <RecentActivity />
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
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerAvatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  headerEditIcon: {
    fontSize: 16,
    padding: spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  modalBtnCancel: {
    backgroundColor: colors.background.tertiary,
  },
  modalBtnCancelText: {
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  modalBtnSave: {
    backgroundColor: colors.primary.main,
  },
  modalBtnSaveText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
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
  budgetColumn: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  budgetValue: {
    fontSize: typography.fontSize.lg,
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
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  remainingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  aiCard: {
    backgroundColor: colors.primary.main + '10',
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  aiTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  aiDismiss: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    padding: spacing.xs,
  },
  aiText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  aiActionBtn: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  aiActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  // Global Progress styles
  globalProgress: {
    marginBottom: spacing.md,
  },
  globalProgressBar: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  globalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
  },
  globalProgressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'right',
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
  sectionStatusEmoji: {
    fontSize: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityContent: {
    flex: 1,
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
  activityArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
});
