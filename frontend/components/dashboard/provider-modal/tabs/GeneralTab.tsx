import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { TabProps } from "../types";

export function GeneralTab({ formData, handleChange, type }: TabProps) {
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
                <label className={LABEL_CLASS}>Provider Name</label>
                <input
                    className={INPUT_CLASS}
                    value={formData.provider_name || ""}
                    onChange={(e) => handleChange('provider_name', e.target.value)}
                />
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className={LABEL_CLASS}>Slug (URL)</label>
                <input
                    className={INPUT_CLASS}
                    value={formData.slug || ""}
                    onChange={(e) => handleChange('slug', e.target.value)}
                />
            </div>
            <div className="col-span-2">
                <label className={LABEL_CLASS}>Website URL (Affiliate Target)</label>
                <input
                    className={INPUT_CLASS}
                    value={formData.website_url || ""}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                />
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className={LABEL_CLASS}>Provider Type</label>
                <select 
                    className={INPUT_CLASS} 
                    value={formData.provider_type || ""} 
                    onChange={(e) => handleChange('provider_type', e.target.value)}
                >
                    {type === 'hosting' ? (
                        <>
                            <option value="Shared">Shared Hosting</option>
                            <option value="VPS">VPS Hosting</option>
                            <option value="Dedicated">Dedicated Server</option>
                            <option value="Cloud">Cloud Hosting</option>
                        </>
                    ) : (
                        <option value="VPN">VPN Service</option>
                    )}
                </select>
            </div>
            {type === 'hosting' && (
                <div className="col-span-2 md:col-span-1">
                    <label className={LABEL_CLASS}>Plan Name</label>
                    <input
                        className={INPUT_CLASS}
                        value={formData.plan_name || ""}
                        onChange={(e) => handleChange('plan_name', e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}
