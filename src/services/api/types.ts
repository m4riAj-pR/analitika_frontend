// src/services/api/types.ts

export type ApiError = {
  message: string;
  status?: number;
  details?: any;
};

// Puedes agregar aquí las interfaces para tus recursos si las conoces
export interface Campaign {
  id: number;
  name: string;
  // ... otros campos
}
