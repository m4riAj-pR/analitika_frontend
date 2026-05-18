import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountAvatar from '../../../src/components/AccountAvatar';
import { useProfile } from '../../../src/hooks/useProfile';
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
  const { profile } = useProfile();
  const isManager = profile?.id_role === 3;

  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(false);
  const [metricas, setMetricas] = useState<any>(null);
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // 2️⃣ Cargar estadísticas
  const fetchStats = useCallback(async (campaign: Campaign) => {
    if (campaign.id_campaign == null) {
      setStatsError(true);
      return;
    }
    setLoadingStats(true);
    setStatsError(false);

    try {
      // Usamos Promise.allSettled para que si falla uno (ej. la tabla de clics), los KPIs sigan cargando
      const results = await Promise.allSettled([
        getMetricas(campaign.id_campaign),
        getClicsPorDia(campaign.id_campaign),
        getTablaClic(campaign.id_campaign),
      ]);

      const [resMet, resClicsDia, resTabla] = results;

      let metData = null;
      if (resMet.status === 'fulfilled') {
        const met = resMet.value;
        metData = met?.response || met?.data || met;
        setMetricas(metData);
      } else {
        console.log("Error loading metrics:", resMet.reason);
        setMetricas(null);
      }

      if (resClicsDia.status === 'fulfilled') {
        const clicsDia = resClicsDia.value;
        setClicsPorDia(Array.isArray(clicsDia) ? clicsDia : (clicsDia?.data || clicsDia?.response || []));
      } else {
        console.log("Error loading clicks per day:", resClicsDia.reason);
        setClicsPorDia([]);
      }

      let data = [];
      if (resTabla.status === 'fulfilled') {
        const tabla = resTabla.value;
        data = Array.isArray(tabla) 
          ? tabla 
          : (tabla?.data || tabla?.response || tabla?.clics || tabla?.clicks || tabla?.list || tabla?.items || []);
      }

      // FALLBACK SI FALLA O ESTÁ VACÍO: Si no hay datos o la petición falló, pero sabemos que hay clics
      if (data.length === 0 && (metData?.clics || metData?.clicks || 0) > 0) {
        try {
          const { clicksApi, trackingLinksApi } = await import('../../../src/services/api');
          
          // Fallback 1: Endpoint general de clics con filtro local por campaña
          const fallbackRes: any = await clicksApi.getAll();
          const allClicks = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes?.response || fallbackRes?.data || []);
          
          let filtered = allClicks.filter((c: any) => 
            Number(c.id_campaign) === Number(campaign.id_campaign)
          );

          // Fallback 2: Si aún no hay, buscar por Tracking Links de la campaña
          if (filtered.length === 0) {
            console.log("Fallback 1 vacío, intentando Fallback 2 (por Tracking Links)...");
            const linksRes: any = await trackingLinksApi.listByCampaign(Number(campaign.id_campaign));
            const links = Array.isArray(linksRes) ? linksRes : (linksRes?.response || linksRes?.data || []);
            
            if (links.length > 0) {
              const linkIds = links.map((l: any) => Number(l.id_link));
              filtered = allClicks.filter((c: any) => linkIds.includes(Number(c.id_link)));
            }
          }

          if (filtered.length > 0) {
            data = filtered;
            console.log(`FALLBACK SUCCESS: Se encontraron ${data.length} clics.`);
          }
        } catch (err) {
          console.log("Detailed fallbacks failed:", err);
        }
      }

      setTablaClics(data);
      
      // Solo mostramos error general si fallaron los KPIs básicos (métricas)
      if (resMet.status === 'rejected') {
        setStatsError(true);
      }

    } catch (err) {
      console.log("General error in fetchStats:", err);
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
                isOwner={profile?.id_role < 3}
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
  const chartLabels = clicsPorDia.map((d: any, i) => d.fecha || d.date || d.day || `D${i + 1}`);
  const chartValues = clicsPorDia.map((d: any) => Number(d.clics || d.clicks || d.count || 0));
  const hasChart = chartValues.length > 0 && chartValues.some(v => v > 0);

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

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.campaignBanner, { backgroundColor: isDark ? '#1E293B' : '#F3F0FA', padding: 16, borderRadius: 20 }]}>
          <Text style={[styles.campaignBannerText, { color: themeColors.textPrimary }]}>{selectedCampaign?.name}</Text>
          <View style={[styles.statusBadge, selectedCampaign?.status === 'active' ? styles.statusBadgeActive : (isDark ? { backgroundColor: '#334155' } : null)]}>
            <Text style={[styles.statusBadgeText, { color: isDark ? '#F1F5F9' : '#000' }]}>{selectedCampaign?.status === 'active' ? 'Activa' : 'Inactiva'}</Text>
          </View>
        </View>

        {loadingStats ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={{ color: themeColors.textSecondary, marginTop: 10 }}>Cargando estadísticas...</Text>
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <KpiCard label="Clics" value={(metricas?.clics || metricas?.clicks) ?? 0} />
              <KpiCard label="Convers." value={(metricas?.conversiones || metricas?.conversions) ?? 0} />
              {!isManager && (
                <>
                  <KpiCard label="Ingresos" value={metricas?.ingresos ?? 0} isCurrency />
                  <KpiCard label="ROI" value={metricas?.roi ?? 0} />
                  <KpiCard label="ROAS" value={metricas?.roas ?? 0} />
                  <KpiCard label="CPC" value={metricas?.cpc ?? 0} isCurrency />
                  <KpiCard label="CPA" value={metricas?.cpa ?? 0} isCurrency />
                </>
              )}
            </View>

            <View style={[styles.chartCard, { backgroundColor: themeColors.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Clics por Día</Text>
              {hasChart ? (
                <BarChart
                  data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                  width={width - 48}
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
                  style={{ borderRadius: 16, marginTop: 15, marginLeft: -16 }}
                />
              ) : (
                <Text style={[styles.noDataText, { color: themeColors.textMuted }]}>No hay datos suficientes para la gráfica.</Text>
              )}
            </View>

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
                    const date = new Date(click.created_at || click.fecha);
                    const dateStr = date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    // Simple parser para UserAgent (si existe)
                    const ua = click.user_agent || click.dispositivo || 'N/A';
                    let device = 'Web';
                    if (ua.toLowerCase().includes('android')) device = 'Android';
                    else if (ua.toLowerCase().includes('iphone') || ua.toLowerCase().includes('ipad')) device = 'iOS';
                    else if (ua.toLowerCase().includes('mobile')) device = 'Móvil';

                    return (
                      <View key={idx} style={[styles.tableRow, { borderBottomColor: themeColors.borderDivider }]}>
                        <View style={{ flex: 2 }}>
                          <Text style={[styles.tableCell, { color: themeColors.textPrimary }]}>{dateStr}</Text>
                          <Text style={[styles.tableCellSub, { color: themeColors.textMuted }]}>{timeStr}</Text>
                        </View>
                        <View style={{ flex: 1.5 }}>
                          <Text style={[styles.tableCell, { color: themeColors.textSecondary }]} numberOfLines={1}>
                            {click.pais || click.country || 'Colombia'}
                          </Text>
                          {click.utm_source && click.utm_source !== 'N/A' && (
                            <Text style={{ fontSize: 10, color: themeColors.primary, fontWeight: '700', textTransform: 'uppercase' }}>{click.utm_source}</Text>
                          )}
                        </View>
                        <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons 
                            name={(device === 'iOS' || device === 'Android' || device === 'Móvil' ? 'smartphone-outline' : 'desktop-outline') as any} 
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
                    {(metricas?.clics || metricas?.clicks) > 0 
                      ? `No hay detalles disponibles para los ${(metricas?.clics || metricas?.clicks)} clics registrados.`
                      : 'No hay registros de clics individuales aún.'}
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
});

const emptyStyles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F0FA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  cta: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: '#FFF', fontWeight: '600' },
});
