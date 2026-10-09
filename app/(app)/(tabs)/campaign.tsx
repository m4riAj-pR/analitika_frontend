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

import { colors, spacing, typography, shadows, radii } from '@/src/theme/colors';
import { useTheme } from '@/src/ThemeContext';
import AccountAvatar from '@/src/components/AccountAvatar';
import { useProfile } from '@/src/hooks/useProfile';
import { useCampaigns } from '@/src/hooks/useCampaigns';
import { useAdConnections } from '@/src/hooks/useAdConnections';
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
        Comienza creando tu primera campaña integrada con Posts, Reels y TikToks.
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

  // Meta API Connections Hook
  const {
    connections,
    loading: loadingConns,
    connecting: connectingMeta,
    syncingId,
    connectMeta,
    disconnectConnection,
    triggerSync,
  } = useAdConnections();

  const [linksMap, setLinksMap] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');

  // Comparador de Campañas
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

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

  useEffect(() => {
    const fetchLinks = async () => {
      if (Array.isArray(campaigns)) {
        const newMap: Record<number, string> = {};
        for (const camp of campaigns) {
          if (camp.id_campaign) {
            try {
              const links = await trackingLinksApi.listByCampaign(camp.id_campaign);
              if (links && links.length > 0) {
                newMap[camp.id_campaign] = trackingLinksApi.publicTrackUrl(Number(links[0].id_link));
              }
            } catch (e) {}
          }
        }
        setLinksMap(newMap);
      }
    };
    fetchLinks();
  }, [campaigns]);

  const activeCampaigns = Array.isArray(campaigns)
    ? campaigns.filter(c => String(c.status).toLowerCase() === 'active')
    : [];
  const inactiveCampaigns = Array.isArray(campaigns)
    ? campaigns.filter(c => String(c.status).toLowerCase() !== 'active')
    : [];

  const copyLink = async (id_campaign: number | null) => {
    if (id_campaign === null) {
      Alert.alert('Error', 'Campaña sin ID válido');
      return;
    }

    const existingLink = linksMap[id_campaign];
    if (existingLink) {
      await Clipboard.setStringAsync(existingLink);
      showToast('Link copiado al portapapeles');
      return;
    }

    try {
      let links = await trackingLinksApi.listByCampaign(id_campaign);
      if (!links || links.length === 0) {
        const res: any = await trackingLinksApi.create({
          id_campaign: id_campaign,
          destination: 'https://analitika.com',
        });
        if (res && res.id_link) {
          const trackUrl = trackingLinksApi.publicTrackUrl(Number(res.id_link));
          setLinksMap(prev => ({ ...prev, [id_campaign]: trackUrl }));
          await Clipboard.setStringAsync(trackUrl);
          showToast('Link generado y copiado');
          return;
        }
        links = await trackingLinksApi.listByCampaign(id_campaign);
      }

      if (links && links.length > 0) {
        const id_link = links[0].id_link;
        const trackUrl = trackingLinksApi.publicTrackUrl(Number(id_link));
        setLinksMap(prev => ({ ...prev, [id_campaign]: trackUrl }));
        await Clipboard.setStringAsync(trackUrl);
        showToast('Link copiado');
      }
    } catch (err: any) {
      Alert.alert('Error', `No se pudo copiar el link: ${err.message || 'Error'}`);
    }
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

        {/* Desglose Analítico Integrado: Posts, Reels, TikToks */}
        <View style={styles.integratedPillsRow}>
          <View style={[styles.integratedPill, { backgroundColor: isDark ? '#334155' : '#FFF' }]}>
            <Ionicons name="image-outline" size={14} color="#8B5CF6" />
            <Text style={[styles.integratedPillText, { color: themeColors.textPrimary }]}>Posts Feed</Text>
          </View>
          <View style={[styles.integratedPill, { backgroundColor: isDark ? '#334155' : '#FFF' }]}>
            <Ionicons name="videocam-outline" size={14} color="#EC4899" />
            <Text style={[styles.integratedPillText, { color: themeColors.textPrimary }]}>Reels IG/FB</Text>
          </View>
          <View style={[styles.integratedPill, { backgroundColor: isDark ? '#334155' : '#FFF' }]}>
            <Ionicons name="logo-tiktok" size={13} color="#000" />
            <Text style={[styles.integratedPillText, { color: themeColors.textPrimary }]}>TikToks</Text>
          </View>
        </View>

        {/* Indicador de Origen Meta API si existe */}
        {camp.data_source === 'api_meta' && (
          <View style={styles.metaBadgeInline}>
            <Ionicons name="sync-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.metaBadgeInlineText}>Sincronizado con Meta Ads (CTR: {camp.ctr_real ? `${camp.ctr_real}%` : 'N/A'})</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.copyCapsule, { backgroundColor: isDark ? '#334155' : '#FFF' }]} onPress={() => copyLink(campId)}>
          <Ionicons name="copy-outline" size={18} color={themeColors.primary} />
          <Text style={[styles.copyCapsuleText, { color: themeColors.primary }]}>Copiar enlace de seguimiento</Text>
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
          <Text style={[styles.headerSub, { color: themeColors.textSecondary }]}>Gestión y vinculación publicitaria</Text>
        </View>

        <View style={styles.headerActions}>
          {selectedForCompare.length >= 2 && (
            <TouchableOpacity
              style={[styles.compareTopBtn, { backgroundColor: '#8B5CF6' }]}
              onPress={() => setShowCompareModal(true)}
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

          <TouchableOpacity onPress={() => router.push('/account')}>
            <AccountAvatar size={38} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SECCIÓN DE CONEXIÓN API META (Exclusivo Owner en Módulo de Campañas) ── */}
      {isOwner && (
        <View style={styles.metaModuleWrapper}>
          <View style={[styles.metaCard, { backgroundColor: isDark ? '#1E293B' : '#F5F3FF', borderColor: themeColors.primary }]}>
            <View style={styles.metaCardHeader}>
              <View style={styles.metaBadge}>
                <Ionicons name="logo-facebook" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.metaBadgeText}>META MARKETING API</Text>
              </View>
              <TouchableOpacity
                style={[styles.metaConnectBtn, { backgroundColor: themeColors.primary }, connectingMeta && { opacity: 0.7 }]}
                onPress={connectMeta}
                disabled={connectingMeta}
              >
                {connectingMeta ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="link" size={14} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.metaConnectBtnText}>
                      {connections.length > 0 ? 'Conectar otra cuenta' : 'Vincular Meta Ads'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {connections.length === 0 ? (
              <Text style={[styles.metaCardSub, { color: themeColors.textSecondary }]}>
                Vincula tu cuenta publicitaria de Meta para sincronizar directamente el gasto, impresiones y CTR de tus anuncios de Facebook e Instagram en tus campañas.
              </Text>
            ) : (
              <View style={styles.metaConnsList}>
                {connections.map(c => (
                  <View key={c.id_connection} style={[styles.metaConnItem, { backgroundColor: isDark ? '#334155' : '#FFF' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.metaConnName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                        {c.account_name || 'Cuenta publicitaria Meta'}
                      </Text>
                      <Text style={[styles.metaConnId, { color: themeColors.textMuted }]}>ID: {c.external_account_id}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.metaSyncBtn, { borderColor: themeColors.primary }]}
                      onPress={() => triggerSync(c.id_connection)}
                      disabled={syncingId === c.id_connection}
                    >
                      {syncingId === c.id_connection ? (
                        <ActivityIndicator size="small" color={themeColors.primary} />
                      ) : (
                        <Ionicons name="sync" size={16} color={themeColors.primary} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.metaDiscBtn}
                      onPress={() => disconnectConnection(c.id_connection)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

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
                          <Text style={{ fontSize: 11, color: themeColors.textMuted }}>Posts • Reels • TikToks</Text>
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
              Comparativa directa del conjunto analítico (Posts, Reels, TikToks):
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 10 }}>
              {comparedCampaignsList.map((c) => (
                <View key={c.id_campaign} style={[styles.compareColumn, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
                  <Text style={[styles.compareCampName, { color: themeColors.textPrimary }]} numberOfLines={2}>{c.name}</Text>
                  
                  <View style={styles.compareMetricBox}>
                    <Text style={styles.compareMetricLabel}>Formato Principal</Text>
                    <Text style={styles.compareMetricVal}>Posts + Reels + TikToks</Text>
                  </View>

                  <View style={styles.compareMetricBox}>
                    <Text style={styles.compareMetricLabel}>CTR Estimado</Text>
                    <Text style={[styles.compareMetricVal, { color: '#10B981' }]}>{c.ctr_real ? `${c.ctr_real}%` : 'Sincronizando'}</Text>
                  </View>

                  <View style={styles.compareMetricBox}>
                    <Text style={styles.compareMetricLabel}>Origen de Datos</Text>
                    <Text style={styles.compareMetricVal}>{c.data_source === 'api_meta' ? 'Meta Ads API' : 'Integrado'}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

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
  metaModuleWrapper: { paddingHorizontal: 20, marginBottom: 12 },
  metaCard: {
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  metaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1877F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm },
  metaBadgeText: { color: '#fff', fontSize: 10, fontWeight: typography.bold },
  metaConnectBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.md },
  metaConnectBtnText: { color: '#fff', fontSize: 12, fontWeight: typography.bold },
  metaCardSub: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  metaConnsList: { gap: 8, marginTop: 8 },
  metaConnItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: radii.md, gap: 8 },
  metaConnName: { fontSize: 13, fontWeight: typography.bold },
  metaConnId: { fontSize: 11 },
  metaSyncBtn: { borderWidth: 1, padding: 6, borderRadius: radii.sm },
  metaDiscBtn: { padding: 6 },
  scrollContent: { paddingHorizontal: 20 },
  activeSection: { marginBottom: 10 },
  inactiveSection: { borderRadius: radii.xl, padding: 18, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: typography.bold, marginBottom: 12 },
  activeCard: { borderRadius: radii.xl, padding: 18, marginBottom: 16 },
  activeCardTitle: { fontSize: 17, fontWeight: typography.bold },
  iconBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  integratedPillsRow: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  integratedPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm, gap: 4 },
  integratedPillText: { fontSize: 11, fontWeight: typography.medium },
  metaBadgeInline: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaBadgeInlineText: { fontSize: 12, color: '#10B981', fontWeight: typography.bold },
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
