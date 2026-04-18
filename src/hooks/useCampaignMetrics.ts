import { useCallback, useEffect, useState } from 'react';
import { metricsApi, type CampaignMetrics } from '../services/api';

export function useCampaignMetrics(id_campaign?: number) {
    const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getMetrics = useCallback(async () => {
        if (!id_campaign) return;

        try {
            setLoading(true);
            setError(null);
            const response = await metricsApi.getByCampaign(id_campaign);
            setMetrics(response);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudieron cargar las métricas');
        } finally {
            setLoading(false);
        }
    }, [id_campaign]);

    useEffect(() => {
        getMetrics();
    }, [getMetrics]);

    return { metrics, loading, error, reload: getMetrics };
}