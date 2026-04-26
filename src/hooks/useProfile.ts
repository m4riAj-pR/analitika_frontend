import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services/api/auth';
import * as userService from '../services/api/user';

export function useProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await authService.me();
            // Asumiendo que la respuesta viene envuelta en .response
            setProfile(response.response || response);
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(err.message || 'Error al cargar perfil');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = async (data: any) => {
        try {
            setSaving(true);
            const userId = profile?.id_user || profile?.id; // Intenta ambos por si acaso
            if (!userId) {
                throw new Error("No se pudo encontrar el ID del usuario para actualizar.");
            }
            const response: any = await userService.updateProfile(userId, data);
            const updated = response.response || response;
            setProfile(updated);
            return updated;
        } catch (err: any) {
            console.error('Error updating profile:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { 
        profile, 
        loading, 
        saving, 
        error, 
        updateProfile, 
        refreshProfile: fetchProfile 
    };
}
