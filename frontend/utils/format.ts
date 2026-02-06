export function formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined) return "-";
    return `$${price.toFixed(2)}`;
}

export function formatBoolean(val: boolean | null | undefined, trueLabel: string = "Yes", falseLabel: string = "No"): string {
    if (val === null || val === undefined) return "-";
    return val ? trueLabel : falseLabel;
}

export function formatBandwidth(val: string | number | null | undefined): string {
    if (!val || val === "unknown") return "-";
    if (typeof val === "number") return `${val} GB`;
    return val.toString();
}

export function formatStorage(val: string | number | null | undefined): string {
    if (!val || val === "unknown") return "-";
    if (typeof val === "number") return `${val} GB SSD`;
    return val.toString();
}

export function safeValue(val: any): string {
    if (val === null || val === undefined || val === "" || val === "unknown") return "-";
    return val.toString();
}
