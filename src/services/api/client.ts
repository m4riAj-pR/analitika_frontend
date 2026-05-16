// src/services/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL, API_TIMEOUT, TOKEN_KEY } from './config';
import type { ApiError } from './types';


let memoryToken: string | null = null;
let memoryUser: any = null;

export async function getToken() {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return storedToken || memoryToken;
  } catch {
    return memoryToken;
  }
}

export const USER_KEY = 'analitika_user';
export const CURRENT_USER_KEY = 'current_user';

export async function saveToken(token: string) {
  memoryToken = token;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch { }
}

export async function saveUser(user: any) {
  memoryUser = user;
  try {
    console.log("GUARDANDO USUARIO EN CACHE:", user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (err: any) {
    // Si el módulo nativo no está (común en algunos entornos de Expo), usamos solo RAM silenciosamente
    if (err?.message?.includes('Native module is null')) {
      console.log("AsyncStorage no disponible, usando memoria RAM temporal.");
    } else {
      Alert.alert("Error", "Error al guardar la información del usuario localmente.");
    }
  }
}

export async function getUser() {
  try {
    const currentUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
      return JSON.parse(currentUser);
    }

    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : memoryUser;
  } catch {
    return memoryUser;
  }
}

export async function removeToken() {
  memoryToken = null;
  memoryUser = null;
  try {
    // Solo eliminamos las llaves de autenticación, preservando otras configuraciones (como el tema)
    const keys = [TOKEN_KEY, USER_KEY, CURRENT_USER_KEY];
    await AsyncStorage.multiRemove(keys);
  } catch (err: any) {
    if (!err?.message?.includes('Native module is null')) {
      Alert.alert("Error", "Ocurrió un problema al cerrar la sesión.");
    }
  }
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
