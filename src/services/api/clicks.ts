import { request } from './client';
import type { ClickItem } from './types';

export const clicksApi = {
  listByLink: (id_link: number) => request<ClickItem[]>(`/clicks/${id_link}`, { method: 'GET' }),
};