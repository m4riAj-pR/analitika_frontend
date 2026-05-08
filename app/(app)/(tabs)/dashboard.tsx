import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountAvatar from '../../../src/components/AccountAvatar';
import { campaignsApi } from '../../../src/services/api/campaign';
import { notificationsApi } from '../../../src/services/api/notifications';
import { getClicsPorDia, getMetricas, getTablaClic } from '../../../src/services/api/stats';
import type { Campaign } from '../../../src/services/api/types';
import { colors, shadows } from '../../../src/theme/colors';
import { useTheme } from '../../../src/ThemeContext';

const { width } = Dimensions.get('window');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

// ─── Header Component ────────────────────────────────────────────────────────
function Header({ unreadCount }: { unreadCount: number }) {
  const router = useRouter();
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../../assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/notifications')}
        >
          <Ionicons name="notifications" size={28} color={themeColors.primary} />
          {unreadCount > 0 && <View style={[styles.unreadDot, { borderColor: themeColors.bgPage }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/account' as any)}
        >
          <AccountAvatar size={42} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Campaign Card ───────────────────────────────────────────────────────────
function CampaignCard({ campaign, onSelect, index }: { campaign: Campaign; onSelect: () => void; index: number }) {
  const { colors: themeColors, isDark } = useTheme();
  const isAltDesign = index % 2 === 0;
  const isInactive = String(campaign.status).toLowerCase() !== 'active';

  return (
    <View style={[
      styles.cardContainer, 
      { backgroundColor: isDark ? '#1E293B' : '#E9E4F5' },
      isInactive && (isDark ? { backgroundColor: '#1e293b', opacity: 0.6 } : styles.cardInactive)
    ]}>
      {/* Decoración de fondo */}
      <View style={styles.decorationContainer}>
        {isAltDesign ? (
          <View style={styles.barsContainer}>
            <View style={[styles.bar, { height: '60%' }, isInactive && { backgroundColor: '#CBD5E1' }]} />
            <View style={[styles.bar, { height: '80%' }, isInactive && { backgroundColor: '#CBD5E1' }]} />
            <View style={[styles.bar, { height: '100%' }, isInactive && { backgroundColor: '#CBD5E1' }]} />
          </View>
        ) : (
          <View style={[styles.circleDecoration, isInactive && { backgroundColor: '#CBD5E1' }]} />
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: themeColors.textPrimary }, isInactive && { color: themeColors.textMuted }]}>{campaign.name}</Text>
        <View style={[styles.statusBadgeInline, isInactive ? (isDark ? { backgroundColor: '#334155' } : styles.statusBadgeInactive) : styles.statusBadgeActive]}>
          <Text style={[styles.statusBadgeTextInline, { color: isDark ? '#94A3B8' : '#475569' }]}>
            {String(campaign.status).toUpperCase()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.cardButton, { backgroundColor: themeColors.primary }, isInactive && { backgroundColor: isDark ? '#334155' : '#94A3B8' }]}
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
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={emptyStyles.wrapper}>
      <View style={[emptyStyles.iconCircle, { backgroundColor: isDark ? '#1E293B' : '#F3F0FA' }]}>
        <Ionicons name="layers-outline" size={52} color={themeColors.primary} />
      </View>
      <Text style={[emptyStyles.title, { color: themeColors.textPrimary }]}>No hay campañas</Text>
      <Text style={[emptyStyles.subtitle, { color: themeColors.textSecondary }]}>
        Parece que aún no has creado ninguna campaña activa.
      </Text>
      <TouchableOpacity
        style={[emptyStyles.cta, { backgroundColor: themeColors.primary }]}
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
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={[styles.kpiCard, { backgroundColor: isDark ? '#1E293B' : '#F3F0FA' }]}>
      <Text style={[styles.kpiLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <Text style={[isCurrency ? styles.kpiValueCurrency : styles.kpiValue, { color: themeColors.primary }]} numberOfLines={1}>
        {isCurrency ? formatCurrency(value) : value}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { campaignId } = useLocalSearchParams();
  const { colors: themeColors, isDark } = useTheme();

  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

        // Mostramos todas las campañas (activas e inactivas)
        setCampaigns(all);

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

    // Cargar conteo de notificaciones
    notificationsApi.getUnreadCount()
      .then((res: any) => setUnreadCount(res.count || 0))
      .catch(() => setUnreadCount(0));
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
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.bgPage }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  // ─── Vista de Lista ──────────────────────────────────────────────────────────
  if (!selectedCampaign) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
        <Header unreadCount={unreadCount} />

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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setSelectedCampaign(null)} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={themeColors.primary} />
          <Text style={[styles.backText, { color: themeColors.primary }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.detailTitle, { color: themeColors.primary }]}>Estadísticas</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.campaignBanner, { backgroundColor: isDark ? '#1E293B' : '#F3F0FA', padding: 16, borderRadius: 20 }]}>
          <Text style={[styles.campaignBannerText, { color: themeColors.textPrimary }]}>{selectedCampaign?.name}</Text>
          <View style={[styles.statusBadge, selectedCampaign?.status === 'active' ? styles.statusBadgeActive : (isDark ? { backgroundColor: '#334155' } : null)]}>
            <Text style={[styles.statusBadgeText, { color: isDark ? '#F1F5F9' : '#000' }]}>{selectedCampaign?.status === 'active' ? 'Activa' : 'Inactiva'}</Text>
          </View>
        </View>

        {loadingStats ? (
          <ActivityIndicator size="small" color={themeColors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <KpiCard label="Clics" value={metricas?.clics ?? 0} />
              <KpiCard label="Convers." value={metricas?.conversiones ?? 0} />
              <KpiCard label="CPC" value={metricas?.cpc ?? 0} isCurrency />
              <KpiCard label="ROI" value={metricas?.roi ?? 0} isCurrency />
            </View>

            <View style={[styles.chartCard, { backgroundColor: themeColors.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Clics por Día</Text>
              {hasChart ? (
                <LineChart
                  data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                  width={width - 80}
                  height={220}
                  chartConfig={{
                    backgroundColor: themeColors.bgCard,
                    backgroundGradientFrom: themeColors.bgCard,
                    backgroundGradientTo: themeColors.bgCard,
                    color: (opacity = 1) => isDark ? `rgba(173, 141, 242, ${opacity})` : `rgba(95, 27, 242, ${opacity})`,
                    labelColor: (opacity = 1) => themeColors.textSecondary,
                    propsForDots: { r: '5', strokeWidth: '2', stroke: themeColors.primary },
                  }}
                  bezier
                  style={{ borderRadius: 16, marginTop: 10 }}
                />
              ) : (
                <Text style={[styles.noDataText, { color: themeColors.textMuted }]}>No hay datos suficientes para la gráfica.</Text>
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
  logoWrapper: { flex: 80, alignItems: 'flex-start', justifyContent: 'center' },
  logoImage: { width: 180, height: 180, marginTop: 100, marginLeft: -12 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileButton: { padding: 4, justifyContent: 'center' },

  listTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: 30,
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
  cardInactive: {
    backgroundColor: '#F1F5F9',
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
  statusBadgeInline: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusBadgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  statusBadgeTextInline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
});

const emptyStyles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F0FA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  cta: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: '#FFF', fontWeight: '600' },
});
