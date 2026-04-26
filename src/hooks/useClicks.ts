import { useCallback, useEffect, useState } from 'react';
import * as Service from '../services/api/clicks';

export function useClicks() {
    const [clicks, setClicks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setClicks(response.response || []);
        } catch (err: any) {
            console.error('Error fetching clicks:', err);
            setError(err.message || 'Error al cargar clics');
            setClicks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { clicks, loading, error, reload: fetchAll };
}



