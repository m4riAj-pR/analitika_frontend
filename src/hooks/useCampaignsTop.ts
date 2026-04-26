import { useCallback, useEffect, useState } from 'react';
import { statsApi } from '../services/api/stats';
import { TopCampaign } from '../services/api/types';

export function useCampaignsTop(start_date: string, end_date: string) {
    const [campaigns, setCampaigns] = useState<TopCampaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRanking = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await statsApi.getRanking(start_date, end_date);
            // Assuming the response is the array or has a property containing it
            setCampaigns(response || []);
        } catch (err: any) {
            console.error('Error fetching top campaigns:', err);
            setError(err.message || 'Error al cargar el ranking');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, [start_date, end_date]);

    useEffect(() => {
        fetchRanking();
    }, [fetchRanking]);

    return { campaigns, loading, error, reload: fetchRanking };
}
