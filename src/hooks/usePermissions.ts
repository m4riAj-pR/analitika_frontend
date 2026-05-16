import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Service from '../services/api/permissions';

export function usePermissions() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setPermissions(response.response || []);
        } catch (err: any) {
            Alert.alert("Error", "No se pudieron cargar los permisos.");
            setError(err.message || 'Error al cargar permisos');
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { permissions, loading, error, reload: fetchAll };
}



