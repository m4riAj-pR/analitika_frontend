import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    colors,
    radii,
    shadows,
    spacing,
    typography,
} from '../../../src/theme/colors';

import { campaignsApi } from '../../../src/services/api/campaign';
import { useCampaigns } from '../../../src/hooks/useCampaigns';
import { trackingLinksApi } from '../../../src/services/api/tracking';
import { trackingStatsApi } from '../../../src/services/api/stats';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { palette } from '../../../src/theme/colors';

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CampaignScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { campaigns, loading, reload } = useCampaigns();
    const [creating, setCreating] = useState(false);

    // Leer id_link y registrar
    useEffect(() => {
        if (params.id_link) {
            const id_link = Number(params.id_link);
            if (!isNaN(id_link)) {
                trackingStatsApi.registrarClick(id_link).catch(err => console.log('Error registrando click', err));
            }
        }
    }, [params.id_link]);

    // Filtrar campañas
    const topCampaign = campaigns.length > 0 ? campaigns[0] : null;
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const inactiveCampaigns = campaigns.filter(c => c.status !== 'active');

    const copyLink = async (id_campaign: number) => {
        try {
            const links = await trackingLinksApi.listByCampaign(id_campaign);
            if (links && links.length > 0) {
                const trackUrl = trackingLinksApi.publicTrackUrl(links[0].id_link);
                await Clipboard.setStringAsync(trackUrl);
                Alert.alert("¡Copiado!", "El link trackeable ha sido copiado al portapapeles.");
            } else {
                Alert.alert("Sin Link", "Esta campaña aún no tiene un link trackeable generado.");
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo copiar el link.");
        }
    };

    // handleCreateCampaign fue eliminado ya que "Create" es un Tab manejado por customtabbar.tsx

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
                {/* ── TOP CAMPAIGN CARD ── */}
                {topCampaign && (
                    <View style={[styles.card, { backgroundColor: '#EDE9FE' }]}>
                        <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: spacing.md }]}>{topCampaign.name}</Text>
                        
                        <TouchableOpacity style={styles.copyRow} onPress={() => copyLink(topCampaign.id_campaign)}>
                            <View style={styles.copyIconWrapper}>
                                <Ionicons name="copy" size={16} color={colors.bgPage} />
                            </View>
                            <Text style={styles.copyText}>Copiar link trackeable</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnDashboard} activeOpacity={0.8} onPress={() => router.push('/(app)/(tabs)/dashboard')}>
                            <Text style={styles.btnDashboardText}>Ver Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── CAMPAÑAS ACTIVAS CARD ── */}
                <View style={[styles.card, styles.activeCard, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={styles.cardTitle}>Campañas Activas</Text>
                    {activeCampaigns.map((camp) => (
                        <View key={camp.id_campaign} style={styles.campaignRowWhite}>
                            <Text style={styles.campaignName}>{camp.name}</Text>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/(app)/create', params: { id: camp.id_campaign } })}>
                                <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* ── CAMPAÑAS INACTIVAS CARD ── */}
                <View style={[styles.card, styles.activeCard, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={styles.cardTitle}>Campañas Inactivas</Text>
                    {inactiveCampaigns.map((camp) => (
                        <View key={camp.id_campaign} style={styles.campaignRowWhite}>
                            <Text style={styles.campaignName}>{camp.name}</Text>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/(app)/create', params: { id: camp.id_campaign } })}>
                                <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    ))}
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
        borderRadius: radii.xl,
        padding: spacing.xl,
        minHeight: 120,
    },
    activeCard: {
        gap: spacing.md,
    },
    cardTitle: {
        fontSize: typography.sizeLg,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },

    /* Top Campaign Card Details */
    copyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    copyIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: radii.sm,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    copyText: {
        fontSize: typography.sizeSm,
        color: colors.primary,
        fontWeight: typography.semibold,
    },
    btnDashboard: {
        backgroundColor: colors.primary,
        borderRadius: radii.pill,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    btnDashboardText: {
        color: colors.textOnPrimary,
        fontWeight: typography.bold,
        fontSize: typography.sizeMd,
    },

    /* Campañas list */
    campaignRowWhite: {
        height: 48,
        borderRadius: radii.pill,
        backgroundColor: colors.bgPage,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    campaignName: {
        fontSize: typography.sizeSm,
        color: colors.textPrimary,
        fontWeight: typography.medium,
        flex: 1,
    },
});
