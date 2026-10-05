// src/services/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import { API_BASE_URL, API_TIMEOUT, TOKEN_KEY } from './config';
import type { ApiError } from './types';

let memoryToken: string | null = null;
let memoryUser: any = null;
let migrationCompleted = false;

export const USER_KEY = 'analitika_user';
export const CURRENT_USER_KEY = 'current_user';

const isWeb = Platform.OS === 'web';

/**
 * Función de migración: detecta un token o datos de usuario existentes en AsyncStorage (legacy),
 * los traslada a SecureStore y elimina las copias antiguas en AsyncStorage.
 */
export async function migrateFromAsyncStorage(): Promise<void> {
  if (migrationCompleted || isWeb) {
    return;
  }
  try {
    const legacyToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (legacyToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, legacyToken);
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('[Migration] Token JWT migrado exitosamente de AsyncStorage a SecureStore.');
    }

    const legacyUser = await AsyncStorage.getItem(USER_KEY);
    if (legacyUser) {
      await SecureStore.setItemAsync(USER_KEY, legacyUser);
      await AsyncStorage.removeItem(USER_KEY);
    }

    const legacyCurrentUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (legacyCurrentUser) {
      await SecureStore.setItemAsync(CURRENT_USER_KEY, legacyCurrentUser);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }

    migrationCompleted = true;
  } catch (err: any) {
    console.warn('[SecureStore Migration Warning] Error durante la migración desde AsyncStorage:', err?.message || err);
  }
}

/** Helper para escribir de forma segura en SecureStore (o AsyncStorage en web) */
async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err: any) {
    console.warn(`[SecureStore Warning] No se pudo guardar la clave '${key}' en SecureStore. Se utilizará degradación:`, err?.message || err);
    try {
      await AsyncStorage.setItem(key, value);
    } catch (fallbackErr) {
      console.error(`[Storage Error] Fallback de almacenamiento falló para '${key}':`, fallbackErr);
    }
  }
}

/** Helper para leer de forma segura desde SecureStore (o AsyncStorage en web) */
async function getSecureItem(key: string): Promise<string | null> {
  if (isWeb) {
    return await AsyncStorage.getItem(key);
  }
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) {
      return value;
    }
    // Si no está en SecureStore, verificar si queda un residual en AsyncStorage
    return await AsyncStorage.getItem(key);
  } catch (err: any) {
    console.warn(`[SecureStore Warning] No se pudo leer la clave '${key}' de SecureStore:`, err?.message || err);
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

/** Helper para eliminar claves de SecureStore y AsyncStorage */
async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err: any) {
    console.warn(`[SecureStore Warning] Error borrando '${key}' en SecureStore:`, err?.message || err);
  }
  // Asegurar borrado en AsyncStorage también
  try {
    await AsyncStorage.removeItem(key);
  } catch { }
}

export async function getToken(): Promise<string | null> {
  if (memoryToken) {
    return memoryToken;
  }
  await migrateFromAsyncStorage();
  try {
    const storedToken = await getSecureItem(TOKEN_KEY);
    if (storedToken) {
      memoryToken = storedToken;
    }
    return storedToken || memoryToken;
  } catch {
    return memoryToken;
  }
}

export async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  try {
    await setSecureItem(TOKEN_KEY, token);
  } catch (err: any) {
    console.warn('[saveToken Warning] Error al guardar el token:', err?.message || err);
  }
}

export async function saveUser(user: any): Promise<void> {
  memoryUser = user;
  try {
    console.log("GUARDANDO USUARIO EN CACHE SEGURO:", user);
    const userStr = JSON.stringify(user);
    await setSecureItem(USER_KEY, userStr);
    await setSecureItem(CURRENT_USER_KEY, userStr);
      } catch (err: any) {
    if (err?.message?.includes('Native module is null')) {
      console.log("Módulo nativo no disponible, usando memoria RAM temporal.");
    } else {
      console.warn("[saveUser Warning] Error al guardar usuario en almacenamiento seguro:", err?.message || err);
    }
  }
}

export async function getUser(): Promise<any> {
  if (memoryUser) {
    return memoryUser;
  }
  await migrateFromAsyncStorage();
  try {
    const currentUser = await getSecureItem(CURRENT_USER_KEY);
    if (currentUser) {
      const parsed = JSON.parse(currentUser);
      memoryUser = parsed;
      return parsed;
    }

    const user = await getSecureItem(USER_KEY);
    if (user) {
      const parsed = JSON.parse(user);
      memoryUser = parsed;
      return parsed;
    }

    return memoryUser;
  } catch {
    return memoryUser;
  }
}

export async function removeToken(): Promise<void> {
  memoryToken = null;
  memoryUser = null;
  migrationCompleted = false;
  try {
    // Solo eliminamos las llaves de autenticación de SecureStore (y AsyncStorage legacy),
    // preservando otras configuraciones como el tema (analitika_app_theme) que permanece en AsyncStorage.
    await deleteSecureItem(TOKEN_KEY);
    await deleteSecureItem(USER_KEY);
    await deleteSecureItem(CURRENT_USER_KEY);
  } catch (err: any) {
    if (!err?.message?.includes('Native module is null')) {
      console.warn('[removeToken Warning] Problema al limpiar storage:', err?.message || err);
    }
  }
}

/** Reset helper para pruebas unitarias */
export function _resetMemoryCache(): void {
  memoryToken = null;
  memoryUser = null;
  migrationCompleted = false;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    console.log("REQUEST URL", url);
    console.log("REQUEST OPTIONS", options);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    console.log("RESPONSE STATUS", response.status);
    console.log("RESPONSE TEXT", text);

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const error: ApiError = {
        message:
          data?.detail ||
          data?.message ||
          data?.error ||
          'Ocurrió un error en la petición',
        status: response.status,
        details: data,
      };

      if (response.status === 401) {
        // Solo borrar token si realmente se envió uno y la petición no es a user-company
        if (token && !url.includes('/user-company')) {
          console.warn("Sesión expirada detectada (401). Limpiando storage...");
          await removeToken();
        }
      }

      throw error;
    }

    return data as T;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw {
        message: 'La petición tardó demasiado tiempo',
        status: 408,
        details: error,
      } as ApiError;
    }

    if (error?.status) {
      throw error;
    }

    throw {
      message: 'No se pudo conectar con el servidor',
      status: 0,
      details: error,
    } as ApiError;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default {
  get: <T>(url: string, options?: any) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data?: any, options?: any) => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data?: any, options?: any) => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string, options?: any) => request<T>(url, { ...options, method: 'DELETE' }),
};
