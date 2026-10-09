import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/colors';
import { useTheme } from '@/src/ThemeContext';

interface MarketingGuide {
  id: string;
  title: string;
  category: string;
  readTime: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  summary: string;
  steps: { title: string; content: string }[];
}

const GUIDES: MarketingGuide[] = [
  {
    id: 'strategy_360',
    title: 'Estrategia de Contenido 360° (Posts + Reels + TikToks)',
    category: 'Estrategia',
    readTime: '4 min',
    icon: 'planet-outline',
    color: '#8B5CF6',
    summary: 'Aprende a integrar Posts, Reels e historias de TikTok bajo una misma campaña unificada.',
    steps: [
      {
        title: '1. Definición del Pilar de Contenido',
        content: 'Establece un mensaje central único para la campaña. No aísles las redes; cada pieza debe sumar al objetivo general de conversión.',
      },
      {
        title: '2. Formato Feed (Posts & Carruseles)',
        content: 'Utiliza los Posts estáticos o carruseles para educar y generar guardados. Muestra infografías, testimonios o propuestas de valor detalladas.',
      },
      {
        title: '3. Formato Reels (Instagram / Meta)',
        content: 'Capta atención en los primeros 3 segundos con ganchos visuales. Usa audio en tendencia y texto superpuesto claro.',
      },
      {
        title: '4. Formato TikToks',
        content: 'Crea contenido orgánico, nativo y dinámico. La autenticidad en TikTok supera a la producción hipereditada. Conecta directo con la audiencia.',
      },
      {
        title: '5. Consolidación de Métricas',
        content: 'Mide la suma de impresiones y clics en Analitika para comparar qué formato genera el menor Costo por Clic (CPC).',
      },
    ],
  },
  {
    id: 'ctr_optimization',
    title: 'Cómo Maximizar el CTR (Click-Through Rate)',
    category: 'Optimización',
    readTime: '3 min',
    icon: 'trending-up-outline',
    color: '#10B981',
    summary: 'Técnicas efectivas para convertir visualizaciones en visitas reales a tus enlaces.',
    steps: [
      {
        title: '1. Call to Action (CTA) Claro',
        content: 'Evita llamados difusos. Usa verbos de acción directa como "Toca aquí para ver el catálogo", "Obtén tu descuento hoy".',
      },
      {
        title: '2. Enlaces con Seguimiento (Tracking Links)',
        content: 'Genera enlaces únicos desde Analitika para cada canal. Así sabrás exactamente qué red social generó cada conversión.',
      },
      {
        title: '3. Optimización de la Landing Page',
        content: 'Asegura que tu sitio web cargue en menos de 2.5 segundos para evitar pérdidas entre el clic del anuncio y la visita final.',
      },
    ],
  },
  {
    id: 'meta_api_guide',
    title: 'Vinculación de Meta Marketing API',
    category: 'Automatización',
    readTime: '5 min',
    icon: 'link-outline',
    color: '#3B82F6',
    summary: 'Guía paso a paso para sincronizar tus anuncios de Facebook e Instagram en tiempo real.',
    steps: [
      {
        title: '1. Conexión OAuth con Meta',
        content: 'En la sección de Campañas, pulsa en "Conectar Meta Ads". Autoriza a Analitika a consultar los datos de tu cuenta publicitaria de forma segura.',
      },
      {
        title: '2. Selección de Campaña Externa',
        content: 'Al crear o editar una campaña, elige "Meta" como plataforma y vincula el ID de tu campaña activa de Facebook/Instagram.',
      },
      {
        title: '3. Sincronización Automática',
        content: 'Analitika importará automáticamente el gasto ejecutado, impresiones y calculará el CTR real diario.',
      },
    ],
  },
];

export default function LearningScreen() {
  const insets = useSafeAreaInsets();
  const { colors: themeColors, isDark } = useTheme();

  const [selectedGuide, setSelectedGuide] = useState<MarketingGuide | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculadora de ROI / ROAS
  const [calcBudget, setCalcBudget] = useState('1000000');
  const [calcRevenue, setCalcRevenue] = useState('3500000');

  const budgetNum = parseFloat(calcBudget) || 0;
  const revenueNum = parseFloat(calcRevenue) || 0;
  const calcRoi = budgetNum > 0 ? (((revenueNum - budgetNum) / budgetNum) * 100).toFixed(1) : '0';
  const calcRoas = budgetNum > 0 ? (revenueNum / budgetNum).toFixed(2) : '0';

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Aprende Marketing</Text>
          <Text style={[styles.headerSub, { color: themeColors.textSecondary }]}>
            Guías estratégicas y herramientas prácticas
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.calcTopBtn, { backgroundColor: isDark ? '#334155' : '#EDE9FE' }]}
          onPress={() => setShowCalculator(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calculator-outline" size={20} color={themeColors.primary} />
          <Text style={[styles.calcTopBtnText, { color: themeColors.primary }]}>Simulador</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
        {/* Banner Promocional / Destacado */}
        <TouchableOpacity
          style={[styles.heroCard, { backgroundColor: isDark ? '#1E293B' : '#E9E4F5' }]}
          activeOpacity={0.9}
          onPress={() => setShowCalculator(true)}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>HERRAMIENTA PRÁCTICA</Text>
            </View>
            <Text style={[styles.heroTitle, { color: themeColors.textPrimary }]}>Calculadora de ROI y ROAS</Text>
            <Text style={[styles.heroSub, { color: themeColors.textSecondary }]}>
              Simula el retorno de inversión y el rendimiento financiero de tus campañas.
            </Text>
          </View>
          <Ionicons name="sparkles" size={36} color={themeColors.primary} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Guías Paso a Paso</Text>

        {GUIDES.map((guide) => (
          <TouchableOpacity
            key={guide.id}
            style={[styles.guideCard, { backgroundColor: themeColors.bgCard }, shadows.card]}
            activeOpacity={0.85}
            onPress={() => setSelectedGuide(guide)}
          >
            <View style={[styles.guideIconBox, { backgroundColor: guide.color + '18' }]}>
              <Ionicons name={guide.icon} size={26} color={guide.color} />
            </View>

            <View style={styles.guideInfo}>
              <View style={styles.guideMetaRow}>
                <Text style={[styles.categoryTag, { color: guide.color }]}>{guide.category}</Text>
                <Text style={[styles.readTimeText, { color: themeColors.textMuted }]}>• {guide.readTime}</Text>
              </View>
              <Text style={[styles.guideTitle, { color: themeColors.textPrimary }]}>{guide.title}</Text>
              <Text style={[styles.guideSummary, { color: themeColors.textSecondary }]} numberOfLines={2}>
                {guide.summary}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal Lector de Guía */}
      <Modal visible={Boolean(selectedGuide)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.guideModalCard, { backgroundColor: themeColors.bgCard }]}>
            {selectedGuide && (
              <>
                <View style={styles.guideModalHeader}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.categoryTag, { color: selectedGuide.color }]}>{selectedGuide.category}</Text>
                    <Text style={[styles.guideModalTitle, { color: themeColors.textPrimary }]}>{selectedGuide.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedGuide(null)}>
                    <Ionicons name="close-circle" size={28} color={themeColors.textMuted} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
                  {selectedGuide.steps.map((step, idx) => (
                    <View key={idx} style={[styles.stepItem, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
                      <Text style={[styles.stepTitle, { color: themeColors.primary }]}>{step.title}</Text>
                      <Text style={[styles.stepContent, { color: themeColors.textSecondary }]}>{step.content}</Text>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[styles.closeGuideBtn, { backgroundColor: themeColors.primary }]}
                  onPress={() => setSelectedGuide(null)}
                >
                  <Text style={styles.closeGuideBtnText}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Calculadora ROI / ROAS */}
      <Modal visible={showCalculator} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.calcModalCard, { backgroundColor: themeColors.bgCard }]}>
            <View style={styles.guideModalHeader}>
              <Text style={[styles.guideModalTitle, { color: themeColors.primary }]}>Calculadora ROI / ROAS</Text>
              <TouchableOpacity onPress={() => setShowCalculator(false)}>
                <Ionicons name="close" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginVertical: 10 }}>
              <View style={styles.calcInputGroup}>
                <Text style={[styles.calcLabel, { color: themeColors.textSecondary }]}>Presupuesto / Inversión ($)</Text>
                <TextInput
                  style={[styles.calcInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={calcBudget}
                  onChangeText={setCalcBudget}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.calcInputGroup}>
                <Text style={[styles.calcLabel, { color: themeColors.textSecondary }]}>Ingresos Generados ($)</Text>
                <TextInput
                  style={[styles.calcInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={calcRevenue}
                  onChangeText={setCalcRevenue}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.resultsGrid}>
                <View style={[styles.resultCard, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
                  <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>ROI Estimado</Text>
                  <Text style={[styles.resultValue, { color: Number(calcRoi) >= 0 ? '#10B981' : '#EF4444' }]}>{calcRoi}%</Text>
                </View>
                <View style={[styles.resultCard, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
                  <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>ROAS</Text>
                  <Text style={[styles.resultValue, { color: themeColors.primary }]}>{calcRoas}x</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeGuideBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowCalculator(false)}
            >
              <Text style={styles.closeGuideBtnText}>Cerrar Simulador</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: typography.bold },
  headerSub: { fontSize: 13, marginTop: 2 },
  calcTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    gap: 6,
  },
  calcTopBtnText: { fontSize: 13, fontWeight: typography.bold },
  scrollContent: { paddingHorizontal: 20 },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: radii.xl,
    marginBottom: 24,
  },
  heroBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: typography.bold },
  heroTitle: { fontSize: 17, fontWeight: typography.bold },
  heroSub: { fontSize: 12, marginTop: 4, paddingRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: typography.bold, marginBottom: 14 },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 12,
  },
  guideIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  guideInfo: { flex: 1, paddingRight: 8 },
  guideMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  categoryTag: { fontSize: 11, fontWeight: typography.bold },
  readTimeText: { fontSize: 11 },
  guideTitle: { fontSize: 15, fontWeight: typography.bold },
  guideSummary: { fontSize: 12, marginTop: 3 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  guideModalCard: {
    maxHeight: '80%',
    borderRadius: radii.xl,
    padding: 20,
  },
  guideModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  guideModalTitle: { fontSize: 18, fontWeight: typography.bold, marginTop: 4 },
  stepItem: {
    padding: 14,
    borderRadius: radii.md,
    marginBottom: 10,
  },
  stepTitle: { fontSize: 14, fontWeight: typography.bold, marginBottom: 4 },
  stepContent: { fontSize: 13, lineHeight: 18 },
  closeGuideBtn: {
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  closeGuideBtnText: { color: '#fff', fontSize: 14, fontWeight: typography.bold },
  calcModalCard: { borderRadius: radii.xl, padding: 20 },
  calcInputGroup: { marginBottom: 12 },
  calcLabel: { fontSize: 13, fontWeight: typography.medium, marginBottom: 6 },
  calcInput: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  resultsGrid: { flexDirection: 'row', gap: 12, marginTop: 10 },
  resultCard: {
    flex: 1,
    padding: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  resultLabel: { fontSize: 12 },
  resultValue: { fontSize: 20, fontWeight: typography.bold, marginTop: 4 },
});
