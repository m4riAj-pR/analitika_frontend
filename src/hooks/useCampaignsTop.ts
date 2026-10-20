import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { campaignsApi } from '../services/api/campaign';
import { TopCampaign } from '../services/api/types';

/**
 * Hook to fetch top campaigns from GET /analitika/campaigns/top.
 * The start_date/end_date params are kept for API compatibility 
 * but the actual endpoint may not use them.
 */
export function useCampaignsTop(_start_date?: string, _end_date?: string) {
    const [campaigns, setCampaigns] = useState<TopCampaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRanking = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("LOADING TOP CAMPAIGNS");
            const response: any = await campaignsApi.getTop();
            console.log("TOP CAMPAIGNS RESPONSE:", response);
            const data = Array.isArray(response) ? response : (response?.data || response?.response || []);
            // Sort by ROI descending
            const sorted = data.sort((a: any, b: any) => {
                const roiA = a.roi ?? 0;
                const roiB = b.roi ?? 0;
                return roiB - roiA;
            });
            // Assign rankPosition
            const ranked = sorted.map((c: any, idx: number) => ({
                ...c,
                rankPosition: idx + 1,
            }));
            setCampaigns(ranked);
        } catch (err: any) {
            Alert.alert("Error", "No se pudo cargar el ranking de campañas.");
            setError(err.message || 'Error al cargar el ranking');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRanking();
    }, [fetchRanking]);

    return { campaigns, loading, error, reload: fetchRanking };
}
