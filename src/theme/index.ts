// Design System - Aplikacja Remontowa

export const colors = {
  // Primary brand colors
  primary: {
    main: '#2563EB',
    light: '#60A5FA',
    dark: '#1D4ED8',
  },
  secondary: {
    main: '#64748B',
    light: '#94A3B8',
    dark: '#475569',
  },

  // Section colors - każda sekcja ma swój kolor
  sections: {
    plan: '#4A90A4',        // Plan i Inspekcja - niebieski
    electrical: '#F5A623',   // Elektryka - pomarańczowy
    plumbing: '#7ED321',     // Hydraulika - zielony
    carpentry: '#8B572A',    // Stolarka - brązowy
    finishing: '#9B59B6',    // Wykończenie - fioletowy
    costs: '#E74C3C',        // Kosztorys - czerwony
  },

  // Background colors
  background: {
    primary: '#F8FAFC',
    secondary: '#F1F5F9',
    tertiary: '#E2E8F0',
  },

  // Surface colors
  surface: {
    primary: '#FFFFFF',
    elevated: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },

  // Status colors
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Border colors
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Sekcje z metadanymi
export const sectionConfig = {
  plan: {
    id: 'plan',
    name: 'Plan i Inspekcja',
    icon: 'clipboard-check',
    color: colors.sections.plan,
    order: 1,
  },
  electrical: {
    id: 'electrical',
    name: 'Elektryka',
    icon: 'flash',
    color: colors.sections.electrical,
    order: 2,
  },
  plumbing: {
    id: 'plumbing',
    name: 'Hydraulika',
    icon: 'water',
    color: colors.sections.plumbing,
    order: 3,
  },
  carpentry: {
    id: 'carpentry',
    name: 'Stolarka',
    icon: 'hammer',
    color: colors.sections.carpentry,
    order: 4,
  },
  finishing: {
    id: 'finishing',
    name: 'Wykończenie',
    icon: 'brush',
    color: colors.sections.finishing,
    order: 5,
  },
  costs: {
    id: 'costs',
    name: 'Kosztorys',
    icon: 'calculator',
    color: colors.sections.costs,
    order: 6,
  },
} as const;

export type SectionType = keyof typeof sectionConfig;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  sectionConfig,
};

export default theme;
