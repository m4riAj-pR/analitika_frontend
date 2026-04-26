import { useCallback, useEffect, useState } from 'react';
import * as Service from '../services/api/userCompany';

export function useUserCompany() {
    const [userCompanies, setUserCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setUserCompanies(response.response || []);
        } catch (err: any) {
            console.error('Error fetching user company relations:', err);
            setError(err.message || 'Error al cargar relaciones usuario-empresa');
            setUserCompanies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { userCompanies, loading, error, reload: fetchAll };
}



