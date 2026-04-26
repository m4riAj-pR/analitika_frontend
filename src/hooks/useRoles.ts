import { useCallback, useEffect, useState } from 'react';
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
            console.error('Error fetching roles:', err);
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



