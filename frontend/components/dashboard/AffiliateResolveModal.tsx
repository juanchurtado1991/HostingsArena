"use client";

import { AdminTask } from "@/lib/tasks/types";
import { AffiliateFormModal, EMPTY_AFFILIATE_FORM } from "./AffiliateFormModal";

interface AffiliateResolveModalProps {
    task: AdminTask;
    onClose: () => void;
    onResolved: () => void;
}

export function AffiliateResolveModal({ task, onClose, onResolved }: AffiliateResolveModalProps) {
    const providerName = (task.metadata as Record<string, unknown>)?.provider_name as string;

    const handleSubmit = async (data: typeof EMPTY_AFFILIATE_FORM) => {
        const res = await fetch(`/api/admin/tasks/${task.id}/resolve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                link: data.affiliate_link,
                network: data.network || null,
                commission_rate: data.commission_rate || null,
                cookie_days: data.cookie_days ? parseInt(data.cookie_days) : null,
            }),
        });

        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || "Failed to save");
        }

        onResolved();
    };

    return (
        <AffiliateFormModal
            title="Add Affiliate Link"
            subtitle={providerName}
            initialData={{
                ...EMPTY_AFFILIATE_FORM,
                provider_name: providerName,
            }}
            providerLocked
            showWarning
            warningProvider={providerName}
            showStatus={false}
            submitLabel="Save & Close Task"
            submitGradient="from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-500/20"
            headerGradient="from-red-500/20 to-orange-500/10"
            headerIconColor="text-red-400"
            onSubmit={handleSubmit}
            onClose={onClose}
        />
    );
}
