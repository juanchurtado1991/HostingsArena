"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    Undo2, Redo2, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Type, Palette, X, Highlighter, Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, List, ListOrdered, ImageIcon,
    Link as LinkIcon, ChevronDown, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { LinkMenu, VsMenu, AffiliateMenu } from "./EditorPopups";

import { AffiliateLink } from "./types";
import { normalizeUrl } from "./utils";

function ToolbarBtn({
    onClick,
    active,
    children,
    title,
    disabled = false
}: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-xl transition-all duration-200 ${active
                ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}

function ToolbarGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {children}
        </div>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-6 bg-border/40 mx-1" />;
}


export function EditorToolbar({
    editor,
    affiliateLinks,
    onInsertAffiliate,
    onInsertImage,
}: {
    editor: any;
    affiliateLinks: AffiliateLink[];
    onInsertAffiliate: (link: AffiliateLink) => void;
    onInsertImage: (file: File) => Promise<void>;
}) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showAffiliateMenu, setShowAffiliateMenu] = useState(false);
    const [showVsMenu, setShowVsMenu] = useState(false);
    const [showLinkMenu, setShowLinkMenu] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [vsCategory, setVsCategory] = useState<"hosting" | "vpn">("hosting");
    const [vsProviders, setVsProviders] = useState<any[]>([]);
    const [vsLoading, setVsLoading] = useState(false);
    const [vsA, setVsA] = useState("");
    const [vsB, setVsB] = useState("");
    const [affSearch, setAffSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showVsMenu) {
            const fetchVsProviders = async () => {
                setVsLoading(true);
                try {
                    const res = await fetch(`/api/providers?type=${vsCategory}`);
                    if (res.ok) {
                        const data = await res.json();
                        setVsProviders(data || []);
                    }
                } catch (e) {
                    console.error("Error fetching vs providers:", e);
                } finally {
                    setVsLoading(false);
                }
            };
            fetchVsProviders();
        }
    }, [showVsMenu, vsCategory]);

    if (!editor) return null;

    const colors = [
        "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308", "#22c55e",
        "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280", "#1e293b",
    ];

    const filteredLinks = affiliateLinks.filter(a =>
        a.provider_name.toLowerCase().includes(affSearch.toLowerCase())
    );

    return (
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-border/50 bg-muted/20 overflow-x-auto no-scrollbar">
            <ToolbarGroup>
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)">
                    <Undo2 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)">
                    <Redo2 className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            <ToolbarGroup>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (⌘B)">
                    <Bold className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (⌘I)">
                    <Italic className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (⌘U)">
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />
            <ToolbarGroup>
                <div className="flex items-center gap-1 bg-background/50 rounded-xl px-2 h-9 ring-1 ring-border/50">
                    <Type className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                        className="bg-transparent text-[11px] font-bold border-none focus:ring-0 cursor-pointer min-w-[50px] outline-none"
                        onChange={(e) => {
                            if (e.target.value === "auto") {
                                editor.chain().focus().unsetFontSize().run();
                            } else {
                                editor.chain().focus().setFontSize(`${e.target.value}px`).run();
                            }
                        }}
                        value={editor.getAttributes('textStyle').fontSize?.replace('px', '') || "auto"}
                    >
                        <option value="auto">Auto</option>
                        {[10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 32, 48].map(size => (
                            <option key={size} value={size}>{size}px</option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <ToolbarBtn onClick={() => setShowColorPicker(true)} title="Text Color" active={showColorPicker}>
                        <Palette className="w-4 h-4" />
                    </ToolbarBtn>
                    {showColorPicker && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowColorPicker(false)} />
                            <div className="w-full max-w-[240px] p-5 bg-background border border-border rounded-3xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Palette className="w-3.5 h-3.5" />
                                        Text Colors
                                    </h4>
                                    <button onClick={() => setShowColorPicker(false)} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                                            className="w-8 h-8 rounded-full border border-border hover:scale-125 transition-all duration-200 shadow-sm ring-offset-2 hover:ring-2 hover:ring-primary/20"
                                            style={{ backgroundColor: c }}
                                            title={c}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Custom Color</label>
                                        <input
                                            type="color"
                                            className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer bg-transparent"
                                            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                                            title="Pick Custom Color"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                                        className="w-full text-[10px] font-bold text-muted-foreground hover:text-foreground py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Undo2 className="w-3 h-3" />
                                        RESET COLOR
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: "#fbbf24" }).run()} active={editor.isActive("highlight")} title="Highlight">
                    <Highlighter className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            <ToolbarGroup>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
                    <Heading1 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
                    <Heading2 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
                    <Heading3 className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            <ToolbarGroup>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
                    <AlignCenter className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
                    <AlignRight className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
                    <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            <ToolbarGroup>
                <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Insert Image">
                    <ImageIcon className="w-4 h-4" />
                </ToolbarBtn>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            onInsertImage(file);
                            e.target.value = ""; // Reset
                        }
                    }}
                />

                <ToolbarBtn
                    onClick={() => {
                        const previousUrl = editor.getAttributes('link').href || "";
                        setLinkUrl(previousUrl);
                        setShowLinkMenu(true);
                    }}
                    active={editor.isActive('link')}
                    title="Insert/Edit Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </ToolbarBtn>

                <ToolbarBtn onClick={() => setShowVsMenu(true)} active={showVsMenu} title="Insert Versus Comparison">
                    <div className="flex items-center gap-0.5">
                        <span className="text-[10px] font-black">VS</span>
                    </div>
                </ToolbarBtn>

                <button
                    type="button"
                    onClick={() => setShowAffiliateMenu(true)}
                    title="Insert Affiliate Link"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                >
                    <span className="hidden sm:inline">AFFILIATE</span>
                    <ChevronDown className="w-3 h-3" />
                </button>
            </ToolbarGroup>

            <LinkMenu show={showLinkMenu} onClose={() => setShowLinkMenu(false)} linkUrl={linkUrl} setLinkUrl={setLinkUrl} editor={editor} />
            <VsMenu show={showVsMenu} onClose={() => setShowVsMenu(false)} vsCategory={vsCategory} setVsCategory={setVsCategory} vsA={vsA} setVsA={setVsA} vsB={vsB} setVsB={setVsB} vsProviders={vsProviders} vsLoading={vsLoading} editor={editor} />
            <AffiliateMenu show={showAffiliateMenu} onClose={() => setShowAffiliateMenu(false)} affSearch={affSearch} setAffSearch={setAffSearch} filteredLinks={filteredLinks} onInsertAffiliate={onInsertAffiliate} />
        </div>
    );
}

ToolbarBtn.displayName = "ToolbarBtn";
ToolbarGroup.displayName = "ToolbarGroup";
ToolbarDivider.displayName = "ToolbarDivider";
EditorToolbar.displayName = "EditorToolbar";
