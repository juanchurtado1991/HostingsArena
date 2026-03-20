import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { TabProps } from "../types";

export function PricingTab({ formData, handleChange, type }: TabProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className={LABEL_CLASS}>Monthly Intro ($)</label>
                    <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_monthly || ""} onChange={(e) => handleChange('pricing_monthly', parseFloat(e.target.value))} />
                </div>
                <div>
                    <label className={LABEL_CLASS}>Renewal Price ($)</label>
                    <input type="number" step="0.01" className={INPUT_CLASS} value={formData.renewal_price || formData.renewal_price_monthly || ""} onChange={(e) => handleChange(type === 'hosting' ? 'renewal_price' : 'renewal_price_monthly', parseFloat(e.target.value))} />
                </div>
                <div>
                    <label className={LABEL_CLASS}>Setup Fee ($)</label>
                    <input type="number" step="0.01" className={INPUT_CLASS} value={formData.setup_fee || 0} onChange={(e) => handleChange('setup_fee', parseFloat(e.target.value))} />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <label className={LABEL_CLASS}>Yearly Total ($)</label>
                    <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_yearly || ""} onChange={(e) => handleChange('pricing_yearly', parseFloat(e.target.value))} />
                </div>
                <div>
                    <label className={LABEL_CLASS}>2-Year Total ($)</label>
                    <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_2year || ""} onChange={(e) => handleChange('pricing_2year', parseFloat(e.target.value))} />
                </div>
                <div>
                    <label className={LABEL_CLASS}>3-Year Total ($)</label>
                    <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_3year || ""} onChange={(e) => handleChange('pricing_3year', parseFloat(e.target.value))} />
                </div>
                <div>
                    <label className={LABEL_CLASS}>Refund Guarantee (Days)</label>
                    <input type="number" className={INPUT_CLASS} value={formData.money_back_days || ""} onChange={(e) => handleChange('money_back_days', parseInt(e.target.value))} />
                </div>
            </div>
        </div>
    );
}
