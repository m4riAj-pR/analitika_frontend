import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Service from '../services/api/users';

export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const raw: any = await Service.getAll();
            setUsers(Array.isArray(raw) ? raw : raw?.response || []);
        } catch (err: any) {
            Alert.alert("Error", "No se pudieron cargar los usuarios.");
            setError(err.message || 'Error al cargar usuarios');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { users, loading, error, reload: fetchAll };
}



