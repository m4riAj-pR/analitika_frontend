
export const palette = {
  // Violeta principal (1) — botones, títulos, acciones primarias
  purple1: '#5f1bf2',

  // Violeta medio (2) — estados hover, íconos activos
  purple2: '#8857f2',

  // Violeta claro (3) — bordes, inputs, elementos secundarios
  purple3: '#ad8df2',

  // Lila suave (4) — chips, badges, estados seleccionados
  purple4: '#8372f2',

  // Análogo neutro — fondos de cards, secciones, formularios
  analogWhite: '#f2f2f2',

  // Utilitarios puros
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const colors = {
  // --- Marca ---
  primary:      palette.purple1,   // Botones principales, CTA
  primaryHover: palette.purple2,   // Estado presionado del botón principal
  secondary:    palette.purple4,   // Botones secundarios, tabs activos

  // --- Texto ---
  textPrimary:   palette.purple1,  // Títulos y encabezados
  textSecondary: palette.purple2,  // Subtítulos, labels
  textMuted:     palette.purple3,  // Placeholders, texto deshabilitado
  textBody:      '#6B7280',        // Texto de párrafo (legibilidad)
  textOnPrimary: palette.white,    // Texto sobre fondo purple1

  // --- Fondos ---
  bgPage:        palette.white,         // Fondo general de la app
  bgCard:        palette.analogWhite,   // Cards, secciones
  bgInput:       palette.white,         // Campos de texto
  bgAccent:      '#EDE9FE',             // Fondo de la card de login/registro
  bgBlob:        '#C4B5FD',             // Círculos decorativos del splash

  // --- Bordes ---
  borderInput:   '#DDD6FE',        // Borde de inputs en reposo
  borderFocus:   palette.purple1,  // Borde de input con foco
  borderDivider: '#DDD6FE',        // Líneas divisoras

  // --- Estados ---
  success: '#10B981',
  error:   '#EF4444',
  warning: '#F59E0B',
  info:    palette.purple2,

  // --- Checkbox / Toggle ---
  checkboxActive:   palette.purple1,
  checkboxInactive: '#DDD6FE',

  // --- Links ---
  link: palette.purple4,
} as const;

export const typography = {
  // Tamaños
  sizeXs:  11,
  sizeSm:  13,
  sizeMd:  15,
  sizeLg:  17,
  sizeXl:  20,
  size2xl: 24,
  size3xl: 28,
  size4xl: 32,

  // Pesos
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,

  // Interlineado
  lineHeightSm: 18,
  lineHeightMd: 24,
  lineHeightLg: 36,
} as const;

// ------------------------------------------------------------------
// ESPACIADO — sistema de 4pt
// ------------------------------------------------------------------
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  pill: 999,
} as const;

// ------------------------------------------------------------------
// SOMBRAS
// ------------------------------------------------------------------
export const shadows = {
  card: {
    shadowColor: palette.purple1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  none: {},
} as const;

// ------------------------------------------------------------------
// ESTILOS REUTILIZABLES — StyleSheet-ready objects
// ------------------------------------------------------------------
export const sharedStyles = {
  // Botón principal
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontWeight: typography.bold,
    fontSize: typography.sizeLg,
  },

  // Input estándar
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizeSm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Blobber decorativo
  blob: {
    position: 'absolute' as const,
    borderRadius: radii.pill,
    backgroundColor: colors.bgBlob,
    opacity: 0.55,
  },

  // Divider con punto central
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.borderDivider,
  },
  dividerDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderDivider,
    marginHorizontal: spacing.sm,
  },

  // Link texto
  link: {
    color: colors.link,
    textDecorationLine: 'underline' as const,
    fontWeight: typography.medium,
  },

  // Texto footer (p.ej. "¿Ya tienes cuenta?")
  footerText: {
    textAlign: 'center' as const,
    fontSize: typography.sizeSm,
    color: colors.textBody,
  },
} as const;