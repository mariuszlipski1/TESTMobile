import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { SectionType } from '../types';

interface AIQuestion {
  id: string;
  question: string;
  why: string;
  asked: boolean;
}

interface AIChatPanelProps {
  sectionType: SectionType;
  projectData?: {
    area?: number;
    year?: number;
    floor?: number;
  };
  onQuestionAsked?: (questionId: string) => void;
  sectionColor?: string;
}

// Section-specific question templates
const SECTION_QUESTIONS: Record<SectionType, AIQuestion[]> = {
  electrical: [
    {
      id: '1',
      question: 'Czy instalacja elektryczna spełnia normę PN-HD 60364?',
      why: 'Norma określa bezpieczeństwo instalacji - kluczowe dla gwarancji',
      asked: false,
    },
    {
      id: '2',
      question: 'Jaka jest grubość przewodów do urządzeń AGD?',
      why: 'AGD wymaga przewodów min. 2.5mm² dla bezpieczeństwa',
      asked: false,
    },
    {
      id: '3',
      question: 'Ile obwodów powinno być w kuchni?',
      why: 'Kuchnia wymaga min. 3-4 obwodów (AGD, oświetlenie, gniazdka)',
      asked: false,
    },
    {
      id: '4',
      question: 'Czy wycena zawiera wymianę tablicy rozdzielczej?',
      why: 'Stara tablica może nie obsłużyć nowych obwodów',
      asked: false,
    },
    {
      id: '5',
      question: 'Jaki jest termin gwarancji na wykonane prace?',
      why: 'Standardowa gwarancja to min. 2 lata',
      asked: false,
    },
    {
      id: '6',
      question: 'Kto dostarcza materiały - wykonawca czy ja?',
      why: 'Wpływa na cenę końcową i jakość materiałów',
      asked: false,
    },
    {
      id: '7',
      question: 'Czy instalacja będzie miała uziemienie?',
      why: 'Uziemienie jest wymagane przez przepisy',
      asked: false,
    },
    {
      id: '8',
      question: 'Czy przewidziane jest oświetlenie awaryjne?',
      why: 'Wymagane w korytarzach i przy wyjściach',
      asked: false,
    },
    {
      id: '9',
      question: 'Ile gniazdek USB planowanych w pomieszczeniach?',
      why: 'Wygoda użytkowania - nie wymaga późniejszego dokładania',
      asked: false,
    },
    {
      id: '10',
      question: 'Czy wycena obejmuje protokół odbioru i pomiary?',
      why: 'Pomiary izolacji i uziemienia są wymagane',
      asked: false,
    },
  ],
  plumbing: [
    {
      id: '1',
      question: 'Jaki jest stan pionów wodno-kanalizacyjnych?',
      why: 'Stare piony mogą wymagać wymiany w całym budynku',
      asked: false,
    },
    {
      id: '2',
      question: 'Jakie ciśnienie wody jest w instalacji?',
      why: 'Wpływa na dobór armatury i komfort użytkowania',
      asked: false,
    },
    {
      id: '3',
      question: 'Czy wycena obejmuje próbę szczelności?',
      why: 'Test pod ciśnieniem to podstawa gwarancji',
      asked: false,
    },
    {
      id: '4',
      question: 'Jaki termin gwarancji na szczelność instalacji?',
      why: 'Min. 3 lata - przecieki mogą pojawić się po czasie',
      asked: false,
    },
    {
      id: '5',
      question: 'Czy planowana jest wymiana zaworów głównych?',
      why: 'Stare zawory mogą nie trzymać przy awarii',
      asked: false,
    },
    {
      id: '6',
      question: 'Jaki materiał rur będzie użyty?',
      why: 'PEX, PP czy miedź - różne trwałości i ceny',
      asked: false,
    },
    {
      id: '7',
      question: 'Czy instalacja przewiduje filtr mechaniczny?',
      why: 'Chroni armaturę przed zanieczyszczeniami',
      asked: false,
    },
    {
      id: '8',
      question: 'Jakie spadki kanalizacji są planowane?',
      why: 'Min. 2% dla odpływu - zapobiega zatorom',
      asked: false,
    },
    {
      id: '9',
      question: 'Czy bojler/piec wymaga wymiany?',
      why: 'Stary piec może być nieefektywny energetycznie',
      asked: false,
    },
    {
      id: '10',
      question: 'Czy wycena obejmuje montaż wodomierzy?',
      why: 'Nowe wodomierze mogą być wymagane przez spółdzielnię',
      asked: false,
    },
  ],
  carpentry: [
    {
      id: '1',
      question: 'Jaka jest wilgotność w pomieszczeniach?',
      why: 'Wpływa na wybór materiałów i aklimatyzację drewna',
      asked: false,
    },
    {
      id: '2',
      question: 'Czy podłogi mają być cyklinowane czy wymieniane?',
      why: 'Cyklinowanie jest tańsze ale nie zawsze możliwe',
      asked: false,
    },
    {
      id: '3',
      question: 'Jakie certyfikaty mają materiały (FSC, E1)?',
      why: 'Certyfikaty gwarantują jakość i bezpieczeństwo',
      asked: false,
    },
    {
      id: '4',
      question: 'Czy drzwi będą z ościeżnicą regulowaną?',
      why: 'Łatwiejszy montaż i korekta po osiadaniu',
      asked: false,
    },
    {
      id: '5',
      question: 'Jaki jest czas aklimatyzacji materiałów?',
      why: 'Min. 48h - zapobiega deformacji po montażu',
      asked: false,
    },
    {
      id: '6',
      question: 'Czy wycena obejmuje listwy przypodłogowe?',
      why: 'Często pomijane - dolicz 10-15% do podłóg',
      asked: false,
    },
    {
      id: '7',
      question: 'Jaki typ zamków w drzwiach wewnętrznych?',
      why: 'Magnetyczne są cichsze i trwalsze',
      asked: false,
    },
    {
      id: '8',
      question: 'Czy futryny będą malowane czy okleinowane?',
      why: 'Okleinowane są trwalsze ale droższe',
      asked: false,
    },
    {
      id: '9',
      question: 'Jakie progi w drzwiach (obniżone, standardowe)?',
      why: 'Wpływa na komfort i dostępność',
      asked: false,
    },
    {
      id: '10',
      question: 'Czy jest gwarancja na zawiasy i okucia?',
      why: 'Zawiasy to element zużywalny - min. 2 lata',
      asked: false,
    },
  ],
  finishing: [
    {
      id: '1',
      question: 'Jaki harmonogram prac wykończeniowych?',
      why: 'Kolejność: gładzie → malowanie → podłogi',
      asked: false,
    },
    {
      id: '2',
      question: 'Ile warstw gładzi będzie nakładanych?',
      why: 'Min. 2 warstwy dla gładkiej powierzchni',
      asked: false,
    },
    {
      id: '3',
      question: 'Jaki typ farby (lateksowa, akrylowa)?',
      why: 'Lateksowa jest zmywalna i trwalsza',
      asked: false,
    },
    {
      id: '4',
      question: 'Czy ściany wymagają gruntowania?',
      why: 'Grunt poprawia przyczepność i zmniejsza zużycie farby',
      asked: false,
    },
    {
      id: '5',
      question: 'Jakie płytki w łazience (rektyfikowane)?',
      why: 'Rektyfikowane = wąskie fugi, nowocześniejszy wygląd',
      asked: false,
    },
    {
      id: '6',
      question: 'Czy wycena obejmuje izolację pod płytkami?',
      why: 'Wymagana w strefie prysznica i wanny',
      asked: false,
    },
    {
      id: '7',
      question: 'Jaki typ fugi (epoksydowa, cementowa)?',
      why: 'Epoksydowa jest droższa ale nie plami się',
      asked: false,
    },
    {
      id: '8',
      question: 'Czy malowanie obejmuje sufity?',
      why: 'Sufity często wymagane osobno w wycenie',
      asked: false,
    },
    {
      id: '9',
      question: 'Jaka jest tolerancja na nierówności ścian?',
      why: 'Max 2mm/m - więcej wymaga dodatkowej pracy',
      asked: false,
    },
    {
      id: '10',
      question: 'Czy wykonawca sprząta po zakończeniu prac?',
      why: 'Sprzątanie poremontowe kosztuje 500-1500 zł',
      asked: false,
    },
  ],
  plan: [],
  costs: [],
};

export default function AIChatPanel({
  sectionType,
  projectData,
  onQuestionAsked,
  sectionColor = colors.primary.main,
}: AIChatPanelProps) {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [sectionType]);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);

    // Simulate API call to Claude
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get section-specific questions
    const sectionQuestions = SECTION_QUESTIONS[sectionType] || [];

    // Personalize based on project data
    let personalizedQuestions = [...sectionQuestions];

    if (projectData) {
      // Add context-specific questions based on building age
      if (projectData.year && projectData.year < 1990) {
        if (sectionType === 'electrical') {
          personalizedQuestions.unshift({
            id: 'old-1',
            question: 'Czy instalacja zawiera przewody aluminiowe?',
            why: `Budynek z ${projectData.year} r. może mieć aluminium - wymaga wymiany`,
            asked: false,
          });
        }
        if (sectionType === 'plumbing') {
          personalizedQuestions.unshift({
            id: 'old-2',
            question: 'Czy rury są stalowe ocynkowane?',
            why: `Stare budynki (${projectData.year}) mają rury do wymiany`,
            asked: false,
          });
        }
      }
    }

    setQuestions(personalizedQuestions);
    setIsLoading(false);
  }, [sectionType, projectData]);

  const handleToggleQuestion = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, asked: !q.asked } : q
      )
    );
    onQuestionAsked?.(questionId);
  }, [onQuestionAsked]);

  const handleRegenerate = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Shuffle and get different questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.map((q) => ({ ...q, asked: false })));
    setIsLoading(false);
  }, [questions]);

  const askedCount = questions.filter((q) => q.asked).length;
  const displayedQuestions = showAllQuestions ? questions : questions.slice(0, 5);

  if (isLoading && questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={sectionColor} />
        <Text style={styles.loadingText}>Generowanie pytań...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.aiIcon, { backgroundColor: sectionColor }]}>
          <Text style={styles.aiIconText}>AI</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Pytania do fachowca</Text>
          <Text style={styles.headerSubtitle}>
            Zadano {askedCount} z {questions.length} pytań
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(askedCount / questions.length) * 100}%`,
                backgroundColor: sectionColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Questions List */}
      <View style={styles.questionsList}>
        {displayedQuestions.map((question, index) => (
          <TouchableOpacity
            key={question.id}
            style={[
              styles.questionItem,
              question.asked && styles.questionItemAsked,
            ]}
            onPress={() => handleToggleQuestion(question.id)}
          >
            <View style={styles.questionCheckbox}>
              <View
                style={[
                  styles.checkbox,
                  question.asked && [
                    styles.checkboxChecked,
                    { backgroundColor: sectionColor },
                  ],
                ]}
              >
                {question.asked && (
                  <Text style={styles.checkboxIcon}>✓</Text>
                )}
              </View>
            </View>
            <View style={styles.questionContent}>
              <Text
                style={[
                  styles.questionText,
                  question.asked && styles.questionTextAsked,
                ]}
              >
                {question.question}
              </Text>
              <Text style={styles.questionWhy}>
                {question.why}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show More / Less */}
      {questions.length > 5 && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => setShowAllQuestions(!showAllQuestions)}
        >
          <Text style={[styles.showMoreBtnText, { color: sectionColor }]}>
            {showAllQuestions
              ? 'Pokaż mniej'
              : `Pokaż wszystkie (${questions.length})`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Regenerate Button */}
      <TouchableOpacity
        style={[styles.regenerateBtn, { borderColor: sectionColor }]}
        onPress={handleRegenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={sectionColor} />
        ) : (
          <Text style={[styles.regenerateBtnText, { color: sectionColor }]}>
            Wygeneruj nowe pytania
          </Text>
        )}
      </TouchableOpacity>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Wskazówki</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Zaznacz pytania, które już zadałeś fachowcowi
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>📝</Text>
          <Text style={styles.tipText}>
            Zapisz odpowiedzi w notatkach do tej sekcji
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  aiIconText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  questionsList: {
    marginBottom: spacing.md,
  },
  questionItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  questionItemAsked: {
    opacity: 0.7,
    backgroundColor: colors.background.secondary,
  },
  questionCheckbox: {
    marginRight: spacing.md,
    paddingTop: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: 'transparent',
  },
  checkboxIcon: {
    fontSize: 14,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  questionTextAsked: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  questionWhy: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  showMoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  showMoreBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  regenerateBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  regenerateBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  tipsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing['3xl'],
  },
  tipsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
