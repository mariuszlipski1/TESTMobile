import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, sectionConfig } from '../theme';
import { SectionType, Expense } from '../types';
import { useExpensesStore, useBudgetSummaryStore } from '../store';

const { width: screenWidth } = Dimensions.get('window');

// Budget Summary Card
const BudgetSummaryCard = ({
  planned,
  spent,
}: {
  planned: number;
  spent: number;
}) => {
  const percentage = planned > 0 ? Math.round((spent / planned) * 100) : 0;
  const remaining = planned - spent;
  const isOverBudget = remaining < 0;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Podsumowanie budzetu</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Planowane</Text>
          <Text style={styles.summaryValue}>{planned.toLocaleString()} zl</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Wydane</Text>
          <Text style={[styles.summaryValue, isOverBudget && styles.overBudget]}>
            {spent.toLocaleString()} zl
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pozostalo</Text>
          <Text style={[styles.summaryValue, isOverBudget && styles.overBudget]}>
            {remaining.toLocaleString()} zl
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isOverBudget
                ? colors.status.error
                : percentage > 80
                ? colors.status.warning
                : colors.status.success,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{percentage}% wykorzystane</Text>
    </View>
  );
};

// Cost Comparison Chart (Stacked Bar Chart)
const CostComparisonChart = ({
  data,
}: {
  data: { sectionType: SectionType; planned: number; actual: number }[];
}) => {
  const maxValue = Math.max(...data.flatMap(d => [d.planned, d.actual]));
  const chartHeight = 150;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Porownanie kosztow</Text>

      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary.main }]} />
          <Text style={styles.legendText}>Planowane</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.status.success }]} />
          <Text style={styles.legendText}>Rzeczywiste</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
        <View style={styles.chartContent}>
          {data.map((item, index) => {
            const config = sectionConfig[item.sectionType];
            const plannedHeight = (item.planned / maxValue) * chartHeight;
            const actualHeight = (item.actual / maxValue) * chartHeight;

            return (
              <TouchableOpacity
                key={item.sectionType}
                style={styles.chartBarGroup}
                onPress={() => {
                  Alert.alert(
                    config.name,
                    `Planowane: ${item.planned.toLocaleString()} zl\nRzeczywiste: ${item.actual.toLocaleString()} zl\nRoznica: ${((item.actual - item.planned) / item.planned * 100).toFixed(1)}%`
                  );
                }}
              >
                <View style={styles.barsContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      styles.plannedBar,
                      { height: plannedHeight }
                    ]}
                  />
                  <View
                    style={[
                      styles.chartBar,
                      styles.actualBar,
                      { height: actualHeight }
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{config.name.substring(0, 3)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// Cost Item Row with Edit Capability
const CostItemRow = ({
  sectionType,
  planned,
  actual,
  acceptedEstimate,
  onEditPlanned,
}: {
  sectionType: SectionType;
  planned: number;
  actual: number;
  acceptedEstimate?: string;
  onEditPlanned: (sectionType: SectionType, newValue: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(planned.toString());

  const config = sectionConfig[sectionType];
  const diff = actual - planned;
  const diffPercent = planned > 0 ? Math.round((diff / planned) * 100) : 0;

  const handleSave = () => {
    const newValue = parseFloat(editValue) || 0;
    if (newValue > 0) {
      onEditPlanned(sectionType, newValue);
    }
    setIsEditing(false);
  };

  // Determine status icon and color
  const getStatusIcon = () => {
    if (actual === 0) return { icon: 'Brak', color: colors.text.tertiary };
    if (diffPercent > 10) return { icon: '+' + diffPercent + '%', color: colors.status.error };
    if (diffPercent > 5) return { icon: '+' + diffPercent + '%', color: colors.status.warning };
    if (diffPercent < 0) return { icon: diffPercent + '%', color: colors.status.success };
    return { icon: diffPercent + '%', color: colors.status.success };
  };

  const status = getStatusIcon();

  return (
    <View style={styles.costItemRow}>
      <View style={styles.costItemHeader}>
        <View style={[styles.costItemIcon, { backgroundColor: config.color + '20' }]}>
          <Text style={[styles.costItemIconText, { color: config.color }]}>
            {config.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.costItemInfo}>
          <Text style={styles.costItemName}>{config.name}</Text>
          {acceptedEstimate && (
            <Text style={styles.costItemContractor}>{acceptedEstimate}</Text>
          )}
        </View>
        <Text style={[styles.statusBadge, { color: status.color }]}>
          {status.icon}
        </Text>
      </View>

      <View style={styles.costItemNumbers}>
        <TouchableOpacity
          style={styles.costItemColumn}
          onPress={() => {
            setEditValue(planned.toString());
            setIsEditing(true);
          }}
        >
          <Text style={styles.costItemLabel}>Plan</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              onBlur={handleSave}
              onSubmitEditing={handleSave}
              autoFocus
            />
          ) : (
            <Text style={[styles.costItemValue, styles.editableValue]}>
              {planned.toLocaleString()} zl
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.costItemColumn}>
          <Text style={styles.costItemLabel}>Rzeczywiste</Text>
          <Text style={styles.costItemValue}>{actual.toLocaleString()} zl</Text>
        </View>
        <View style={styles.costItemColumn}>
          <Text style={styles.costItemLabel}>Roznica</Text>
          <Text
            style={[
              styles.costItemValue,
              diff > 0 ? styles.negativeDiff : styles.positiveDiff,
            ]}
          >
            {diff > 0 ? '+' : ''}
            {diff.toLocaleString()} zl
          </Text>
        </View>
      </View>
    </View>
  );
};

// Expense Tracker Modal
const ExpenseTrackerModal = ({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}) => {
  const [category, setCategory] = useState<SectionType>('electrical');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: SectionType[] = ['electrical', 'plumbing', 'carpentry', 'finishing'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Opis jest wymagany';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Kwota musi byc wieksza od 0';
    }

    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate > today) {
      newErrors.date = 'Data nie moze byc w przyszlosci';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      sectionId: category,
      projectId: 'current-project',
      description: description.trim(),
      amount: parseFloat(amount),
      date,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('electrical');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Anuluj</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Dodaj wydatek</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Zapisz</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Category Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Kategoria</Text>
            <View style={styles.categorySelector}>
              {categories.map((cat) => {
                const config = sectionConfig[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      category === cat && { backgroundColor: config.color + '20', borderColor: config.color },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        category === cat && { color: config.color, fontWeight: typography.fontWeight.semibold },
                      ]}
                    >
                      {config.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Opis</Text>
            <TextInput
              style={[styles.formInput, errors.description && styles.inputError]}
              placeholder="np. Zakup przewodow YDY 5x2.5"
              value={description}
              onChangeText={setDescription}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Kwota (zl)</Text>
            <TextInput
              style={[styles.formInput, errors.amount && styles.inputError]}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}
          </View>

          {/* Date */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Data</Text>
            <TextInput
              style={[styles.formInput, errors.date && styles.inputError]}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
            />
            {errors.date && (
              <Text style={styles.errorText}>{errors.date}</Text>
            )}
          </View>

          {/* Receipt placeholder */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Paragon (opcjonalnie)</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>+ Dodaj zdjecie paragonu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Recent Expenses
const RecentExpenses = ({
  expenses,
  onAddPress,
}: {
  expenses: Expense[];
  onAddPress: () => void;
}) => {
  return (
    <View style={styles.expensesSection}>
      <View style={styles.expensesHeader}>
        <Text style={styles.expensesTitle}>Ostatnie wydatki</Text>
        <TouchableOpacity onPress={onAddPress}>
          <Text style={styles.expensesAddBtn}>+ Dodaj</Text>
        </TouchableOpacity>
      </View>

      {expenses.length === 0 ? (
        <Text style={styles.emptyText}>Brak wydatkow</Text>
      ) : (
        expenses.slice(0, 5).map((expense) => (
          <View key={expense.id} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseDescription}>{expense.description}</Text>
              <Text style={styles.expenseDate}>
                {new Date(expense.date).toLocaleDateString('pl-PL')}
              </Text>
            </View>
            <Text style={styles.expenseAmount}>
              -{expense.amount.toLocaleString()} zl
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

// AI Insights
const AIInsights = ({
  summaryItems,
}: {
  summaryItems: { sectionType: SectionType; planned: number; actual: number }[];
}) => {
  // Generate dynamic insights based on data
  const insights: string[] = [];

  summaryItems.forEach((item) => {
    const config = sectionConfig[item.sectionType];
    const diffPercent = item.planned > 0
      ? Math.round(((item.actual - item.planned) / item.planned) * 100)
      : 0;

    if (diffPercent > 5) {
      insights.push(
        `${config.name} przekroczyla budzet o ${diffPercent}% - typowe odchylenie dla remontow w starszych budynkach.`
      );
    } else if (diffPercent < -5 && item.actual > 0) {
      insights.push(
        `${config.name} zaoszczedzila ${Math.abs(diffPercent)}% budzetu - dobra negocjacja z wykonawca!`
      );
    }
  });

  if (insights.length === 0) {
    insights.push('Budzet jest pod kontrola. Kontynuuj monitorowanie wydatkow.');
  }

  return (
    <View style={styles.aiInsights}>
      <View style={styles.aiInsightsHeader}>
        <Text style={styles.aiInsightsIcon}>AI</Text>
        <Text style={styles.aiInsightsTitle}>Analiza kosztow</Text>
      </View>
      {insights.map((insight, index) => (
        <Text key={index} style={styles.aiInsightsText}>
          {insight}
        </Text>
      ))}
      <TouchableOpacity style={styles.aiInsightsBtn}>
        <Text style={styles.aiInsightsBtnText}>Odswiez insights</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CostsScreen() {
  const [viewMode, setViewMode] = useState<'summary' | 'details'>('summary');
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);

  // Use stores
  const { expenses, addExpense } = useExpensesStore();
  const { summaryItems, totalPlanned, totalActual, updateSummaryItem } = useBudgetSummaryStore();

  const handleAddExpense = useCallback((expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);

    // Update actual amount in budget summary
    const sectionType = expenseData.sectionId as SectionType;
    const currentItem = summaryItems.find(item => item.sectionType === sectionType);
    if (currentItem) {
      updateSummaryItem(sectionType, {
        actual: currentItem.actual + expenseData.amount,
      });
    }

    // Check for budget alert
    const newActual = (currentItem?.actual || 0) + expenseData.amount;
    const planned = currentItem?.planned || 0;
    if (planned > 0 && newActual > planned * 1.1) {
      Alert.alert(
        'Alert budzetowy',
        `${sectionConfig[sectionType].name} przekroczyla budzet!\nPlanowane: ${planned.toLocaleString()} zl\nRzeczywiste: ${newActual.toLocaleString()} zl`,
        [{ text: 'OK' }]
      );
    }
  }, [addExpense, summaryItems, updateSummaryItem]);

  const handleEditPlanned = useCallback((sectionType: SectionType, newValue: number) => {
    updateSummaryItem(sectionType, { planned: newValue });
  }, [updateSummaryItem]);

  const handleExportPDF = () => {
    Alert.alert('Export PDF', 'Funkcja eksportu PDF zostanie uruchomiona...');
  };

  const handleExportExcel = () => {
    Alert.alert('Export Excel', 'Funkcja eksportu Excel zostanie uruchomiona...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kosztorys</Text>
          <Text style={styles.headerSubtitle}>Zarzadzanie budzetem projektu</Text>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === 'summary' && styles.viewToggleBtnActive,
            ]}
            onPress={() => setViewMode('summary')}
          >
            <Text
              style={[
                styles.viewToggleText,
                viewMode === 'summary' && styles.viewToggleTextActive,
              ]}
            >
              Podsumowanie
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === 'details' && styles.viewToggleBtnActive,
            ]}
            onPress={() => setViewMode('details')}
          >
            <Text
              style={[
                styles.viewToggleText,
                viewMode === 'details' && styles.viewToggleTextActive,
              ]}
            >
              Szczegoly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Budget Summary */}
        <BudgetSummaryCard
          planned={totalPlanned}
          spent={totalActual}
        />

        {/* Cost Comparison Chart */}
        <CostComparisonChart data={summaryItems} />

        {/* Cost Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Rozbicie kosztow</Text>

          {summaryItems.map((item) => (
            <CostItemRow
              key={item.sectionType}
              sectionType={item.sectionType}
              planned={item.planned}
              actual={item.actual}
              acceptedEstimate={item.contractor}
              onEditPlanned={handleEditPlanned}
            />
          ))}
        </View>

        {/* AI Insights */}
        <AIInsights summaryItems={summaryItems} />

        {/* Recent Expenses */}
        <RecentExpenses
          expenses={expenses}
          onAddPress={() => setExpenseModalVisible(true)}
        />

        {/* Export Actions */}
        <View style={styles.exportSection}>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportPDF}>
            <Text style={styles.exportBtnText}>Eksportuj do PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, styles.exportBtnSecondary]}
            onPress={handleExportExcel}
          >
            <Text style={[styles.exportBtnText, styles.exportBtnTextSecondary]}>
              Eksportuj do Excel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Expense Tracker Modal */}
      <ExpenseTrackerModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
        onSave={handleAddExpense}
      />
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
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  viewToggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: colors.surface.primary,
    ...shadows.sm,
  },
  viewToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  viewToggleTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  overBudget: {
    color: colors.status.error,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'right',
  },

  // Chart styles
  chartContainer: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chartLegend: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  chartScroll: {
    marginHorizontal: -spacing.sm,
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    height: 180,
  },
  chartBarGroup: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    width: 20,
    marginHorizontal: 2,
    borderRadius: borderRadius.sm,
  },
  plannedBar: {
    backgroundColor: colors.primary.main,
  },
  actualBar: {
    backgroundColor: colors.status.success,
  },
  chartLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Cost breakdown styles
  breakdownSection: {
    marginBottom: spacing.lg,
  },
  breakdownTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  costItemRow: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  costItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  costItemIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  costItemIconText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  costItemInfo: {
    flex: 1,
  },
  costItemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  costItemContractor: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  statusBadge: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  costItemNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costItemColumn: {
    alignItems: 'center',
    flex: 1,
  },
  costItemLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  costItemValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  editableValue: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  editInput: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.main,
    paddingVertical: 2,
    minWidth: 60,
    textAlign: 'center',
  },
  negativeDiff: {
    color: colors.status.error,
  },
  positiveDiff: {
    color: colors.status.success,
  },

  // AI Insights styles
  aiInsights: {
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  aiInsightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiInsightsIcon: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface.primary,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  aiInsightsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  aiInsightsText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.sm,
  },
  aiInsightsBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  aiInsightsBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },

  // Expenses section styles
  expensesSection: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  expensesTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  expensesAddBtn: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  expenseDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  expenseAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.status.error,
  },

  // Export section styles
  exportSection: {
    marginBottom: spacing['3xl'],
  },
  exportBtn: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exportBtnText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  exportBtnSecondary: {
    backgroundColor: colors.background.tertiary,
  },
  exportBtnTextSecondary: {
    color: colors.text.primary,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCancel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  modalSave: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  formInput: {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.surface.primary,
  },
  categoryOptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  uploadButton: {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
