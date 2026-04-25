import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  palette,
  radii,
  shadows,
  spacing,
  typography,
} from '../../../src/theme/colors';
import { useCampaignsTop } from '../../../src/hooks/UseCampaignsTop';
import type { TopCampaign } from '../../../src/services/api/types';

// ─── Podium icon ──────────────────────────────────────────────────────────────
function PodiumIcon({ color = palette.purple3 }: { color?: string }) {
  return (
    <View style={podiumStyles.wrapper}>
      <Ionicons name="star" size={13} color={color} style={{ marginBottom: 3 }} />
      <View style={podiumStyles.columns}>
        <View style={[podiumStyles.col, { height: 22, backgroundColor: color }]} />
        <View style={[podiumStyles.col, { height: 30, backgroundColor: color }]} />
        <View style={[podiumStyles.col, { height: 16, backgroundColor: color }]} />
      </View>
    </View>
  );
}
const podiumStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: 50 },
  columns: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  col: { width: 13, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
});

// ─── Ranking card ─────────────────────────────────────────────────────────────
function RankingCard({ item, rank }: { item: TopCampaign; rank: number }) {
  const isTop = rank === 1;
  const accent = isTop ? '#38bdf8' : 'transparent';

  const formatNumber = (n?: number | null) =>
    n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <View style={[styles.card, isTop && styles.cardTop]}>
      {/* rank badge */}
      <View style={[styles.rankBadge, isTop && styles.rankBadgeTop]}>
        {isTop
          ? <Ionicons name="trophy" size={13} color="#F59E0B" />
          : <Text style={styles.rankText}>#{rank}</Text>
        }
      </View>

      <PodiumIcon color={isTop ? '#38bdf8' : 'rgba(255,255,255,0.5)'} />

      {/* info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="hand-right-outline" size={11} color="rgba(255,255,255,0.6)" />
          <Text style={styles.metaText}>{formatNumber(item.clicks)} clics</Text>
          <Text style={styles.metaDot}>·</Text>
          <Ionicons name="refresh-outline" size={11} color="rgba(255,255,255,0.6)" />
          <Text style={styles.metaText}>{formatNumber(item.conversions)} conv.</Text>
        </View>
      </View>

      {/* ROI pill */}
      {item.roi != null && (
        <View style={[styles.roiPill, isTop && styles.roiPillTop]}>
          <Text style={[styles.roiText, isTop && { color: '#38bdf8' }]}>
            {item.roi >= 0 ? '+' : ''}{item.roi.toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  const router = useRouter();
  return (
    <View style={emptyStyles.wrapper}>
      <View style={emptyStyles.iconCircle}>
        <Ionicons name="podium-outline" size={52} color={colors.primary} />
      </View>
      <Text style={emptyStyles.title}>Sin ranking aún</Text>
      <Text style={emptyStyles.subtitle}>
        Crea tus primeras campañas y comparte sus links para ver cuáles generan más impacto aquí.
      </Text>
      <TouchableOpacity
        style={emptyStyles.cta}
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/create')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={emptyStyles.ctaText}>Crear campaña</Text>
      </TouchableOpacity>
    </View>
  );
}
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
    color: colors.textBody,
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
  ctaText: { color: '#fff', fontSize: typography.sizeMd, fontWeight: typography.bold },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function RankingScreen() {
  const insets = useSafeAreaInsets();

  // Rango: últimos 30 días
  const { start_date, end_date } = useMemo(() => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    const start = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
    return { start_date: start, end_date: end };
  }, []);

  const { campaigns, loading, error, reload } = useCampaignsTop(start_date, end_date);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Top Campañas</Text>
          <Text style={styles.headerSub}>Últimos 30 días</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.75}>
          <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando ranking…</Text>
        </View>
      ) : error ? (
        /* API error → treat as empty (no campaigns yet) */
        <EmptyState />
      ) : campaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* legend */}
          <View style={styles.legendRow}>
            <Ionicons name="trophy-outline" size={14} color={palette.purple2} />
            <Text style={styles.legendText}>
              {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''} en el ranking
            </Text>
            <TouchableOpacity onPress={reload} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="refresh-outline" size={16} color={palette.purple3} />
            </TouchableOpacity>
          </View>

          {/* list */}
          <View style={styles.list}>
            {campaigns.map((item, index) => (
              <RankingCard key={item.id_campaign} item={item} rank={index + 1} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.textBody, fontSize: typography.sizeSm, marginTop: spacing.xs },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.size2xl,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  headerSub: {
    fontSize: typography.sizeSm,
    color: palette.purple3,
    fontWeight: typography.medium,
    marginTop: 1,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },

  /* Legend */
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendText: {
    flex: 1,
    fontSize: typography.sizeSm,
    color: palette.purple2,
    fontWeight: typography.medium,
  },

  /* List */
  list: { gap: spacing.md },

  /* Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  cardTop: {
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  /* Rank badge */
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTop: { backgroundColor: 'rgba(245,158,11,0.2)' },
  rankText: { fontSize: typography.sizeXs, fontWeight: typography.bold, color: '#fff' },

  /* Card content */
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: typography.sizeMd, fontWeight: typography.bold, color: '#fff' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  metaDot: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  /* ROI pill */
  roiPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  roiPillTop: { backgroundColor: 'rgba(56,189,248,0.15)' },
  roiText: { fontSize: 12, fontWeight: typography.bold, color: 'rgba(255,255,255,0.85)' },
});
