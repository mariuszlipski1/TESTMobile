import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors, spacing, sectionConfig } from '../theme';
import PropertyDetailsForm from '../components/PropertyDetailsForm';
import FileUploadZone from '../components/FileUploadZone';
import AIInspectionChecklist from '../components/AIInspectionChecklist';
import InspectionPhotoGallery from '../components/InspectionPhotoGallery';
import {
  PropertyData,
  InspectionChecklistItem,
  InspectionPhoto,
} from '../types';

// Mock data for demo - w rzeczywistej aplikacji z API
const generateMockChecklist = (propertyData: PropertyData): InspectionChecklistItem[] => {
  const items: InspectionChecklistItem[] = [
    // Hydraulika
    {
      id: '1',
      category: 'hydraulika',
      task: 'Sprawdź stan pionów wodno-kanalizacyjnych',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      category: 'hydraulika',
      task: 'Zweryfikuj ciśnienie wody w punktach poboru',
      priority: 'medium',
      completed: false,
    },
    {
      id: '3',
      category: 'hydraulika',
      task: 'Sprawdź szczelność zaworów odcinających',
      priority: 'high',
      completed: false,
    },

    // Elektryka
    {
      id: '4',
      category: 'elektryka',
      task: 'Zlokalizuj i sprawdź tablicę rozdzielczą',
      priority: 'high',
      completed: false,
    },
    {
      id: '5',
      category: 'elektryka',
      task: 'Zweryfikuj typ instalacji (aluminium/miedź)',
      priority: 'high',
      completed: false,
    },
    {
      id: '6',
      category: 'elektryka',
      task: 'Sprawdź działanie wszystkich gniazdek',
      priority: 'medium',
      completed: false,
    },

    // Konstrukcja
    {
      id: '7',
      category: 'konstrukcja',
      task: 'Sprawdź ściany pod kątem pęknięć i wilgoci',
      priority: 'high',
      completed: false,
    },
    {
      id: '8',
      category: 'konstrukcja',
      task: 'Zweryfikuj stan sufitów - plamy, ugięcia',
      priority: 'medium',
      completed: false,
    },
    {
      id: '9',
      category: 'konstrukcja',
      task: 'Sprawdź poziom podłóg',
      priority: 'medium',
      completed: false,
    },

    // Stolarka
    {
      id: '10',
      category: 'stolarka',
      task: 'Sprawdź stan okien i ich szczelność',
      priority: 'medium',
      completed: false,
    },
    {
      id: '11',
      category: 'stolarka',
      task: 'Zweryfikuj działanie drzwi wewnętrznych',
      priority: 'low',
      completed: false,
    },

    // Wentylacja
    {
      id: '12',
      category: 'wentylacja',
      task: 'Sprawdź ciąg w kratach wentylacyjnych',
      priority: 'high',
      completed: false,
    },
    {
      id: '13',
      category: 'wentylacja',
      task: 'Zweryfikuj stan nawiewników okiennych',
      priority: 'medium',
      completed: false,
    },
  ];

  // Dodaj dodatkowe punkty dla starszych budynków
  if (propertyData.year < 1990) {
    items.push({
      id: '14',
      category: 'inne',
      task: 'Sprawdź możliwość występowania azbestu w materiałach budowlanych',
      priority: 'high',
      completed: false,
    });
  }

  // Dodaj punkt dla budynków bez windy na wysokich piętrach
  if (!propertyData.hasElevator && propertyData.floor > 3) {
    items.push({
      id: '15',
      category: 'inne',
      task: 'Zaplanuj logistykę transportu materiałów (brak windy)',
      priority: 'medium',
      completed: false,
    });
  }

  // Rynek wtórny - dodatkowe sprawdzenia
  if (propertyData.marketType === 'secondary') {
    items.push({
      id: '16',
      category: 'inne',
      task: 'Poproś o dokumentację poprzednich remontów',
      priority: 'medium',
      completed: false,
    });
  }

  return items;
};

export default function PlanScreen() {
  const route = useRoute();
  const projectId = (route.params as { projectId?: string })?.projectId || 'default';

  // State
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [floorPlanUri, setFloorPlanUri] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<InspectionChecklistItem[]>([]);
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handlers
  const handlePropertySave = useCallback(async (data: PropertyData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPropertyData(data);

      // Auto-generate checklist after saving property data
      if (checklistItems.length === 0) {
        handleGenerateChecklist(data);
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zapisać danych');
    } finally {
      setIsSaving(false);
    }
  }, [checklistItems.length]);

  const handleFloorPlanSelected = useCallback(async (uri: string, type: string) => {
    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setFloorPlanUri(uri);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się przesłać pliku');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFloorPlanRemoved = useCallback(() => {
    setFloorPlanUri(null);
  }, []);

  const handleGenerateChecklist = useCallback(async (data?: PropertyData) => {
    const dataToUse = data || propertyData;
    if (!dataToUse) {
      Alert.alert('Brak danych', 'Najpierw wypełnij dane nieruchomości');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation (in real app - call Claude API)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const generatedItems = generateMockChecklist(dataToUse);
      setChecklistItems(generatedItems);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wygenerować checklisty');
    } finally {
      setIsGenerating(false);
    }
  }, [propertyData]);

  const handleItemToggle = useCallback((itemId: string, completed: boolean) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
            }
          : item
      )
    );
  }, []);

  const handleItemNoteChange = useCallback((itemId: string, notes: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  }, []);

  const handleAddPhotoToItem = useCallback((itemId: string) => {
    // In real app, open photo picker and associate with item
    Alert.alert('Dodaj zdjęcie', `Zdjęcie zostanie przypisane do punktu checklisty`);
  }, []);

  const handleAddPhoto = useCallback(async (uri: string, checklistItemId?: string) => {
    const newPhoto: InspectionPhoto = {
      id: Date.now().toString(),
      projectId,
      photoUrl: uri,
      thumbnailUrl: uri,
      checklistItemId,
      createdAt: new Date().toISOString(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
  }, [projectId]);

  const handleRemovePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }, []);

  const handlePhotoPress = useCallback((photo: InspectionPhoto) => {
    // In real app, open full-screen viewer
    Alert.alert('Podgląd', `Zdjęcie: ${photo.id}`);
  }, []);

  const config = sectionConfig.plan;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Header */}
        <View style={[styles.header, { backgroundColor: config.color + '15' }]}>
          <View style={[styles.headerIcon, { backgroundColor: config.color }]}>
            <View style={styles.headerIconText} />
          </View>
          <View>
            <View style={styles.headerTitleRow}>
              <View
                style={[styles.headerIconSmall, { backgroundColor: config.color }]}
              />
              <View style={styles.headerTextContainer}>
                <View style={styles.headerTitle} />
              </View>
            </View>
          </View>
        </View>

        {/* 1. Property Details Form */}
        <View style={styles.section}>
          <PropertyDetailsForm
            initialData={propertyData || undefined}
            onSave={handlePropertySave}
            isLoading={isSaving}
          />
        </View>

        {/* 2. Floor Plan Upload */}
        <View style={styles.section}>
          <FileUploadZone
            currentFileUrl={floorPlanUri || undefined}
            onFileSelected={handleFloorPlanSelected}
            onFileRemoved={handleFloorPlanRemoved}
            isLoading={isUploading}
          />
        </View>

        {/* 3. AI Inspection Checklist */}
        <View style={[styles.section, styles.checklistSection]}>
          <AIInspectionChecklist
            items={checklistItems}
            onItemToggle={handleItemToggle}
            onItemNoteChange={handleItemNoteChange}
            onAddPhoto={handleAddPhotoToItem}
            onRegenerate={() => handleGenerateChecklist()}
            isGenerating={isGenerating}
          />
        </View>

        {/* 4. Inspection Photos Gallery */}
        <View style={styles.section}>
          <InspectionPhotoGallery
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onPhotoPress={handlePhotoPress}
          />
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
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  headerIconText: {
    // Placeholder
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  headerTextContainer: {
    // Placeholder
  },
  headerTitle: {
    // Placeholder
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  checklistSection: {
    minHeight: 400,
  },
});
