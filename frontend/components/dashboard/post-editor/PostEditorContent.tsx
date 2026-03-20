"use client";

import React from "react";
import { EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { 
    Sparkles, Loader2, Bold, Italic, Underline as UnderlineIcon, 
    Strikethrough, Link as LinkIcon 
} from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { AffiliateLink } from "./types";
import { normalizeUrl } from "./utils";

interface PostEditorContentProps {
    editor: any;
    editLang: "en" | "es";
    handleLangSwitch: (lang: "en" | "es") => void;
    handleTranslate: () => void;
    isTranslating: boolean;
    affiliateLinks: AffiliateLink[];
    handleInsertAffiliate: (link: AffiliateLink) => void;
    handleEditorImageUpload: (file: File) => Promise<void>;
}

export function PostEditorContent({
    editor,
    editLang,
    handleLangSwitch,
    handleTranslate,
    isTranslating,
    affiliateLinks,
    handleInsertAffiliate,
    handleEditorImageUpload,
}: PostEditorContentProps) {
    if (!editor) return null;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-none px-6 py-3 border-b border-border/50 bg-background/50 flex items-center justify-between">
                <div className="flex p-1 bg-muted/50 rounded-xl ring-1 ring-border/50">
                    <button
                        onClick={() => handleLangSwitch("en")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editLang === "en" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        ENGLISH
                    </button>
                    <button
                        onClick={() => handleLangSwitch("es")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editLang === "es" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        ESPAÑOL
                    </button>
                </div>

                <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black tracking-tighter bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-primary hover:scale-105 transition-all shadow-sm disabled:opacity-50"
                >
                    {isTranslating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                    )}
                    MAGIC TRANSLATE (AI)
                </button>
            </div>

            <EditorToolbar
                editor={editor}
                affiliateLinks={affiliateLinks}
                onInsertAffiliate={handleInsertAffiliate}
                onInsertImage={handleEditorImageUpload}
            />

            <div className="flex-1 overflow-y-auto bg-background/30 selection:bg-primary/10">
                {editor && (
                    <BubbleMenu
                        editor={editor}
                        className="flex items-center gap-0.5 p-1 bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded-lg transition-colors ${editor.isActive("bold") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded-lg transition-colors ${editor.isActive("italic") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1.5 rounded-lg transition-colors ${editor.isActive("underline") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <UnderlineIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`p-1.5 rounded-lg transition-colors ${editor.isActive("strike") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <Strikethrough className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-border/50 mx-1" />
                        <button
                            onClick={() => {
                                const url = window.prompt("URL", editor.getAttributes("link").href);
                                if (url) {
                                    const normalized = normalizeUrl(url);
                                    editor.chain().focus().setLink({ href: normalized }).run();
                                } else if (url === "") {
                                    editor.chain().focus().unsetLink().run();
                                }
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${editor.isActive("link") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                    </BubbleMenu>
                )}
                <div className="max-w-[850px] mx-auto py-12 px-8 min-h-full">
                    <EditorContent editor={editor} className="prose prose-zinc dark:prose-invert max-w-none focus:outline-none" />
                </div>
            </div>
        </div>
    );
}
