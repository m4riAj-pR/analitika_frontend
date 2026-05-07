import { useCallback, useEffect, useState } from 'react';
import { userCompanyApi } from '../services/api';
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
            const response: any = await authService.me();
            console.log("DEBUG: authService.me() devolvió:", response);
            let user = response?.response || response;
            console.log("DEBUG: user extraído de la respuesta:", user);

            if (user) {
                // 1. Intentar sacar el id_company directamente del array companies si existe
                if (!user.id_company && Array.isArray(user.companies) && user.companies.length > 0) {
                    user = { ...user, id_company: user.companies[0].id_company, company_name: user.companies[0].name };
                }

                // 2. Fallback: Buscar la empresa en la tabla intermedia user-company
                if (!user.id_company && user.id_user) {
                    try {
                        const { userCompanyApi } = await import('../services/api');
                        const ucResponse: any = await userCompanyApi.getAll();

                        const userCompanies = Array.isArray(ucResponse) ? ucResponse : (ucResponse?.response || []);
                        const relation = userCompanies.find((uc: any) => Number(uc.id_user) === Number(user.id_user));
                        
                        if (relation) {
                            user = { 
                                ...user, 
                                id_company: Number(relation.id_company),
                            };
                            
                            // Guardar en caché
                            await authService.authApi.saveUser(user);
                            console.log("Se encontró la relación en user-company y se guardó en caché:", user);
                        } else {
                            console.warn("No se encontró relación en user-company para el usuario:", user.id_user);
                        }
                    } catch (err) {
                        console.error('Error buscando en user-company:', err);
                    }
                }
            }

            console.log("USEPROFILE RESOLVED USER:", user);
            setProfile(user);
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
            if (!profile?.id_person) throw new Error("No hay sesión activa");

            // CORRECCIÓN 5: campos correctos para el schema Person del backend
            await authService.updateProfile(profile.id_person, {
                name:     data.first_name || data.name,
                lastname: data.last_name  || data.lastname,
                email:    data.email || profile.email,
                phone:    data.phone,
            });

            // Actualizar caché local
            const updatedUser = {
                ...profile,
                first_name: data.first_name || data.name || profile.first_name,
                last_name: data.last_name || data.lastname || profile.last_name,
                phone: data.phone || profile.phone,
            };
            await authService.authApi.saveUser(updatedUser);

            // Refrescar estado local
            await fetchProfile();
            return updatedUser;
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
