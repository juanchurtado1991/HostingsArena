"use client";

import { useAffiliateManager } from "./hooks/useAffiliateManager";
import { AffiliateStatsCards } from "./affiliate-manager/AffiliateStatsCards";
import { AffiliateGuide } from "./affiliate-manager/AffiliateGuide";
import { AffiliateFilters } from "./affiliate-manager/AffiliateFilters";
import { AffiliateCard } from "./affiliate-manager/AffiliateCard";
import { AffiliateFormModal } from "./affiliate-modal/AffiliateFormModal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, Link as LinkIcon } from "lucide-react";

export function AffiliateManager() {
    const {
        affiliates, stats, loading, search, setSearch,
        statusFilter, setStatusFilter, networkFilter, setNetworkFilter,
        showModal, setShowModal, editingAffiliate, modalInitialData,
        deletingId, copiedId, showGuide, setShowGuide,
        availableProviders, uniqueNetworks, fetchAffiliates,
        openAddModal, openEditModal, handleSave, handleDelete,
        handleToggleStatus, handleCopy, handleTestLink
    } = useAffiliateManager();

    return (
        <div className="space-y-8">
            <AffiliateStatsCards stats={stats} />

            {showGuide && <AffiliateGuide />}

            <AffiliateFilters 
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                networkFilter={networkFilter}
                setNetworkFilter={setNetworkFilter}
                uniqueNetworks={uniqueNetworks}
                showGuide={showGuide}
                setShowGuide={setShowGuide}
                onRefresh={fetchAffiliates}
                onAdd={openAddModal}
                loading={loading}
            />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : affiliates.length === 0 ? (
                <GlassCard className="text-center py-16">
                    <LinkIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Affiliates Found</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        {search ? `No results for "${search}"` : "Start by adding your first affiliate partner"}
                    </p>
                    <button 
                        onClick={openAddModal} 
                        className="rounded-xl px-4 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
                    >
                        Add First Partner
                    </button>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {affiliates.map((aff) => (
                        <AffiliateCard 
                            key={aff.id}
                            aff={aff}
                            copiedId={copiedId}
                            deletingId={deletingId}
                            onCopy={handleCopy}
                            onToggleStatus={handleToggleStatus}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onTest={handleTestLink}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <AffiliateFormModal
                    title={editingAffiliate ? "Edit Affiliate" : "Add Affiliate Partner"}
                    subtitle={editingAffiliate ? `Editing ${editingAffiliate.provider_name}` : "Configure a new affiliate link"}
                    initialData={modalInitialData}
                    providerLocked={!!editingAffiliate}
                    providerOptions={availableProviders}
                    showStatus
                    submitLabel={editingAffiliate ? "Save Changes" : "Add Partner"}
                    onSubmit={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}