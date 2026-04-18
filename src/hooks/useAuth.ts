import { useEffect, useState } from 'react';
import { authApi, type AuthUser } from '../services/api';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const bootstrap = async () => {
        try {
            setLoading(true);
            setError(null);
            const me = await authApi.me();
            setUser(me);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        bootstrap();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authApi.login({ email, password });
            setUser(data.user);
            return data;
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo iniciar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return {
        user,
        loading,
        error,
        login,
        logout,
        refreshUser: bootstrap,
        isAuthenticated: !!user,
    };
}