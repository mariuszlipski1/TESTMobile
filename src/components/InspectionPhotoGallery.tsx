import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { InspectionPhoto } from '../types';

interface InspectionPhotoGalleryProps {
  photos: InspectionPhoto[];
  onAddPhoto: (uri: string, checklistItemId?: string) => void;
  onRemovePhoto: (photoId: string) => void;
  onPhotoPress: (photo: InspectionPhoto) => void;
  isLoading?: boolean;
  maxPhotos?: number;
}

export default function InspectionPhotoGallery({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onPhotoPress,
  isLoading = false,
  maxPhotos = 20,
}: InspectionPhotoGalleryProps) {
  const canAddMore = photos.length < maxPhotos;

  const handleAddPhoto = async () => {
    if (!canAddMore) {
      Alert.alert('Limit osiągnięty', `Maksymalna liczba zdjęć to ${maxPhotos}`);
      return;
    }

    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Brak uprawnień',
          'Potrzebujemy dostępu do kamery i galerii'
        );
        return;
      }

      // Show action sheet
      Alert.alert(
        'Dodaj zdjęcie',
        'Wybierz źródło',
        [
          {
            text: 'Aparat',
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
                allowsEditing: true,
              });
              if (!result.canceled && result.assets[0]) {
                onAddPhoto(result.assets[0].uri);
              }
            },
          },
          {
            text: 'Galeria',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: maxPhotos - photos.length,
              });
              if (!result.canceled) {
                result.assets.forEach((asset) => {
                  onAddPhoto(asset.uri);
                });
              }
            },
          },
          { text: 'Anuluj', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać zdjęcia');
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    Alert.alert(
      'Usuń zdjęcie',
      'Czy na pewno chcesz usunąć to zdjęcie?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => onRemovePhoto(photoId),
        },
      ]
    );
  };

  const renderPhotoItem = ({ item }: { item: InspectionPhoto }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => onPhotoPress(item)}
      onLongPress={() => handleRemovePhoto(item.id)}
    >
      <Image
        source={{ uri: item.thumbnailUrl || item.photoUrl }}
        style={styles.photoImage}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemovePhoto(item.id)}
      >
        <Text style={styles.removeBtnText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAddButton = () => (
    <TouchableOpacity
      style={styles.addPhotoBtn}
      onPress={handleAddPhoto}
      disabled={isLoading || !canAddMore}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary.main} />
      ) : (
        <>
          <Text style={styles.addPhotoIcon}>+</Text>
          <Text style={styles.addPhotoText}>Dodaj</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Zdjęcia inspekcyjne</Text>
        <Text style={styles.counter}>
          {photos.length}/{maxPhotos}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        Dokumentuj stan mieszkania przed remontem
      </Text>

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={handleAddPhoto}
            disabled={isLoading}
          >
            <Text style={styles.emptyAddIcon}>📷</Text>
            <Text style={styles.emptyAddText}>Dodaj pierwsze zdjęcie</Text>
            <Text style={styles.emptyAddSubtext}>
              Zrób zdjęcie lub wybierz z galerii
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.galleryContainer}>
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id}
            renderItem={renderPhotoItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContent}
            ListFooterComponent={canAddMore ? renderAddButton : null}
          />
        </View>
      )}

      <Text style={styles.hint}>
        Przytrzymaj zdjęcie, aby je usunąć
      </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  counter: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyAddBtn: {
    width: '100%',
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  emptyAddIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyAddText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  emptyAddSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  galleryContainer: {
    marginHorizontal: -spacing.lg,
  },
  galleryContent: {
    paddingHorizontal: spacing.lg,
  },
  photoItem: {
    width: 100,
    height: 100,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  addPhotoIcon: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
  addPhotoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
