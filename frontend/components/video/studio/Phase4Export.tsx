import React from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Download, Film, Sparkles, Gauge, FileVideo, RotateCcw } from 'lucide-react';

type ExportSettings = ReturnType<typeof useVideoStudio>['exportSettings'];

function SettingRow<K extends keyof ExportSettings>({
    icon: Icon, label,
    settingKey, options, exportSettings, setExportSettings
}: {
    icon: React.ElementType; label: string;
    settingKey: K;
    options: { id: ExportSettings[K]; label: string; desc: string }[];
    exportSettings: ExportSettings;
    setExportSettings: (v: ExportSettings) => void;
}) {
    return (
        <div className="flex items-center gap-4 flex-1 min-h-0">
            <div className="w-36 shrink-0 flex items-center gap-2.5">
                <div className="p-2 bg-studio-accent/10 rounded-lg border border-studio-accent/20 text-studio-accent shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em] leading-tight">{label}</span>
            </div>
            <div className="flex-1 flex gap-3 h-full">
                {options.map(opt => {
                    const isActive = exportSettings[settingKey] === opt.id;
                    return (
                        <button
                            key={String(opt.id)}
                            onClick={() => setExportSettings({ ...exportSettings, [settingKey]: opt.id })}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-200 active:scale-[0.97] relative overflow-hidden ${
                                isActive
                                    ? 'border-studio-accent bg-studio-accent text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)]'
                                    : 'border-zinc-200/50 bg-zinc-100/50 hover:bg-zinc-200/50 hover:border-zinc-300/50'
                            }`}
                        >
                            <span className={`text-sm font-black tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                                {opt.label}
                            </span>
                            <span className={`text-[8px] font-bold uppercase tracking-[0.12em] transition-colors ${isActive ? 'text-white/80' : 'text-zinc-500'}`}>
                                {opt.desc}
                            </span>
                            {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,1)]" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function Phase4Export() {
    const {
        isGeneratingVideo, renderProgress, renderEta,
        renderStep, renderFinished,
        scenes, renderVideo,
        exportSettings, setExportSettings, handleDownload,
        resetProject
    } = useVideoStudio();

    return (
        <div className="h-[calc(100vh-84px)] flex items-stretch gap-0 animate-in fade-in duration-500 overflow-hidden rounded-2xl border border-studio-border ring-1 ring-black/5 shadow-2xl relative bg-studio-surface/50 backdrop-blur-2xl">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-studio-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 left-1/3 w-80 h-40 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

            {isGeneratingVideo ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-10 relative z-10">
                    <div className="relative w-56 h-56">
                        <div className="absolute inset-0 rounded-full border border-studio-accent/20 animate-ping opacity-20" />
                        <svg className="w-full h-full -rotate-90">
                            <circle className="text-black/5" strokeWidth="5" stroke="currentColor" fill="transparent" r="100" cx="112" cy="112" />
                            <circle className="text-studio-accent transition-all duration-700 ease-out"
                                strokeWidth="7" strokeDasharray={628}
                                strokeDashoffset={628 - (628 * renderProgress / 100)}
                                strokeLinecap="round" stroke="currentColor" fill="transparent" r="100" cx="112" cy="112" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                            <span className="text-6xl font-black text-zinc-900 tracking-tighter">{Math.round(renderProgress)}%</span>
                            <span className="text-[10px] font-bold text-studio-accent/70 uppercase tracking-[0.2em]">Encoding</span>
                        </div>
                    </div>
                    <div className="space-y-4 text-center max-w-sm w-full">
                        <div className="flex items-center justify-center gap-2 py-2 px-5 rounded-full bg-zinc-100/80 border border-zinc-200/50 w-fit mx-auto shadow-sm">
                            <Loader2 className="w-3 h-3 animate-spin text-studio-accent" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-studio-accent">{renderStep}</p>
                        </div>
                        <div className="h-1 w-full bg-zinc-100/50 rounded-full overflow-hidden border border-zinc-200/20">
                            <div className="h-full bg-gradient-to-r from-studio-accent to-indigo-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(70,130,255,0.3)]" style={{ width: `${renderProgress}%` }} />
                        </div>
                        {renderEta > 0 && <p className="text-xs text-zinc-700">ETA <span className="text-zinc-400 font-bold">{renderEta >= 60 ? `${Math.floor(renderEta / 60)}m ${renderEta % 60}s` : `${renderEta}s`}</span></p>}
                    </div>
                </div>

            ) : renderFinished ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-studio-accent/15 blur-3xl scale-[2] animate-pulse" />
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-studio-accent/20 to-indigo-500/10 flex items-center justify-center text-studio-accent border border-studio-accent/30 shadow-2xl">
                            <CheckCircle className="w-14 h-14" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">Production Complete</h2>
                        <p className="text-sm text-zinc-500">Your video is mastered and ready for the world.</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Button onClick={handleDownload} className="w-full h-14 bg-gradient-to-r from-studio-accent to-indigo-500 hover:opacity-90 text-white rounded-2xl text-sm font-bold gap-3 shadow-xl shadow-studio-accent/25 transition-all active:scale-95">
                            <Download className="w-5 h-5" /> Download Master
                        </Button>
                        <button onClick={resetProject} className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-700 hover:text-zinc-400 transition-colors py-3 uppercase tracking-widest w-full">
                            <RotateCcw className="w-3 h-3" /> Start New Production
                        </button>
                    </div>
                </div>

            ) : (
                <>
                    <div className="flex-1 flex flex-col p-8 gap-3 relative z-10 border-r border-zinc-200/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-studio-accent/10 rounded-xl border border-studio-accent/20 text-studio-accent">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900">Export Settings</h2>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-[0.15em]">Configure your output</p>
                            </div>
                        </div>

                        <SettingRow icon={Sparkles} label="Resolution" settingKey="resolution" exportSettings={exportSettings} setExportSettings={setExportSettings}
                            options={[
                                { id: '720p'  as const, label: '720p',  desc: 'Social' },
                                { id: '1080p' as const, label: '1080p', desc: 'Full HD' },
                                { id: '4k'    as const, label: '4K',    desc: 'Cinema' },
                            ]}
                        />
                        <div className="h-px bg-zinc-200/50 shrink-0" />
                        <SettingRow icon={Film} label="Quality" settingKey="quality" exportSettings={exportSettings} setExportSettings={setExportSettings}
                            options={[
                                { id: 'draft'    as const, label: 'Draft', desc: 'Fast' },
                                { id: 'balanced' as const, label: 'Smart', desc: 'Balanced' },
                                { id: 'max'      as const, label: 'Ultra', desc: 'Maximum' },
                            ]}
                        />
                        <div className="h-px bg-zinc-200/50 shrink-0" />
                        <SettingRow icon={Gauge} label="Frame Rate" settingKey="fps" exportSettings={exportSettings} setExportSettings={setExportSettings}
                            options={[
                                { id: '24' as const, label: '24 fps', desc: 'Cinematic' },
                                { id: '30' as const, label: '30 fps', desc: 'Standard' },
                                { id: '60' as const, label: '60 fps', desc: 'Smooth' },
                            ]}
                        />
                        <div className="h-px bg-zinc-200/50 shrink-0" />
                        <SettingRow icon={FileVideo} label="Output Format" settingKey="outputFormat" exportSettings={exportSettings} setExportSettings={setExportSettings}
                            options={[
                                { id: 'mp4'  as const, label: 'MP4',  desc: 'Universal' },
                                { id: 'webm' as const, label: 'WebM', desc: 'Web' },
                                { id: 'mov'  as const, label: 'MOV',  desc: 'Apple' },
                            ]}
                        />
                    </div>

                    <div className="w-72 shrink-0 flex flex-col items-center justify-between p-8 relative z-10">
                        <div className="flex flex-col items-center text-center gap-5 pt-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-studio-accent/20 rounded-full blur-2xl scale-150" />
                                <div className="relative w-20 h-20 rounded-full bg-studio-accent/10 flex items-center justify-center text-studio-accent border border-studio-accent/20 shadow-xl">
                                    <Sparkles className="w-9 h-9" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-bold text-zinc-900">Initiate Render</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">Baking all layers, neural voices, and cinematic audio into a master file.</p>
                            </div>
                        </div>

                        <div className="w-full space-y-2">
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-3">Selected Config</div>
                            {([
                                ['Resolution', exportSettings.resolution],
                                ['Quality', exportSettings.quality],
                                ['Frame Rate', `${exportSettings.fps} fps`],
                                ['Format', exportSettings.outputFormat.toUpperCase()],
                            ] as [string, string][]).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-100/50 border border-zinc-200/50 shadow-sm">
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{key}</span>
                                    <span className="text-[9px] text-studio-accent font-black uppercase tracking-wider">{val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="w-full space-y-2">
                            <Button onClick={renderVideo} disabled={scenes.length === 0}
                                className="w-full h-14 bg-gradient-to-r from-studio-accent to-indigo-500 hover:opacity-90 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-studio-accent/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
                                Start Rendering
                            </Button>
                            {scenes.length === 0 && <p className="text-[9px] text-zinc-700 uppercase tracking-widest text-center">Add scenes first</p>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
