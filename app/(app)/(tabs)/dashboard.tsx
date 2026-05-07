import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AccountAvatar from '../../../src/components/AccountAvatar';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { campaignsApi } from '../../../src/services/api/campaign';
import { getClicsPorDia, getMetricas, getTablaClic } from '../../../src/services/api/stats';
import type { Campaign } from '../../../src/services/api/types';
import { colors, palette, radii, shadows, spacing, typography } from '../../../src/theme/colors';

const { width } = Dimensions.get('window');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

// ─── Header Component ────────────────────────────────────────────────────────
function Header() {
  const router = useRouter();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <Image 
          source={require('../../../assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={styles.profileButton}
        activeOpacity={0.7}
        onPress={() => router.push('/(app)/(tabs)/account')}
      >
        <AccountAvatar size={42} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Campaign Card ───────────────────────────────────────────────────────────
function CampaignCard({ campaign, onSelect, index }: { campaign: Campaign; onSelect: () => void; index: number }) {
  const isAltDesign = index % 2 === 0;

  return (
    <View style={styles.cardContainer}>
      {/* Decoración de fondo */}
      <View style={styles.decorationContainer}>
        {isAltDesign ? (
          <View style={styles.barsContainer}>
            <View style={[styles.bar, { height: '60%' }]} />
            <View style={[styles.bar, { height: '80%' }]} />
            <View style={[styles.bar, { height: '100%' }]} />
          </View>
        ) : (
          <View style={styles.circleDecoration} />
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{campaign.name}</Text>
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
        Parece que aún no has creado ninguna campaña activa.
      </Text>
      <TouchableOpacity
        style={emptyStyles.cta}
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/create')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={emptyStyles.ctaText}>Crear campaña</Text>
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
  const { campaignId } = useLocalSearchParams();

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
      .getAll()
      .then((data: any) => {
        const all = Array.isArray(data) ? data : (data?.response || []);
        
        // La lista principal solo muestra las activas
        const activeOnly = all.filter((c: Campaign) => String(c.status).toLowerCase() === 'active');
        setCampaigns(activeOnly);

        if (campaignId) {
            const found = all.find((c: Campaign) => String(c.id_campaign) === String(campaignId));
            if (found) {
                setSelectedCampaign(found);
                return;
            }
        }
        setSelectedCampaign(null);
      })
      .catch((err: any) => {
        console.error("Error loading campaigns:", err);
        setCampaigns([]);
        setSelectedCampaign(null);
      })
      .finally(() => setLoadingCampaigns(false));
  }, [campaignId]);

  // 2️⃣ Cargar estadísticas
  const fetchStats = useCallback(async (campaign: Campaign) => {
    if (campaign.id_campaign == null) {
      setStatsError(true);
      return;
    }
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

  if (loadingCampaigns) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ─── Vista de Lista ──────────────────────────────────────────────────────────
  if (!selectedCampaign) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header />
        <Text style={styles.listTitle}>DashBoards</Text>
        
        {campaigns.length === 0 ? (
            <EmptyState />
        ) : (
            <FlatList
              data={campaigns}
              keyExtractor={(item) => String(item.id_campaign)}
              renderItem={({ item, index }) => (
                <CampaignCard
                  campaign={item}
                  index={index}
                  onSelect={() => setSelectedCampaign(item)}
                />
              )}
              contentContainerStyle={[styles.listScrollContent, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
            />
        )}
      </View>
    );
  }

  // ─── Vista de Detalle ────────────────────────────────────────────────────────
  const chartLabels = clicsPorDia.map((d: any, i) => d.fecha || d.day || `D${i + 1}`);
  const chartValues = clicsPorDia.map((d: any) => Number(d.clics || d.count || 0));
  const hasChart = chartValues.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setSelectedCampaign(null)} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Estadísticas</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.campaignBanner}>
          <Text style={styles.campaignBannerText}>{selectedCampaign?.name}</Text>
          <View style={[styles.statusBadge, selectedCampaign?.status === 'active' && styles.statusBadgeActive]}>
            <Text style={styles.statusBadgeText}>{selectedCampaign?.status === 'active' ? 'Activa' : 'Inactiva'}</Text>
          </View>
        </View>

        {loadingStats ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <KpiCard label="Clics" value={metricas?.clics ?? 0} />
              <KpiCard label="Convers." value={metricas?.conversiones ?? 0} />
              <KpiCard label="CPC" value={metricas?.cpc ?? 0} isCurrency />
              <KpiCard label="ROI" value={metricas?.roi ?? 0} isCurrency />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Clics por Día</Text>
              {hasChart ? (
                <LineChart
                  data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                  width={width - 80}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#FFF',
                    backgroundGradientFrom: '#FFF',
                    backgroundGradientTo: '#FFF',
                    color: (opacity = 1) => `rgba(95, 27, 242, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                    propsForDots: { r: '5', strokeWidth: '2', stroke: colors.primary },
                  }}
                  bezier
                  style={{ borderRadius: 16, marginTop: 10 }}
                />
              ) : (
                <Text style={styles.noDataText}>No hay datos suficientes para la gráfica.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 80,
  },
  logoWrapper: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  logoImage: { width: 300, height: 300 },
  profileButton: { padding: 4 },

  listTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  listScrollContent: { paddingHorizontal: 24 },

  // CARD DESIGN MOCKUP
  cardContainer: {
    backgroundColor: '#E9E4F5',
    borderRadius: 28,
    padding: 24,
    height: 190,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  decorationContainer: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: 150,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: '60%',
  },
  bar: {
    width: 28,
    backgroundColor: '#AD8DF2',
    borderRadius: 6,
    opacity: 0.5,
  },
  circleDecoration: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#AD8DF2',
    opacity: 0.4,
    position: 'absolute',
    right: -40, top: -20,
  },
  cardInfo: { zIndex: 2 },
  cardLabel: { fontSize: 22, fontWeight: '600', color: '#000' },
  cardName: { fontSize: 22, fontWeight: '600', color: '#000' },
  cardButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 2,
  },
  cardButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  // DETAIL
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: colors.primary, marginLeft: 4, fontWeight: '600' },
  detailTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.primary },
  scrollContent: { paddingHorizontal: 24 },
  campaignBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  campaignBannerText: { fontSize: 20, fontWeight: '700', color: '#000' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#EEE' },
  statusBadgeActive: { backgroundColor: '#D1FAE5' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { width: '47%', backgroundColor: '#F3F0FA', padding: 16, borderRadius: 20 },
  kpiLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  kpiValueCurrency: { fontSize: 18, fontWeight: '700', color: colors.primary },
  chartCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, ...shadows.card },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  noDataText: { textAlign: 'center', marginTop: 20, color: '#999' },
});

const emptyStyles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F0FA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  cta: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: '#FFF', fontWeight: '600' },
});
