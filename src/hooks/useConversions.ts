import { useCallback, useEffect, useState } from 'react';
import { Conversion, ConversionPayload, conversionsApi } from '../services/api';

export function useConversions(id_campaign?: number) {
    const [conversions, setConversions] = useState<Conversion[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConversions = useCallback(async () => {
        if (!id_campaign) return;

        try {
            setLoading(true);
            setError(null);
            const response = await conversionsApi.listByCampaign(id_campaign);
            setConversions(response);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudieron cargar las conversiones');
        } finally {
            setLoading(false);
        }
    }, [id_campaign]);

    useEffect(() => {
        fetchConversions();
    }, [fetchConversions]);

    const createConversion = async (payload: ConversionPayload) => {
        try {
            setCreating(true);
            setError(null);
            const created = await conversionsApi.create(payload);
            setConversions((prev) => [created, ...prev]);
            return created;
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo registrar la conversión');
            throw err;
        } finally {
            setCreating(false);
        }
    };

    return {
        conversions,
        loading,
        creating,
        error,
        reload: fetchConversions,
        createConversion,
    };
}