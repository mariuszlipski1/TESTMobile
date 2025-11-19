import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface FileUploadZoneProps {
  currentFileUrl?: string;
  onFileSelected: (uri: string, type: string) => void;
  onFileRemoved?: () => void;
  isLoading?: boolean;
  maxSizeMB?: number;
}

export default function FileUploadZone({
  currentFileUrl,
  onFileSelected,
  onFileRemoved,
  isLoading = false,
  maxSizeMB = 10,
}: FileUploadZoneProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(currentFileUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);

  const pickDocument = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Brak uprawnień',
          'Potrzebujemy dostępu do galerii, aby wybrać plik'
        );
        return;
      }

      // Pick image (for floor plans)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (approximate)
        if (asset.fileSize && asset.fileSize > maxSizeMB * 1024 * 1024) {
          Alert.alert(
            'Plik za duży',
            `Maksymalny rozmiar pliku to ${maxSizeMB} MB`
          );
          return;
        }

        setPreviewUri(asset.uri);
        setFileName(asset.fileName || 'rzut_mieszkania');
        onFileSelected(asset.uri, asset.mimeType || 'image/jpeg');
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wybrać pliku');
    }
  };

  const handleRemove = () => {
    setPreviewUri(null);
    setFileName(null);
    onFileRemoved?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rzut mieszkania</Text>
      <Text style={styles.subtitle}>
        Dodaj rzut, aby AI mógł lepiej przygotować checklistę
      </Text>

      {!previewUri ? (
        <TouchableOpacity
          style={styles.uploadZone}
          onPress={pickDocument}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary.main} />
          ) : (
            <>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Przeciągnij plik tutaj</Text>
              <Text style={styles.uploadSubtext}>lub kliknij, aby wybrać</Text>
              <Text style={styles.uploadFormats}>PDF, JPG, PNG (max {maxSizeMB} MB)</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: previewUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewFileName} numberOfLines={1}>
              {fileName}
            </Text>
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.previewBtn}
                onPress={pickDocument}
                disabled={isLoading}
              >
                <Text style={styles.previewBtnText}>Zmień</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewBtn, styles.previewBtnDanger]}
                onPress={handleRemove}
                disabled={isLoading}
              >
                <Text style={[styles.previewBtnText, styles.previewBtnTextDanger]}>
                  Usuń
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {previewUri && (
        <View style={styles.aiHint}>
          <Text style={styles.aiHintIcon}>AI</Text>
          <Text style={styles.aiHintText}>
            AI przeanalizuje rzut i dostosuje checklistę
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
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
    marginBottom: spacing.lg,
  },
  uploadZone: {
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  uploadText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  uploadSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  uploadFormats: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.md,
  },
  previewContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.tertiary,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewOverlay: {
    padding: spacing.md,
    backgroundColor: colors.surface.primary,
  },
  previewFileName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  previewActions: {
    flexDirection: 'row',
  },
  previewBtn: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  previewBtnDanger: {
    backgroundColor: colors.status.error + '15',
  },
  previewBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  previewBtnTextDanger: {
    color: colors.status.error,
  },
  aiHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.sm,
  },
  aiHintIcon: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface.primary,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  aiHintText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    flex: 1,
  },
});
