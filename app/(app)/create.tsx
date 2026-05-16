import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountAvatar from '../../src/components/AccountAvatar';
import { useProfile } from '../../src/hooks/useProfile';
import { campaignsApi, channelsApi, trackingLinksApi } from '../../src/services/api';
import { CAMPAIGN_STATUS } from '../../src/services/api/types';
import {
    colors,
    palette,
    radii,
    spacing,
    typography,
} from '../../src/theme/colors';
import { useTheme } from '../../src/ThemeContext';

// ─── Date field group (DD / MM / YYYY) ───────────────────────────────────────
function DateGroup({
  label,
  dd, mm, yyyy,
  onDd, onMm, onYyyy,
}: {
  label: string;
  dd: string; mm: string; yyyy: string;
  onDd: (v: string) => void;
  onMm: (v: string) => void;
  onYyyy: (v: string) => void;
}) {
  const { colors: themeColors, isDark } = useTheme();
  const mmRef = useRef<TextInput>(null);
  const yyyyRef = useRef<TextInput>(null);

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.dateInput, { flex: 1, backgroundColor: themeColors.bgCard, color: themeColors.textPrimary }]}
          placeholder="DD"
          placeholderTextColor={themeColors.textMuted}
          value={dd}
          onChangeText={(v) => { onDd(v); if (v.length === 2) mmRef.current?.focus(); }}
          keyboardType="numeric"
          maxLength={2}
          textAlign="center"
        />
        <TextInput
          ref={mmRef}
          style={[styles.dateInput, { flex: 1, backgroundColor: themeColors.bgCard, color: themeColors.textPrimary }]}
          placeholder="MM"
          placeholderTextColor={themeColors.textMuted}
          value={mm}
          onChangeText={(v) => { onMm(v); if (v.length === 2) yyyyRef.current?.focus(); }}
          keyboardType="numeric"
          maxLength={2}
          textAlign="center"
        />
        <TextInput
          ref={yyyyRef}
          style={[styles.dateInput, { flex: 2, backgroundColor: themeColors.bgCard, color: themeColors.textPrimary }]}
          placeholder="YYYY"
          placeholderTextColor={themeColors.textMuted}
          value={yyyy}
          onChangeText={onYyyy}
          keyboardType="numeric"
          maxLength={4}
          textAlign="center"
        />
      </View>
    </View>
  );
}


function MoneyInput({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <View style={[styles.moneyWrapper, { backgroundColor: themeColors.bgCard }]}>
        <Text style={[styles.moneyCurrency, { color: themeColors.textPrimary }]}>$</Text>
        <TextInput
          style={[styles.moneyInput, { color: themeColors.textPrimary }]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholderTextColor={themeColors.textMuted}
        />
      </View>
    </View>
  );
}

// ─── Empty State (Replicated from Dashboard) ──────────────────────────────────
function EmptyState({ 
  title = "No hay campañas", 
  subtitle = "Parece que aún no has creado ninguna campaña activa.",
  ctaText = "Volver",
  onPress
}: { 
  title?: string; 
  subtitle?: string; 
  ctaText?: string;
  onPress: () => void;
}) {
  const { colors: themeColors, isDark } = useTheme();
  return (
    <View style={emptyStyles.wrapper}>
      <View style={[emptyStyles.iconCircle, { backgroundColor: isDark ? '#1E293B' : '#F3F0FA' }]}>
        <Ionicons name="layers-outline" size={52} color={themeColors.primary} />
      </View>
      <Text style={[emptyStyles.title, { color: themeColors.textPrimary }]}>{title}</Text>
      <Text style={[emptyStyles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
      <TouchableOpacity
        style={[emptyStyles.cta, { backgroundColor: themeColors.primary }]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Ionicons name="arrow-back-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={emptyStyles.ctaText}>{ctaText}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CreateCampaignScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const campaignId = params.id ? Number(params.id) : null;
  const { profile } = useProfile();
  const { colors: themeColors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const statusOptions = CAMPAIGN_STATUS;
  const PREDEFINED_CHANNELS = [
    { label: 'Meta (FB/IG)', value: 'Meta' },
    { label: 'Google Ads', value: 'Google' },
    { label: 'TikTok Ads', value: 'TikTok' },
    { label: 'Email Marketing', value: 'Email' },
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'Organic (Social/SEO)', value: 'Organic' },
    { label: 'LinkedIn Ads', value: 'LinkedIn' },
    { label: 'Twitter / X', value: 'Twitter' },
    { label: 'Otros', value: 'Others' },
  ];

  // Datos del Canal (entidad separada)
  const [channelName, setChannelName] = useState('');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelDescription, setChannelDescription] = useState('');

  const [startDd, setStartDd] = useState('');
  const [startMm, setStartMm] = useState('');
  const [startYyyy, setStartYyyy] = useState('');

  const [endDd, setEndDd] = useState('');
  const [endMm, setEndMm] = useState('');
  const [endYyyy, setEndYyyy] = useState('');

  const [spent, setSpent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setSessionLoading(true);

      // 2. Si es edición, cargar la campaña
      if (campaignId) {
        try {
          setLoading(true);
          const campaigns: any = await campaignsApi.list();
          const camp = campaigns.find((c: any) => c.id_campaign === campaignId);
          if (camp) {
            setName(camp.name || '');
            
            // Limpiar firma de la descripción si existe [Creador: ...]
            let cleanDesc = camp.description || '';
            cleanDesc = cleanDesc.replace(/\[Creador: .*?\]\s*/, '');
            setDescription(cleanDesc);

            setStatus(camp.status || 'active');
            setSpent(camp.spent?.toString() || '');
            
            if (camp.start_date) {
              const [y, m, d] = camp.start_date.split('-');
              setStartYyyy(y); setStartMm(m); setStartDd(d);
            }
            if (camp.end_date) {
              const [y, m, d] = camp.end_date.split('-');
              setEndYyyy(y); setEndMm(m); setEndDd(d);
            }
          }

          // Cargar el link trackeable
          try {
            const links = await trackingLinksApi.listByCampaign(campaignId);
            if (links && links.length > 0 && links[0].id_link) {
              setTrackUrl(trackingLinksApi.publicTrackUrl(Number(links[0].id_link)));
            }
          } catch (err) {
            console.log("No se pudo cargar el link trackeable", err);
          }
        } catch (err) {
          Alert.alert("Error", "No se pudo cargar la campaña.");
        } finally {
          setLoading(false);
        }
      }

      setSessionLoading(false);
    };
    loadData();
  }, [campaignId]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre de la campaña.');
      return;
    }

    // Intentar obtener el ID de la empresa de varias fuentes dentro del perfil
    let companyId = profile?.id_company;
    
    if (!companyId && profile?.companies && profile.companies.length > 0) {
      companyId = profile.companies[0].id_company;
    }

    // Si sigue sin haber ID y es Super Admin (rol 1), intentar obtener la primera empresa del sistema
    if (!companyId && profile?.id_role === 1) {
      try {
        const { companiesApi } = await import('../services/api/companies');
        const companies: any = await companiesApi.getCompanies();
        const list = Array.isArray(companies) ? companies : (companies?.response || []);
        if (list.length > 0) {
          companyId = list[0].id_company;
        }
      } catch (err) {
        console.log("Error al intentar obtener empresa fallback para Admin:", err);
      }
    }

    if (!companyId) {
      Alert.alert(
        'Empresa no detectada', 
        'No pudimos identificar tu empresa vinculada. Asegúrate de que tu perfil tenga una empresa asignada o contacta a soporte.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    try {
      setLoading(true);

      const startDate = (startYyyy && startMm && startDd) 
        ? `${startYyyy}-${startMm.padStart(2, '0')}-${startDd.padStart(2, '0')}`
        : null;
      
      const endDate = (endYyyy && endMm && endDd)
        ? `${endYyyy}-${endMm.padStart(2, '0')}-${endDd.padStart(2, '0')}`
        : null;

      // Validación de Seguridad: Rango de fechas permitido (Año actual o siguiente)
      const currentYear = new Date().getFullYear();
      const maxYear = currentYear + 1;

      const validateYear = (yyyy: string, label: string) => {
        if (!yyyy) return true;
        const year = parseInt(yyyy);
        if (isNaN(year)) return true;
        if (year < currentYear) {
          Alert.alert('Fecha inválida', `La ${label} no puede ser de un año anterior (${currentYear}).`);
          return false;
        }
        if (year > maxYear) {
          Alert.alert('Fecha inválida', `La ${label} no puede ser posterior al año ${maxYear}.`);
          return false;
        }
        return true;
      };

      if (!validateYear(startYyyy, 'fecha de inicio') || !validateYear(endYyyy, 'fecha de fin')) {
        setLoading(false);
        return;
      }

      // 1. Payload de Campaña
      let numericSpent = null;
      if (spent) {
        numericSpent = parseFloat(spent.replace(',', '.'));
        if (isNaN(numericSpent)) numericSpent = null;
      }

      const campaignPayload = {
        id_company: Number(companyId),
        name: name.trim(),
        description: description.trim() || null,
        status: status,
        start_date: startDate,
        end_date: endDate,
        spent: numericSpent,
      };
      console.log("CREATE CAMPAIGN PAYLOAD:", campaignPayload);

      // 2. Guardar Campaña
      let newCampaignId: number | null = null;
      if (campaignId) {
        await campaignsApi.update(campaignId, campaignPayload);
        newCampaignId = campaignId;
      } else {
        const res: any = await campaignsApi.create(campaignPayload);
        if (res && (res.id_campaign || res.id)) {
          newCampaignId = res.id_campaign || res.id;
        } else {
          // Fallback: intentar encontrar la campaña recién creada por nombre
          try {
            const allCampaigns: any = await campaignsApi.list();
            const list = Array.isArray(allCampaigns) ? allCampaigns : (allCampaigns?.response || []);
            const justCreated = list.find((c: any) => c.name === campaignPayload.name && Number(c.id_company) === Number(campaignPayload.id_company));
            if (justCreated) {
              newCampaignId = justCreated.id_campaign;
            }
          } catch (err) {
            console.log("No se pudo obtener id de campaña creada:", err);
          }
        }
      }

      // 3. Payload de Canal
      if (channelName.trim()) {
        const channelPayload = {
          name: channelName.trim(),
          description: channelDescription.trim() || null,
        };
        try {
          await channelsApi.createChannel(channelPayload);
        } catch (channelErr) {
          console.log("Error creating channel, continuing...", channelErr);
        }
      }

      // 4. Crear link trackeable inicial (solo en creación)
      if (!campaignId && newCampaignId) {
        try {
          await trackingLinksApi.create({
            id_campaign: newCampaignId,
            destination: 'https://analitika.com',
          });
          console.log("Link trackeable creado automáticamente para campaña:", newCampaignId);
        } catch (linkErr) {
          console.log("Error creating initial link:", linkErr);
        }
      }

      Alert.alert('¡Listo!', `Campaña ${campaignId ? 'actualizada' : 'creada'} exitosamente.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.log("CREATE CAMPAIGN ERROR:", error);
      Alert.alert('Error', error.message || 'No se pudo completar la operación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Fallback si estamos editando y no se encuentra la campaña */}
      {campaignId && !name && !loading && !sessionLoading ? (
        <EmptyState 
          title="Campaña no encontrada"
          subtitle="No pudimos encontrar la campaña que intentas editar."
          onPress={() => router.back()}
        />
      ) : (
        <>
          {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: themeColors.primary }]} numberOfLines={2}>
          {name.trim() ? name : `Nombre de la\ncampaña`}
        </Text>

        <TouchableOpacity
          style={[styles.headerActionBtn, { backgroundColor: themeColors.primary }]}
          activeOpacity={0.8}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.headerPlusIcon}>
              <View style={[styles.plusVerticalHeader, { backgroundColor: '#fff' }]} />
              <View style={[styles.plusHorizontalHeader, { backgroundColor: '#fff' }]} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.avatarBtn, { backgroundColor: themeColors.bgCard }]}
          activeOpacity={0.75}
          onPress={() => router.push('/(app)/(tabs)/account')}
        >
          <AccountAvatar size={36} />
        </TouchableOpacity>
      </View>

      {/* ── FORM ── */}
      <ScrollView
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {sessionLoading && (
          <View style={{ marginBottom: spacing.md }}>
            <ActivityIndicator size="small" color={themeColors.primary} />
          </View>
        )}

        {/* Plantillas */}
        {!campaignId && (
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[styles.fieldLabel, { color: themeColors.textSecondary, marginBottom: spacing.sm }]}>Selecciona una Plantilla</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
              <TouchableOpacity
                style={[styles.templateBtn, { backgroundColor: themeColors.bgCard }]}
                onPress={() => {
                  setName(`Ventas - ${new Date().toLocaleString('default', { month: 'long' })}`);
                  setDescription("Campaña optimizada para maximizar conversiones y ventas directas.");
                  setChannelName("Meta");
                }}
              >
                <Ionicons name="cart-outline" size={20} color={themeColors.primary} />
                <Text style={[styles.templateBtnText, { color: themeColors.textPrimary }]}>Ventas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.templateBtn, { backgroundColor: themeColors.bgCard }]}
                onPress={() => {
                  setName(`Leads - ${new Date().toLocaleString('default', { month: 'long' })}`);
                  setDescription("Enfoque en captación de prospectos y generación de base de datos.");
                  setChannelName("Google");
                }}
              >
                <Ionicons name="person-add-outline" size={20} color={themeColors.primary} />
                <Text style={[styles.templateBtnText, { color: themeColors.textPrimary }]}>Leads</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.templateBtn, { backgroundColor: themeColors.bgCard }]}
                onPress={() => {
                  setName(`Tráfico - ${new Date().toLocaleString('default', { month: 'long' })}`);
                  setDescription("Aumento de visibilidad y visitas al sitio web o landing page.");
                  setChannelName("TikTok");
                }}
              >
                <Ionicons name="megaphone-outline" size={20} color={themeColors.primary} />
                <Text style={[styles.templateBtnText, { color: themeColors.textPrimary }]}>Tráfico</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Nombre */}
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.bgCard, color: themeColors.textPrimary }]}
          placeholder="Nombre de la campaña"
          placeholderTextColor={themeColors.textMuted}
          value={name}
          onChangeText={setName}
        />

        {/* Descripción */}
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: themeColors.bgCard, color: themeColors.textPrimary }]}
          placeholder="Descripcion"
          placeholderTextColor={themeColors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Estado */}
        <TouchableOpacity
          style={[styles.selectorRow, { backgroundColor: themeColors.bgCard }]}
          activeOpacity={0.7}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={[styles.selectorText, { color: themeColors.textPrimary }, !status && { color: themeColors.textMuted }]}>
            {status || 'Estado'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
        </TouchableOpacity>

        {/* Modal selector de estado */}
        <Modal visible={showStatusModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowStatusModal(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: themeColors.bgPage }]}>
              <Text style={[styles.modalTitle, { color: themeColors.primary }]}>Selecciona un Estado</Text>
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    setStatus(opt);
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    { color: themeColors.textPrimary },
                    status === opt && { color: themeColors.primary, fontWeight: typography.bold },
                  ]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Datos del Canal */}
        <View style={[styles.divider, { backgroundColor: themeColors.borderDivider }]} />
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Datos del Canal (Opcional)</Text>
        
        <TouchableOpacity
          style={[styles.selectorRow, { backgroundColor: themeColors.bgCard, marginBottom: spacing.md }]}
          activeOpacity={0.7}
          onPress={() => setShowChannelModal(true)}
        >
          <Text style={[styles.selectorText, { color: themeColors.textPrimary }, !channelName && { color: themeColors.textMuted }]}>
            {PREDEFINED_CHANNELS.find(c => c.value === channelName)?.label || 'Seleccionar Canal'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
        </TouchableOpacity>

        {/* Modal selector de canal */}
        <Modal visible={showChannelModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowChannelModal(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: themeColors.bgPage, maxHeight: '70%' }]}>
              <Text style={[styles.modalTitle, { color: themeColors.primary }]}>Plataforma de la Campaña</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {PREDEFINED_CHANNELS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.modalOption}
                    onPress={() => {
                      setChannelName(opt.value);
                      setShowChannelModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      { color: themeColors.textPrimary },
                      channelName === opt.value && { color: themeColors.primary, fontWeight: typography.bold },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: themeColors.bgCard, color: themeColors.textPrimary }]}
          placeholder="Descripción del Canal"
          placeholderTextColor={themeColors.textMuted}
          value={channelDescription}
          onChangeText={setChannelDescription}
          multiline
        />

        {/* Fecha inicio */}
        <DateGroup
          label="Fecha inicio"
          dd={startDd} mm={startMm} yyyy={startYyyy}
          onDd={setStartDd} onMm={setStartMm} onYyyy={setStartYyyy}
        />

        {/* Fecha fin */}
        <DateGroup
          label="Fecha fin"
          dd={endDd} mm={endMm} yyyy={endYyyy}
          onDd={setEndDd} onMm={setEndMm} onYyyy={setEndYyyy}
        />

        {/* Gasto */}
        <MoneyInput label="Gasto acumulado" value={spent} onChange={setSpent} />

        {/* Generar Link Trackeable */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Link Trackeable</Text>
          <View style={[styles.linkBox, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, backgroundColor: themeColors.bgCard }]}>
            {trackUrl ? (
              <>
                <Text style={{ flex: 1, color: themeColors.textPrimary, fontSize: typography.sizeMd }} numberOfLines={1}>
                  {trackUrl}
                </Text>
                <TouchableOpacity 
                  style={{ padding: spacing.sm, backgroundColor: isDark ? '#334155' : '#EDE9FE', borderRadius: radii.md }}
                  onPress={async () => {
                    await Clipboard.setStringAsync(trackUrl);
                    Alert.alert('¡Copiado!', 'El link ha sido copiado al portapapeles.');
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color={themeColors.primary} />
                </TouchableOpacity>
              </>
            ) : (
                <Text style={{ flex: 1, color: themeColors.textMuted, fontSize: typography.sizeSm, fontStyle: 'italic' }}>
                    {campaignId ? 'No se encontró link trackeable' : 'El link se generará automáticamente al crear la campaña.'}
                  </Text>
            )}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: themeColors.primary }, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>
              {campaignId ? 'Guardar Cambios' : 'Crear campaña'}
            </Text>
          )}
        </TouchableOpacity>
          </ScrollView>
        </>
      )}
    </KeyboardAvoidingView>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.size2xl,
    fontWeight: typography.bold,
    color: colors.primary,
    lineHeight: typography.lineHeightLg,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerPlusIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusVerticalHeader: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
    position: 'absolute',
  },
  plusHorizontalHeader: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
  },

  /* Form */
  form: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  /* Text inputs */
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizeMd,
    color: colors.textPrimary,
    // sombra sutil mejorada
    shadowColor: palette.purple2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },

  /* Canal selector */
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: palette.purple2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  selectorText: {
    fontSize: typography.sizeMd,
    color: colors.textPrimary,
  },
  placeholder: {
    color: palette.purple3,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
    shadowColor: palette.purple2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  templateBtnText: {
    fontSize: typography.sizeMd,
    fontWeight: typography.semibold,
  },

  /* Date group */
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sizeSm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizeMd,
    color: colors.textPrimary,
    shadowColor: palette.purple2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Money input */
  moneyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: palette.purple2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  moneyCurrency: {
    fontSize: typography.sizeMd,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  moneyInput: {
    flex: 1,
    fontSize: typography.sizeMd,
    color: colors.textPrimary,
    padding: 0,
  },

  /* Link trackeable */
  linkBox: {
    height: 72,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    shadowColor: palette.purple2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  /* CTA */
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  createButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
  },

  /* Section spacing */
  divider: {
    height: 1,
    backgroundColor: colors.borderDivider,
    marginVertical: spacing.lg,
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.bgPage,
    borderRadius: radii.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: typography.sizeXl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  modalOptionText: {
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
    textAlign: 'center',
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
