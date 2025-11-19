import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { RootStackParamList, MediaAttachment } from '../types';
import { useNotesStore } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Media Toolbar
const MediaToolbar = ({
  onAddImage,
  onRecordAudio,
  onAddTag,
}: {
  onAddImage: () => void;
  onRecordAudio: () => void;
  onAddTag: () => void;
}) => {
  return (
    <View style={styles.toolbar}>
      <TouchableOpacity style={styles.toolbarBtn} onPress={onAddImage}>
        <Text style={styles.toolbarIcon}>📷</Text>
        <Text style={styles.toolbarText}>Zdjęcie</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolbarBtn} onPress={onRecordAudio}>
        <Text style={styles.toolbarIcon}>🎤</Text>
        <Text style={styles.toolbarText}>Audio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolbarBtn} onPress={onAddTag}>
        <Text style={styles.toolbarIcon}>#</Text>
        <Text style={styles.toolbarText}>Tag</Text>
      </TouchableOpacity>
    </View>
  );
};

// Media Preview
const MediaPreview = ({
  media,
  onRemove,
}: {
  media: MediaAttachment[];
  onRemove: (id: string) => void;
}) => {
  if (media.length === 0) return null;

  return (
    <View style={styles.mediaPreview}>
      <Text style={styles.mediaPreviewTitle}>Załączniki ({media.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {media.map((item) => (
          <View key={item.id} style={styles.mediaPreviewItem}>
            <View style={styles.mediaPreviewPlaceholder}>
              <Text style={styles.mediaPreviewIcon}>
                {item.type === 'image' ? '🖼️' : '🎵'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.mediaRemoveBtn}
              onPress={() => onRemove(item.id)}
            >
              <Text style={styles.mediaRemoveBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Tag Input
const TagInput = ({
  tags,
  onAddTag,
  onRemoveTag,
}: {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <View style={styles.tagInputContainer}>
      <Text style={styles.tagInputLabel}>Tagi</Text>
      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.tagChip}
            onPress={() => onRemoveTag(tag)}
          >
            <Text style={styles.tagChipText}>#{tag}</Text>
            <Text style={styles.tagChipRemove}>×</Text>
          </TouchableOpacity>
        ))}
        <TextInput
          style={styles.tagInput}
          placeholder="Dodaj tag..."
          placeholderTextColor={colors.text.tertiary}
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
        />
      </View>
    </View>
  );
};

export default function NoteEditorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { noteId, sectionId, projectId } = route.params as {
    noteId?: string;
    sectionId: string;
    projectId: string;
  };

  const { addNote } = useNotesStore();

  const isEditing = !!noteId;

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleAddImage = async () => {
    // In real app, use expo-image-picker
    Alert.alert(
      'Dodaj zdjęcie',
      'Wybierz źródło',
      [
        { text: 'Aparat', onPress: () => console.log('Camera') },
        { text: 'Galeria', onPress: () => console.log('Gallery') },
        { text: 'Anuluj', style: 'cancel' },
      ]
    );
  };

  const handleRecordAudio = () => {
    setIsRecording(!isRecording);
    // In real app, use expo-av for recording
  };

  const handleAddTag = (tag: string) => {
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleRemoveMedia = (id: string) => {
    setMedia(media.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Błąd', 'Treść notatki nie może być pusta');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      sectionId,
      projectId,
      content: content.trim(),
      media,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addNote(sectionId, newNote);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          {/* Content Input */}
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="Wpisz treść notatki..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              autoFocus={!isEditing}
            />
          </View>

          {/* Media Preview */}
          <MediaPreview media={media} onRemove={handleRemoveMedia} />

          {/* Tag Input */}
          <TagInput
            tags={tags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          {/* Recording indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Nagrywanie...</Text>
              <TouchableOpacity
                style={styles.stopRecordingBtn}
                onPress={handleRecordAudio}
              >
                <Text style={styles.stopRecordingBtnText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Toolbar */}
        <MediaToolbar
          onAddImage={handleAddImage}
          onRecordAudio={handleRecordAudio}
          onAddTag={() => {}}
        />

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>
              {isEditing ? 'Zapisz zmiany' : 'Dodaj notatkę'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: colors.surface.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  contentInput: {
    padding: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    minHeight: 200,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  mediaPreview: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  mediaPreviewTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  mediaPreviewItem: {
    position: 'relative',
    marginRight: spacing.md,
  },
  mediaPreviewPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreviewIcon: {
    fontSize: 24,
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaRemoveBtnText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  tagInputContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tagInputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
  },
  tagChipRemove: {
    fontSize: typography.fontSize.md,
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },
  tagInput: {
    flex: 1,
    minWidth: 100,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    padding: spacing.xs,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error + '15',
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.status.error,
    marginRight: spacing.sm,
  },
  recordingText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.status.error,
    fontWeight: typography.fontWeight.medium,
  },
  stopRecordingBtn: {
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  stopRecordingBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: colors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  toolbarBtn: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  toolbarIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  toolbarText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  saveContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  saveBtn: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
