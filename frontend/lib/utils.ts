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
    return renewal;
}
