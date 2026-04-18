import { useCallback, useEffect, useState } from 'react';
import { campaignsApi } from '../services/api/campaign';
import type { Campaign } from '../services/api/types';

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await campaignsApi.list();
            setCampaigns(response);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudieron cargar las campañas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    return { campaigns, loading, error, reload: fetchCampaigns };
}
