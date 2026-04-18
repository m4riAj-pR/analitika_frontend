import { useCallback, useEffect, useState } from 'react';
import { campaignsApi, TopCampaign } from '../services/api';

export function useCampaignsTop(start_date: string, end_date: string) {
    const [campaigns, setCampaigns] = useState<TopCampaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTopCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await campaignsApi.top(start_date, end_date);
            setCampaigns(response);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo cargar el ranking');
        } finally {
            setLoading(false);
        }
    }, [start_date, end_date]);

    useEffect(() => {
        fetchTopCampaigns();
    }, [fetchTopCampaigns]);

    return { campaigns, loading, error, reload: fetchTopCampaigns };
}