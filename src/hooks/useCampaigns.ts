import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { campaignsApi } from '../services/api/campaign';
import { Campaign } from '../services/api/types';
import { useProfile } from './useProfile';

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useProfile();

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // CORRECCIÓN 2: no pasar id_company — el backend filtra por usuario autenticado
            const response: any = await campaignsApi.getAll();
            const data = Array.isArray(response) ? response : response?.response || [];
            setCampaigns(data);
        } catch (err: any) {
            Alert.alert("Error", "No se pudieron cargar las campañas.");
            setError(err.message || 'Error al cargar campañas');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // CORRECCIÓN 2: cargar siempre que haya un perfil autenticado, con o sin empresa
        if (profile) {
            fetchAll();
        }
    }, [profile?.id_user, fetchAll]);

    return { campaigns, loading, error, reload: fetchAll };
}
