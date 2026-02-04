import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

export function formatNumber(num: number | undefined | null): string {
    if (num === undefined || num === null) return "-";
    return new Intl.NumberFormat("en-US").format(num);
}

export function calculateMonthlyCost(monthly: number, renewal: number | undefined | null, months: number = 36): number {
    if (!renewal) return monthly;
    // Simple avg for now: (12 * promo + 24 * renewal) / 36 usually? 
    // But let's assume promo is for first term (e.g. 12mo or 36mo).
    // This function needs more context about promo period. 
    // For MVP let's return a weighted average if period known, else just renewal?
    // Actually, let's keep it simple: return the renewal price as "Long Term Cost" vs "Promo Price".
    return renewal;
}
