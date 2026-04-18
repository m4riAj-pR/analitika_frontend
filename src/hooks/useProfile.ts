import { useEffect, useState } from 'react';
import { AuthUser, UpdateProfilePayload, usersApi } from '../services/api';

export function useProfile() {
    const [profile, setProfile] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await usersApi.getMe();
            setProfile(data);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const updateProfile = async (payload: UpdateProfilePayload) => {
        try {
            setSaving(true);
            setError(null);
            const updated = await usersApi.updateMe(payload);
            setProfile(updated);
            return updated;
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo actualizar el perfil');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return { profile, loading, saving, error, getProfile, updateProfile };
}