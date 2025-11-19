import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, sectionConfig } from '../theme';
import { SectionType } from '../types';

// Budget Summary Card
const BudgetSummaryCard = ({
  planned,
  spent,
}: {
  planned: number;
  spent: number;
}) => {
  const percentage = Math.round((spent / planned) * 100);
  const remaining = planned - spent;
  const isOverBudget = remaining < 0;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Podsumowanie budżetu</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Planowane</Text>
          <Text style={styles.summaryValue}>{planned.toLocaleString()} zł</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Wydane</Text>
          <Text style={[styles.summaryValue, isOverBudget && styles.overBudget]}>
            {spent.toLocaleString()} zł
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pozostało</Text>
          <Text style={[styles.summaryValue, isOverBudget && styles.overBudget]}>
            {remaining.toLocaleString()} zł
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

// Cost Item Row
const CostItemRow = ({
  sectionType,
  planned,
  actual,
  acceptedEstimate,
}: {
  sectionType: SectionType;
  planned: number;
  actual: number;
  acceptedEstimate?: string;
}) => {
  const config = sectionConfig[sectionType];
  const diff = actual - planned;
  const diffPercent = planned > 0 ? Math.round((diff / planned) * 100) : 0;

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
      </View>

      <View style={styles.costItemNumbers}>
        <View style={styles.costItemColumn}>
          <Text style={styles.costItemLabel}>Plan</Text>
          <Text style={styles.costItemValue}>{planned.toLocaleString()} zł</Text>
        </View>
        <View style={styles.costItemColumn}>
          <Text style={styles.costItemLabel}>Rzeczywiste</Text>
          <Text style={styles.costItemValue}>{actual.toLocaleString()} zł</Text>
        </View>
        <View style={styles.costItemColumn}>
          <Text style={styles.costItemLabel}>Różnica</Text>
          <Text
            style={[
              styles.costItemValue,
              diff > 0 ? styles.negativeDiff : styles.positiveDiff,
            ]}
          >
            {diff > 0 ? '+' : ''}
            {diffPercent}%
          </Text>
        </View>
      </View>
    </View>
  );
};

// Recent Expenses
const RecentExpenses = () => {
  const expenses = [
    {
      id: '1',
      description: 'Materiały elektryczne - kable',
      amount: 2450,
      date: '2024-01-15',
      section: 'electrical',
    },
    {
      id: '2',
      description: 'Zaliczka - Pan Marek',
      amount: 10000,
      date: '2024-01-10',
      section: 'electrical',
    },
    {
      id: '3',
      description: 'Rury PEX',
      amount: 1800,
      date: '2024-01-08',
      section: 'plumbing',
    },
  ];

  return (
    <View style={styles.expensesSection}>
      <View style={styles.expensesHeader}>
        <Text style={styles.expensesTitle}>Ostatnie wydatki</Text>
        <TouchableOpacity>
          <Text style={styles.expensesAddBtn}>+ Dodaj</Text>
        </TouchableOpacity>
      </View>

      {expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseItem}>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseDescription}>{expense.description}</Text>
            <Text style={styles.expenseDate}>
              {new Date(expense.date).toLocaleDateString('pl-PL')}
            </Text>
          </View>
          <Text style={styles.expenseAmount}>
            -{expense.amount.toLocaleString()} zł
          </Text>
        </View>
      ))}
    </View>
  );
};

// AI Insights
const AIInsights = () => {
  return (
    <View style={styles.aiInsights}>
      <View style={styles.aiInsightsHeader}>
        <Text style={styles.aiInsightsIcon}>AI</Text>
        <Text style={styles.aiInsightsTitle}>Analiza kosztów</Text>
      </View>
      <Text style={styles.aiInsightsText}>
        Elektryka przekroczyła budżet o 8%. Jest to typowe odchylenie dla remontów
        w budynkach z lat 2000-2010, gdzie często wymaga się pełnej wymiany
        instalacji aluminiowej.
      </Text>
      <TouchableOpacity style={styles.aiInsightsBtn}>
        <Text style={styles.aiInsightsBtnText}>Zobacz szczegółową analizę</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CostsScreen() {
  const [viewMode, setViewMode] = useState<'summary' | 'details'>('summary');

  // Mock data
  const budgetData = {
    planned: 100000,
    spent: 67500,
    sections: {
      electrical: { planned: 30000, actual: 32400, contractor: 'ElektroPro' },
      plumbing: { planned: 15000, actual: 14200, contractor: 'HydroMax' },
      carpentry: { planned: 20000, actual: 18500, contractor: undefined },
      finishing: { planned: 25000, actual: 2400, contractor: undefined },
      plan: { planned: 5000, actual: 0, contractor: undefined },
      costs: { planned: 5000, actual: 0, contractor: undefined },
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kosztorys</Text>
          <Text style={styles.headerSubtitle}>Zarządzanie budżetem projektu</Text>
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
              Szczegóły
            </Text>
          </TouchableOpacity>
        </View>

        {/* Budget Summary */}
        <BudgetSummaryCard
          planned={budgetData.planned}
          spent={budgetData.spent}
        />

        {/* Cost Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Rozbicie kosztów</Text>

          <CostItemRow
            sectionType="electrical"
            planned={budgetData.sections.electrical.planned}
            actual={budgetData.sections.electrical.actual}
            acceptedEstimate={budgetData.sections.electrical.contractor}
          />
          <CostItemRow
            sectionType="plumbing"
            planned={budgetData.sections.plumbing.planned}
            actual={budgetData.sections.plumbing.actual}
            acceptedEstimate={budgetData.sections.plumbing.contractor}
          />
          <CostItemRow
            sectionType="carpentry"
            planned={budgetData.sections.carpentry.planned}
            actual={budgetData.sections.carpentry.actual}
          />
          <CostItemRow
            sectionType="finishing"
            planned={budgetData.sections.finishing.planned}
            actual={budgetData.sections.finishing.actual}
          />
        </View>

        {/* AI Insights */}
        <AIInsights />

        {/* Recent Expenses */}
        <RecentExpenses />

        {/* Export Actions */}
        <View style={styles.exportSection}>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportBtnText}>Eksportuj do PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, styles.exportBtnSecondary]}>
            <Text style={[styles.exportBtnText, styles.exportBtnTextSecondary]}>
              Eksportuj do Excel
            </Text>
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
  costItemNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costItemColumn: {
    alignItems: 'center',
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
  negativeDiff: {
    color: colors.status.error,
  },
  positiveDiff: {
    color: colors.status.success,
  },
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
    marginBottom: spacing.md,
  },
  aiInsightsBtn: {
    alignSelf: 'flex-start',
  },
  aiInsightsBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
  },
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
});
