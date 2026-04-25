import { useCallback, useEffect, useState } from 'react';
import { campaignsApi } from '../services/api/campaign';
import type { Campaign } from '../services/api/types';
import { DEMO_CAMPAIGNS } from '../data/demoCampaigns';

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await campaignsApi.list();
            // Si el backend no retorna campañas, usar las de demo
            setCampaigns(response.length > 0 ? response : DEMO_CAMPAIGNS);
        } catch {
            // Backend no disponible → datos de demo para el usuario de prueba
            setCampaigns(DEMO_CAMPAIGNS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    return { campaigns, loading, error, reload: fetchCampaigns };
}
