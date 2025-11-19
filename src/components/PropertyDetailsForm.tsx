import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { MarketType, PropertyData } from '../types';

interface PropertyDetailsFormProps {
  initialData?: Partial<PropertyData>;
  onSave: (data: PropertyData) => void;
  isLoading?: boolean;
}

export default function PropertyDetailsForm({
  initialData,
  onSave,
  isLoading = false,
}: PropertyDetailsFormProps) {
  const [area, setArea] = useState(initialData?.area?.toString() || '');
  const [floor, setFloor] = useState(initialData?.floor?.toString() || '');
  const [year, setYear] = useState(initialData?.year?.toString() || '');
  const [marketType, setMarketType] = useState<MarketType>(
    initialData?.marketType || 'secondary'
  );
  const [hasElevator, setHasElevator] = useState(initialData?.hasElevator || false);
  const [hasParking, setHasParking] = useState(initialData?.hasParking || false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Walidacja metrażu: 15-300 m²
    const areaNum = parseFloat(area);
    if (!area || isNaN(areaNum)) {
      newErrors.area = 'Podaj metraż';
    } else if (areaNum < 15 || areaNum > 300) {
      newErrors.area = 'Metraż musi być między 15-300 m²';
    }

    // Walidacja piętra
    const floorNum = parseInt(floor);
    if (!floor || isNaN(floorNum)) {
      newErrors.floor = 'Podaj piętro';
    } else if (floorNum < -2 || floorNum > 50) {
      newErrors.floor = 'Piętro musi być między -2 a 50';
    }

    // Walidacja roku budowy: 1900-2025
    const yearNum = parseInt(year);
    if (!year || isNaN(yearNum)) {
      newErrors.year = 'Podaj rok budowy';
    } else if (yearNum < 1900 || yearNum > 2025) {
      newErrors.year = 'Rok musi być między 1900-2025';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        area: parseFloat(area),
        floor: parseInt(floor),
        year: parseInt(year),
        marketType,
        hasElevator,
        hasParking,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dane nieruchomości</Text>
      <Text style={styles.subtitle}>
        Wprowadź podstawowe informacje o mieszkaniu
      </Text>

      {/* Metraż */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Metraż (m²) *</Text>
        <TextInput
          style={[styles.input, errors.area && styles.inputError]}
          placeholder="np. 55"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="decimal-pad"
          value={area}
          onChangeText={setArea}
        />
        {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
      </View>

      {/* Piętro i Rok - w jednym rzędzie */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Piętro *</Text>
          <TextInput
            style={[styles.input, errors.floor && styles.inputError]}
            placeholder="np. 3"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            value={floor}
            onChangeText={setFloor}
          />
          {errors.floor && <Text style={styles.errorText}>{errors.floor}</Text>}
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Rok budowy *</Text>
          <TextInput
            style={[styles.input, errors.year && styles.inputError]}
            placeholder="np. 2005"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            value={year}
            onChangeText={setYear}
          />
          {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
        </View>
      </View>

      {/* Typ rynku */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rynek</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              marketType === 'primary' && styles.segmentBtnActive,
            ]}
            onPress={() => setMarketType('primary')}
          >
            <Text
              style={[
                styles.segmentBtnText,
                marketType === 'primary' && styles.segmentBtnTextActive,
              ]}
            >
              Pierwotny
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              marketType === 'secondary' && styles.segmentBtnActive,
            ]}
            onPress={() => setMarketType('secondary')}
          >
            <Text
              style={[
                styles.segmentBtnText,
                marketType === 'secondary' && styles.segmentBtnTextActive,
              ]}
            >
              Wtórny
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Opcjonalne - winda i parking */}
      <View style={styles.switchRow}>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Winda</Text>
          <Switch
            value={hasElevator}
            onValueChange={setHasElevator}
            trackColor={{ false: colors.border.medium, true: colors.primary.light }}
            thumbColor={hasElevator ? colors.primary.main : colors.background.tertiary}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Parking</Text>
          <Switch
            value={hasParking}
            onValueChange={setHasParking}
            trackColor={{ false: colors.border.medium, true: colors.primary.light }}
            thumbColor={hasParking ? colors.primary.main : colors.background.tertiary}
          />
        </View>
      </View>

      {/* Przycisk zapisz */}
      <TouchableOpacity
        style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        <Text style={styles.saveBtnText}>
          {isLoading ? 'Zapisywanie...' : 'Zapisz dane'}
        </Text>
      </TouchableOpacity>
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.surface.primary,
    ...shadows.sm,
  },
  segmentBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  segmentBtnTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
