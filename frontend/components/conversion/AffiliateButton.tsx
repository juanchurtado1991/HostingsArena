"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { trackAffiliateClick } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AffiliateButtonProps extends ButtonProps {
    providerName: string;
    visitUrl: string;
    position?: string;
    children?: React.ReactNode;
    showIcon?: boolean;
}

export function AffiliateButton({
    providerName,
    visitUrl,
    position = "unknown",
    children,
    showIcon = true,
    className,
    variant,
    size,
    ...props
}: AffiliateButtonProps) {
    return (
        <Button
            className={cn("rounded-full font-bold", className)}
            asChild
            variant={variant}
            size={size}
            {...props}
        >
            <a
                href={visitUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAffiliateClick(providerName, visitUrl, position)}
            >
                {children || (
                    <>
                        Visit {providerName}
                        {showIcon && <ArrowRight className="ml-2 w-5 h-5" />}
                    </>
                )}
            </a>
        </Button>
    );
}
