import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Estimate, EstimateItem } from '../types';

interface EstimateComparisonProps {
  estimates: Estimate[];
  onAccept: (estimateId: string) => void;
  onViewDetails: (estimateId: string) => void;
  sectionColor?: string;
}

// AI Insight Component
const AIInsight = ({ text, type }: { text: string; type: 'warning' | 'info' | 'success' }) => {
  const iconMap = {
    warning: '⚠️',
    info: '💡',
    success: '✅',
  };

  const bgColorMap = {
    warning: colors.status.warning + '15',
    info: colors.primary.main + '10',
    success: colors.status.success + '15',
  };

  return (
    <View style={[styles.aiInsight, { backgroundColor: bgColorMap[type] }]}>
      <Text style={styles.aiInsightIcon}>{iconMap[type]}</Text>
      <Text style={styles.aiInsightText}>{text}</Text>
    </View>
  );
};

// Price Comparison Cell
const PriceComparisonCell = ({
  price,
  lowestPrice,
  highestPrice,
}: {
  price: number;
  lowestPrice: number;
  highestPrice: number;
}) => {
  const isLowest = price === lowestPrice;
  const isHighest = price === highestPrice;
  const percentDiff = ((price - lowestPrice) / lowestPrice) * 100;

  return (
    <View style={styles.priceCell}>
      <Text
        style={[
          styles.priceValue,
          isLowest && styles.priceLowest,
          isHighest && styles.priceHighest,
        ]}
      >
        {price.toLocaleString()} zł
      </Text>
      {!isLowest && percentDiff > 0 && (
        <Text style={styles.priceDiff}>+{percentDiff.toFixed(0)}%</Text>
      )}
      {isLowest && <Text style={styles.priceLowestLabel}>Najniższa</Text>}
    </View>
  );
};

export default function EstimateComparison({
  estimates,
  onAccept,
  onViewDetails,
  sectionColor = colors.primary.main,
}: EstimateComparisonProps) {
  const [selectedEstimates, setSelectedEstimates] = useState<string[]>(
    estimates.slice(0, 3).map((e) => e.id)
  );

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    const selected = estimates.filter((e) => selectedEstimates.includes(e.id));
    if (selected.length === 0) return null;

    const totals = selected.map((e) => e.totalAmount);
    const lowestPrice = Math.min(...totals);
    const highestPrice = Math.max(...totals);
    const avgPrice = totals.reduce((a, b) => a + b, 0) / totals.length;

    // Find common items across estimates
    const allItemNames = new Set<string>();
    selected.forEach((e) => {
      e.items.forEach((item) => allItemNames.add(item.name.toLowerCase()));
    });

    // Generate AI insights
    const insights: { text: string; type: 'warning' | 'info' | 'success' }[] = [];

    // Check for missing items
    selected.forEach((estimate) => {
      const estimateItemNames = new Set(estimate.items.map((i) => i.name.toLowerCase()));
      const missingItems = [...allItemNames].filter((name) => !estimateItemNames.has(name));

      if (missingItems.length > 0) {
        insights.push({
          text: `${estimate.contractorName} nie uwzględnia: ${missingItems.slice(0, 2).join(', ')}`,
          type: 'warning',
        });
      }
    });

    // Price difference insight
    const priceDiffPercent = ((highestPrice - lowestPrice) / lowestPrice) * 100;
    if (priceDiffPercent > 20) {
      insights.push({
        text: `Różnica między ofertami wynosi ${priceDiffPercent.toFixed(0)}% - zapytaj o szczegóły`,
        type: 'info',
      });
    }

    // Check for materials inclusion
    const hasNoMaterials = selected.some(
      (e) => !e.items.some((i) => i.category === 'materiały')
    );
    if (hasNoMaterials) {
      insights.push({
        text: 'Niektóre wyceny mogą nie zawierać materiałów - potwierdź z wykonawcą',
        type: 'warning',
      });
    }

    return {
      selected,
      lowestPrice,
      highestPrice,
      avgPrice,
      insights,
    };
  }, [estimates, selectedEstimates]);

  const toggleEstimateSelection = (id: string) => {
    setSelectedEstimates((prev) =>
      prev.includes(id)
        ? prev.filter((eid) => eid !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  if (estimates.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>📊</Text>
        <Text style={styles.emptyStateText}>Brak wycen do porównania</Text>
        <Text style={styles.emptyStateSubtext}>
          Dodaj co najmniej 2 wyceny, aby je porównać
        </Text>
      </View>
    );
  }

  if (estimates.length === 1) {
    return (
      <View style={styles.singleEstimate}>
        <Text style={styles.singleEstimateText}>
          Dodaj więcej wycen, aby móc je porównać
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Selection Pills */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionLabel}>
          Wybierz wyceny do porównania (max 3):
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {estimates.map((estimate) => (
            <TouchableOpacity
              key={estimate.id}
              style={[
                styles.selectionPill,
                selectedEstimates.includes(estimate.id) && [
                  styles.selectionPillActive,
                  { backgroundColor: sectionColor },
                ],
              ]}
              onPress={() => toggleEstimateSelection(estimate.id)}
            >
              <Text
                style={[
                  styles.selectionPillText,
                  selectedEstimates.includes(estimate.id) &&
                    styles.selectionPillTextActive,
                ]}
                numberOfLines={1}
              >
                {estimate.contractorName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {comparisonData && (
        <>
          {/* Comparison Table */}
          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Wykonawca</Text>
              <Text style={styles.tableHeaderText}>Kwota</Text>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>

            {comparisonData.selected.map((estimate) => (
              <TouchableOpacity
                key={estimate.id}
                style={styles.tableRow}
                onPress={() => onViewDetails(estimate.id)}
              >
                <View style={styles.tableCell}>
                  <Text style={styles.contractorName} numberOfLines={1}>
                    {estimate.contractorName}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <PriceComparisonCell
                    price={estimate.totalAmount}
                    lowestPrice={comparisonData.lowestPrice}
                    highestPrice={comparisonData.highestPrice}
                  />
                </View>
                <View style={styles.tableCell}>
                  {estimate.isAccepted ? (
                    <View style={styles.acceptedBadge}>
                      <Text style={styles.acceptedBadgeText}>✓</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.acceptBtn, { backgroundColor: sectionColor }]}
                      onPress={() => onAccept(estimate.id)}
                    >
                      <Text style={styles.acceptBtnText}>Akceptuj</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Najniższa</Text>
              <Text style={[styles.statValue, { color: colors.status.success }]}>
                {comparisonData.lowestPrice.toLocaleString()} zł
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Średnia</Text>
              <Text style={styles.statValue}>
                {comparisonData.avgPrice.toLocaleString()} zł
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Najwyższa</Text>
              <Text style={[styles.statValue, { color: colors.status.error }]}>
                {comparisonData.highestPrice.toLocaleString()} zł
              </Text>
            </View>
          </View>

          {/* AI Insights */}
          {comparisonData.insights.length > 0 && (
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>Spostrzeżenia AI</Text>
              {comparisonData.insights.map((insight, index) => (
                <AIInsight key={index} text={insight.text} type={insight.type} />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  singleEstimate: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  singleEstimateText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  selectionContainer: {
    marginBottom: spacing.lg,
  },
  selectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  selectionPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.sm,
    maxWidth: 150,
  },
  selectionPillActive: {
    backgroundColor: colors.primary.main,
  },
  selectionPillText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  selectionPillTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  comparisonTable: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tableCell: {
    flex: 1,
  },
  contractorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  priceCell: {
    alignItems: 'flex-start',
  },
  priceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  priceLowest: {
    color: colors.status.success,
  },
  priceHighest: {
    color: colors.status.error,
  },
  priceDiff: {
    fontSize: typography.fontSize.xs,
    color: colors.status.warning,
    marginTop: spacing.xs,
  },
  priceLowestLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.status.success,
    marginTop: spacing.xs,
  },
  acceptedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.status.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptedBadgeText: {
    fontSize: 14,
    color: colors.status.success,
  },
  acceptBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  acceptBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  summaryStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  insightsContainer: {
    marginBottom: spacing['3xl'],
  },
  insightsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  aiInsight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  aiInsightIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  aiInsightText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});
