import { useCallback, useEffect, useState } from 'react';
import * as Service from '../services/api/channels';

export function useChannels() {
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setChannels(response.response || []);
        } catch (err: any) {
            console.error('Error fetching channels:', err);
            setError(err.message || 'Error al cargar canales');
            setChannels([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { channels, loading, error, reload: fetchAll };
}



