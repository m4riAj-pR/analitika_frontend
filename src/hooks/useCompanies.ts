import { useCallback, useEffect, useState } from 'react';
import * as Service from '../services/api/companies';

export function useCompanies() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setCompanies(response.response || []);
        } catch (err: any) {
            console.error('Error fetching companies:', err);
            setError(err.message || 'Error al cargar empresas');
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { companies, loading, error, reload: fetchAll };
}



