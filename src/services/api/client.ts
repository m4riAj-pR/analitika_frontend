// src/services/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, TOKEN_KEY } from './config';
import type { ApiError } from './types';


let memoryToken: string | null = null;

async function getToken() {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return storedToken || memoryToken;
  } catch {
    return memoryToken;
  }
}

export async function saveToken(token: string) {
  memoryToken = token;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch { }
}

export async function removeToken() {
  memoryToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch { }
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

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const text = await response.text();

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
        await removeToken();
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
