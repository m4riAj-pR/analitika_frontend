import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
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
            Alert.alert("Error", "No se pudieron cargar los clics.");
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



