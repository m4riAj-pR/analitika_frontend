import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { colors, spacing, typography, shadows } from '@/src/theme/colors';
import { useTheme } from '@/src/ThemeContext';
import AccountAvatar from '@/src/components/AccountAvatar';
import { useCampaigns } from '@/src/hooks/useCampaigns';
import { trackingLinksApi } from '@/src/services/api/tracking';
import { Campaign } from '@/src/services/api/types';

// ─── Empty State (Replicated from Dashboard) ──────────────────────────────────
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


// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CampaignScreen() {
    const { campaigns, loading, reload } = useCampaigns();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors: themeColors, isDark } = useTheme();
    const [linksMap, setLinksMap] = React.useState<Record<number, string>>({});

    // Recargar siempre que la pantalla gane foco
    useFocusEffect(
        React.useCallback(() => {
            reload();
        }, [reload])
    );

    // Cargar links para todas las campañas
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
            Alert.alert('Error', 'Campaña no tiene id válido');
            return;
        }
        
        const existingLink = linksMap[id_campaign];
        if (existingLink) {
            await Clipboard.setStringAsync(existingLink);
            Alert.alert('¡Copiado!', `Link copiado: ${existingLink}`);
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
                    Alert.alert('¡Copiado!', `Link generado y copiado: ${trackUrl}`);
                    return;
                }
                links = await trackingLinksApi.listByCampaign(id_campaign);
            }

            if (links && links.length > 0) {
                const id_link = links[0].id_link;
                const trackUrl = trackingLinksApi.publicTrackUrl(Number(id_link));
                setLinksMap(prev => ({ ...prev, [id_campaign]: trackUrl }));
                await Clipboard.setStringAsync(trackUrl);
                Alert.alert('¡Copiado!', `Link copiado: ${trackUrl}`);
            }
        } catch (err: any) {
            Alert.alert('Error', `No se pudo copiar el link: ${err.message || 'Error'}`);
        }
    };

    const renderActiveCard = (camp: Campaign) => {
        const campId = camp.id_campaign;
        if (!campId) return null;

        return (
            <View key={`active-card-${campId}`} style={[styles.activeCard, { backgroundColor: isDark ? '#1E293B' : '#E9E4F5' }]}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(app)/create', params: { id: String(campId) } })}>
                    <Text style={[styles.activeCardTitle, { color: themeColors.textPrimary }]}>{camp.name}</Text>
                </TouchableOpacity>
                
                {/* Botón Copiar Estilo Mockup (Cápsula Blanca) */}
                <TouchableOpacity style={[styles.copyCapsule, { backgroundColor: isDark ? '#334155' : '#FFF' }]} onPress={() => copyLink(campId)}>
                    <Ionicons name="copy" size={20} color={themeColors.primary} />
                    <Text style={[styles.copyCapsuleText, { color: themeColors.primary }]}>Copiar link trackeable</Text>
                </TouchableOpacity>

                {/* Botón Dashboard Estilo Mockup (Sólido Morado) */}
                <TouchableOpacity style={[styles.dashboardButton, { backgroundColor: themeColors.primary }]} onPress={() => router.push('/(app)/(tabs)/dashboard')}>
                    <Text style={styles.dashboardButtonText}>Ver Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
            {/* ── HEADER ── */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Campañas</Text>
                <TouchableOpacity onPress={() => router.push('/account')}>
                    <AccountAvatar size={42} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
                    
                    {campaigns.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {/* Sección Campañas Activas (Como Cards del Mockup) */}
                            <View style={styles.activeSection}>
                                {activeCampaigns.map(renderActiveCard)}
                                {activeCampaigns.length === 0 && <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No hay campañas activas</Text>}
                            </View>

                            {/* Sección Campañas Inactivas (Estilo Mockup) */}
                            <View style={[styles.inactiveSection, { backgroundColor: isDark ? '#1E293B' : '#E9E4F5' }]}>
                                <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Campañas Inactivas</Text>
                                {inactiveCampaigns.map((camp) => (
                                    <View key={`inactive-${camp.id_campaign}`} style={[styles.listItem, { backgroundColor: isDark ? '#334155' : '#F3F0FA' }]}>
                                        <Text style={[styles.listText, { color: themeColors.textPrimary }]} numberOfLines={1}>{camp.name}</Text>
                                        <View style={styles.listActions}>
                                            <TouchableOpacity 
                                                style={{ marginRight: 15 }}
                                                onPress={() => router.push({ pathname: '/(app)/(tabs)/dashboard', params: { campaignId: String(camp.id_campaign) } })}
                                            >
                                                <Ionicons name="eye-outline" size={24} color={themeColors.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => router.push({ pathname: '/(app)/create', params: { id: String(camp.id_campaign) } })}>
                                                <Ionicons name="create-outline" size={24} color={themeColors.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                {inactiveCampaigns.length === 0 && <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No hay campañas inactivas</Text>}
                            </View>
                        </>
                    )}

                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPage },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.primary,
    },
    scrollContent: { paddingHorizontal: 24 },

    // SECCIONES ESTILO MOCKUP (Color lila de fondo)
    activeSection: {
        marginBottom: 10,
    },
    inactiveSection: {
        backgroundColor: '#E9E4F5',
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },

    // CARDS ACTIVAS (Exactamente como la imagen)
    activeCard: {
        backgroundColor: '#E9E4F5', // Fondo lila suave
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
    },
    activeCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    copyCapsule: {
        flexDirection: 'row',
        backgroundColor: '#FFF', // Cápsula Blanca
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    copyCapsuleText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 10,
    },
    dashboardButton: {
        backgroundColor: colors.primary, // Botón Morado
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dashboardButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },

    // LISTA INACTIVAS (Fondo blanco dentro del lila)
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F0FA', // Blanco-grisáceo suave para items
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 18,
        marginBottom: 12,
    },
    listText: {
        fontSize: 15,
        color: '#000',
        flex: 1,
        marginRight: 10,
    },
    listActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

const emptyStyles = StyleSheet.create({
    wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 100 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F0FA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 10 },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
    cta: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    ctaText: { color: '#FFF', fontWeight: '600' },
});
