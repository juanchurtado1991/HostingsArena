"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const languages = [
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
];

export function LocaleSwitcher() {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const segments = pathname.split("/");
    const currentLang = segments[1]?.length === 2 ? segments[1] : "en";

    const [value, setValue] = React.useState(currentLang);

    React.useEffect(() => {
        setValue(currentLang);
    }, [currentLang]);

    const handleSelect = (newLang: string) => {
        setValue(newLang);
        setOpen(false);

        let newPath = "";
        if (segments.length > 1 && languages.some(l => l.value === segments[1])) {
            const rest = segments.slice(2).join("/");
            newPath = `/${newLang}${rest ? `/${rest}` : ''}`;
        } else {
            newPath = `/${newLang}${pathname}`;
        }

        newPath = newPath.replace("//", "/");

        router.push(newPath);
    };

    const selected = languages.find((framework) => framework.value === value) || languages[0];

    return (
        <div className="relative inline-flex items-center bg-background/50 border border-border/50 rounded-full hover:bg-accent/50 transition-colors">
            <select
                className="h-9 appearance-none bg-transparent pl-3 pr-8 text-sm font-medium focus:outline-none cursor-pointer"
                value={value}
                onChange={(e) => handleSelect(e.target.value)}
            >
                {languages.map((language) => (
                    <option key={language.value} value={language.value}>
                        {language.flag} {language.value.toUpperCase()}
                    </option>
                ))}
            </select>
            <ChevronsUpDown className="absolute right-2 h-3 w-3 opacity-50 pointer-events-none" />
        </div>
    );
}

