import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Service from '../services/api/roles';

export function useRoles() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setRoles(response.response || []);
        } catch (err: any) {
            Alert.alert("Error", "No se pudieron cargar los roles.");
            setError(err.message || 'Error al cargar roles');
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { roles, loading, error, reload: fetchAll };
}



