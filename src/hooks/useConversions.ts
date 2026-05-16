import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Service from '../services/api/conversion';

export function useConversions() {
    const [conversions, setConversions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setConversions(response.response || []);
        } catch (err: any) {
            Alert.alert("Error", "No se pudieron cargar las conversiones.");
            setError(err.message || 'Error al cargar conversiones');
            setConversions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { conversions, loading, error, reload: fetchAll };
}



