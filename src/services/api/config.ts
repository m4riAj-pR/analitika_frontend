import Constants from 'expo-constants';

const DEFAULT_API_URL = 'https://analitika-production.up.railway.app';

/** URL de la API: `expo.extra.apiUrl` en app.json, con la de producción como respaldo. */
const getBaseUrl = (): string => {
  const fromConfig = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  return (fromConfig || DEFAULT_API_URL).replace(/\/+$/, '');
};

export const API_BASE_URL = getBaseUrl();
export const API_TIMEOUT = 10000;
export const TOKEN_KEY = 'analitika_token';
