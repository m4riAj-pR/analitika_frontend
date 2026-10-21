import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services/api/auth';

export function useProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // me() ya devuelve el usuario normalizado con id_company y company_name
            setProfile(await authService.me());
        } catch (err: any) {
            setError(err?.message || 'Error al cargar perfil');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = async (data: any) => {
        try {
            setSaving(true);
            if (!profile?.id_person) throw new Error("No hay sesión activa");

            const payload: any = {
                name:  data.name || data.first_name,
                email: data.email || profile.email,
                phone: data.phone,
            };
            await authService.updateProfile(profile.id_person, payload);

            // Actualizar caché local
            const updatedUser = {
                ...profile,
                name: payload.name || profile.name,
                first_name: payload.name || profile.first_name,
                phone: data.phone ?? profile.phone,
            };
            await authService.authApi.saveUser(updatedUser);

            // Refrescar estado local
            await fetchProfile();
            return updatedUser;
        } catch (err: any) {
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
