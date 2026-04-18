
const API_BASE_URL = 'https://TU_BACKEND.com';
const TOKEN_KEY = 'analitika_token';

export type ApiError = {
    message: string;
    status?: number;
    details?: unknown;
};

export type RegisterPayload = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type AuthUser = {
    id_user: number;
    id_person?: number;
    id_company?: number;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
};

export type LoginResponse = {
    token: string;
    user: AuthUser;
};

export type UpdateProfilePayload = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
};

export type CampaignStatus = 'active' | 'paused' | 'finished';

export type CampaignPayload = {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status: CampaignStatus;
    spent: number;
    canal?: string;
    budget?: number;
    return_expected?: number;
};

export type Campaign = {
    id_campaign: number;
    id_company?: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status: CampaignStatus;
    spent: number;
    created_at?: string;
    updated_at?: string;
};

export type TopCampaign = {
    id_campaign: number;
    name: string;
    roi?: number | null;
    conversions?: number;
    clicks?: number;
    variation?: number | null;
};

export type TrackingLinkPayload = {
    id_campaign: number;
    destination_url: string;
};

export type TrackingLink = {
    id_link: number;
    id_campaign: number;
    url: string;
    destination_url: string;
    alias?: string;
    source?: string;
    created_at?: string;
};

export type ConversionPayload = {
    id_campaign: number;
    id_link?: number;
    ip_address?: string;
    user_agent?: string;
};

export type Conversion = {
    id_conversion: number;
    id_campaign: number;
    ip_address?: string;
    user_agent?: string;
    created_at?: string;
};

export type ClickItem = {
    id_click: number;
    id_link: number;
    ip_address?: string;
    user_agent?: string;
    referer?: string;
    country?: string;
    city?: string;
    device_type?: string;
    os?: string;
    browser?: string;
    created_at?: string;
};

export type CampaignMetrics = {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
    roi?: number;
    ctr?: number;
    cpa?: number;
};

export type DashboardResponse = {
    total_spend?: number;
    total_conversions?: number;
    total_clicks?: number;
    recent_campaigns?: Campaign[];
};