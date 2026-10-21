/** Formateadores compartidos para que cifras, fechas, estados y roles se lean igual en toda la app. */

const isNum = (v: unknown): v is number | string =>
  v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

/** Montos grandes sin decimales; montos pequeños (CPC, CPA) con 2 para no redondear 0,65 a 1. */
export const formatMoney = (v: unknown): string => {
  if (!isNum(v)) return '—';
  const n = Number(v);
  const digits = Math.abs(n) < 100 && !Number.isInteger(n) ? 2 : 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(n);
};

export const formatInt = (v: unknown): string =>
  isNum(v) ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(v)) : '—';

/** Porcentaje que ya viene en escala 0–100 (ROI, tasa de conversión del backend). */
export const formatPct = (v: unknown, digits = 1): string =>
  isNum(v) ? `${Number(v).toFixed(digits).replace('.', ',')} %` : '—';

export const formatRatio = (v: unknown): string =>
  isNum(v) ? `${Number(v).toFixed(2).replace('.', ',')}x` : '—';

export const formatCompact = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')} k` : String(n);

/** "2026-10-08" → "08/10" sin desfase de zona horaria. */
export const formatDayShort = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}` : String(iso);
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  draft: 'Borrador',
  paused: 'Pausada',
  finished: 'Finalizada',
};
export const statusLabel = (s?: string | null): string =>
  STATUS_LABEL[String(s ?? '').toLowerCase()] ?? (s ? String(s) : '—');

const ROLE_LABEL: Record<number, string> = { 1: 'Super Admin', 2: 'Owner', 3: 'Manager' };
export const roleLabel = (idRole?: number | null): string => ROLE_LABEL[Number(idRole)] ?? 'Usuario';

export const deviceFromUA = (ua?: string | null): 'Móvil' | 'Tablet' | 'Escritorio' | 'Desconocido' => {
  const s = String(ua ?? '').toLowerCase();
  if (!s || s === 'n/a') return 'Desconocido';
  if (/ipad|tablet/.test(s)) return 'Tablet';
  if (/mobi|iphone|android/.test(s)) return 'Móvil';
  return 'Escritorio';
};
