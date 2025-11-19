import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { MediaAttachment } from '../types';

interface ContractorNotesEditorProps {
  onSave: (content: string, media: MediaAttachment[], tags: string[]) => void;
  initialContent?: string;
  initialTags?: string[];
  sectionColor?: string;
}

// Formatting Toolbar
const FormattingToolbar = ({
  onBold,
  onItalic,
  onList,
  onAddImage,
  onRecordAudio,
}: {
  onBold: () => void;
  onItalic: () => void;
  onList: () => void;
  onAddImage: () => void;
  onRecordAudio: () => void;
}) => {
  return (
    <View style={styles.toolbar}>
      <TouchableOpacity style={styles.toolbarBtn} onPress={onBold}>
        <Text style={styles.toolbarBtnText}>B</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolbarBtn} onPress={onItalic}>
        <Text style={[styles.toolbarBtnText, styles.italic]}>I</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolbarBtn} onPress={onList}>
        <Text style={styles.toolbarIcon}>•</Text>
      </TouchableOpacity>
      <View style={styles.toolbarDivider} />
      <TouchableOpacity style={styles.toolbarBtn} onPress={onAddImage}>
        <Text style={styles.toolbarIcon}>📷</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolbarBtn} onPress={onRecordAudio}>
        <Text style={styles.toolbarIcon}>🎤</Text>
      </TouchableOpacity>
    </View>
  );
};

// Tag Autocomplete Suggestions
const TAG_SUGGESTIONS: Record<string, string[]> = {
  electrical: ['gniazdka', 'przewody', 'bezpieczniki', 'tablica', 'oświetlenie', 'smart-home'],
  plumbing: ['piony', 'ciśnienie', 'ogrzewanie', 'rury', 'zawory', 'bojler'],
  carpentry: ['drzwi', 'futryny', 'podłogi', 'parkiet', 'listwy', 'szafy'],
  finishing: ['malowanie', 'gładzie', 'panele', 'tapety', 'płytki', 'fuga'],
};

// Tag Input with Autocomplete
const TagInputWithAutocomplete = ({
  tags,
  onAddTag,
  onRemoveTag,
  sectionType,
}: {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  sectionType?: string;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = sectionType ? TAG_SUGGESTIONS[sectionType] || [] : [];
  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      onAddTag(tag.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  return (
    <View style={styles.tagInputContainer}>
      <View style={styles.tagsWrapper}>
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
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            setShowSuggestions(text.length > 0);
          }}
          onSubmitEditing={() => handleAddTag(inputValue)}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
      </View>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionItem}
              onPress={() => handleAddTag(suggestion)}
            >
              <Text style={styles.suggestionText}>#{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Media Gallery
const MediaGallery = ({
  media,
  onRemove,
}: {
  media: MediaAttachment[];
  onRemove: (id: string) => void;
}) => {
  if (media.length === 0) return null;

  return (
    <View style={styles.mediaGallery}>
      <Text style={styles.mediaGalleryTitle}>
        Załączniki ({media.length})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {media.map((item) => (
          <View key={item.id} style={styles.mediaItem}>
            {item.type === 'image' && item.url ? (
              <Image source={{ uri: item.url }} style={styles.mediaImage} />
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Text style={styles.mediaPlaceholderIcon}>
                  {item.type === 'image' ? '🖼️' : item.type === 'audio' ? '🎵' : '📄'}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.mediaRemoveBtn}
              onPress={() => onRemove(item.id)}
            >
              <Text style={styles.mediaRemoveBtnText}>×</Text>
            </TouchableOpacity>
            {item.type === 'audio' && (
              <View style={styles.audioIndicator}>
                <Text style={styles.audioIndicatorText}>Audio</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default function ContractorNotesEditor({
  onSave,
  initialContent = '',
  initialTags = [],
  sectionColor = colors.primary.main,
}: ContractorNotesEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isRecording, setIsRecording] = useState(false);

  const handleBold = useCallback(() => {
    setContent((prev) => prev + '**tekst**');
  }, []);

  const handleItalic = useCallback(() => {
    setContent((prev) => prev + '*tekst*');
  }, []);

  const handleList = useCallback(() => {
    setContent((prev) => prev + '\n- ');
  }, []);

  const handleAddImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Brak uprawnień', 'Potrzebujemy dostępu do galerii');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newMedia: MediaAttachment = {
        id: Date.now().toString(),
        type: 'image',
        url: asset.uri,
        thumbnailUrl: asset.uri,
        mimeType: 'image/jpeg',
        size: asset.fileSize || 0,
        name: `image_${Date.now()}.jpg`,
        createdAt: new Date().toISOString(),
      };
      setMedia((prev) => [...prev, newMedia]);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Brak uprawnień', 'Potrzebujemy dostępu do aparatu');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newMedia: MediaAttachment = {
        id: Date.now().toString(),
        type: 'image',
        url: asset.uri,
        thumbnailUrl: asset.uri,
        mimeType: 'image/jpeg',
        size: asset.fileSize || 0,
        name: `photo_${Date.now()}.jpg`,
        createdAt: new Date().toISOString(),
      };
      setMedia((prev) => [...prev, newMedia]);
    }
  }, []);

  const handleRecordAudio = useCallback(() => {
    // Toggle recording state
    setIsRecording((prev) => !prev);

    if (!isRecording) {
      // Start recording - in production, use expo-av
      Alert.alert(
        'Nagrywanie',
        'Nagrywanie audio rozpoczęte. Kliknij ponownie, aby zatrzymać.'
      );
    } else {
      // Stop recording and add to media
      const newMedia: MediaAttachment = {
        id: Date.now().toString(),
        type: 'audio',
        url: '',
        mimeType: 'audio/m4a',
        size: 0,
        name: `audio_${Date.now()}.m4a`,
        createdAt: new Date().toISOString(),
      };
      setMedia((prev) => [...prev, newMedia]);
    }
  }, [isRecording]);

  const handleRemoveMedia = useCallback((id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleAddTag = useCallback((tag: string) => {
    setTags((prev) => [...prev, tag]);
  }, []);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleSave = useCallback(() => {
    if (!content.trim()) {
      Alert.alert('Błąd', 'Treść notatki nie może być pusta');
      return;
    }
    onSave(content.trim(), media, tags);
  }, [content, media, tags, onSave]);

  return (
    <View style={styles.container}>
      {/* Formatting Toolbar */}
      <FormattingToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onList={handleList}
        onAddImage={() => {
          Alert.alert(
            'Dodaj zdjęcie',
            'Wybierz źródło',
            [
              { text: 'Aparat', onPress: handleTakePhoto },
              { text: 'Galeria', onPress: handleAddImage },
              { text: 'Anuluj', style: 'cancel' },
            ]
          );
        }}
        onRecordAudio={handleRecordAudio}
      />

      {/* Content Editor */}
      <View style={styles.editorContainer}>
        <TextInput
          style={styles.editor}
          placeholder="Wpisz notatkę z rozmowy z fachowcem..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />
      </View>

      {/* Recording Indicator */}
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

      {/* Media Gallery */}
      <MediaGallery media={media} onRemove={handleRemoveMedia} />

      {/* Tags */}
      <View style={styles.tagsSection}>
        <Text style={styles.tagsSectionTitle}>Tagi</Text>
        <TagInputWithAutocomplete
          tags={tags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          sectionType="electrical"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: sectionColor }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Zapisz notatkę</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: colors.surface.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  toolbarBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  toolbarBtnText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  italic: {
    fontStyle: 'italic',
  },
  toolbarIcon: {
    fontSize: 18,
  },
  toolbarDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  editorContainer: {
    backgroundColor: colors.surface.primary,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  editor: {
    padding: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    minHeight: 150,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error + '15',
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
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
  mediaGallery: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  mediaGalleryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  mediaItem: {
    position: 'relative',
    marginRight: spacing.md,
  },
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  mediaPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholderIcon: {
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
  audioIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
  },
  audioIndicatorText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  tagsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  tagsSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  tagInputContainer: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: spacing.sm,
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
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    padding: spacing.sm,
  },
  suggestionItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
  },
  saveButton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
