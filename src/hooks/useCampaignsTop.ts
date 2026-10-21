import { useCallback, useEffect, useState } from 'react';
import { campaignsApi } from '../services/api/campaign';
import { TopCampaign } from '../services/api/types';

/**
 * Ranking desde GET /analitika/campaigns/top. El backend ordena por clics y no admite
 * filtro de fechas. El ROI se calcula aquí cuando el rol recibe datos financieros.
 */
export function useCampaignsTop(limit = 10) {
    const [campaigns, setCampaigns] = useState<TopCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRanking = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await campaignsApi.getTop(limit);
            const data: any[] = Array.isArray(response) ? response : [];
            const ranked: TopCampaign[] = data
                .map((c) => {
                    const spent = c.spent != null ? Number(c.spent) : null;
                    const profit = c.beneficio != null ? Number(c.beneficio) : null;
                    return {
                        id_campaign: Number(c.id_campaign),
                        name: c.name,
                        clics: Number(c.clics) || 0,
                        ingresos: c.ingresos != null ? Number(c.ingresos) : null,
                        spent,
                        beneficio: profit,
                        roi: spent && spent > 0 && profit != null ? (profit / spent) * 100 : null,
                    };
                })
                .sort((a, b) => b.clics - a.clics)
                .map((c, idx) => ({ ...c, rankPosition: idx + 1 }));
            setCampaigns(ranked);
        } catch (err: any) {
            setError(err?.message || 'No se pudo cargar el ranking');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchRanking();
    }, [fetchRanking]);

    return { campaigns, loading, error, reload: fetchRanking };
}
