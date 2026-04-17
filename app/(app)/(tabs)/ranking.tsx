import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
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
  spacing,
  typography,
} from '../../../src/theme/colors';

// ─── Types ───────────────────────────────────────────────────────────────────
interface RankingItem {
  id: string;
  name: string;
  views: string;
  highlighted?: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const RANKING: RankingItem[] = [
  { id: '1', name: 'Nombre', views: '100k vistas' },
  { id: '2', name: 'Nombre', views: '100k vistas', highlighted: true },
  { id: '3', name: 'Nombre', views: '86k vistas' },
  { id: '4', name: 'Nombre', views: '74k vistas' },
  { id: '5', name: 'Nombre', views: '61k vistas' },
];

// ─── Podium SVG-like icon built with View ─────────────────────────────────────
function PodiumIcon({ color = palette.purple3 }: { color?: string }) {
  return (
    <View style={podiumStyles.wrapper}>
      {/* Star on top */}
      <Ionicons name="star" size={14} color={color} style={podiumStyles.star} />
      {/* Three columns */}
      <View style={podiumStyles.columns}>
        <View style={[podiumStyles.col, { height: 22, backgroundColor: color }]} />
        <View style={[podiumStyles.col, { height: 30, backgroundColor: color }]} />
        <View style={[podiumStyles.col, { height: 16, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const podiumStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: 52 },
  star: { marginBottom: 4, alignSelf: 'center' },
  columns: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  col: { width: 14, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
});

// ─── Ranking card ─────────────────────────────────────────────────────────────
function RankingCard({ item, rank }: { item: RankingItem; rank: number }) {
  return (
    <View
      style={[
        styles.card,
        item.highlighted && styles.cardHighlighted,
      ]}
    >
      {/* Rank badge */}
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      {/* Podium icon */}
      <PodiumIcon color={item.highlighted ? '#38bdf8' : palette.purple3} />

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardViews}>{item.views}</Text>
      </View>

      {/* Trailing arrow */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={item.highlighted ? '#38bdf8' : palette.purple3}
        style={{ marginLeft: 'auto' }}
      />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function RankingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ranking</Text>
        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.75}>
          <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SUBTITLE ── */}
        <Text style={styles.subtitle}>Las mejores campañas de la semana</Text>

        {/* ── LIST ── */}
        <View style={styles.list}>
          {RANKING.map((item, index) => (
            <RankingCard key={item.id} item={item} rank={index + 1} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const HIGHLIGHT_COLOR = '#38bdf8'; // sky blue — spotlight accent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },

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

  subtitle: {
    fontSize: typography.sizeMd,
    fontWeight: typography.medium,
    color: colors.textBody,
    lineHeight: typography.lineHeightMd,
    marginBottom: spacing.xs,
  },

  /* List */
  list: {
    gap: spacing.md,
  },

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
  cardHighlighted: {
    borderColor: HIGHLIGHT_COLOR,
    shadowColor: HIGHLIGHT_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },

  /* Rank badge */
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: typography.sizeXs,
    fontWeight: typography.bold,
    color: colors.textOnPrimary,
  },

  /* Card content */
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: typography.sizeMd,
    fontWeight: typography.bold,
    color: colors.textOnPrimary,
  },
  cardViews: {
    fontSize: typography.sizeSm,
    fontWeight: typography.regular,
    color: 'rgba(255,255,255,0.7)',
  },
});
