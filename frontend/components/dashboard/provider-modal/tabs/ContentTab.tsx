import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { TabProps } from "../types";
import { cn } from "@/lib/utils";

export function ContentTab({ formData, handleChange }: TabProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={LABEL_CLASS}>Summary (English)</label>
                    <textarea
                        className={cn(INPUT_CLASS, "min-h-[120px] resize-none")}
                        value={formData.raw_data?.summary_en || ""}
                        onChange={(e) => handleChange('raw_data.summary_en', e.target.value)}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASS}>Summary (Spanish)</label>
                    <textarea
                        className={cn(INPUT_CLASS, "min-h-[120px] resize-none")}
                        value={formData.raw_data?.summary_es || ""}
                        onChange={(e) => handleChange('raw_data.summary_es', e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className={LABEL_CLASS}>Editor Notes / Quick Verdict</label>
                <textarea
                    className={cn(INPUT_CLASS, "min-h-[80px] resize-none italic")}
                    placeholder="Small excerpt used in detail pages..."
                    value={formData.raw_data?.notes || ""}
                    onChange={(e) => handleChange('raw_data.notes', e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={LABEL_CLASS}>Pros (One per line)</label>
                    <textarea
                        className={cn(INPUT_CLASS, "min-h-[120px] resize-none font-mono text-xs")}
                        value={formData.raw_data?.pros?.join('\n') || ""}
                        onChange={(e) => handleChange('raw_data.pros', e.target.value.split('\n'))}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASS}>Cons (One per line)</label>
                    <textarea
                        className={cn(INPUT_CLASS, "min-h-[120px] resize-none font-mono text-xs")}
                        value={formData.raw_data?.cons?.join('\n') || ""}
                        onChange={(e) => handleChange('raw_data.cons', e.target.value.split('\n'))}
                    />
                </div>
            </div>
        </div>
    );
}
