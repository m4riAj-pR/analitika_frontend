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
import AccountAvatar from '../../../src/components/AccountAvatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  palette,
  radii,
  shadows,
  spacing,
  typography,
} from '../../../src/theme/colors';
import { useTheme } from '../../../src/ThemeContext';
import { useCampaignsTop } from '../../../src/hooks/useCampaignsTop';
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
  const { colors: themeColors, isDark } = useTheme();
  const isTop = rank === 1;
  const accent = isTop ? themeColors.primary : 'transparent';

  const formatNumber = (n?: number | null) =>
    n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <View style={[styles.card, { backgroundColor: themeColors.primary }, isTop && { borderColor: isDark ? themeColors.textSecondary : palette.purple3 }]}>
      {/* rank badge */}
      <View style={[styles.rankBadge, isTop && styles.rankBadgeTop]}>
        {isTop
          ? <Ionicons name="trophy" size={13} color="#F59E0B" />
          : <Text style={styles.rankText}>#{rank}</Text>
        }
      </View>

      <PodiumIcon color={isTop ? (isDark ? '#F1F5F9' : palette.purple3) : 'rgba(255,255,255,0.5)'} />

      {/* info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={11} color="rgba(255,255,255,0.6)" />
          <Text style={styles.metaText}>{formatNumber(item.clicks)} clics</Text>
        </View>
      </View>

      {/* ROI pill */}
      {item.roi != null && (
        <View style={[styles.roiPill, isTop && styles.roiPillTop]}>
          <Text style={[styles.roiText, isTop && { color: isDark ? '#FFF' : palette.purple3 }]}>
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
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={emptyStyles.wrapper}>
      <View style={[emptyStyles.iconCircle, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
        <Ionicons name="podium-outline" size={52} color={themeColors.primary} />
      </View>
      <Text style={[emptyStyles.title, { color: themeColors.textPrimary }]}>Sin ranking aún</Text>
      <Text style={[emptyStyles.subtitle, { color: themeColors.textSecondary }]}>
        Crea tus primeras campañas y comparte sus links para ver cuáles generan más impacto aquí.
      </Text>
      <TouchableOpacity
        style={[emptyStyles.cta, { backgroundColor: themeColors.primary }]}
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: themeColors, isDark } = useTheme();

  // Rango: últimos 30 días
  const { start_date, end_date } = useMemo(() => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    const start = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
    return { start_date: start, end_date: end };
  }, []);

  const { campaigns, loading, error, reload } = useCampaignsTop(start_date, end_date);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Top Campañas</Text>
          <Text style={[styles.headerSub, { color: themeColors.textSecondary }]}>Últimos 30 días</Text>
        </View>
        <TouchableOpacity style={[styles.avatarBtn, { backgroundColor: themeColors.bgCard }]} activeOpacity={0.75} onPress={() => router.push('/(app)/account' as any)}>
          <AccountAvatar size={42} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Cargando ranking…</Text>
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
            <Ionicons name="trophy-outline" size={14} color={themeColors.primary} />
            <Text style={[styles.legendText, { color: themeColors.textSecondary }]}>
              {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''} en el ranking
            </Text>
            <TouchableOpacity onPress={reload} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="refresh-outline" size={16} color={themeColors.primary} />
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
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
    width: 46,
    height: 46,
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
  },
  cardTop: {
    borderColor: palette.purple3,
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
  roiPillTop: { backgroundColor: 'rgba(173, 141, 242, 0.15)' },
  roiText: { fontSize: 12, fontWeight: typography.bold, color: 'rgba(255,255,255,0.85)' },
});
