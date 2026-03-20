import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { AffiliateSectionProps } from "../types";

export function AffiliateCommission({ formData, update }: AffiliateSectionProps) {
    return (
        <div className="col-span-12 lg:col-span-5 space-y-6 lg:pl-6 lg:border-l border-gray-100">

            <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => update("status", e.target.value)}
                    className={`${INPUT_CLASS} appearance-none cursor-pointer bg-white font-medium`}
                >
                    <option value="active">Active (Live)</option>
                    <option value="paused">Paused (Inactive)</option>
                    <option value="processing_approval">Processing Approval</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Network</label>
                <div className="relative">
                    <input
                        type="text"
                        list="networks"
                        value={formData.network}
                        onChange={(e) => update("network", e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="Select or type..."
                    />
                    <datalist id="networks">
                        <option value="Impact" />
                        <option value="ShareASale" />
                        <option value="CJ Affiliate" />
                        <option value="Awin" />
                        <option value="PartnerStack" />
                        <option value="Direct" />
                    </datalist>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Min Payout</label>
                <div className="flex gap-2 w-full">
                    <input
                        type="number"
                        value={formData.minimum_payout_amount || ""}
                        onChange={(e) => update("minimum_payout_amount", e.target.value)}
                        placeholder="50"
                        className="flex-1 w-full min-w-0 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400 shadow-sm"
                    />
                    <select
                        value={formData.minimum_payout_currency || "USD"}
                        onChange={(e) => update("minimum_payout_currency", e.target.value)}
                        className="w-auto flex-none min-w-[80px] px-2 py-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm cursor-pointer hover:bg-gray-50 appearance-none text-center font-bold tracking-wide"
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={LABEL_CLASS}>Comm. Rate</label>
                    <input
                        type="text"
                        value={formData.commission_rate}
                        onChange={(e) => update("commission_rate", e.target.value)}
                        placeholder="e.g. 30%"
                        className={INPUT_CLASS}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className={LABEL_CLASS}>Cookie (days)</label>
                    <input
                        type="number"
                        value={formData.cookie_days}
                        onChange={(e) => update("cookie_days", e.target.value)}
                        placeholder="30"
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Reminder?</label>
                <input
                    type="date"
                    value={formData.reminder_at ? new Date(formData.reminder_at).toISOString().split('T')[0] : ""}
                    onChange={(e) => update("reminder_at", e.target.value)}
                    className={`${INPUT_CLASS} px-2 text-xs`}
                />
            </div>

            {formData.reminder_at && (
                <div className="space-y-1.5">
                    <label className={LABEL_CLASS}>Reminder Note</label>
                    <textarea
                        value={formData.reminder_note || ""}
                        onChange={(e) => update("reminder_note", e.target.value)}
                        placeholder="e.g. Follow up on approval next week..."
                        className={`${INPUT_CLASS} min-h-[60px] text-xs resize-none`}
                    />
                </div>
            )}

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Instructions</h4>
                <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
                    <li>Ensure the <strong>Provider Name</strong> matches the one in our database exactly.</li>
                    <li>Credentials are stored securely but <strong>visible to admins</strong> for quick access.</li>
                    <li>Set <strong>Status</strong> to 'Active' to immediately enable the link.</li>
                    <li>Use <strong>Processing Approval</strong> to track applications.</li>
                </ul>
            </div>

        </div>
    );
}
