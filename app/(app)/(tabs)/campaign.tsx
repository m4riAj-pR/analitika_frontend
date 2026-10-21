import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { typography, shadows, radii } from '@/src/theme/colors';
import { useTheme } from '@/src/ThemeContext';
import AccountAvatar from '@/src/components/AccountAvatar';
import { useProfile } from '@/src/hooks/useProfile';
import { useCampaigns } from '@/src/hooks/useCampaigns';
import { getMetricas } from '@/src/services/api/stats';
import { formatInt, formatMoney, formatPct, statusLabel } from '@/src/utils/format';
import { trackingLinksApi } from '@/src/services/api/tracking';
import { campaignsApi } from '@/src/services/api/campaign';
import { Campaign } from '@/src/services/api/types';

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
        Crea tu primera campaña para obtener su enlace de seguimiento y empezar a medir clics y conversiones.
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

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CampaignScreen() {
  const { campaigns, loading, reload } = useCampaigns();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors: themeColors, isDark } = useTheme();

  const isOwner = profile?.id_role === 1 || profile?.id_role === 2;

  const [linksMap, setLinksMap] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');

  // Comparador de Campañas
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [compareStats, setCompareStats] = useState<Record<number, any>>({});
  const [loadingCompare, setLoadingCompare] = useState(false);

  const openCompare = async () => {
    setShowCompareModal(true);
    setLoadingCompare(true);
    const entries = await Promise.all(
      selectedForCompare.map(async (id) => [id, await getMetricas(id).catch(() => null)] as const),
    );
    setCompareStats(Object.fromEntries(entries));
    setLoadingCompare(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    reload();
    setTimeout(() => setRefreshing(false), 900);
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Una sola consulta de links (en vez de una por campaña); se usa el primero de cada campaña
  useEffect(() => {
    if (!Array.isArray(campaigns) || campaigns.length === 0) return;
    trackingLinksApi.getAll()
      .then((links) => {
        const newMap: Record<number, string> = {};
        (Array.isArray(links) ? links : []).forEach((l) => {
          if (newMap[l.id_campaign] == null) newMap[l.id_campaign] = trackingLinksApi.publicTrackUrl(Number(l.id_link));
        });
        setLinksMap(newMap);
      })
      .catch(() => {});
  }, [campaigns]);

  const activeCampaigns = Array.isArray(campaigns)
    ? campaigns.filter(c => String(c.status).toLowerCase() === 'active')
    : [];
  const inactiveCampaigns = Array.isArray(campaigns)
    ? campaigns.filter(c => String(c.status).toLowerCase() !== 'active')
    : [];

  const copyLink = async (camp: Campaign) => {
    const link = camp.id_campaign != null ? linksMap[camp.id_campaign] : undefined;
    if (!link) {
      // No se genera un link con un destino inventado: se pide definir la URL real
      Alert.alert(
        'Sin enlace de seguimiento',
        'Esta campaña aún no tiene enlace. Edítala e indica la URL de destino para generarlo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Editar campaña', onPress: () => router.push({ pathname: '/(app)/create', params: { id: String(camp.id_campaign) } }) },
        ],
      );
      return;
    }
    await Clipboard.setStringAsync(link);
    showToast('Enlace copiado al portapapeles');
  };

  const handleDelete = (camp: Campaign) => {
    if (!camp.id_campaign) return;
    Alert.alert(
      'Eliminar campaña',
      `¿Estás seguro de que deseas eliminar "${camp.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await campaignsApi.remove(camp.id_campaign!);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showToast(`Campaña "${camp.name}" eliminada`);
              reload();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar la campaña.');
            }
          },
        },
      ]
    );
  };

  const toggleSelectForCompare = (id: number) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(i => i !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        Alert.alert('Límite alcanzado', 'Puedes comparar un máximo de 3 campañas a la vez.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const renderSwipeDelete = (camp: Campaign) => (
    <TouchableOpacity style={styles.swipeDeleteBtn} onPress={() => handleDelete(camp)} activeOpacity={0.8}>
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={styles.swipeDeleteText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const renderActiveCard = (camp: Campaign) => {
    const campId = camp.id_campaign;
    if (!campId) return null;
    const isSelected = selectedForCompare.includes(campId);

    return (
      <View key={`active-card-${campId}`} style={[styles.activeCard, { backgroundColor: isDark ? '#1E293B' : '#E9E4F5' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.activeCardTitle, { color: themeColors.textPrimary, marginBottom: 0, flex: 1 }]} numberOfLines={2}>
            {camp.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: isSelected ? themeColors.primary : isDark ? '#334155' : '#FFF' }]}
              onPress={() => toggleSelectForCompare(campId)}
            >
              <Ionicons name="checkbox" size={18} color={isSelected ? '#fff' : themeColors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: isDark ? '#334155' : '#FFF' }]}
              onPress={() => router.push({ pathname: '/(app)/create', params: { id: String(campId) } })}
            >
              <Ionicons name="create-outline" size={18} color={themeColors.primary} />
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: isDark ? '#334155' : '#FFF' }]}
                onPress={() => handleDelete(camp)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={[styles.copyCapsule, { backgroundColor: isDark ? '#334155' : '#FFF' }]} onPress={() => copyLink(camp)}>
          <Ionicons name="copy-outline" size={18} color={themeColors.primary} />
          <Text style={[styles.copyCapsuleText, { color: themeColors.primary }]}>
            {linksMap[campId] ? 'Copiar enlace de seguimiento' : 'Generar enlace de seguimiento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dashboardButton, { backgroundColor: themeColors.primary }]}
          onPress={() => router.push({ pathname: '/(app)/(tabs)/dashboard', params: { campaignId: String(campId) } })}
        >
          <Text style={styles.dashboardButtonText}>Ver Métricas y Rendimiento</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const comparedCampaignsList = campaigns.filter(c => c.id_campaign && selectedForCompare.includes(c.id_campaign));

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Campañas</Text>
          <Text style={[styles.headerSub, { color: themeColors.textSecondary }]}>Gestión y enlaces de seguimiento</Text>
        </View>

        <View style={styles.headerActions}>
          {selectedForCompare.length >= 2 && (
            <TouchableOpacity
              style={[styles.compareTopBtn, { backgroundColor: '#8B5CF6' }]}
              onPress={openCompare}
            >
              <Ionicons name="stats-chart" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.compareTopBtnText}>Comparar ({selectedForCompare.length})</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push('/(app)/create')}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/account')}>
            <AccountAvatar size={38} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary]} tintColor={themeColors.primary} />
          }
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        >
          {campaigns.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Sección Campañas Activas */}
              <View style={styles.activeSection}>
                {activeCampaigns.map(renderActiveCard)}
                {activeCampaigns.length === 0 && (
                  <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No hay campañas activas en este momento</Text>
                )}
              </View>

              {/* Sección Campañas Inactivas */}
              {inactiveCampaigns.length > 0 && (
                <View style={[styles.inactiveSection, { backgroundColor: isDark ? '#1E293B' : '#E9E4F5' }]}>
                  <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Campañas Pausadas / Finalizadas</Text>
                  {inactiveCampaigns.map((camp) => {
                    const inner = (
                      <View style={[styles.listItem, { backgroundColor: isDark ? '#334155' : '#F3F0FA' }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listText, { color: themeColors.textPrimary }]} numberOfLines={1}>
                            {camp.name}
                          </Text>
                          <Text style={{ fontSize: 11, color: themeColors.textMuted }}>{statusLabel(camp.status)}</Text>
                        </View>
                        <View style={styles.listActions}>
                          <TouchableOpacity
                            style={{ marginRight: 12 }}
                            onPress={() => router.push({ pathname: '/(app)/(tabs)/dashboard', params: { campaignId: String(camp.id_campaign) } })}
                          >
                            <Ionicons name="stats-chart-outline" size={22} color={themeColors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => router.push({ pathname: '/(app)/create', params: { id: String(camp.id_campaign) } })}>
                            <Ionicons name="create-outline" size={22} color={themeColors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                    return isOwner ? (
                      <Swipeable key={`inactive-${camp.id_campaign}`} renderRightActions={() => renderSwipeDelete(camp)} overshootRight={false}>
                        {inner}
                      </Swipeable>
                    ) : (
                      <View key={`inactive-${camp.id_campaign}`}>{inner}</View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Modal Comparador de Campañas */}
      <Modal visible={showCompareModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.compareModalCard, { backgroundColor: themeColors.bgCard }]}>
            <View style={styles.compareModalHeader}>
              <Text style={[styles.compareModalTitle, { color: themeColors.primary }]}>Comparador de Campañas</Text>
              <TouchableOpacity onPress={() => setShowCompareModal(false)}>
                <Ionicons name="close-circle" size={26} color={themeColors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.compareSub, { color: themeColors.textSecondary }]}>
              Métricas acumuladas de cada campaña desde su enlace de seguimiento.
            </Text>

            {loadingCompare ? (
              <ActivityIndicator size="large" color={themeColors.primary} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 10 }}>
                {comparedCampaignsList.map((c) => {
                  const st = c.id_campaign != null ? compareStats[c.id_campaign] : null;
                  const rows: [string, string][] = [
                    ['Clics', formatInt(st?.clics)],
                    ['Conversiones', formatInt(st?.conversiones)],
                    ['Tasa de conversión', formatPct(st?.conversion_rate)],
                    ...(st?.ingresos != null
                      ? ([['Inversión', formatMoney(st.spent)], ['Ingresos', formatMoney(st.ingresos)], ['ROI', formatPct(st.roi)]] as [string, string][])
                      : []),
                  ];
                  return (
                    <View key={c.id_campaign} style={[styles.compareColumn, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
                      <Text style={[styles.compareCampName, { color: themeColors.textPrimary }]} numberOfLines={2}>{c.name}</Text>
                      {st == null ? (
                        <Text style={{ fontSize: 12, color: themeColors.textMuted }}>Sin métricas disponibles</Text>
                      ) : rows.map(([label, value]) => (
                        <View key={label} style={styles.compareMetricBox}>
                          <Text style={styles.compareMetricLabel}>{label}</Text>
                          <Text style={[styles.compareMetricVal, { color: themeColors.textPrimary }]}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.closeCompareBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowCompareModal(false)}
            >
              <Text style={styles.closeCompareBtnText}>Cerrar Comparador</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toast !== '' && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 24, fontWeight: typography.bold },
  headerSub: { fontSize: 12, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  compareTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  compareTopBtnText: { color: '#fff', fontSize: 12, fontWeight: typography.bold },
  scrollContent: { paddingHorizontal: 20 },
  activeSection: { marginBottom: 10 },
  inactiveSection: { borderRadius: radii.xl, padding: 18, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: typography.bold, marginBottom: 12 },
  activeCard: { borderRadius: radii.xl, padding: 18, marginBottom: 16 },
  activeCardTitle: { fontSize: 17, fontWeight: typography.bold },
  iconBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  copyCapsule: { flexDirection: 'row', borderRadius: radii.lg, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  copyCapsuleText: { fontSize: 13, fontWeight: typography.medium, marginLeft: 8 },
  dashboardButton: { borderRadius: radii.md, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  dashboardButtonText: { color: '#FFF', fontSize: 14, fontWeight: typography.bold },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: radii.md, marginBottom: 8 },
  listText: { fontSize: 14, fontWeight: typography.bold },
  listActions: { flexDirection: 'row', alignItems: 'center' },
  emptyText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  swipeDeleteBtn: { backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', width: 80, borderRadius: radii.md, marginBottom: 8, marginLeft: 6 },
  swipeDeleteText: { color: '#fff', fontSize: 11, fontWeight: typography.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  compareModalCard: { borderRadius: radii.xl, padding: 20 },
  compareModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compareModalTitle: { fontSize: 18, fontWeight: typography.bold },
  compareSub: { fontSize: 13, marginVertical: 8 },
  compareColumn: { width: 160, padding: 14, borderRadius: radii.lg },
  compareCampName: { fontSize: 14, fontWeight: typography.bold, marginBottom: 10, height: 38 },
  compareMetricBox: { marginBottom: 10 },
  compareMetricLabel: { fontSize: 10, opacity: 0.7 },
  compareMetricVal: { fontSize: 12, fontWeight: typography.bold, marginTop: 2 },
  closeCompareBtn: { height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  closeCompareBtnText: { color: '#fff', fontSize: 14, fontWeight: typography.bold },
  toast: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: '#1E293B', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  toastText: { color: '#fff', fontSize: 13, fontWeight: typography.bold },
});

const emptyStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: typography.bold },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, maxWidth: 260 },
  cta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderRadius: radii.md, marginTop: 20 },
  ctaText: { color: '#fff', fontSize: 14, fontWeight: typography.bold },
});
