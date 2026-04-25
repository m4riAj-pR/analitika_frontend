// src/services/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TOKEN_KEY } from './config';
import type { ApiError } from './types';

let memoryToken: string | null = null;

async function getToken() {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return t || memoryToken;
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
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message || 'Ocurrió un error en la petición',
      status: response.status,
      details: data,
    };

    if (response.status === 401) {
      await removeToken();
    }

    throw error;
  }

  return data as T;
}