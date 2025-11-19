import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { EstimateItem } from '../types';

interface EstimateUploaderProps {
  sectionId: string;
  projectId: string;
  onEstimateCreated: (estimate: {
    contractorName: string;
    totalAmount: number;
    items: EstimateItem[];
    fileUrl: string;
  }) => void;
  sectionColor?: string;
}

// Parsed Estimate Display
const ParsedEstimateDisplay = ({
  items,
  totalAmount,
  onItemEdit,
}: {
  items: EstimateItem[];
  totalAmount: number;
  onItemEdit: (index: number, field: string, value: string | number) => void;
}) => {
  return (
    <View style={styles.parsedEstimate}>
      <Text style={styles.parsedEstimateTitle}>Wyciągnięte pozycje</Text>
      {items.map((item, index) => (
        <View key={item.id} style={styles.estimateItemRow}>
          <View style={styles.estimateItemInfo}>
            <Text style={styles.estimateItemName}>{item.name}</Text>
            <Text style={styles.estimateItemDetails}>
              {item.quantity} {item.unit} × {item.unitPrice.toLocaleString()} zł
            </Text>
          </View>
          <Text style={styles.estimateItemPrice}>
            {item.totalPrice.toLocaleString()} zł
          </Text>
        </View>
      ))}
      <View style={styles.estimateTotalRow}>
        <Text style={styles.estimateTotalLabel}>RAZEM</Text>
        <Text style={styles.estimateTotalValue}>
          {totalAmount.toLocaleString()} zł
        </Text>
      </View>
    </View>
  );
};

// Manual Entry Form
const ManualEntryForm = ({
  onSubmit,
}: {
  onSubmit: (name: string, amount: number) => void;
}) => {
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');

  const handleAdd = () => {
    if (itemName.trim() && itemAmount) {
      onSubmit(itemName.trim(), parseFloat(itemAmount));
      setItemName('');
      setItemAmount('');
    }
  };

  return (
    <View style={styles.manualEntry}>
      <Text style={styles.manualEntryTitle}>Dodaj pozycję ręcznie</Text>
      <View style={styles.manualEntryRow}>
        <TextInput
          style={[styles.manualInput, styles.manualInputName]}
          placeholder="Nazwa pozycji"
          placeholderTextColor={colors.text.tertiary}
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={[styles.manualInput, styles.manualInputAmount]}
          placeholder="Kwota"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numeric"
          value={itemAmount}
          onChangeText={setItemAmount}
        />
        <TouchableOpacity style={styles.manualAddBtn} onPress={handleAdd}>
          <Text style={styles.manualAddBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function EstimateUploader({
  sectionId,
  projectId,
  onEstimateCreated,
  sectionColor = colors.primary.main,
}: EstimateUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    size: number;
  } | null>(null);
  const [contractorName, setContractorName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedItems, setParsedItems] = useState<EstimateItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleSelectFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Check file size (max 5 MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert('Błąd', 'Plik jest zbyt duży. Maksymalny rozmiar to 5 MB.');
        return;
      }

      setSelectedFile({
        name: file.name,
        uri: file.uri,
        size: file.size || 0,
      });
      setParsedItems([]);
      setTotalAmount(0);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wybrać pliku');
    }
  }, []);

  const handleAnalyzeWithAI = useCallback(async () => {
    if (!selectedFile) {
      Alert.alert('Błąd', 'Wybierz plik PDF');
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis - in production, this would call your backend
    // which would use OCR (Tesseract.js) + Claude API to analyze the PDF
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock parsed data
      const mockItems: EstimateItem[] = [
        {
          id: '1',
          name: 'Wymiana tablicy rozdzielczej',
          quantity: 1,
          unit: 'szt',
          unitPrice: 3500,
          totalPrice: 3500,
          category: 'materiały',
        },
        {
          id: '2',
          name: 'Gniazdka podtynkowe',
          quantity: 15,
          unit: 'szt',
          unitPrice: 50,
          totalPrice: 750,
          category: 'materiały',
        },
        {
          id: '3',
          name: 'Przewód YDY 3x2.5',
          quantity: 100,
          unit: 'm',
          unitPrice: 8,
          totalPrice: 800,
          category: 'materiały',
        },
        {
          id: '4',
          name: 'Robocizna - instalacja elektryczna',
          quantity: 1,
          unit: 'kpl',
          unitPrice: 8000,
          totalPrice: 8000,
          category: 'robocizna',
        },
      ];

      const total = mockItems.reduce((sum, item) => sum + item.totalPrice, 0);

      setParsedItems(mockItems);
      setTotalAmount(total);

      // Try to extract contractor name from filename
      if (!contractorName) {
        const nameMatch = selectedFile.name.match(/wycena[_-]?(.*?)[_-]?\d/i);
        if (nameMatch) {
          setContractorName(nameMatch[1].replace(/[_-]/g, ' ').trim());
        }
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się przeanalizować pliku');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile, contractorName]);

  const handleManualItemAdd = useCallback((name: string, amount: number) => {
    const newItem: EstimateItem = {
      id: Date.now().toString(),
      name,
      quantity: 1,
      unit: 'szt',
      unitPrice: amount,
      totalPrice: amount,
    };

    setParsedItems((prev) => [...prev, newItem]);
    setTotalAmount((prev) => prev + amount);
  }, []);

  const handleSave = useCallback(() => {
    if (!contractorName.trim()) {
      Alert.alert('Błąd', 'Podaj nazwę wykonawcy');
      return;
    }

    if (parsedItems.length === 0 && totalAmount === 0) {
      Alert.alert('Błąd', 'Brak pozycji wyceny');
      return;
    }

    onEstimateCreated({
      contractorName: contractorName.trim(),
      totalAmount,
      items: parsedItems,
      fileUrl: selectedFile?.uri || '',
    });
  }, [contractorName, totalAmount, parsedItems, selectedFile, onEstimateCreated]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Contractor Name Input */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Nazwa wykonawcy</Text>
        <TextInput
          style={styles.contractorInput}
          placeholder="np. ElektroPro Sp. z o.o."
          placeholderTextColor={colors.text.tertiary}
          value={contractorName}
          onChangeText={setContractorName}
        />
      </View>

      {/* File Upload Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Plik wyceny (PDF)</Text>
        <TouchableOpacity
          style={[
            styles.uploadZone,
            selectedFile && styles.uploadZoneSelected,
          ]}
          onPress={handleSelectFile}
        >
          {selectedFile ? (
            <View style={styles.selectedFile}>
              <Text style={styles.selectedFileIcon}>📄</Text>
              <View style={styles.selectedFileInfo}>
                <Text style={styles.selectedFileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.selectedFileSize}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeFileBtn}
                onPress={() => {
                  setSelectedFile(null);
                  setParsedItems([]);
                  setTotalAmount(0);
                }}
              >
                <Text style={styles.removeFileBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Wybierz plik PDF</Text>
              <Text style={styles.uploadHint}>Maksymalny rozmiar: 5 MB</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Analyze Button */}
      {selectedFile && parsedItems.length === 0 && (
        <TouchableOpacity
          style={[styles.analyzeBtn, { backgroundColor: sectionColor }]}
          onPress={handleAnalyzeWithAI}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <View style={styles.analyzingRow}>
              <ActivityIndicator size="small" color={colors.text.inverse} />
              <Text style={styles.analyzeBtnText}>Analizowanie...</Text>
            </View>
          ) : (
            <Text style={styles.analyzeBtnText}>Analizuj z AI</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Parsed Estimate */}
      {parsedItems.length > 0 && (
        <ParsedEstimateDisplay
          items={parsedItems}
          totalAmount={totalAmount}
          onItemEdit={() => {}}
        />
      )}

      {/* Manual Entry Toggle */}
      <TouchableOpacity
        style={styles.manualEntryToggle}
        onPress={() => setShowManualEntry(!showManualEntry)}
      >
        <Text style={styles.manualEntryToggleText}>
          {showManualEntry ? 'Ukryj wprowadzanie ręczne' : 'Wprowadź ręcznie'}
        </Text>
      </TouchableOpacity>

      {/* Manual Entry Form */}
      {showManualEntry && <ManualEntryForm onSubmit={handleManualItemAdd} />}

      {/* Quick Total Entry */}
      {parsedItems.length === 0 && !showManualEntry && (
        <View style={styles.quickTotalSection}>
          <Text style={styles.sectionLabel}>Lub podaj tylko kwotę całkowitą</Text>
          <TextInput
            style={styles.totalInput}
            placeholder="np. 28500"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            value={totalAmount > 0 ? totalAmount.toString() : ''}
            onChangeText={(text) => setTotalAmount(parseFloat(text) || 0)}
          />
        </View>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          { backgroundColor: sectionColor },
          (!contractorName.trim() || (parsedItems.length === 0 && totalAmount === 0)) &&
            styles.saveBtnDisabled,
        ]}
        onPress={handleSave}
        disabled={!contractorName.trim() || (parsedItems.length === 0 && totalAmount === 0)}
      >
        <Text style={styles.saveBtnText}>Zapisz wycenę</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  contractorInput: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    ...shadows.sm,
  },
  uploadZone: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.medium,
    padding: spacing.xl,
    alignItems: 'center',
  },
  uploadZoneSelected: {
    borderStyle: 'solid',
    borderColor: colors.primary.main,
    padding: spacing.md,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  uploadText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  uploadHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  selectedFileIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  selectedFileInfo: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  selectedFileSize: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  removeFileBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileBtnText: {
    fontSize: 18,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  analyzeBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeBtnText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
    marginLeft: spacing.sm,
  },
  parsedEstimate: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  parsedEstimateTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  estimateItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  estimateItemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  estimateItemName: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  estimateItemDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  estimateItemPrice: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  estimateTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  estimateTotalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  estimateTotalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  manualEntryToggle: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  manualEntryToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  manualEntry: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  manualEntryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  manualEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manualInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  manualInputName: {
    flex: 2,
    marginRight: spacing.sm,
  },
  manualInputAmount: {
    flex: 1,
    marginRight: spacing.sm,
  },
  manualAddBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualAddBtnText: {
    fontSize: 20,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  quickTotalSection: {
    marginBottom: spacing.lg,
  },
  totalInput: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    ...shadows.sm,
  },
  saveBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
