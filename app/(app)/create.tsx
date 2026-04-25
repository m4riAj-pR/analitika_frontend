import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { campaignsApi, trackingLinksApi } from '../../src/services/api';
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

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function CreateCampaignScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const campaignId = params.id ? Number(params.id) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [canal, setCanal] = useState('');
  const [showCanalModal, setShowCanalModal] = useState(false);
  const canales = ['Instagram', 'Facebook', 'WhatsApp', 'TikTok', 'Email', 'Otro'];

  const [startDd, setStartDd] = useState('');
  const [startMm, setStartMm] = useState('');
  const [startYyyy, setStartYyyy] = useState('');

  const [endDd, setEndDd] = useState('');
  const [endMm, setEndMm] = useState('');
  const [endYyyy, setEndYyyy] = useState('');

  const [budget, setBudget] = useState('');
  const [returnExpected, setReturnExpected] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre de la campaña.');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        canal: canal || undefined,
        start_date: `${startYyyy || '2026'}-${(startMm || '01').padStart(2, '0')}-${(startDd || '01').padStart(2, '0')}`,
        end_date: `${endYyyy || '2026'}-${(endMm || '01').padStart(2, '0')}-${(endDd || '01').padStart(2, '0')}`,
        status: 'active' as const,
        spent: Number(budget) || 0,
        budget: Number(budget) || 0,
        return_expected: Number(returnExpected) || 0,
      };

      if (campaignId) {
        await campaignsApi.update(campaignId, payload);
      } else {
        const created = await campaignsApi.create(payload);
        if (created.id_campaign) {
          try {
            await trackingLinksApi.create({
              id_campaign: created.id_campaign,
              destination_url: 'https://ejemplo.com',
            });
          } catch {
            // silencioso
          }
        }
      }

      Alert.alert('¡Listo!', `Campaña ${campaignId ? 'actualizada' : 'creada'} exitosamente.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la campaña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.75}>
          <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
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

        {/* Canal */}
        <TouchableOpacity
          style={styles.selectorRow}
          activeOpacity={0.7}
          onPress={() => setShowCanalModal(true)}
        >
          <Text style={[styles.selectorText, !canal && styles.placeholder]}>
            {canal || 'Canal'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={palette.purple3} />
        </TouchableOpacity>

        {/* Modal selector de canal */}
        <Modal visible={showCanalModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCanalModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona un Canal</Text>
              {canales.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.modalOption}
                  onPress={() => {
                    setCanal(c);
                    setShowCanalModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    canal === c && { color: colors.primary, fontWeight: typography.bold },
                  ]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

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

        {/* Presupuesto */}
        <MoneyInput label="Presupuesto" value={budget} onChange={setBudget} />

        {/* Retorno Esperado */}
        <MoneyInput label="Retorno Esperado" value={returnExpected} onChange={setReturnExpected} />

        {/* Generar Link Trackeable */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Generar Link Trackeable</Text>
          <View style={styles.linkBox} />
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.createButton, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleCreate}
          disabled={loading}
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
