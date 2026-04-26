import { useCallback, useEffect, useState } from 'react';
import * as Service from '../services/api/users';

export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setUsers(response.response || []);
        } catch (err: any) {
            console.error('Error fetching users:', err);
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



