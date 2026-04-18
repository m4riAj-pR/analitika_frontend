import { useCallback, useEffect, useState } from 'react';
import { ClickItem, clicksApi } from '../services/api';

export function useClicks(id_link?: number) {
    const [clicks, setClicks] = useState<ClickItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClicks = useCallback(async () => {
        if (!id_link) return;

        try {
            setLoading(true);
            setError(null);
            const response = await clicksApi.listByLink(id_link);
            setClicks(response);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudieron cargar los clics');
        } finally {
            setLoading(false);
        }
    }, [id_link]);

    useEffect(() => {
        fetchClicks();
    }, [fetchClicks]);

    return { clicks, loading, error, reload: fetchClicks };
}