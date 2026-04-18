// src/services/api/user.ts
import { request } from './client';

import type { AuthUser, UpdateProfilePayload } from './types';

export const usersApi = {
    getMe: () => request<AuthUser>('/users/me', { method: 'GET' }),

    updateMe: (payload: UpdateProfilePayload) =>
        request<AuthUser>('/users/me', {
            method: 'PUT',
            body: JSON.stringify(payload),
        }),
};