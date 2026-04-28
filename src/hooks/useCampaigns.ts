import { useCallback, useEffect, useState } from 'react';
import { campaignsApi } from '../services/api/campaign';
import { Campaign } from '../services/api/types';

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("LOADING CAMPAIGNS");
            const response: any = await campaignsApi.getAll();
            console.log("CAMPAIGNS RESPONSE:", response);
            setCampaigns(response || []);
        } catch (err: any) {
            console.error('Error fetching campaigns:', err);
            setError(err.message || 'Error al cargar campañas');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { campaigns, loading, error, reload: fetchAll };
}
