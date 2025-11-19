import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows, sectionConfig } from '../theme';
import { useNotesStore, useEstimatesStore } from '../store';
import { Note, RootStackParamList, SectionType } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Tab selector
const TabSelector = ({
  activeTab,
  onTabChange,
}: {
  activeTab: 'notes' | 'estimates' | 'ai';
  onTabChange: (tab: 'notes' | 'estimates' | 'ai') => void;
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
        onPress={() => onTabChange('notes')}
      >
        <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
          Notatki
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'estimates' && styles.tabActive]}
        onPress={() => onTabChange('estimates')}
      >
        <Text style={[styles.tabText, activeTab === 'estimates' && styles.tabTextActive]}>
          Wyceny
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'ai' && styles.tabActive]}
        onPress={() => onTabChange('ai')}
      >
        <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>
          AI
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Note Item Component
const NoteItem = ({ note, onPress }: { note: Note; onPress: () => void }) => {
  const hasMedia = note.media && note.media.length > 0;
  const hasTags = note.tags && note.tags.length > 0;

  return (
    <TouchableOpacity style={styles.noteItem} onPress={onPress}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteDate}>
          {new Date(note.createdAt).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {hasMedia && (
          <View style={styles.mediaIndicator}>
            <Text style={styles.mediaIndicatorText}>
              {note.media.length} 📎
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.noteContent} numberOfLines={3}>
        {note.content}
      </Text>
      {hasTags && (
        <View style={styles.tagContainer}>
          {note.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Notes List
const NotesList = ({
  sectionId,
  projectId,
}: {
  sectionId: string;
  projectId: string;
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { notesBySection } = useNotesStore();
  const notes = notesBySection[sectionId] || [];

  // Mock data for demo
  const mockNotes: Note[] = notes.length > 0 ? notes : [
    {
      id: '1',
      sectionId,
      projectId,
      content: 'Spotkanie z elektrykiem Pan Marek. Omówiliśmy rozmieszczenie gniazdek w kuchni i salonie. Zaproponował dodatkowy obwód dla AGD.',
      media: [{ id: '1', type: 'image', url: '', thumbnailUrl: '', mimeType: 'image/jpeg', size: 1000, name: 'instalacja.jpg', createdAt: new Date().toISOString() }],
      tags: ['gniazdka', 'kuchnia', 'AGD'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      sectionId,
      projectId,
      content: 'Notatka z inspekcji przewodów. Stara instalacja aluminiowa - wymaga całkowitej wymiany.',
      media: [],
      tags: ['inspekcja', 'aluminium'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <FlatList
      data={mockNotes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NoteItem
          note={item}
          onPress={() => navigation.navigate('NoteDetail', { noteId: item.id, sectionId })}
        />
      )}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📝</Text>
          <Text style={styles.emptyStateText}>Brak notatek</Text>
          <Text style={styles.emptyStateSubtext}>
            Dodaj pierwszą notatkę w tej sekcji
          </Text>
        </View>
      }
    />
  );
};

// Estimates List
const EstimatesList = ({ sectionId }: { sectionId: string }) => {
  const { estimatesBySection } = useEstimatesStore();
  const estimates = estimatesBySection[sectionId] || [];

  // Mock data for demo
  const mockEstimates = [
    {
      id: '1',
      contractorName: 'ElektroPro Sp. z o.o.',
      totalAmount: 28500,
      isAccepted: true,
    },
    {
      id: '2',
      contractorName: 'Pan Janusz - Elektryka',
      totalAmount: 32000,
      isAccepted: false,
    },
  ];

  return (
    <View style={styles.estimatesList}>
      {mockEstimates.map((estimate) => (
        <TouchableOpacity key={estimate.id} style={styles.estimateItem}>
          <View style={styles.estimateHeader}>
            <Text style={styles.estimateContractor}>{estimate.contractorName}</Text>
            {estimate.isAccepted && (
              <View style={styles.acceptedBadge}>
                <Text style={styles.acceptedBadgeText}>✓ Zaakceptowana</Text>
              </View>
            )}
          </View>
          <Text style={styles.estimateAmount}>
            {estimate.totalAmount.toLocaleString()} zł
          </Text>
          <TouchableOpacity style={styles.analyzeBtn}>
            <Text style={styles.analyzeBtnText}>Analizuj z AI</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// AI Panel
const AIPanel = ({ sectionType }: { sectionType: SectionType }) => {
  const questions = [
    'Czy elektryka spełnia normę PN-HD 60364?',
    'Ile obwodów powinno być w kuchni?',
    'Jaka powinna być grubość przewodów do AGD?',
    'Czy warto inwestować w smart home?',
    'Na co zwrócić uwagę przy gwarancji?',
  ];

  return (
    <View style={styles.aiPanel}>
      <View style={styles.aiPanelHeader}>
        <Text style={styles.aiPanelTitle}>Pytania do fachowca</Text>
        <Text style={styles.aiPanelSubtitle}>
          Wygenerowane na podstawie Twojego projektu
        </Text>
      </View>
      {questions.map((question, index) => (
        <TouchableOpacity key={index} style={styles.questionItem}>
          <Text style={styles.questionNumber}>{index + 1}</Text>
          <Text style={styles.questionText}>{question}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.regenerateBtn}>
        <Text style={styles.regenerateBtnText}>Wygeneruj nowe pytania</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function SectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState<'notes' | 'estimates' | 'ai'>('notes');

  // Determine section type from route name
  const routeName = route.name.toLowerCase();
  const sectionTypeMap: Record<string, SectionType> = {
    plan: 'plan',
    electrical: 'electrical',
    plumbing: 'plumbing',
    carpentry: 'carpentry',
    finishing: 'finishing',
    costs: 'costs',
  };
  const sectionType: SectionType = sectionTypeMap[routeName] || 'electrical';

  const config = sectionConfig[sectionType];
  const projectId = (route.params as { projectId?: string })?.projectId || 'default';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: config.color + '15' }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: config.color }]}>
            <Text style={styles.headerIconText}>{config.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{config.name}</Text>
            <Text style={styles.headerSubtitle}>2 notatki • 2 wyceny</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'notes' && (
          <NotesList sectionId={sectionType} projectId={projectId} />
        )}
        {activeTab === 'estimates' && <EstimatesList sectionId={sectionType} />}
        {activeTab === 'ai' && <AIPanel sectionType={sectionType} />}
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: config.color }]}
        onPress={() =>
          navigation.navigate('NoteEditor', {
            sectionId: sectionType,
            projectId,
          })
        }
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerIconText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  noteItem: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noteDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  mediaIndicator: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  mediaIndicatorText: {
    fontSize: typography.fontSize.xs,
  },
  noteContent: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
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
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  estimatesList: {
    padding: spacing.lg,
  },
  estimateItem: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  estimateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  estimateContractor: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  acceptedBadge: {
    backgroundColor: colors.status.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  acceptedBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.status.success,
    fontWeight: typography.fontWeight.medium,
  },
  estimateAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  analyzeBtn: {
    backgroundColor: colors.primary.main + '10',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  analyzeBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  aiPanel: {
    padding: spacing.lg,
  },
  aiPanelHeader: {
    marginBottom: spacing.lg,
  },
  aiPanelTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  aiPanelSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  questionNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginRight: spacing.md,
    width: 20,
  },
  questionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  regenerateBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
  },
  regenerateBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabText: {
    fontSize: 28,
    color: colors.text.inverse,
    fontWeight: '300',
  },
});
