import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCampaignPrediction, simulateScenario } from '../services/api/predictions';
import {
  SCENARIO_CHANNELS,
  type CampaignPrediction,
  type ScenarioChannel,
  type ScenarioPrediction,
  type StrategicRecommendation,
} from '../services/api/types';
import { radii, shadows } from '../theme/colors';
import { useTheme } from '../ThemeContext';
import { formatMoney, formatPct } from '../utils/format';

/** Métricas acumuladas de la campaña (respuesta de /stats) con las que se precarga el simulador. */
type CampaignStats = {
  clics?: number;
  conversiones?: number;
  ingresos?: number;
  spent?: number;
  roi?: number;
};

type Props = {
  idCampaign: number;
  stats: CampaignStats | null;
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const RECOMMENDATION: Record<StrategicRecommendation, { icon: IconName; tone: 'success' | 'warning' | 'error'; text: string }> = {
  'Escalar presupuesto': {
    icon: 'trending-up',
    tone: 'success',
    text: 'El retorno proyectado supera el 30 %. Considera aumentar el presupuesto de forma gradual.',
  },
  'Mantener y monitorear': {
    icon: 'pulse',
    tone: 'warning',
    text: 'El retorno proyectado está entre 0 % y 30 %. Mantén la inversión y vuelve a evaluar en 48 horas.',
  },
  'Optimizar o pausar': {
    icon: 'alert-circle',
    tone: 'error',
    text: 'Se proyecta una pérdida. Revisa el mensaje, el público y el canal, o pausa la campaña.',
  },
};

/** El modelo devuelve el ROI como razón (0,35 = 35 %); los KPI de /stats ya vienen en porcentaje. */
const ratioToPct = (r: number | null | undefined) => (r == null ? null : Number(r) * 100);

/** Acepta "1.250,5" o "1250.5" y devuelve un número no negativo, o null si no es válido. */
const parseAmount = (v: string, integer = false): number | null => {
  const clean = v.trim().replace(/\s/g, '');
  if (!clean) return null;
  const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  if (integer && !Number.isInteger(n)) return null;
  return n;
};

const asInput = (v: unknown) => (v == null || !Number.isFinite(Number(v)) ? '0' : String(Math.round(Number(v))));

/**
 * Dashboard predictivo: proyección del ROI a 7 días con datos reales, simulador de escenarios
 * y recomendación estratégica. Se renderiza solo para Owner y Super Admin; el padre lo monta con
 * `key={idCampaign}` para reiniciar el estado al cambiar de campaña.
 */
export default function RoiPredictor({ idCampaign, stats }: Props) {
  const { colors: c, isDark } = useTheme();

  const [prediction, setPrediction] = useState<CampaignPrediction | null>(null);
  const [predError, setPredError] = useState<string | null>(null);
  const [predLoading, setPredLoading] = useState(true);

  const [channel, setChannel] = useState<ScenarioChannel>('Google');
  const [form, setForm] = useState(() => ({
    spend: asInput(stats?.spent),
    clicks: asInput(stats?.clics),
    conversions: asInput(stats?.conversiones),
    revenue: asInput(stats?.ingresos),
  }));
  const [scenario, setScenario] = useState<ScenarioPrediction | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const loadPrediction = useCallback(() => {
    return getCampaignPrediction(idCampaign)
      .then((data) => {
        setPrediction(data);
        setPredError(null);
      })
      .catch((err: any) => {
        setPrediction(null);
        setPredError(err?.message || 'No fue posible obtener la proyección.');
      })
      .finally(() => setPredLoading(false));
  }, [idCampaign]);

  // Carga inicial: los setState ocurren al resolver la promesa, no de forma síncrona en el efecto
  useEffect(() => {
    loadPrediction();
  }, [loadPrediction]);

  const retry = () => {
    setPredLoading(true);
    loadPrediction();
  };

  const simulate = async () => {
    const spend = parseAmount(form.spend);
    const clicks = parseAmount(form.clicks, true);
    const conversions = parseAmount(form.conversions, true);
    const revenue = parseAmount(form.revenue);
    if (spend == null || clicks == null || conversions == null || revenue == null) {
      setSimError('Revisa los valores: deben ser números mayores o iguales a cero, y clics y conversiones, enteros.');
      setScenario(null);
      return;
    }
    if (conversions > clicks) {
      setSimError('Las conversiones no pueden superar a los clics.');
      setScenario(null);
      return;
    }
    setSimLoading(true);
    setSimError(null);
    try {
      setScenario(await simulateScenario({
        channel, spend_48h: spend, clicks_48h: clicks, conversions_48h: conversions, revenue_48h: revenue,
      }));
    } catch (err: any) {
      setScenario(null);
      setSimError(err?.message || 'No fue posible calcular el escenario.');
    } finally {
      setSimLoading(false);
    }
  };

  const toneColor = (tone: 'success' | 'warning' | 'error') =>
    tone === 'success' ? c.success : tone === 'warning' ? c.warning : c.error;
  const softBg = isDark ? 'rgba(255,255,255,0.05)' : '#F6F3FF';
  const projectedPct = ratioToPct(prediction?.predicted_roi_7d);
  const hours = prediction ? Math.min(prediction.hours_of_data_available, prediction.observation_window_hours) : 0;
  const windowPct = prediction ? Math.round((hours / prediction.observation_window_hours) * 100) : 0;
  const rec = scenario ? RECOMMENDATION[scenario.strategic_recommendation] : null;

  const fields: { key: keyof typeof form; label: string; integer?: boolean }[] = [
    { key: 'spend', label: 'Inversión ($)' },
    { key: 'clicks', label: 'Clics', integer: true },
    { key: 'conversions', label: 'Conversiones', integer: true },
    { key: 'revenue', label: 'Ingresos ($)' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: c.bgCard }]} accessibilityLabel="Dashboard predictivo de ROI">
      <View style={styles.titleRow}>
        <Ionicons name="analytics" size={20} color={c.primary} />
        <Text style={[styles.title, { color: c.textPrimary }]}>Proyección de ROI a 7 días</Text>
      </View>
      <Text style={[styles.subtitle, { color: c.textBody }]}>
        Modelo Gradient Boosting que estima el retorno a partir de las primeras 48 horas de la campaña.
      </Text>

      {/* ── Predicción con datos reales ── */}
      <Text style={[styles.blockTitle, { color: c.textPrimary }]}>Con los datos reales de la campaña</Text>
      {predLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={c.primary} />
          <Text style={[styles.muted, { color: c.textMuted }]}>Calculando proyección…</Text>
        </View>
      ) : predError ? (
        <View style={[styles.notice, { borderColor: c.error, backgroundColor: softBg }]}>
          <Ionicons name="cloud-offline-outline" size={18} color={c.error} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.noticeText, { color: c.textBody }]}>No fue posible obtener la proyección: {predError}</Text>
            <TouchableOpacity onPress={retry} accessibilityRole="button" style={{ marginTop: 6 }}>
              <Text style={{ color: c.primary, fontWeight: '700' }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : prediction ? (
        <>
          <View style={styles.pair}>
            <View style={[styles.stat, { backgroundColor: softBg }]}>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>ROI actual</Text>
              <Text style={[styles.statValue, { color: (stats?.roi ?? 0) < 0 ? c.error : c.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatPct(stats?.roi ?? 0)}
              </Text>
            </View>
            <View style={[styles.stat, { backgroundColor: softBg }]}>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>ROI proyectado</Text>
              <Text style={[styles.statValue, { color: (projectedPct ?? 0) < 0 ? c.error : c.primary }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatPct(projectedPct)}
              </Text>
            </View>
          </View>

          <Text style={[styles.muted, { color: c.textBody, marginTop: 12 }]}>
            Ventana de observación: {hours.toFixed(1).replace('.', ',')} h de {prediction.observation_window_hours} h
          </Text>
          <View style={[styles.track, { backgroundColor: isDark ? '#334155' : '#E9E3FD' }]} accessibilityLabel={`${windowPct} % de la ventana de 48 horas completada`}>
            <View style={[styles.fill, { width: `${windowPct}%`, backgroundColor: c.primary }]} />
          </View>
          <Text style={[styles.tiny, { color: c.textMuted }]}>
            Modelo {prediction.model_artifact}{prediction.model_version ? ` · versión ${prediction.model_version}` : ''}
          </Text>

          {prediction.low_confidence_warning && (
            <View style={[styles.notice, { borderColor: c.warning, backgroundColor: softBg }]}>
              <Ionicons name="time-outline" size={18} color={c.warning} />
              <Text style={[styles.noticeText, { color: c.textBody }]}>{prediction.low_confidence_warning}</Text>
            </View>
          )}
          {prediction.dataset_warning && (
            <View style={[styles.notice, { borderColor: c.info, backgroundColor: softBg }]}>
              <Ionicons name="information-circle-outline" size={18} color={c.info} />
              <Text style={[styles.noticeText, { color: c.textBody }]}>{prediction.dataset_warning}</Text>
            </View>
          )}
        </>
      ) : null}

      {/* ── Simulador de escenarios ── */}
      <View style={[styles.divider, { backgroundColor: c.borderDivider }]} />
      <Text style={[styles.blockTitle, { color: c.textPrimary }]}>Simulador de escenarios</Text>
      <Text style={[styles.muted, { color: c.textBody }]}>
        Ajusta las métricas de las primeras 48 horas para evaluar un escenario alternativo.
      </Text>

      <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Canal</Text>
      <View style={styles.chips}>
        {SCENARIO_CHANNELS.map((ch) => {
          const active = ch === channel;
          return (
            <TouchableOpacity
              key={ch}
              onPress={() => setChannel(ch)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, { borderColor: c.primary, backgroundColor: active ? c.primary : 'transparent' }]}
            >
              <Text style={{ color: active ? c.textOnPrimary : c.primary, fontWeight: '600', fontSize: 13 }}>{ch}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.grid}>
        {fields.map((f) => (
          <View key={f.key} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{f.label}</Text>
            <TextInput
              value={form[f.key]}
              onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
              keyboardType={f.integer ? 'number-pad' : 'decimal-pad'}
              accessibilityLabel={f.label}
              style={[styles.input, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.borderInput }]}
              placeholderTextColor={c.textMuted}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={simulate}
        disabled={simLoading}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: c.primary, opacity: simLoading ? 0.7 : 1 }]}
      >
        {simLoading
          ? <ActivityIndicator color={c.textOnPrimary} />
          : <Text style={[styles.buttonText, { color: c.textOnPrimary }]}>Calcular escenario</Text>}
      </TouchableOpacity>

      {simError && (
        <View style={[styles.notice, { borderColor: c.error, backgroundColor: softBg }]}>
          <Ionicons name="alert-circle-outline" size={18} color={c.error} />
          <Text style={[styles.noticeText, { color: c.textBody }]}>{simError}</Text>
        </View>
      )}

      {scenario && rec && (
        <>
          <View style={[styles.pair, { marginTop: 14 }]}>
            <View style={[styles.stat, { backgroundColor: softBg }]}>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>ROI proyectado</Text>
              <Text style={[styles.statValue, { color: scenario.predicted_roi_7d < 0 ? c.error : c.primary }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatPct(ratioToPct(scenario.predicted_roi_7d))}
              </Text>
            </View>
            <View style={[styles.stat, { backgroundColor: softBg }]}>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>Ingreso a 7 días</Text>
              <Text style={[styles.statMoney, { color: c.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatMoney(scenario.estimated_revenue_7d)}
              </Text>
            </View>
          </View>
          <View
            style={[styles.recommendation, { borderLeftColor: toneColor(rec.tone), backgroundColor: softBg }]}
            accessibilityLabel={`Recomendación: ${scenario.strategic_recommendation}. ${rec.text}`}
          >
            <Ionicons name={rec.icon} size={22} color={toneColor(rec.tone)} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.recTitle, { color: c.textPrimary }]}>{scenario.strategic_recommendation}</Text>
              <Text style={[styles.noticeText, { color: c.textBody }]}>{rec.text}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, marginBottom: 20, ...shadows.card },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 4, marginBottom: 14, lineHeight: 17 },
  blockTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  centerBox: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  pair: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, borderRadius: radii.md, padding: 12 },
  statLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  // Los montos en pesos son más largos: tamaño menor para que quepan sin cortarse
  statMoney: { fontSize: 17, fontWeight: '800' },
  muted: { fontSize: 12, lineHeight: 17 },
  tiny: { fontSize: 11, marginTop: 6 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  fill: { height: 8, borderRadius: 4 },
  notice: { flexDirection: 'row', gap: 8, borderLeftWidth: 3, borderRadius: radii.sm, padding: 10, marginTop: 10, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17 },
  divider: { height: 1, marginVertical: 18 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  field: { width: '48%' },
  input: { borderWidth: 1, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  button: { marginTop: 16, borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700' },
  recommendation: { flexDirection: 'row', gap: 10, borderLeftWidth: 4, borderRadius: radii.md, padding: 12, marginTop: 12, alignItems: 'flex-start' },
  recTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
});
