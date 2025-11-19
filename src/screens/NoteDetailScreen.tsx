import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { RootStackParamList, Note } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock note data
const mockNote: Note = {
  id: '1',
  sectionId: 'electrical',
  projectId: 'default',
  content: `Spotkanie z elektrykiem Pan Marek z firmy ElektroPro.

Omówiliśmy szczegółowo rozmieszczenie gniazdek:
- Kuchnia: 8 gniazdek nad blatem, 2 pod blatem (zmywarka, lodówka)
- Salon: 6 gniazdek podwójnych wzdłuż ścian
- Sypialnia: 4 gniazdka przy łóżku + 2 przy biurku

Pan Marek zaproponował dodatkowy obwód dla AGD w kuchni - płyta indukcyjna wymaga osobnego zabezpieczenia 32A.

Wycena obejmuje:
- Kompletną wymianę instalacji z aluminium na miedź
- Nową rozdzielnię 3-rzędową
- Przewody YDY 3x2,5 i 3x1,5

Termin realizacji: 2 tygodnie od akceptacji wyceny.
Gwarancja: 5 lat na wykonanie.`,
  media: [
    {
      id: '1',
      type: 'image',
      url: 'https://placehold.co/400x300/2563EB/ffffff?text=Instalacja',
      thumbnailUrl: 'https://placehold.co/100x100/2563EB/ffffff?text=1',
      mimeType: 'image/jpeg',
      size: 245000,
      name: 'instalacja_kuchnia.jpg',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'image',
      url: 'https://placehold.co/400x300/F5A623/ffffff?text=Rozdzielnia',
      thumbnailUrl: 'https://placehold.co/100x100/F5A623/ffffff?text=2',
      mimeType: 'image/jpeg',
      size: 189000,
      name: 'rozdzielnia.jpg',
      createdAt: new Date().toISOString(),
    },
  ],
  audioTranscript: 'Pan Marek polecił sprawdzenie stanu licznika, może wymagać wymiany na nowy elektroniczny.',
  tags: ['gniazdka', 'kuchnia', 'AGD', 'ElektroPro'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function NoteDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { noteId, sectionId } = route.params as { noteId: string; sectionId: string };

  // In real app, fetch note by ID
  const note = mockNote;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <Text style={styles.date}>{formatDate(note.createdAt)}</Text>

        {/* Content */}
        <View style={styles.contentCard}>
          <Text style={styles.content}>{note.content}</Text>
        </View>

        {/* Media Gallery */}
        {note.media.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Załączniki ({note.media.length})</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mediaScroll}
            >
              {note.media.map((media) => (
                <TouchableOpacity key={media.id} style={styles.mediaItem}>
                  <View style={styles.mediaPlaceholder}>
                    <Text style={styles.mediaPlaceholderText}>
                      {media.type === 'image' ? '🖼️' : '🎵'}
                    </Text>
                  </View>
                  <Text style={styles.mediaName} numberOfLines={1}>
                    {media.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Audio Transcript */}
        {note.audioTranscript && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transkrypcja audio</Text>
            <View style={styles.transcriptCard}>
              <View style={styles.transcriptHeader}>
                <Text style={styles.transcriptIcon}>🎤</Text>
                <Text style={styles.transcriptLabel}>Automatyczna transkrypcja</Text>
              </View>
              <Text style={styles.transcriptText}>{note.audioTranscript}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tagi</Text>
            <View style={styles.tagsContainer}>
              {note.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('NoteEditor', {
                noteId: note.id,
                sectionId,
                projectId: note.projectId,
              })
            }
          >
            <Text style={styles.actionBtnText}>Edytuj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>
              Udostępnij
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>Usuń</Text>
          </TouchableOpacity>
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
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  contentCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  content: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  mediaScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  mediaItem: {
    marginRight: spacing.md,
    width: 100,
  },
  mediaPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholderText: {
    fontSize: 32,
  },
  mediaName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  transcriptCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transcriptIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  transcriptLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  transcriptText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontStyle: 'italic',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  actions: {
    marginTop: spacing['2xl'],
    marginBottom: spacing['3xl'],
  },
  actionBtn: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionBtnText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  actionBtnSecondary: {
    backgroundColor: colors.background.tertiary,
  },
  actionBtnTextSecondary: {
    color: colors.text.primary,
  },
  actionBtnDanger: {
    backgroundColor: colors.status.error + '10',
  },
  actionBtnTextDanger: {
    color: colors.status.error,
  },
});
