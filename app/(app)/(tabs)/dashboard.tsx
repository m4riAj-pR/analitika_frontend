import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { campaignsApi } from '../../../src/services/api/campaign';
import { getClicsPorDia, getMetricas, getTablaClic } from '../../../src/services/api/stats';
import { colors, palette, radii, shadows, spacing, typography } from '../../../src/theme/colors';
import type { Campaign } from '../../../src/services/api/types';

const { width } = Dimensions.get('window');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

// ─── Header Component ────────────────────────────────────────────────────────
function Header() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoBlob} />
        <Text style={styles.logoText}>Analitika</Text>
      </View>
      <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
        <Ionicons name="person-circle" size={42} color={palette.purple3} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Campaign Card ───────────────────────────────────────────────────────────
function CampaignCard({ campaign, onSelect }: { campaign: Campaign; onSelect: () => void }) {
  // Generar un diseño decorativo aleatorio basado en el ID o nombre
  const isAltDesign = campaign.name.length % 2 === 0;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Nombre</Text>
          <Text style={styles.cardTitle}>{campaign.name}</Text>
        </View>

        {/* Decoración visual (barras o semicírculo como en la imagen) */}
        <View style={styles.decorationContainer}>
          {isAltDesign ? (
            <View style={styles.barsContainer}>
              <View style={[styles.bar, { height: '40%' }]} />
              <View style={[styles.bar, { height: '70%' }]} />
              <View style={[styles.bar, { height: '100%' }]} />
            </View>
          ) : (
            <View style={styles.circleDecoration} />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.cardButton}
        activeOpacity={0.8}
        onPress={onSelect}
      >
        <Text style={styles.cardButtonText}>Ver Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
  const router = useRouter();
  return (
    <View style={emptyStyles.wrapper}>
      <View style={emptyStyles.iconCircle}>
        <Ionicons name="layers-outline" size={52} color={colors.primary} />
      </View>
      <Text style={emptyStyles.title}>No hay campañas</Text>
      <Text style={emptyStyles.subtitle}>
        Parece que aún no has creado ninguna campaña. Comienza ahora para ver tus resultados.
      </Text>
      <TouchableOpacity
        style={emptyStyles.cta}
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/create')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={emptyStyles.ctaText}>Crear mi primera campaña</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, isCurrency = false }: { label: string; value: number; isCurrency?: boolean }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={isCurrency ? styles.kpiValueCurrency : styles.kpiValue} numberOfLines={1}>
        {isCurrency ? formatCurrency(value) : value}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [loadingStats, setLoadingStats] = useState(false);
  const [metricas, setMetricas] = useState<any>(null);
  const [clicsPorDia, setClicsPorDia] = useState<any[]>([]);
  const [tablaClics, setTablaClics] = useState<any[]>([]);
  const [statsError, setStatsError] = useState(false);

  // 1️⃣ Cargar lista de campañas
  useEffect(() => {
    campaignsApi
      .list()
      .then((data) => {
        setCampaigns(data || []);
        setSelectedCampaign(null);
      })
      .catch((err) => {
        console.error("Error loading campaigns:", err);
        setCampaigns([]);
        setSelectedCampaign(null);
      })
      .finally(() => setLoadingCampaigns(false));
  }, []);

  // 2️⃣ Cargar estadísticas de la campaña seleccionada
  const fetchStats = useCallback(async (campaign: Campaign) => {
    setLoadingStats(true);
    setStatsError(false);

    try {
      const [met, clicsDia, tabla] = await Promise.all([
        getMetricas(campaign.id_campaign),
        getClicsPorDia(campaign.id_campaign),
        getTablaClic(campaign.id_campaign),
      ]);
      setMetricas(met);
      setClicsPorDia(Array.isArray(clicsDia) ? clicsDia : []);
      setTablaClics(Array.isArray(tabla) ? tabla : []);
    } catch {
      setStatsError(true);
      setMetricas(null);
      setClicsPorDia([]);
      setTablaClics([]);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCampaign) fetchStats(selectedCampaign);
  }, [selectedCampaign, fetchStats]);

  // ─── Loading inicial ───────────────────────────────────────────────────────
  if (loadingCampaigns) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando dashboard…</Text>
      </View>
    );
  }

  // ─── Sin campañas ─────────────────────────────────────────────────────────
  if (campaigns.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header />
        <EmptyState />
      </View>
    );
  }

  // ─── Vista de Lista de Dashboards ──────────────────────────────────────────
  if (!selectedCampaign) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header />
        <Text style={styles.listTitle}>DashBoards</Text>
        <FlatList
          data={campaigns}
          keyExtractor={(item) => String(item.id_campaign)}
          renderItem={({ item }) => (
            <CampaignCard
              campaign={item}
              onSelect={() => setSelectedCampaign(item)}
            />
          )}
          contentContainerStyle={[styles.listScrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // ─── Con campañas ─────────────────────────────────────────────────────────
  const chartLabels = clicsPorDia.map((d: any, i) => d.fecha || d.day || `D${i + 1}`);
  const chartValues = clicsPorDia.map((d: any) => Number(d.clics || d.count || 0));
  const hasChart = chartValues.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* HEADER DE DETALLE */}
      <View style={styles.detailHeader}>
        <TouchableOpacity
          onPress={() => setSelectedCampaign(null)}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Estadísticas</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* CAMPAIGN SELECTOR */}
        {campaigns.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.campaignSelector}>
            {campaigns.map((c) => {
              const selected = c.id_campaign === selectedCampaign?.id_campaign;
              return (
                <TouchableOpacity
                  key={c.id_campaign}
                  style={[styles.campaignChip, selected && styles.campaignChipActive]}
                  onPress={() => setSelectedCampaign(c)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.campaignChipText, selected && styles.campaignChipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* CAMPAIGN NAME BANNER */}
        <View style={styles.campaignBanner}>
          <Ionicons name="megaphone-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.campaignBannerText} numberOfLines={1}>
            {selectedCampaign?.name}
          </Text>
          <View style={[styles.statusBadge, selectedCampaign?.status === 'active' && styles.statusBadgeActive]}>
            <Text style={styles.statusBadgeText}>
              {selectedCampaign?.status === 'active' ? 'Activa' : selectedCampaign?.status === 'paused' ? 'Pausada' : 'Finalizada'}
            </Text>
          </View>
        </View>

        {/* LOADING STATS */}
        {loadingStats ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando métricas…</Text>
          </View>
        ) : statsError ? (
          /* SIN STATS AÚN */
          <View style={styles.noStatsCard}>
            <Ionicons name="analytics-outline" size={40} color={palette.purple3} />
            <Text style={styles.noStatsTitle}>Sin métricas todavía</Text>
            <Text style={styles.noStatsSubtitle}>
              Comparte el link trackeable de esta campaña para comenzar a registrar clics y conversiones.
            </Text>
          </View>
        ) : (
          <>
            {/* KPI CARDS */}
            <View style={styles.kpiGrid}>
              <KpiCard label="Clics" value={metricas?.clics ?? 0} />
              <KpiCard label="Convers." value={metricas?.conversiones ?? 0} />
              <KpiCard label="CPC" value={metricas?.cpc ?? 0} isCurrency />
              <KpiCard label="ROI" value={metricas?.roi ?? 0} isCurrency />
            </View>

            {/* GRÁFICA */}
            <View style={[styles.chartCard, shadows.card]}>
              <Text style={styles.sectionTitle}>Clics por Día</Text>
              {hasChart ? (
                <View pointerEvents="none" style={styles.chartWrapper}>
                  <LineChart
                    data={{
                      labels: chartLabels,
                      datasets: [{ data: chartValues }],
                    }}
                    width={width - spacing.xl * 2 - 40}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.bgCard,
                      backgroundGradientFrom: colors.bgCard,
                      backgroundGradientTo: colors.bgCard,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: { r: '5', strokeWidth: '2', stroke: colors.primary },
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16 }}
                  />
                </View>
              ) : (
                <View style={styles.noChartPlaceholder}>
                  <Ionicons name="trending-up-outline" size={32} color={palette.purple3} />
                  <Text style={styles.noChartText}>Los datos aparecerán aquí cuando registres clics.</Text>
                </View>
              )}
            </View>

            {/* TABLA DE CLICS */}
            <View style={[styles.tableCard, shadows.card]}>
              <Text style={styles.sectionTitle}>Últimos Clics</Text>
              {tablaClics.length === 0 ? (
                <View style={styles.noChartPlaceholder}>
                  <Ionicons name="list-outline" size={32} color={palette.purple3} />
                  <Text style={styles.noChartText}>Aún no hay clics registrados.</Text>
                </View>
              ) : (
                <View style={styles.tableWrapper}>
                  <View style={styles.tableRowHeader}>
                    <Text style={[styles.tableColHeader, { flex: 1.2 }]}>Fecha</Text>
                    <Text style={[styles.tableColHeader, { flex: 1 }]}>Hora</Text>
                    <Text style={[styles.tableColHeader, { flex: 1 }]}>País</Text>
                  </View>
                  {tablaClics.map((row, i) => (
                    <View
                      key={i}
                      style={[styles.tableRow, i === tablaClics.length - 1 && { borderBottomWidth: 0 }]}
                    >
                      <Text style={[styles.tableCol, { flex: 1.2 }]}>{row.fecha || 'N/A'}</Text>
                      <Text style={[styles.tableCol, { flex: 1 }]}>{row.hora || 'N/A'}</Text>
                      <Text style={[styles.tableCol, { flex: 1 }]}>{row.pais || 'N/A'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Empty State Styles ───────────────────────────────────────────────────────
const emptyStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl * 1.5,
    gap: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size2xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.sm,
  },
  ctaText: {
    color: '#fff',
    fontWeight: typography.bold,
    fontSize: 16,
  },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.textSecondary, fontSize: typography.sizeSm },

  /* Header */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    height: 70,
  },
  logoWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBlob: {
    position: 'absolute',
    left: -10,
    top: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.purple3,
    opacity: 0.3,
  },
  logoText: {
    fontSize: 26,
    fontWeight: typography.bold,
    color: colors.primary,
    marginLeft: 5,
  },
  profileButton: {
    padding: 2,
  },

  /* List View */
  listTitle: {
    fontSize: 32,
    fontWeight: typography.bold,
    color: colors.primary,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
  },
  listScrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },

  /* Campaign Card */
  cardContainer: {
    backgroundColor: '#EAE6F8',
    borderRadius: 30,
    padding: 24,
    height: 180,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadows.card,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: typography.bold,
    color: '#1A1A1A',
    lineHeight: 28,
  },
  decorationContainer: {
    width: 120,
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: '100%',
  },
  bar: {
    width: 25,
    backgroundColor: palette.purple3,
    borderRadius: 4,
    opacity: 0.6,
  },
  circleDecoration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: palette.purple3,
    opacity: 0.4,
    position: 'absolute',
    right: -40,
    top: -20,
  },
  cardButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontWeight: typography.bold,
    fontSize: 16,
  },

  /* Detail Header */
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: typography.medium,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: typography.bold,
    color: colors.primary,
  },

  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    paddingTop: spacing.sm,
  },

  /* Campaign Selector */
  campaignSelector: { marginBottom: -spacing.sm },
  campaignChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.bgCard,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  campaignChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: colors.primary,
  },
  campaignChipText: {
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  campaignChipTextActive: {
    color: colors.primary,
  },

  /* Campaign Banner */
  campaignBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 4,
  },
  campaignBannerText: {
    flex: 1,
    fontSize: typography.sizeSm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  statusBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: '#F1F5F9',
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },

  /* Stats loading */
  statsLoading: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },

  /* No stats yet */
  noStatsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: spacing.xl * 1.5,
    alignItems: 'center',
    gap: spacing.md,
  },
  noStatsTitle: {
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  noStatsSubtitle: {
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* KPIs */
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '47%',
    backgroundColor: '#EDE9FE',
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'center',
    ...shadows.card,
  },
  kpiLabel: {
    fontSize: typography.sizeMd,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  kpiValue: {
    fontSize: typography.size2xl,
    color: colors.primary,
    fontWeight: typography.bold,
  },
  kpiValueCurrency: {
    fontSize: typography.sizeLg,
    color: colors.primary,
    fontWeight: typography.bold,
  },

  /* Cards */
  chartCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  tableCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartWrapper: {
    alignItems: 'center',
    marginLeft: -10,
  },
  noChartPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  noChartText: {
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Tabla */
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tableColHeader: {
    fontSize: typography.sizeSm,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tableCol: {
    fontSize: typography.sizeSm,
    color: colors.textPrimary,
  },
});
