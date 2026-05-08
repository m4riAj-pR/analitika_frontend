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
  const mmRef = useRef<TextInput>(null);
  const yyyyRef = useRef<TextInput>(null);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.dateInput, { flex: 1 }]}
          placeholder="DD"
          placeholderTextColor={palette.purple3}
          value={dd}
          onChangeText={(v) => { onDd(v); if (v.length === 2) mmRef.current?.focus(); }}
          keyboardType="numeric"
          maxLength={2}
          textAlign="center"
        />
        <TextInput
          ref={mmRef}
          style={[styles.dateInput, { flex: 1 }]}
          placeholder="MM"
          placeholderTextColor={palette.purple3}
          value={mm}
          onChangeText={(v) => { onMm(v); if (v.length === 2) yyyyRef.current?.focus(); }}
          keyboardType="numeric"
          maxLength={2}
          textAlign="center"
        />
        <TextInput
          ref={yyyyRef}
          style={[styles.dateInput, { flex: 2 }]}
          placeholder="YYYY"
          placeholderTextColor={palette.purple3}
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
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.moneyWrapper}>
        <Text style={styles.moneyCurrency}>$</Text>
        <TextInput
          style={styles.moneyInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholderTextColor={palette.purple3}
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
  return (
    <View style={emptyStyles.wrapper}>
      <View style={emptyStyles.iconCircle}>
        <Ionicons name="layers-outline" size={52} color={colors.primary} />
      </View>
      <Text style={emptyStyles.title}>{title}</Text>
      <Text style={emptyStyles.subtitle}>{subtitle}</Text>
      <TouchableOpacity
        style={emptyStyles.cta}
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

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const statusOptions = CAMPAIGN_STATUS;

  // Datos del Canal (entidad separada)
  const [channelName, setChannelName] = useState('');
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
            setDescription(camp.description || '');
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
          console.error("Error loading campaign:", err);
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

    const companyId = profile?.id_company;

    if (!companyId) {
      Alert.alert('Error', 'No se encontró la empresa asociada al usuario. Verifica que tu cuenta tenga una empresa asignada.');
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

      // 1. Payload de Campaña
      const campaignPayload = {
        id_company: Number(companyId),
        name: name.trim(),
        description: description.trim() || null,
        status: status,
        start_date: startDate,
        end_date: endDate,
        spent: spent ? Number(spent) : null,
      };
      console.log("CREATE CAMPAIGN PAYLOAD:", campaignPayload);

      // 2. Guardar Campaña
      let newCampaignId: number | null = null;
      if (campaignId) {
        // Actualización: el backend devuelve {ok: true}
        await campaignsApi.update(campaignId, campaignPayload);
      } else {
        // Creación: el backend ahora devuelve {ok: true, id_campaign: 123}
        const res: any = await campaignsApi.create(campaignPayload);
        if (res && res.id_campaign) {
          newCampaignId = res.id_campaign;
        } else {
          // Fallback por si acaso
          try {
            const allCampaigns: any = await campaignsApi.list();
            const justCreated = Array.isArray(allCampaigns)
              ? allCampaigns.find((c: any) => c.name === campaignPayload.name && c.id_company === campaignPayload.id_company)
              : null;
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
      style={[styles.container, { paddingTop: insets.top }]}
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
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={2}>
          {name.trim() ? name : `Nombre de la\ncampaña`}
        </Text>

        <TouchableOpacity
          style={styles.avatarBtn}
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
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Nombre */}
        <TextInput
          style={styles.input}
          placeholder="Nombre de la campaña"
          placeholderTextColor={palette.purple3}
          value={name}
          onChangeText={setName}
        />

        {/* Descripción */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripcion"
          placeholderTextColor={palette.purple3}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Estado */}
        <TouchableOpacity
          style={styles.selectorRow}
          activeOpacity={0.7}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={[styles.selectorText, !status && styles.placeholder]}>
            {status || 'Estado'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={palette.purple3} />
        </TouchableOpacity>

        {/* Modal selector de estado */}
        <Modal visible={showStatusModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowStatusModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona un Estado</Text>
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
                    status === opt && { color: colors.primary, fontWeight: typography.bold },
                  ]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Datos del Canal */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Datos del Canal (Opcional)</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nombre del Canal (ej. Instagram)"
          placeholderTextColor={palette.purple3}
          value={channelName}
          onChangeText={setChannelName}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción del Canal"
          placeholderTextColor={palette.purple3}
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
          <Text style={styles.fieldLabel}>Link Trackeable</Text>
          <View style={[styles.linkBox, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md }]}>
            {trackUrl ? (
              <>
                <Text style={{ flex: 1, color: colors.textPrimary, fontSize: typography.sizeMd }} numberOfLines={1}>
                  {trackUrl}
                </Text>
                <TouchableOpacity 
                  style={{ padding: spacing.sm, backgroundColor: '#EDE9FE', borderRadius: radii.md }}
                  onPress={async () => {
                    await Clipboard.setStringAsync(trackUrl);
                    Alert.alert('¡Copiado!', 'El link ha sido copiado al portapapeles.');
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={{ flex: 1, color: palette.purple3, fontSize: typography.sizeSm, fontStyle: 'italic' }}>
                {campaignId ? 'No se encontró link trackeable' : 'El link se generará automáticamente al crear la campaña.'}
              </Text>
            )}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.createButton, (loading || !profile || !profile.id_company) && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleCreate}
          disabled={loading || sessionLoading || !profile || !profile.id_company}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
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
