"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PickerSearchProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
}

export function PickerSearch({ value, onChange, placeholder }: PickerSearchProps) {
    return (
        <div className="relative mb-8 shrink-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
                placeholder={placeholder} 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="pl-14 h-14 bg-white border-studio-border text-zinc-900 placeholder:text-zinc-300 focus:ring-4 focus:ring-studio-accent/5 focus:border-studio-accent/30 rounded-2xl font-medium transition-all shadow-sm"
            />
        </div>
    );
}
