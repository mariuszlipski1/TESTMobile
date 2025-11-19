import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { InspectionChecklistItem, PropertyData } from '../types';

interface AIInspectionChecklistProps {
  items: InspectionChecklistItem[];
  onItemToggle: (itemId: string, completed: boolean) => void;
  onItemNoteChange: (itemId: string, note: string) => void;
  onAddPhoto: (itemId: string) => void;
  onRegenerate: () => void;
  isGenerating?: boolean;
  isLoading?: boolean;
}

// Ikony kategorii
const categoryIcons: Record<string, string> = {
  hydraulika: '🔧',
  elektryka: '⚡',
  konstrukcja: '🏗️',
  stolarka: '🪟',
  wentylacja: '💨',
  inne: '📋',
};

// Kolory priorytetów
const priorityColors: Record<string, string> = {
  high: colors.status.error,
  medium: colors.status.warning,
  low: colors.status.info,
};

// Pojedynczy element checklisty
const ChecklistItemRow = ({
  item,
  onToggle,
  onNoteChange,
  onAddPhoto,
}: {
  item: InspectionChecklistItem;
  onToggle: (completed: boolean) => void;
  onNoteChange: (note: string) => void;
  onAddPhoto: () => void;
}) => {
  const [showNote, setShowNote] = useState(!!item.notes);
  const [noteText, setNoteText] = useState(item.notes || '');

  const handleNoteBlur = () => {
    if (noteText !== item.notes) {
      onNoteChange(noteText);
    }
  };

  return (
    <View style={styles.checklistItem}>
      <TouchableOpacity
        style={styles.checklistItemMain}
        onPress={() => onToggle(!item.completed)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            item.completed && styles.checkboxChecked,
          ]}
        >
          {item.completed && <Text style={styles.checkboxIcon}>✓</Text>}
        </View>
        <View style={styles.checklistItemContent}>
          <View style={styles.checklistItemHeader}>
            <Text style={styles.categoryIcon}>
              {categoryIcons[item.category] || '📋'}
            </Text>
            <Text style={styles.categoryName}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColors[item.priority] + '20' },
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: priorityColors[item.priority] },
                ]}
              />
            </View>
          </View>
          <Text
            style={[
              styles.checklistItemTask,
              item.completed && styles.checklistItemTaskCompleted,
            ]}
          >
            {item.task}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.checklistItemActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowNote(!showNote)}
        >
          <Text style={styles.actionBtnText}>
            {showNote ? '📝' : '➕ Notatka'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onAddPhoto}>
          <Text style={styles.actionBtnText}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Note input */}
      {showNote && (
        <TextInput
          style={styles.noteInput}
          placeholder="Dodaj notatkę..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          value={noteText}
          onChangeText={setNoteText}
          onBlur={handleNoteBlur}
        />
      )}
    </View>
  );
};

export default function AIInspectionChecklist({
  items,
  onItemToggle,
  onItemNoteChange,
  onAddPhoto,
  onRegenerate,
  isGenerating = false,
  isLoading = false,
}: AIInspectionChecklistProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Grupowanie po kategorii
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InspectionChecklistItem[]>);

  if (isGenerating) {
    return (
      <View style={styles.container}>
        <View style={styles.generatingState}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.generatingText}>
            AI generuje checklistę inspekcji...
          </Text>
          <Text style={styles.generatingSubtext}>
            To może potrwać kilka sekund
          </Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📋</Text>
          <Text style={styles.emptyStateText}>Brak checklisty</Text>
          <Text style={styles.emptyStateSubtext}>
            Wypełnij dane nieruchomości i wygeneruj checklistę
          </Text>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={onRegenerate}
            disabled={isLoading}
          >
            <Text style={styles.generateBtnText}>Generuj checklistę</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Checklista inspekcji</Text>
          <Text style={styles.subtitle}>
            {completedCount}/{totalCount} punktów sprawdzonych
          </Text>
        </View>
        <TouchableOpacity
          style={styles.regenerateBtn}
          onPress={onRegenerate}
          disabled={isLoading}
        >
          <Text style={styles.regenerateBtnText}>🔄 Regeneruj</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              progress === 100 && styles.progressComplete,
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Checklist items grouped by category */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <View key={category} style={styles.categoryGroup}>
            <Text style={styles.categoryTitle}>
              {categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            {categoryItems.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onToggle={(completed) => onItemToggle(item.id, completed)}
                onNoteChange={(note) => onItemNoteChange(item.id, note)}
                onAddPhoto={() => onAddPhoto(item.id)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  regenerateBtn: {
    padding: spacing.sm,
  },
  regenerateBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
  },
  progressComplete: {
    backgroundColor: colors.status.success,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    minWidth: 40,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  checklistItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checklistItemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  checkboxIcon: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  checklistItemContent: {
    flex: 1,
  },
  checklistItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  categoryName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  checklistItemTask: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  checklistItemTaskCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
  },
  checklistItemActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingLeft: 40,
  },
  actionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  actionBtnText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  noteInput: {
    marginTop: spacing.sm,
    marginLeft: 40,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  generatingState: {
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  generatingText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  generatingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  generateBtn: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  generateBtnText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
