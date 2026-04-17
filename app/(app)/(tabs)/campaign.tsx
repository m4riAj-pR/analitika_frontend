import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
    radii,
    shadows,
    spacing,
    typography,
} from '../../../src/theme/colors';

// ─── Skeleton row — simulates an empty campaign item ─────────────────────────
function SkeletonRow() {
    return <View style={styles.skeletonRow} />;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CampaignScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ── HEADER ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Campañas</Text>
                <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.75}>
                    <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 90 }, // leave room for floating tab bar
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── SUBTITLE ── */}
                <Text style={styles.subtitle}>Crea tu primera campaña</Text>

                {/* ── CREAR CAMPAÑA CARD ── */}
                <View style={[styles.card, shadows.card]}>
                    <Text style={styles.cardTitle}>Crear campaña</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        activeOpacity={0.8}
                        onPress={() => router.push('/(app)/create')}
                    >
                        <Ionicons name="add" size={28} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                </View>

                {/* ── CAMPAÑAS ACTIVAS CARD ── */}
                <View style={[styles.card, shadows.card, styles.activeCard]}>
                    <Text style={styles.cardTitle}>Campañas Activas</Text>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </View>
            </ScrollView>
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
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

    /* ScrollView */
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.sm,
        gap: spacing.xl,
    },

    subtitle: {
        fontSize: typography.sizeLg,
        fontWeight: typography.medium,
        color: colors.textBody,
        marginBottom: spacing.xs,
    },

    /* Cards */
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radii.xl,
        padding: spacing.xl,
    },
    activeCard: {
        gap: spacing.md,
    },
    cardTitle: {
        fontSize: typography.sizeLg,
        fontWeight: typography.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },

    /* Add button */
    addButton: {
        backgroundColor: colors.primary,
        borderRadius: radii.pill,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Skeleton */
    skeletonRow: {
        height: 44,
        borderRadius: radii.lg,
        backgroundColor: colors.bgPage,
    },
});
