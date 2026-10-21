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
import { statusLabel } from '../../src/utils/format';
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
  // El nombre se guarda tal cual en /analitika/channels; el backend lo usa para
  // generar utm_source en el enlace de seguimiento (google, tiktok, email…).
  const PREDEFINED_CHANNELS = [
    { label: 'Google Ads', value: 'Google Ads' },
    { label: 'TikTok Ads', value: 'TikTok Ads' },
    { label: 'Email Marketing', value: 'Email' },
    { label: 'WhatsApp', value: 'WhatsApp' },
    { label: 'Orgánico (redes / SEO)', value: 'Orgánico' },
    { label: 'LinkedIn Ads', value: 'LinkedIn Ads' },
    { label: 'X (Twitter)', value: 'X' },
    { label: 'Otro', value: 'Otro' },
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
  const [budget, setBudget] = useState('');
  const [destination, setDestination] = useState('');
  const [existingLink, setExistingLink] = useState<{ id_link: number; id_channel: number | null; destination: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);

  const isOwner = profile?.id_role === 1 || profile?.id_role === 2;

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
            setSpent(camp.spent != null ? String(Number(camp.spent)) : '');
            setBudget(camp.budget != null ? String(Number(camp.budget)) : '');
            
            if (camp.start_date) {
              const [y, m, d] = camp.start_date.split('-');
              setStartYyyy(y); setStartMm(m); setStartDd(d);
            }
            if (camp.end_date) {
              const [y, m, d] = camp.end_date.split('-');
              setEndYyyy(y); setEndMm(m); setEndDd(d);
            }
          }

          // Enlace de seguimiento y canal asociados (la relación campaña↔canal vive en tracking_links)
          try {
            const [links, channels]: any = await Promise.all([
              trackingLinksApi.listByCampaign(campaignId),
              channelsApi.getChannels().catch(() => []),
            ]);
            const link = Array.isArray(links) && links.length > 0 ? links[0] : null;
            if (link?.id_link) {
              setExistingLink({ id_link: Number(link.id_link), id_channel: link.id_channel ?? null, destination: link.destination || '' });
              setTrackUrl(trackingLinksApi.publicTrackUrl(Number(link.id_link)));
              // Se muestra el destino sin los UTM que agrega el backend
              setDestination(String(link.destination || '').replace(/[?&]utm_source=.*$/, ''));
              const ch = (Array.isArray(channels) ? channels : []).find((c: any) => c.id_channel === link.id_channel);
              if (ch?.name) setChannelName(ch.name);
            }
          } catch {
            // Sin enlace: se generará al guardar con la URL de destino
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

  /** Convierte DD/MM/YYYY en YYYY-MM-DD validando que la fecha exista (p. ej. rechaza 31/02). */
  const toIsoDate = (dd: string, mm: string, yyyy: string): string | null | 'invalid' => {
    if (!dd && !mm && !yyyy) return null;
    const d = Number(dd), m = Number(mm), y = Number(yyyy);
    if (!d || !m || yyyy.length !== 4) return 'invalid';
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return 'invalid';
    return `${yyyy}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const parseAmount = (v: string): number | null | 'invalid' => {
    if (!v.trim()) return null;
    const n = Number(v.trim().replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : 'invalid';
  };

  /** Busca el canal por nombre; si no existe y el rol lo permite (Owner), lo crea. */
  const resolveChannelId = async (nameToFind: string): Promise<number | null> => {
    if (!nameToFind.trim()) return null;
    const find = (list: any) =>
      (Array.isArray(list) ? list : []).find((c: any) => String(c.name || '').trim().toLowerCase() === nameToFind.trim().toLowerCase());
    const existing = find(await channelsApi.getChannels());
    if (existing) return Number(existing.id_channel);
    if (!isOwner) return null; // el backend solo permite crear canales a Owner / Super Admin
    await channelsApi.createChannel({ name: nameToFind.trim(), description: channelDescription.trim() || null });
    const created = find(await channelsApi.getChannels());
    return created ? Number(created.id_channel) : null;
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre de la campaña.');
      return;
    }

    const companyId = profile?.id_company ?? profile?.companies?.[0]?.id_company;
    if (!companyId) {
      Alert.alert('Empresa no detectada', 'Tu usuario no tiene una empresa asignada. Solicita al Owner que te vincule a una empresa.');
      return;
    }

    const startDate = toIsoDate(startDd, startMm, startYyyy);
    const endDate = toIsoDate(endDd, endMm, endYyyy);
    if (startDate === 'invalid' || endDate === 'invalid') {
      Alert.alert('Fecha inválida', 'Revisa las fechas: deben existir en el calendario (DD/MM/AAAA).');
      return;
    }
    const currentYear = new Date().getFullYear();
    for (const [iso, label] of [[startDate, 'fecha de inicio'], [endDate, 'fecha de fin']] as const) {
      if (!iso) continue;
      const year = Number(iso.slice(0, 4));
      if (year < currentYear || year > currentYear + 1) {
        Alert.alert('Fecha inválida', `La ${label} debe estar en ${currentYear} o ${currentYear + 1}.`);
        return;
      }
    }
    if (startDate && endDate && endDate < startDate) {
      Alert.alert('Fecha inválida', 'La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    const numericSpent = parseAmount(spent);
    const numericBudget = parseAmount(budget);
    if (numericSpent === 'invalid' || numericBudget === 'invalid') {
      Alert.alert('Valor inválido', 'La inversión y el presupuesto deben ser números mayores o iguales a cero.');
      return;
    }

    const dest = destination.trim();
    if (!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(dest)) {
      Alert.alert('URL de destino requerida', 'Ingresa la página a la que llegará el tráfico, empezando por http:// o https://');
      return;
    }

    try {
      setLoading(true);

      // Se envían todos los campos: el backend reemplaza la fila completa en el PUT,
      // así un presupuesto existente no se pierde al editar.
      const campaignPayload = {
        id_company: Number(companyId),
        name: name.trim(),
        description: description.trim() || null,
        status,
        start_date: startDate,
        end_date: endDate,
        spent: numericSpent ?? 0,
        budget: numericBudget ?? 0,
      };

      let savedId: number | null = campaignId;
      if (campaignId) {
        await campaignsApi.update(campaignId, campaignPayload);
      } else {
        const res: any = await campaignsApi.create(campaignPayload);
        savedId = res?.id_campaign ? Number(res.id_campaign) : null;
        if (!savedId) throw new Error('El servidor no devolvió el identificador de la campaña.');
      }

      // Canal + enlace de seguimiento. Si fallan, la campaña ya quedó guardada.
      let linkWarning = '';
      try {
        const idChannel = await resolveChannelId(channelName);
        const linkPayload = { id_campaign: savedId, id_channel: idChannel, destination: dest };
        if (existingLink) {
          const changed = existingLink.id_channel !== idChannel || !existingLink.destination.startsWith(dest);
          if (changed) await trackingLinksApi.update(existingLink.id_link, linkPayload);
        } else {
          await trackingLinksApi.create(linkPayload);
        }
      } catch (linkErr: any) {
        linkWarning = `\n\nNo se pudo guardar el enlace de seguimiento: ${linkErr?.message || 'error desconocido'}.`;
      }

      Alert.alert('Listo', `Campaña ${campaignId ? 'actualizada' : 'creada'} correctamente.${linkWarning}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo completar la operación.');
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
          {name.trim() ? name : campaignId ? 'Editar campaña' : 'Nueva campaña'}
        </Text>



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
          placeholder="Descripción (se muestra en la página de aterrizaje)"
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
            {status ? `Estado: ${statusLabel(status)}` : 'Estado'}
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
                    {statusLabel(opt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Datos del Canal */}
        <View style={[styles.divider, { backgroundColor: themeColors.borderDivider }]} />
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Canal y destino</Text>
        
        <TouchableOpacity
          style={[styles.selectorRow, { backgroundColor: themeColors.bgCard, marginBottom: spacing.md }]}
          activeOpacity={0.7}
          onPress={() => setShowChannelModal(true)}
        >
          <Text style={[styles.selectorText, { color: themeColors.textPrimary }, !channelName && { color: themeColors.textMuted }]}>
            {PREDEFINED_CHANNELS.find(c => c.value === channelName)?.label || channelName || 'Canal de difusión (opcional)'}
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

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>URL de destino *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.bgCard, color: themeColors.textPrimary, marginBottom: 0 }]}
            placeholder="https://tusitio.com/landing"
            placeholderTextColor={themeColors.textMuted}
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={[styles.helperText, { color: themeColors.textMuted }]}>
            Cada visita al enlace de seguimiento registra un clic y redirige aquí. Si no incluye parámetros UTM, el servidor los añade.
          </Text>
        </View>

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
        <MoneyInput label="Presupuesto total" value={budget} onChange={setBudget} />
        <MoneyInput label="Inversión ejecutada (para CPC, CPA y ROI)" value={spent} onChange={setSpent} />

        {/* Generar Link Trackeable */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Enlace de seguimiento</Text>
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
                    Alert.alert('Copiado', 'El enlace se copió al portapapeles.');
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color={themeColors.primary} />
                </TouchableOpacity>
              </>
            ) : (
                <Text style={{ flex: 1, color: themeColors.textMuted, fontSize: typography.sizeSm, fontStyle: 'italic' }}>
                    {campaignId ? 'Se generará al guardar con la URL de destino.' : 'Se generará automáticamente al crear la campaña.'}
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
    // flexBasis/minWidth 0: sin esto el campo AAAA se salía del ancho de pantalla
    flexBasis: 0,
    minWidth: 0,
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

  helperText: {
    fontSize: typography.sizeXs,
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 4,
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
