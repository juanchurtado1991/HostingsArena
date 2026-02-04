import { ProviderData } from "@/types";
import fs from "fs";
import path from "path";

// For build time (SSG)
export async function getProviderData(): Promise<ProviderData> {
    const filePath = path.join(process.cwd(), "public/data/providers.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData) as ProviderData;
}

// Client-side fetcher if needed
export async function fetchProviderData(): Promise<ProviderData> {
    const res = await fetch("/data/providers.json");
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
}
