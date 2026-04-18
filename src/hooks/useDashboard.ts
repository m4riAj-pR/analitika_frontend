import { useCallback, useEffect, useState } from 'react';
import { dashboardApi, DashboardResponse } from '../services/api';

export function useDashboard() {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const response = await dashboardApi.getSummary();
            setData(response);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo cargar el dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        data,
        loading,
        refreshing,
        error,
        reload: () => fetchDashboard(false),
        refresh: () => fetchDashboard(true),
    };
}
