// src/services/api/__tests__/client.test.ts
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  getToken,
  saveToken,
  getUser,
  saveUser,
  removeToken,
  migrateFromAsyncStorage,
  _resetMemoryCache,
  USER_KEY,
  CURRENT_USER_KEY,
} from '../client';
import { TOKEN_KEY } from '../config';

// Mock React Native Platform & Alert
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Alert: { alert: jest.fn() },
}));

// Storage in-memory para mocks
const asyncStorageStore: Record<string, string> = {};
const secureStoreStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => asyncStorageStore[key] || null),
  setItem: jest.fn(async (key: string, value: string) => {
    asyncStorageStore[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete asyncStorageStore[key];
  }),
  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((k) => delete asyncStorageStore[k]);
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => secureStoreStore[key] || null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    secureStoreStore[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete secureStoreStore[key];
  }),
}));

describe('client.ts - JWT & Storage Security Unit Tests', () => {
  beforeEach(() => {
    _resetMemoryCache();
    Object.keys(asyncStorageStore).forEach((k) => delete asyncStorageStore[k]);
    Object.keys(secureStoreStore).forEach((k) => delete secureStoreStore[k]);
    jest.clearAllMocks();
  });

  test('1. Guardado exitoso: saveToken y saveUser persisten en SecureStore y RAM', async () => {
    const mockToken = 'jwt-secret-token-12345';
    const mockUser = { id_user: 1, email: 'test@analitika.com', name: 'Test User' };

    await saveToken(mockToken);
    await saveUser(mockUser);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, mockToken);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(USER_KEY, JSON.stringify(mockUser));

    const retrievedToken = await getToken();
    const retrievedUser = await getUser();

    expect(retrievedToken).toBe(mockToken);
    expect(retrievedUser).toEqual(mockUser);
  });

  test('2. Lectura tras reinicio simulado: lee desde SecureStore cuando RAM cache se reinicia', async () => {
    const mockToken = 'jwt-reboot-token-67890';
    secureStoreStore[TOKEN_KEY] = mockToken;

    _resetMemoryCache(); // Simular reinicio de la app (RAM vacía)

    const token = await getToken();
    expect(token).toBe(mockToken);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
  });

  test('3. Borrado selectivo: removeToken elimina token y usuario de SecureStore y AsyncStorage pero preserva analitika_app_theme', async () => {
    // Estado inicial
    secureStoreStore[TOKEN_KEY] = 'token-to-delete';
    secureStoreStore[USER_KEY] = JSON.stringify({ id_user: 1 });
    asyncStorageStore['analitika_app_theme'] = 'dark';

    await removeToken();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(USER_KEY);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(CURRENT_USER_KEY);

    // Verificar que analitika_app_theme permanece intacto en AsyncStorage
    expect(asyncStorageStore['analitika_app_theme']).toBe('dark');

    // RAM y SecureStore limpios
    _resetMemoryCache();
    const tokenAfter = await getToken();
    expect(tokenAfter).toBeNull();
  });

  test('4. Migración desde AsyncStorage: mueve token legacy a SecureStore y elimina copia antigua', async () => {
    const legacyToken = 'legacy-plain-jwt-token';
    const legacyUser = JSON.stringify({ id_user: 99, email: 'legacy@analitika.com' });

    // Simular estado previo a la actualización: token en AsyncStorage
    asyncStorageStore[TOKEN_KEY] = legacyToken;
    asyncStorageStore[USER_KEY] = legacyUser;

    await migrateFromAsyncStorage();

    // Debe haberse copiado a SecureStore
    expect(secureStoreStore[TOKEN_KEY]).toBe(legacyToken);
    expect(secureStoreStore[USER_KEY]).toBe(legacyUser);

    // Debe haberse eliminado de AsyncStorage
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
    expect(asyncStorageStore[TOKEN_KEY]).toBeUndefined();
    expect(asyncStorageStore[USER_KEY]).toBeUndefined();
  });
});
