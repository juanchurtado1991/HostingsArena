export interface AffiliateFormData {
    provider_name: string;
    affiliate_link: string;
    network: string;
    commission_rate: string;
    cookie_days: string;
    link_duration_days: string;
    status: string;
    account_email?: string;
    account_password?: string;
    dashboard_url?: string;
    account_phone?: string;
    payment_method?: string;
    minimum_payout_amount?: string;
    minimum_payout_currency?: string;
    reminder_at?: string;
    reminder_note?: string;
    promo_code?: string;
    promo_discount?: string;
}

export const EMPTY_AFFILIATE_FORM: AffiliateFormData = {
    provider_name: "",
    affiliate_link: "",
    network: "",
    commission_rate: "",
    cookie_days: "",
    link_duration_days: "",
    status: "active",
    account_email: "",
    account_password: "",
    dashboard_url: "",
    account_phone: "",
    payment_method: "",
    minimum_payout_amount: "",
    minimum_payout_currency: "USD",
    reminder_at: "",
    reminder_note: "",
    promo_code: "",
    promo_discount: "",
};

export interface ProviderOption {
    name: string;
    type: "hosting" | "vpn";
}

export interface AffiliateSectionProps {
    formData: AffiliateFormData;
    update: (key: keyof AffiliateFormData, value: string) => void;
}
