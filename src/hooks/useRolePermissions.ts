import { useCallback, useEffect, useState } from 'react';
import * as Service from '../services/api/rolePermissions';

export function useRolePermissions() {
    const [rolePermissions, setRolePermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setRolePermissions(response.response || []);
        } catch (err: any) {
            console.error('Error fetching role permissions:', err);
            setError(err.message || 'Error al cargar permisos de rol');
            setRolePermissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { rolePermissions, loading, error, reload: fetchAll };
}



