import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { TabProps } from "../types";
import { cn } from "@/lib/utils";

export function ScoresTab({ formData, handleChange, type }: TabProps) {
    return (
        <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <label className={cn(LABEL_CLASS, "text-primary text-xs mb-3")}>
                    {type === 'hosting' ? 'Support Score' : 'Support Quality Score'} (0-100)
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    value={(type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0}
                    onChange={(e) => handleChange(type === 'hosting' ? 'support_score' : 'support_quality_score', parseInt(e.target.value))}
                />
                <div className="flex justify-between mt-2 font-black text-2xl text-primary">
                    <span>{(type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0}%</span>
                    <span className="text-sm uppercase tracking-widest mt-2">
                        {((type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0) >= 90 ? 'Elite' : 
                         ((type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0) >= 80 ? 'Excellent' : 'Average'}
                    </span>
                </div>
            </div>
            {type === 'hosting' && (
                <div>
                    <label className={LABEL_CLASS}>Performance Grade (A-F)</label>
                    <select className={INPUT_CLASS} value={formData.performance_grade || ""} onChange={(e) => handleChange('performance_grade', e.target.value)}>
                        {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            )}
            <div>
                <label className={LABEL_CLASS}>Manual Entry (%)</label>
                <input 
                    type="number" 
                    className={INPUT_CLASS} 
                    value={(type === 'hosting' ? formData.support_score : formData.support_quality_score) || ""} 
                    onChange={(e) => handleChange(type === 'hosting' ? 'support_score' : 'support_quality_score', parseInt(e.target.value))} 
                />
            </div>
        </div>
    );
}
