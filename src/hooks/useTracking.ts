import { useCallback, useEffect, useState } from 'react';
import * as Service from '../services/api/tracking';

export function useTracking() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setLinks(response.response || []);
        } catch (err: any) {
            console.error('Error fetching tracking links:', err);
            setError(err.message || 'Error al cargar enlaces de seguimiento');
            setLinks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { links, loading, error, reload: fetchAll };
}



