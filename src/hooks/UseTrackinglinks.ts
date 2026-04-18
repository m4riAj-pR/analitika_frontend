import { useCallback, useEffect, useState } from 'react';
import { TrackingLink, TrackingLinkPayload, trackingLinksApi } from '../services/api';

export function useTrackingLinks(id_campaign?: number) {
    const [links, setLinks] = useState<TrackingLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async () => {
        if (!id_campaign) return;

        try {
            setLoading(true);
            setError(null);
            const response = await trackingLinksApi.listByCampaign(id_campaign);
            setLinks(response);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudieron cargar los links');
        } finally {
            setLoading(false);
        }
    }, [id_campaign]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const createLink = async (payload: TrackingLinkPayload) => {
        try {
            setCreating(true);
            setError(null);
            const created = await trackingLinksApi.create(payload);
            setLinks((prev) => [created, ...prev]);
            return created;
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo crear el tracking link');
            throw err;
        } finally {
            setCreating(false);
        }
    };

    return { links, loading, creating, error, reload: fetchLinks, createLink };
}