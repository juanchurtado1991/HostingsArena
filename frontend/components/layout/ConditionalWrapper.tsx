"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function ConditionalWrapper({
    navbar,
    footer,
    children,
}: {
    navbar: React.ReactNode;
    footer: React.ReactNode;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isStudio = pathname?.includes("/studio");

    return (
        <>
            {!isStudio && navbar}
            <main className={isStudio ? "h-screen w-screen overflow-hidden" : ""}>
                {children}
            </main>
            {!isStudio && footer}
        </>
    );
}
