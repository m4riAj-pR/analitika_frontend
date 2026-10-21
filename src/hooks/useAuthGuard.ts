// src/hooks/useAuthGuard.ts
// Guard de autenticación con validación de token contra el servidor.
// - Llama a /me al montar para verificar que el JWT sigue siendo válido.
// - Grace period de 5 minutos para evitar revalidaciones innecesarias.
// - Distingue errores de red (no cierra sesión) de 401 (sí cierra sesión).

import { useCallback, useEffect, useState } from 'react';
import { getToken, getUser, request } from '../services/api/client';
import type { ApiError, User } from '../services/api/types';
import { normalizeUser } from '../services/api/auth';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Perfil autenticado (respuesta de /me normalizada con la empresa principal). */
export type AuthProfile = User;

export interface UseAuthGuardResult {
  /** True mientras se valida el token contra el servidor. */
  isValidating: boolean;
  /** True si la sesión fue verificada como válida. */
  isAuthorized: boolean;
  /** Perfil del usuario validado, o null si no autorizado. */
  profile: AuthProfile | null;
}

// ─── Grace period (estado a nivel de módulo) ──────────────────────────────────

const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutos

let lastValidationTs = 0;
let validatedProfile: AuthProfile | null = null;
// Token con el que se validó la caché: si cambia (logout + login de otro usuario)
// la caché se descarta, evitando enrutar con el rol del usuario anterior.
let validatedToken: string | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Type guard: verifica si el error lanzado tiene forma de ApiError. */
function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as Record<string, unknown>).message === 'string'
  );
}

/**
 * Extrae un AuthProfile de la respuesta cruda de /me,
 * que puede venir como `User` directo o envuelto en `{ response: User }`.
 */
function extractProfile(data: unknown): AuthProfile | null {
  if (data === null || data === undefined || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;

  // Forma envuelta: { response: { id_user, id_role, ... } }
  if (
    'response' in record &&
    typeof record.response === 'object' &&
    record.response !== null
  ) {
    const inner = record.response as Record<string, unknown>;
    if (typeof inner.id_user === 'number' && typeof inner.id_role === 'number') {
      return record.response as AuthProfile;
    }
  }

  // Forma directa: { id_user, id_role, ... }
  if (typeof record.id_user === 'number' && typeof record.id_role === 'number') {
    return data as AuthProfile;
  }

  return null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthGuard(): UseAuthGuardResult {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  const validate = useCallback(async () => {
    const token = await getToken();

    // 1. Grace period: si ya validamos recientemente con este mismo token, usar caché
    const now = Date.now();
    if (token && token === validatedToken && validatedProfile !== null && now - lastValidationTs < GRACE_PERIOD_MS) {
      setProfile(validatedProfile);
      setIsAuthorized(true);
      setIsValidating(false);
      return;
    }

    // 2. Sin token → no autenticado
    if (!token) {
      validatedProfile = null;
      lastValidationTs = 0;
      setIsAuthorized(false);
      setProfile(null);
      setIsValidating(false);
      return;
    }

    // 3. Validar token contra el servidor
    try {
      const raw = await request<unknown>('/me');
      const user = extractProfile(normalizeUser(raw));

      if (user) {
        lastValidationTs = Date.now();
        validatedProfile = user;
        validatedToken = token;
        setProfile(user);
        setIsAuthorized(true);
      } else {
        // El servidor respondió OK pero sin datos de usuario válidos
        validatedProfile = null;
        lastValidationTs = 0;
        setIsAuthorized(false);
        setProfile(null);
      }
    } catch (err: unknown) {
      if (isApiError(err) && err.status === 401) {
        // Token expirado o revocado — client.ts ya limpió el storage
        validatedProfile = null;
        lastValidationTs = 0;
        setIsAuthorized(false);
        setProfile(null);
      } else {
        // Error de red o timeout — NO cerrar sesión, usar caché local
        const cachedData: unknown = normalizeUser(await getUser());
        const cached = extractProfile(cachedData);

        if (cached) {
          setProfile(cached);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          setProfile(null);
        }
      }
    } finally {
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    validate();
  }, [validate]);

  return { isValidating, isAuthorized, profile };
}
