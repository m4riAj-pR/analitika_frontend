import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Service from '../services/api/persons';

export function usePersons() {
    const [persons, setPersons] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await Service.getAll();
            setPersons(response.response || []);
        } catch (err: any) {
            Alert.alert("Error", "No se pudieron cargar los datos de personas.");
            setError(err.message || 'Error al cargar personas');
            setPersons([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { persons, loading, error, reload: fetchAll };
}



