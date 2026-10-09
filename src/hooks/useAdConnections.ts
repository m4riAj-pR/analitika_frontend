// src/hooks/useAdConnections.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { adConnectionsApi } from '../services/api/adConnections';
import type { AdConnection } from '../services/api/types';
import { useProfile } from './useProfile';

// Completar la sesión de auth si se retorna en web
WebBrowser.maybeCompleteAuthSession();

export function useAdConnections() {
  const { profile } = useProfile();
  const [connections, setConnections] = useState<AdConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwnerOrAdmin = profile?.id_role === 1 || profile?.id_role === 2;
  const companyId = profile?.id_company;

  const fetchConnections = useCallback(async () => {
    if (!companyId || !isOwnerOrAdmin) {
      setConnections([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res: any = await adConnectionsApi.getCompanyConnections(companyId);
      const list = Array.isArray(res) ? res : res?.response || res?.data || [];
      setConnections(list);
    } catch (err: any) {
      console.log('Error fetching ad connections:', err);
      setError(err.message || 'Error al cargar conexiones');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, isOwnerOrAdmin]);

  useEffect(() => {
    if (companyId && isOwnerOrAdmin) {
      fetchConnections();
    }
  }, [companyId, isOwnerOrAdmin, fetchConnections]);

  const connectMeta = useCallback(async (): Promise<{ success: boolean; cancelled?: boolean }> => {
    if (!companyId) {
      Alert.alert('Error', 'No se encontró una empresa asociada a tu cuenta.');
      return { success: false };
    }
    if (!isOwnerOrAdmin) {
      Alert.alert('Acceso denegado', 'Solo el Owner o Administrador puede vincular cuentas publicitarias.');
      return { success: false };
    }

    try {
      setConnecting(true);
      // 1. Iniciar sesión OAuth en el backend
      const oauthRes = await adConnectionsApi.connectMeta(companyId);
      if (!oauthRes || !oauthRes.auth_url) {
        throw new Error('No se recibió la URL de autorización de Meta');
      }

      // 2. Definir redirect URI con el scheme configurado
      const redirectUrl = Linking.createURL('ad-connections/callback');

      // 3. Abrir in-app browser seguro
      const result = await WebBrowser.openAuthSessionAsync(oauthRes.auth_url, redirectUrl);

      // 4. Evaluar resultado
      if (result.type === 'cancel' || result.type === 'dismiss') {
        // El usuario canceló o cerró la ventana: volver sin error
        console.log('OAuth flow cancelled by user');
        return { success: false, cancelled: true };
      }

      if (result.type === 'success') {
        const returnUrl = result.url;
        if (returnUrl && returnUrl.includes('error=')) {
          Alert.alert('Error de autorización', 'No fue posible completar la autorización con Meta Ads.');
          return { success: false };
        }

        // Recargar lista tras autorización exitosa
        await fetchConnections();
        Alert.alert('¡Cuenta Conectada!', 'Tu cuenta publicitaria de Meta Ads ha sido vinculada correctamente.');
        return { success: true };
      }

      // Fallback
      await fetchConnections();
      return { success: true };
    } catch (err: any) {
      console.error('Error connecting Meta Ads:', err);
      Alert.alert('Error de conexión', err.message || 'Hubo un problema al iniciar la conexión con Meta.');
      return { success: false };
    } finally {
      setConnecting(false);
    }
  }, [companyId, isOwnerOrAdmin, fetchConnections]);

  const disconnectConnection = useCallback(async (id_connection: number): Promise<boolean> => {
    if (!companyId) return false;
    try {
      setLoading(true);
      await adConnectionsApi.disconnect(companyId, id_connection);
      await fetchConnections();
      Alert.alert('Cuenta desconectada', 'La cuenta publicitaria ha sido desvinculada exitosamente.');
      return true;
    } catch (err: any) {
      console.error('Error disconnecting ad account:', err);
      Alert.alert('Error', err.message || 'No se pudo desconectar la cuenta publicitaria.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [companyId, fetchConnections]);

  const triggerSync = useCallback(async (id_connection: number): Promise<boolean> => {
    if (!companyId) return false;
    try {
      setSyncingId(id_connection);
      await adConnectionsApi.sync(companyId, id_connection);
      // Breve espera para que el background task del backend empiece
      setTimeout(() => {
        fetchConnections();
      }, 1500);
      Alert.alert('Sincronización iniciada', 'La sincronización de métricas se está ejecutando en segundo plano.');
      return true;
    } catch (err: any) {
      console.error('Error syncing ad connection:', err);
      Alert.alert('Error al sincronizar', err.message || 'No se pudo iniciar la sincronización.');
      return false;
    } finally {
      setSyncingId(null);
    }
  }, [companyId, fetchConnections]);

  return {
    connections,
    loading,
    connecting,
    syncingId,
    error,
    reload: fetchConnections,
    connectMeta,
    disconnectConnection,
    triggerSync,
    hasActiveConnection: connections.some(c => c.status === 'active'),
  };
}
