import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountAvatar from '../../../src/components/AccountAvatar';
import RoiPredictor from '../../../src/components/RoiPredictor';
import { useProfile } from '../../../src/hooks/useProfile';
import { campaignsApi } from '../../../src/services/api/campaign';
import { notificationsApi } from '../../../src/services/api/notifications';
import { getClicsPorDia, getMetricas, getTablaClic } from '../../../src/services/api/stats';
import type { Campaign } from '../../../src/services/api/types';
import { colors, radii, shadows, spacing, typography } from '../../../src/theme/colors';
import { deviceFromUA, formatDayShort, formatInt, formatMoney, formatPct, formatRatio, statusLabel } from '../../../src/utils/format';
import { useTheme } from '../../../src/ThemeContext';

const { width } = Dimensions.get('window');
const KPI_CARD_WIDTH = (width - 48 - 15) / 2;

// Días visibles en la gráfica de barras para que las etiquetas no se encimen
const CHART_MAX_DAYS = 7;
// Ancho interno de la tarjeta: pantalla − padding del scroll (2×24) − padding de la tarjeta (2×20)
const CHART_WIDTH = width - 48 - 40;

// ─── Header Component ────────────────────────────────────────────────────────
function Header({ unreadCount }: { unreadCount: number }) {
  const router = useRouter();
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <Image
          source={isDark ? require('../../../assets/images/icon_negative.png') : require('../../../assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/notifications')}
          accessibilityLabel={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
        >
          <Ionicons name="notifications" size={28} color={themeColors.primary} />
          {unreadCount > 0 && <View style={[styles.unreadDot, { borderColor: themeColors.bgPage }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/(tabs)/account')}
          accessibilityLabel="Mi perfil"
        >
          <AccountAvatar size={42} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Campaign Card ───────────────────────────────────────────────────────────
function CampaignCard({ campaign, onSelect, index, isOwner }: { campaign: Campaign; onSelect: () => void; index: number; isOwner: boolean }) {
  const { colors: themeColors, isDark } = useTheme();
  
  // Extraer creador si existe la firma [Creador: Name]
  const creatorMatch = campaign.description?.match(/\[Creador: (.*?)\]/);
  const creatorName = creatorMatch ? creatorMatch[1] : null;
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
        {isOwner && creatorName && (
          <Text style={{ fontSize: 12, color: themeColors.primary, fontWeight: '600', marginBottom: 4 }}>
            {creatorName}
          </Text>
        )}
        <View style={[styles.statusBadgeInline, isInactive ? (isDark ? { backgroundColor: '#334155' } : styles.statusBadgeInactive) : styles.statusBadgeActive]}>
          <Text style={[styles.statusBadgeTextInline, { color: isDark ? '#94A3B8' : '#475569' }]}>
            {statusLabel(campaign.status)}
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
function KpiCard({
  label,
  displayValue,
  onInfoPress,
}: {
  label: string;
  displayValue: string;
  onInfoPress?: () => void;
}) {
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={[styles.kpiCard, { backgroundColor: isDark ? '#1E293B' : '#F3F0FA' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={[styles.kpiLabel, { color: themeColors.textSecondary, marginBottom: 0 }]}>{label}</Text>
        {onInfoPress && (
          <TouchableOpacity onPress={onInfoPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="information-circle-outline" size={17} color={themeColors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[displayValue.length > 9 ? styles.kpiValueCurrency : styles.kpiValue, { color: themeColors.primary }]} numberOfLines={1} adjustsFontSizeToFit>
        {displayValue}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { campaignId } = useLocalSearchParams();
  const { colors: themeColors, isDark } = useTheme();
  const { profile } = useProfile();
  const isManager = profile?.id_role === 3;
  // La proyección de ROI está restringida en el servidor a Owner (2) y Super Admin (1)
  const canPredict = profile?.id_role === 1 || profile?.id_role === 2;

  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [loadingStats, setLoadingStats] = useState(false);
  const [metricas, setMetricas] = useState<any>(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [clicsPorDia, setClicsPorDia] = useState<any[]>([]);
  const [tablaClics, setTablaClics] = useState<any[]>([]);
  const [statsError, setStatsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1️⃣ Cargar lista de campañas
  const loadData = useCallback(() => {
    campaignsApi
      .getAll()
      .then((data: any) => {
        const all = Array.isArray(data) ? data : (data?.response || []);
        setCampaigns(all);

        if (campaignId) {
          const found = all.find((c: Campaign) => String(c.id_campaign) === String(campaignId));
          if (found) {
            setSelectedCampaign(found);
            return;
          }
        }
        
        // Si ya hay una campaña seleccionada, actualizarla con los datos nuevos
        setSelectedCampaign(prev => {
          if (!prev) return prev;
          const updated = all.find((c: Campaign) => c.id_campaign === prev.id_campaign);
          return updated || prev;
        });
        // Si no hay campaignId o no se encontró, mantenemos el estado actual o reseteamos si es necesario
        // Pero no reseteamos el selectedCampaign si el usuario ya está viendo una campaña específica
        // para evitar que se cierre el detalle al recargar.
      })
      .catch((err: any) => {
        Alert.alert("Error", "No se pudieron cargar las campañas. Por favor, intenta de nuevo.");
        setCampaigns([]);
      })
      .finally(() => setLoadingCampaigns(false));

    notificationsApi.getUnreadCount()
      .then((res: any) => setUnreadCount(res.count || 0))
      .catch(() => setUnreadCount(0));
  }, [campaignId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 900);
  }, [loadData]);

  // useFocusEffect también corre al montar: una sola carga inicial
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // 2️Cargar estadísticas
  const fetchStats = useCallback(async (campaign: Campaign) => {
    if (campaign.id_campaign == null) {
      setStatsError(true);
      return;
    }
    setLoadingStats(true);
    setStatsError(false);

    try {
      // allSettled: si falla el detalle de clics, los KPIs igual se muestran
      const [resMet, resClicsDia, resTabla] = await Promise.allSettled([
        getMetricas(campaign.id_campaign),
        getClicsPorDia(campaign.id_campaign),
        getTablaClic(campaign.id_campaign),
      ]);

      if (resMet.status === 'fulfilled') {
        setMetricas(resMet.value);
      } else {
        setMetricas(null);
        setStatsError(true);
      }

      const diaRaw: any = resClicsDia.status === 'fulfilled' ? resClicsDia.value : null;
      setClicsPorDia(Array.isArray(diaRaw?.data) ? diaRaw.data : []);

      const tablaRaw: any = resTabla.status === 'fulfilled' ? resTabla.value : null;
      setTablaClics(Array.isArray(tablaRaw?.data) ? tablaRaw.data : []);
    } catch {
      setStatsError(true);
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

        {/* Título de sección */}
        <View style={styles.listHeaderSection}>
          <Text style={[styles.listTitle, { color: themeColors.textPrimary }]}>Mis Campañas</Text>
          {profile?.company_name ? (
            <View style={styles.companyRow}>
              <Ionicons name="business-outline" size={14} color={themeColors.textSecondary} />
              <Text style={[styles.companyText, { color: themeColors.textSecondary }]} numberOfLines={1}>
                {profile.company_name}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Banner Aprende Marketing */}
        <TouchableOpacity
          style={[styles.learnBanner, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}
          activeOpacity={0.88}
          onPress={() => router.push('/(app)/(tabs)/learning' as any)}
        >
          <View style={[styles.learnBannerIconBox, { backgroundColor: isDark ? '#2D1D6E' : '#DDD6FE' }]}>
            <Ionicons name="school" size={22} color={themeColors.primary} />
          </View>
          <View style={styles.learnBannerContent}>
            <Text style={[styles.learnBannerTitle, { color: themeColors.primary }]}>Aprende Marketing</Text>
            <Text style={[styles.learnBannerSub, { color: themeColors.textSecondary }]}>
              Guías, estrategias y calculadora de ROI
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.primary} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchWrapper, { backgroundColor: themeColors.bgCard }]}>
            <Ionicons name="search" size={20} color={themeColors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.textPrimary }]}
              placeholder="Buscar campañas..."
              placeholderTextColor={themeColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={themeColors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
            keyExtractor={(item) => String(item.id_campaign)}
            renderItem={({ item, index }) => (
              <CampaignCard
                campaign={item}
                index={index}
                isOwner={profile?.id_role === 2}
                onSelect={() => setSelectedCampaign(item)}
              />
            )}
            contentContainerStyle={[styles.listScrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[themeColors.primary]} tintColor={themeColors.primary} />
            }
          />
        )}
      </View>
    );
  }

  // ─── Vista de Detalle ────────────────────────────────────────────────────────
  const chartDays = clicsPorDia.slice(-CHART_MAX_DAYS);
  // Con más de 5 barras se rotula una de cada dos fechas para que no se encimen
  const chartLabels = chartDays.map((d: any, i: number) => (chartDays.length > 5 && i % 2 === 1 ? '' : formatDayShort(d.fecha)));
  const chartValues = chartDays.map((d: any) => Number(d.clics) || 0);
  const hasChart = chartValues.some(v => v > 0);
  const vigencia = `${selectedCampaign?.start_date ? formatDayShort(selectedCampaign.start_date) + '/' + selectedCampaign.start_date.slice(0, 4) : 'Sin inicio'} – ${selectedCampaign?.end_date ? formatDayShort(selectedCampaign.end_date) + '/' + selectedCampaign.end_date.slice(0, 4) : 'sin fecha fin'}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      <View style={styles.detailHeader}>
        <TouchableOpacity
          onPress={() => setSelectedCampaign(null)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={26} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.detailTitle, { color: themeColors.primary }]} numberOfLines={1}>Detalle de Campaña</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[themeColors.primary]} tintColor={themeColors.primary} />
        }
      >
        <View style={[styles.campaignBanner, { backgroundColor: isDark ? '#1E293B' : '#F3F0FA', padding: 16, borderRadius: 20 }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.campaignBannerText, { color: themeColors.textPrimary }]}>{selectedCampaign?.name}</Text>
            
            <View style={styles.originBadgeRow}>
              <Ionicons name="calendar-outline" size={13} color={themeColors.textMuted} style={{ marginRight: 4 }} />
              <Text style={[styles.originBadgeText, { color: themeColors.textMuted }]}>{vigencia}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, selectedCampaign?.status === 'active' ? styles.statusBadgeActive : (isDark ? { backgroundColor: '#334155' } : null)]}>
            <Text style={[styles.statusBadgeText, { color: isDark ? '#F1F5F9' : '#000' }]}>{statusLabel(selectedCampaign?.status ?? '')}</Text>
          </View>
        </View>

        {statsError && !loadingStats && (
          <View style={[styles.warningBanner, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7', borderColor: themeColors.warning }]}>
            <Ionicons name="warning-outline" size={18} color={themeColors.warning} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={[styles.warningBannerText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
              No se pudieron cargar las métricas de esta campaña. Desliza hacia abajo para reintentar.
            </Text>
          </View>
        )}

        {loadingStats ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={{ color: themeColors.textSecondary, marginTop: 10 }}>Cargando estadísticas...</Text>
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <KpiCard label="Clics" displayValue={formatInt(metricas?.clics ?? 0)} />
              <KpiCard label="Conversiones" displayValue={formatInt(metricas?.conversiones ?? 0)} />
              <KpiCard
                label="Tasa de conversión"
                displayValue={formatPct(metricas?.conversion_rate ?? 0)}
                onInfoPress={() => setShowRateModal(true)}
              />
              {/* El backend no envía campos financieros a Manager: solo se muestran si llegaron */}
              {!isManager && metricas?.ingresos != null && (
                <>
                  <KpiCard label="Inversión" displayValue={formatMoney(metricas.spent)} />
                  <KpiCard label="Ingresos" displayValue={formatMoney(metricas.ingresos)} />
                  <KpiCard label="ROI" displayValue={formatPct(metricas.roi)} />
                  <KpiCard label="ROAS" displayValue={formatRatio(metricas.roas)} />
                  <KpiCard label="CPC" displayValue={formatMoney(metricas.cpc)} />
                  <KpiCard label="CPA" displayValue={formatMoney(metricas.cpa)} />
                </>
              )}
            </View>

            <View style={[styles.chartCard, { backgroundColor: themeColors.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Clics por día</Text>
              {clicsPorDia.length > CHART_MAX_DAYS && (
                <Text style={{ fontSize: 12, color: themeColors.textMuted, marginTop: 2 }}>
                  Últimos {CHART_MAX_DAYS} días con actividad
                </Text>
              )}
              {hasChart ? (
                <BarChart
                  data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                  width={CHART_WIDTH}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: themeColors.bgCard,
                    backgroundGradientFrom: themeColors.bgCard,
                    backgroundGradientTo: themeColors.bgCard,
                    decimalPlaces: 0,
                    color: (opacity = 1) => isDark ? `rgba(173, 141, 242, ${opacity})` : `rgba(95, 27, 242, ${opacity})`,
                    labelColor: (opacity = 1) => themeColors.textSecondary,
                    barPercentage: 0.6,
                    propsForBackgroundLines: {
                      strokeDasharray: "", // solid background lines
                      stroke: isDark ? "#334155" : "#F1F5F9",
                    },
                  }}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                  style={{ borderRadius: 16, marginTop: 15, marginLeft: -8 }}
                />
              ) : (
                <Text style={[styles.noDataText, { color: themeColors.textMuted }]}>No hay datos suficientes para la gráfica.</Text>
              )}
            </View>

            {/* DASHBOARD PREDICTIVO: después de los indicadores y del gráfico, antes del detalle de clics */}
            {canPredict && metricas?.ingresos != null && selectedCampaign?.id_campaign != null && (
              <RoiPredictor
                key={selectedCampaign.id_campaign}
                idCampaign={selectedCampaign.id_campaign}
                stats={metricas}
              />
            )}

            {/* TABLA DE CLICS RECIENTES */}
            <View style={[styles.tableCard, { backgroundColor: themeColors.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginBottom: 15 }]}>Clics Recientes</Text>
              
              {tablaClics && tablaClics.length > 0 ? (
                <View style={styles.tableWrapper}>
                  {/* Header */}
                  <View style={[styles.tableRow, styles.tableHeader, { borderBottomColor: themeColors.borderDivider }]}>
                    <Text style={[styles.tableHeaderCell, { color: themeColors.textMuted, flex: 2 }]}>Fecha/Hora</Text>
                    <Text style={[styles.tableHeaderCell, { color: themeColors.textMuted, flex: 1.5 }]}>País / Fuente</Text>
                    <Text style={[styles.tableHeaderCell, { color: themeColors.textMuted, flex: 1.5 }]}>Dispositivo</Text>
                  </View>
                  
                  {/* Body */}
                  {tablaClics.slice(0, 10).map((click: any, idx: number) => {
                    // fecha/hora ya vienen formateadas por el backend (UTC); se evita reconvertir zona horaria
                    const dateStr = click.fecha && click.fecha !== 'N/A' ? formatDayShort(click.fecha) : '—';
                    const timeStr = click.hora && click.hora !== 'N/A' ? String(click.hora).slice(0, 5) : '';
                    const device = deviceFromUA(click.user_agent);

                    return (
                      <View key={idx} style={[styles.tableRow, { borderBottomColor: themeColors.borderDivider }]}>
                        <View style={{ flex: 2 }}>
                          <Text style={[styles.tableCell, { color: themeColors.textPrimary }]}>{dateStr}</Text>
                          <Text style={[styles.tableCellSub, { color: themeColors.textMuted }]}>{timeStr}</Text>
                        </View>
                        <View style={{ flex: 1.5 }}>
                          <Text style={[styles.tableCell, { color: themeColors.textSecondary }]} numberOfLines={1}>
                            {click.pais || 'Desconocido'}
                          </Text>
                          {click.utm_source && click.utm_source !== 'N/A' && (
                            <Text style={{ fontSize: 10, color: themeColors.primary, fontWeight: '700', textTransform: 'uppercase' }}>{click.utm_source}</Text>
                          )}
                        </View>
                        <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons 
                            name={device === 'Móvil' || device === 'Tablet' ? 'phone-portrait-outline' : 'desktop-outline'}
                            size={14} 
                            color={themeColors.textMuted} 
                            style={{ marginRight: 4 }} 
                          />
                          <Text style={[styles.tableCell, { color: themeColors.textSecondary }]} numberOfLines={1}>{device}</Text>
                        </View>
                      </View>
                    );
                  })}
                  
                  {tablaClics.length > 10 && (
                    <Text style={[styles.tableFooter, { color: themeColors.textMuted }]}>
                      Mostrando los últimos 10 de {tablaClics.length} clics
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Text style={[styles.noDataText, { color: themeColors.textMuted }]}>
                    {(metricas?.clics ?? 0) > 0
                      ? `No hay detalles disponibles para los ${formatInt(metricas.clics)} clics registrados.`
                      : 'Aún no hay clics. Comparte el enlace de seguimiento de la campaña.'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => fetchStats(selectedCampaign!)}
                    style={{ marginTop: 10 }}
                  >
                    <Text style={{ color: themeColors.primary, fontWeight: '600' }}>Actualizar tabla</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── MODAL EXPLICATIVO DEL CTR ── */}
      <Modal
        visible={showRateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRateModal(false)}
        >
          <View style={[styles.ctrModalContent, { backgroundColor: themeColors.bgCard }]}>
            <View style={styles.ctrModalHeader}>
              <View style={[styles.ctrIconCircle, { backgroundColor: isDark ? '#1E1B4B' : '#EDE9FE' }]}>
                <Ionicons name="pie-chart-outline" size={26} color={themeColors.primary} />
              </View>
              <Text style={[styles.ctrModalTitle, { color: themeColors.textPrimary }]}>Tasa de conversión</Text>
            </View>

            <Text style={[styles.ctrModalText, { color: themeColors.textSecondary }]}>
              Porcentaje de clics en el enlace de seguimiento que terminaron en una conversión (venta, registro o contacto).
              {'\n\n'}
              Se calcula como conversiones ÷ clics registrados por Analitika.
            </Text>

            <TouchableOpacity
              style={[styles.ctrModalCloseBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowRateModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.ctrModalCloseBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  // El PNG del logo es cuadrado con margen transparente: se recorta en un contenedor
  // de altura fija en lugar de desplazarlo con márgenes que lo sacaban del header.
  // Franja visible del PNG (500px): y 182–278 → a 150px queda en 55–83; se sube 49px para centrarla.
  logoWrapper: { width: 150, height: 40, overflow: 'hidden' },
  logoImage: { width: 150, height: 150, marginTop: -49, marginLeft: -11 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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

  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  companyText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  listHeaderSection: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  listScrollContent: { paddingHorizontal: 24 },

  // LEARN BANNER
  learnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  learnBannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnBannerContent: {
    flex: 1,
  },
  learnBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  learnBannerSub: {
    fontSize: 12,
    fontWeight: '400',
  },

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
  kpiCard: { width: KPI_CARD_WIDTH, backgroundColor: '#F3F0FA', padding: 16, borderRadius: 20 },
  kpiLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  kpiValueCurrency: { fontSize: 18, fontWeight: '700', color: colors.primary },
  chartCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, ...shadows.card, marginBottom: 20 },
  tableCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, ...shadows.card },
  tableWrapper: { width: '100%' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  tableHeader: { borderBottomWidth: 2, paddingVertical: 8 },
  tableHeaderCell: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  tableCell: { fontSize: 14, fontWeight: '600' },
  tableCellSub: { fontSize: 11 },
  tableFooter: { textAlign: 'center', marginTop: 15, fontSize: 12, fontStyle: 'italic' },
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

  /* Badges de Origen y Advertencia */
  originBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  originBadgeText: {
    fontSize: 11,
    fontWeight: typography.bold,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warningBannerText: {
    flex: 1,
    fontSize: typography.sizeSm,
    lineHeight: 18,
    fontWeight: typography.medium,
  },

  /* Modal CTR */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  ctrModalContent: {
    width: '100%',
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  ctrModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ctrIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  ctrModalTitle: {
    fontSize: typography.sizeXl,
    fontWeight: typography.bold,
    textAlign: 'center',
  },
  ctrModalText: {
    fontSize: typography.sizeSm,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctrModalCloseBtn: {
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  ctrModalCloseBtnText: {
    color: '#fff',
    fontSize: typography.sizeMd,
    fontWeight: typography.bold,
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
