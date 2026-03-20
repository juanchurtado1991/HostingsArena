export interface AnalyticsData {
    summary: {
        today: number;
        week: number;
        month: number;
        clicksToday?: number;
        clicksWeek?: number;
        clicksMonth?: number;
        avgVisitsPerDay?: number;
    };
    topPages: { path: string; views: number }[];
    topPosts: { post_slug: string; views: number }[];
    dailyTraffic: { day: string; views: number }[];
    topReferrers: { referrer: string; views: number }[];
    topCountries: { country: string; views: number }[];
    recentActivity: { type: 'view' | 'click'; ip_address: string; country: string; detail: string; source: string; created_at: string; device_type: string }[];
    clicksByProvider: { provider_name: string; click_count: number }[];
    dailyClicks: { date: string; count: number }[];
}

export const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const getCountryName = (code: string) => {
    try {
        return countryNames.of(code) || code;
    } catch {
        return code;
    }
};
