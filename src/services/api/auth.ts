// src/services/api/auth.ts
import { removeToken, request, saveToken } from './client';
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from './types';

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<{ message: string; user?: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: async (payload: LoginPayload) => {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    await saveToken(data.token);
    return data;
  },

  me: () => request<AuthUser>('/auth/me', { method: 'GET' }),

  logout: async () => {
    try {
      await request<{ message: string }>('/auth/logout', { method: 'POST' });
    } finally {
      await removeToken();
    }
  },
};