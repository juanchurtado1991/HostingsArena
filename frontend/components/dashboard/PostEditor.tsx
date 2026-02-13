"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { PublishSummaryModal } from "./PublishSummaryModal";
import {
    Search, Plus, Loader2, Edit3, Trash2,
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote,
    Link as LinkIcon, Palette, Highlighter, Sparkles, Upload,
    FileText, CheckCircle, Clock, Tag, X,
    ChevronDown, ExternalLink, ImageIcon, Type, Undo2, Redo2, AlertTriangle, Share2,
    Save,
    Send,
    Globe
} from "lucide-react";


export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    category: string | null;
    status: string;
    is_ai_generated: boolean;
    ai_quality_score: number | null;
    seo_title: string | null;
    seo_description: string | null;
    target_keywords: string[] | null;
    related_provider_name: string | null;
    image_prompt: string | null;
    cover_image_url: string | null;
    published_at: string | null;
    created_at: string;
    social_tw_text: string | null;
    social_fb_text: string | null;
    social_li_text: string | null;
    social_hashtags: string[] | null;
    updated_at?: string;
}

interface AffiliateLink {
    id: string;
    provider_name: string;
    affiliate_link: string;
    status: string;
}


function ToolbarBtn({
    onClick, active, title, children, className = ""
}: {
    onClick: () => void; active?: boolean; title: string;
    children: React.ReactNode; className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded-xl transition-all duration-200 ${active
                ? "bg-primary/15 text-primary shadow-sm shadow-primary/10 ring-1 ring-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-105"
                } ${className}`}
        >
            {children}
        </button>
    );
}

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 select-none">{label}</span>
            <div className="flex items-center gap-0.5">{children}</div>
        </div>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent mx-2" />;
}

function EditorToolbar({
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
    const [affSearch, setAffSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!editor) return null;

    const colors = [
        "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
        "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280",
    ];

    const filteredLinks = affiliateLinks.filter(a =>
        a.provider_name.toLowerCase().includes(affSearch.toLowerCase())
    );

    return (
        <div className="flex flex-wrap items-end gap-1 px-5 py-3.5 border-b border-border/50 bg-muted/30">
            {/* Undo/Redo */}
            <ToolbarGroup label="History">
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)">
                    <Undo2 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)">
                    <Redo2 className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            {/* Image Insert */}
            <ToolbarGroup label="Insert">
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
            </ToolbarGroup>

            <ToolbarDivider />

            {/* Text Formatting */}
            <ToolbarGroup label="Format">
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

            {/* Headings */}
            <ToolbarGroup label="Headings">
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

            {/* Alignment */}
            <ToolbarGroup label="Align">
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
                    <AlignCenter className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
                    <AlignRight className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            {/* Lists & Quote */}
            <ToolbarGroup label="Structure">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
                    <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
                    <Quote className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            {/* Color & Highlight */}
            <ToolbarGroup label="Style">
                <div className="relative">
                    <ToolbarBtn onClick={() => setShowColorPicker(!showColorPicker)} title="Text Color">
                        <Palette className="w-4 h-4" />
                    </ToolbarBtn>
                    {showColorPicker && (
                        <div className="p-3 rounded-2xl glass-panel shadow-2xl z-50 flex gap-1.5 flex-wrap w-44">
                            <p className="w-full text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">Text Color</p>
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                                    className="w-7 h-7 rounded-lg border border-border hover:scale-125 transition-all duration-200 shadow-sm"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                                className="w-full text-[10px] text-muted-foreground hover:text-foreground mt-1.5 py-1 rounded-lg hover:bg-accent transition-colors"
                            >
                                ↩ Reset Color
                            </button>
                        </div>
                    )}
                </div>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: "#fbbf24" }).run()} active={editor.isActive("highlight")} title="Highlight">
                    <Highlighter className="w-4 h-4" />
                </ToolbarBtn>
            </ToolbarGroup>

            <ToolbarDivider />

            {/* Affiliate Link Inserter */}
            <div className="relative flex flex-col items-center gap-1">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 select-none">Links</span>
                <button
                    type="button"
                    onClick={() => setShowAffiliateMenu(!showAffiliateMenu)}
                    title="Insert Affiliate Link"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:scale-105"
                >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Affiliate</span>
                    <ChevronDown className="w-3 h-3" />
                </button>
                {showAffiliateMenu && (
                    <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-card backdrop-blur-xl border border-border shadow-2xl shadow-black/20 dark:shadow-black/40 z-50 overflow-hidden">
                        <div className="p-3 border-b border-border/50 bg-primary/5">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-2">Active Partners</p>
                            <input
                                type="text"
                                value={affSearch}
                                onChange={(e) => setAffSearch(e.target.value)}
                                placeholder="Search partners..."
                                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-56 overflow-y-auto py-1 bg-card">
                            {filteredLinks.length === 0 ? (
                                <div className="px-4 py-6 text-xs text-muted-foreground text-center">
                                    <LinkIcon className="w-5 h-5 mx-auto mb-2 opacity-30" />
                                    No active affiliates found
                                </div>
                            ) : filteredLinks.map(link => (
                                <button
                                    key={link.id}
                                    type="button"
                                    onClick={() => {
                                        onInsertAffiliate(link);
                                        setShowAffiliateMenu(false);
                                        setAffSearch("");
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-all flex items-center justify-between group"
                                >
                                    <span className="font-medium group-hover:text-primary transition-colors">{link.provider_name}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


function PostEditorModal({
    post,
    affiliateLinks,
    onSave,
    onClose,
}: {
    post: Post | null;
    affiliateLinks: AffiliateLink[];
    onSave: (data: Partial<Post>) => Promise<void>;
    onClose: () => void;
}) {
    const [title, setTitle] = useState(post?.title || "");
    const [slug, setSlug] = useState(post?.slug || "");
    const [excerpt, setExcerpt] = useState(post?.excerpt || "");
    const [category, setCategory] = useState(post?.category || "");
    const [seoTitle, setSeoTitle] = useState(post?.seo_title || "");
    const [seoDesc, setSeoDesc] = useState(post?.seo_description || "");
    const [keywords, setKeywords] = useState(post?.target_keywords?.join(", ") || "");
    const [imagePrompt, setImagePrompt] = useState(post?.image_prompt || "");
    const [status, setStatus] = useState(post?.status || "draft");
    const [relatedProvider, setRelatedProvider] = useState(post?.related_provider_name || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<"content" | "seo" | "social" | "image">("content");
    const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || "");
    const [socialTw, setSocialTw] = useState(post?.social_tw_text || "");
    const [socialFb, setSocialFb] = useState(post?.social_fb_text || "");
    const [socialLi, setSocialLi] = useState(post?.social_li_text || "");
    const [socialTags, setSocialTags] = useState(post?.social_hashtags?.join(" ") || "");
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [tick, setTick] = useState(0); // Used to force re-render on editor updates

    // Publish Modal State
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishStatus, setPublishStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [publishError, setPublishError] = useState<string | undefined>(undefined);


    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-primary underline hover:text-primary/80", target: "_blank", rel: "noopener noreferrer" },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Placeholder.configure({
                placeholder: "Start writing your article here... Use the toolbar above to format text, add headings, or insert affiliate links.",
            }),
        ],
        content: post?.content || "",
        onTransaction: () => {
            // Force re-render so toolbar active states update
            setTick(t => t + 1);
        },
        editorProps: {
            attributes: {
                class: "tiptap focus:outline-none min-h-[500px] px-8 py-6",
            },
        },
    });

    // Update state when post changes (e.g. after AI generation)
    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt || "");
            setCategory(post.category || "");
            setSeoTitle(post.seo_title || "");
            setSeoDesc(post.seo_description || "");
            setKeywords(post.target_keywords?.join(", ") || "");
            setImagePrompt(post.image_prompt || "");
            setStatus(post.status);
            setRelatedProvider(post.related_provider_name || "");
            setCoverImageUrl(post.cover_image_url || "");
            setSocialTw(post.social_tw_text || "");
            setSocialFb(post.social_fb_text || "");
            setSocialLi(post.social_li_text || "");
            setSocialTags(post.social_hashtags?.join(" ") || "");
            editor?.commands.setContent(post.content);
        }
    }, [post, editor]);

    const wordCount = editor?.getText()?.split(/\s+/).filter(Boolean).length || 0;
    const charCount = editor?.getText()?.length || 0;

    useEffect(() => {
        if (!post && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
        }
    }, [title, post]);

    const handleInsertAffiliate = (link: AffiliateLink) => {
        if (!editor) return;
        editor
            .chain()
            .focus()
            .insertContent(`<a href="${link.affiliate_link}" target="_blank" rel="noopener noreferrer">${link.provider_name}</a> `)
            .run();
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/posts/upload-image", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            setCoverImageUrl(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleEditorImageUpload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/posts/upload-image", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) handleImageUpload(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };

    const handleSave = async (publish = false) => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        setError(null);
        setSaving(true);

        if (publish) {
            setShowPublishModal(true);
            setPublishStatus('loading');
            setPublishError(undefined);
        }

        try {
            const savedPost = await onSave({
                id: post?.id,
                title,
                slug,
                content: editor?.getHTML() || "",
                excerpt,
                category: category || null,
                status: publish ? 'published' : (status || 'draft'),
                seo_title: seoTitle || title,
                seo_description: seoDesc || excerpt,
                target_keywords: keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean) : null,
                related_provider_name: relatedProvider || null,
                image_prompt: imagePrompt || null,
                cover_image_url: coverImageUrl || null,
                social_tw_text: socialTw || null,
                social_fb_text: socialFb || null,
                social_li_text: socialLi || null,
                social_hashtags: socialTags ? socialTags.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : null,
            });

            // Auto-append URL to Twitter if missing and publishing
            const livePostUrl = `https://hostingsarena.com/news/${slug}`;
            let finalSocialTw = socialTw;
            if (publish && finalSocialTw && !finalSocialTw.includes('hostingsarena.com/news/')) {
                finalSocialTw = `${finalSocialTw}\n\n${livePostUrl}`;
                // We update the local state too so it shows in the editor and is saved
                setSocialTw(finalSocialTw);
                // We need to re-save if we updated the text to ensure the webhook gets the latest
                await onSave({ id: post?.id || (savedPost as any)?.post?.id, social_tw_text: finalSocialTw });
            }

            // If it was a new post, onSave should return the data with the new ID
            // The API returns { post: data }
            const postId = (savedPost as any)?.post?.id || post?.id;

            if (publish && postId) {
                // Trigger Google Indexing
                try {
                    await fetch("/api/admin/posts/index-google", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: `https://hostingsarena.com/news/${slug}` })
                    });
                } catch (idxErr) {
                    console.error("Google Indexing trigger failed:", idxErr);
                    // We don't fail the whole publish for indexing, as the post is already live
                }

                setPublishStatus('success');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
            if (publish) {
                setPublishStatus('error');
                setPublishError(err instanceof Error ? err.message : "Distribution failed");
            }
        } finally {
            setSaving(false);
        }
    };


    const INPUT_CLASS = "w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 placeholder:text-muted-foreground/50";

    const categories = [
        "Security", "Performance", "Privacy", "Pricing",
        "Technology", "Hosting Market", "VPN News", "Industry",
        "Guide", "Comparison",
    ];

    const sectionTabs = [
        { key: "content" as const, icon: <Type className="w-3.5 h-3.5" />, label: "Content" },
        { key: "seo" as const, icon: <Search className="w-3.5 h-3.5" />, label: "SEO" },
        { key: "social" as const, icon: <Share2 className="w-3.5 h-3.5" />, label: "Social" },
        { key: "image" as const, icon: <ImageIcon className="w-3.5 h-3.5" />, label: "Image" },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-md" onClick={onClose}>
            {/* Near-fullscreen modal with padding */}
            <div
                className="absolute inset-3 md:inset-6 rounded-3xl border border-[color:var(--glass-border)] bg-card shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Premium Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/15 shadow-lg shadow-primary/10">
                            <Edit3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{post ? "Edit Post" : "New Post"}</h2>
                            <div className="flex items-center gap-3 mt-0.5">
                                {post?.is_ai_generated && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/15">🤖 AI Generated</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    {wordCount} words · {charCount} chars
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Status Toggle */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/50 border border-border">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">Status</span>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="draft">📝 Draft</option>
                                <option value="published">✅ Published</option>
                            </select>
                        </div>
                        {/* Save */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleSave()}
                                className="rounded-2xl bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm text-sm font-semibold px-4 transition-all duration-200"
                                disabled={saving || !title.trim()}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" /> Save Draft</>}
                            </Button>

                            <Button
                                onClick={() => handleSave(true)}
                                className="rounded-2xl bg-gradient-to-r from-primary to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-lg shadow-primary/25 text-sm font-semibold px-6 transition-all duration-200 hover:scale-105"
                                disabled={saving || !title.trim()}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1.5" /> Publish & Share</>}
                            </Button>
                        </div>
                        {/* Close */}
                        <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-muted/50 transition-all duration-200 group">
                            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
                    {/* Left Panel — Editor */}
                    <div className="flex flex-col overflow-hidden border-r border-border/50">
                        {/* Title Area */}
                        <div className="px-8 pt-6 pb-4 border-b border-border/50">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Your article title..."
                                className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/20 tracking-tight"
                            />
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">Slug</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-muted-foreground"
                                    placeholder="auto-generated-slug"
                                />
                            </div>
                        </div>

                        {/* Section Tabs */}
                        <div className="flex px-5 border-b border-border/50 bg-muted/20">
                            {sectionTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveSection(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeSection === tab.key
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        {activeSection === "content" && (
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <EditorToolbar
                                    editor={editor}
                                    affiliateLinks={affiliateLinks}
                                    onInsertAffiliate={handleInsertAffiliate}
                                    onInsertImage={handleEditorImageUpload}
                                />
                                <div className="flex-1 overflow-y-auto">
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        )}

                        {activeSection === "seo" && (
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
                                    <p className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                                        <Search className="w-3.5 h-3.5" /> SEO Preview
                                    </p>
                                    <p className="text-sm font-semibold text-blue-300 mt-2 line-clamp-1">{seoTitle || title || "Page Title"}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{seoDesc || excerpt || "Meta description will appear here..."}</p>
                                    <p className="text-[10px] text-emerald-400 mt-1 font-mono">hostingsarena.com/news/{slug || "slug"}</p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">SEO Title</label>
                                    <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO-optimized title" className={INPUT_CLASS} maxLength={60} />
                                    <div className="flex justify-between mt-1.5">
                                        <p className="text-[10px] text-muted-foreground">Recommended: 50-60 characters</p>
                                        <p className={`text-[10px] font-mono ${seoTitle.length > 60 ? "text-red-400" : seoTitle.length > 50 ? "text-emerald-400" : "text-muted-foreground"}`}>{seoTitle.length}/60</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Meta Description</label>
                                    <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Compelling description for search results" className={`${INPUT_CLASS} h-24 resize-none`} maxLength={155} />
                                    <div className="flex justify-between mt-1.5">
                                        <p className="text-[10px] text-muted-foreground">Recommended: 120-155 characters</p>
                                        <p className={`text-[10px] font-mono ${seoDesc.length > 155 ? "text-red-400" : seoDesc.length > 120 ? "text-emerald-400" : "text-muted-foreground"}`}>{seoDesc.length}/155</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Target Keywords</label>
                                    <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" className={INPUT_CLASS} />
                                    {keywords && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {keywords.split(",").map((k, i) => k.trim() && (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/15">
                                                    {k.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === "social" && (
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Twitter / X */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-foreground" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                            Twitter Post
                                        </label>
                                        <span className={`text-[10px] font-mono ${socialTw.length > 280 ? "text-red-400" : "text-muted-foreground"}`}>{socialTw.length}/280</span>
                                    </div>

                                    {/* Preview Card */}
                                    <div className="p-4 rounded-xl border border-border/50 bg-card max-w-md mx-auto shadow-sm">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0" />
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold">HostingArena</span>
                                                    <span className="text-xs text-muted-foreground">@hostingarena · 1m</span>
                                                </div>
                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{socialTw || "Write something amazing..."} {socialTags}</p>
                                                {coverImageUrl && (
                                                    <div className="mt-2 rounded-xl overflow-hidden border border-border/50">
                                                        <img src={coverImageUrl} alt="Preview" className="w-full aspect-video object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <textarea
                                        value={socialTw}
                                        onChange={(e) => setSocialTw(e.target.value)}
                                        placeholder="What's happening?"
                                        className={`${INPUT_CLASS} h-24 resize-none font-medium`}
                                    />
                                </div>

                                <div className="h-px bg-border/50" />

                                {/* Facebook */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#1877F2]" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        Facebook Post
                                    </label>

                                    {/* Preview Card */}
                                    <div className="p-4 rounded-xl border border-border/50 bg-card max-w-md mx-auto shadow-sm">
                                        <div className="flex gap-2 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-blue-600">HostingsArena</p>
                                                <p className="text-xs text-muted-foreground">Just now · 🌍</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">{socialFb || "What's on your mind? Share this with your friends..."}</p>
                                        {coverImageUrl && (
                                            <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                                                <img src={coverImageUrl} alt="Preview" className="w-full aspect-video object-cover" />
                                                <div className="p-3 bg-muted/30 border-t border-border/50">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">HOSTINGSARENA.COM</p>
                                                    <p className="text-sm font-bold text-foreground mt-1">{title || "Article Title"}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{seoDesc || excerpt || "Read the full article..."}</p>
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-sm text-blue-500 font-medium whitespace-pre-wrap mt-3">{socialTags}</p>
                                    </div>

                                    <textarea
                                        value={socialFb}
                                        onChange={(e) => setSocialFb(e.target.value)}
                                        placeholder="What's on your mind?"
                                        className={`${INPUT_CLASS} h-32 resize-none`}
                                    />
                                </div>

                                <div className="h-px bg-border/50" />

                                {/* LinkedIn */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0077b5]" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        LinkedIn Post
                                    </label>

                                    {/* Preview Card */}
                                    <div className="p-4 rounded-xl border border-border/50 bg-card max-w-md mx-auto shadow-sm">
                                        <div className="flex gap-2 mb-3">
                                            <div className="w-10 h-10 rounded-sm bg-primary/10 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold">HostingsArena</p>
                                                <p className="text-xs text-muted-foreground">redefining verified benchmarks.</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">{socialLi || "Share your professional insights..."}</p>
                                        <p className="text-sm text-blue-500 font-medium whitespace-pre-wrap mb-3">{socialTags}</p>
                                        {coverImageUrl && (
                                            <div className="rounded-sm overflow-hidden border border-border/50 bg-muted/20">
                                                <img src={coverImageUrl} alt="Preview" className="w-full aspect-video object-cover" />
                                                <div className="p-2 bg-muted/30">
                                                    <p className="text-xs font-semibold">{seoTitle || title || "Article Title"}</p>
                                                    <p className="text-[10px] text-muted-foreground">hostingarena.com</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <textarea
                                        value={socialLi}
                                        onChange={(e) => setSocialLi(e.target.value)}
                                        placeholder="Share your insights..."
                                        className={`${INPUT_CLASS} h-32 resize-none`}
                                    />
                                </div>

                                <div className="h-px bg-border/50" />

                                {/* Hashtags */}
                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Hashtags</label>
                                    <input
                                        type="text"
                                        value={socialTags}
                                        onChange={(e) => setSocialTags(e.target.value)}
                                        placeholder="#webhosting #tech #review"
                                        className={INPUT_CLASS}
                                    />
                                    {socialTags && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {socialTags.split(" ").map((t, i) => t.trim() && (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium border border-blue-500/15">
                                                    {t.startsWith("#") ? t : `#${t}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === "image" && (
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {/* Upload Zone */}
                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Cover Image</label>
                                    {coverImageUrl ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-border group">
                                            <img
                                                src={coverImageUrl}
                                                alt="Cover"
                                                className="w-full aspect-video object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                                                <label className="px-4 py-2 rounded-xl bg-muted backdrop-blur-sm text-sm font-medium cursor-pointer hover:bg-accent transition-colors flex items-center gap-2">
                                                    <Upload className="w-4 h-4" /> Replace
                                                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverImageUrl("")}
                                                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed aspect-video cursor-pointer transition-all duration-300 ${dragOver
                                                ? "border-primary bg-primary/10 scale-[1.01]"
                                                : "border-border bg-muted/30 hover:border-border hover:bg-muted/50"
                                                }`}
                                        >
                                            {uploading ? (
                                                <div className="text-center">
                                                    <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                                                    <p className="text-sm text-muted-foreground">Uploading...</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="p-4 rounded-2xl bg-muted/50 mb-4 inline-block">
                                                        <Upload className="w-8 h-8 text-muted-foreground/40" />
                                                    </div>
                                                    <p className="text-sm font-medium mb-1">Drop image here or click to upload</p>
                                                    <p className="text-xs text-muted-foreground/50">JPEG, PNG, WebP, GIF · Max 5MB</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                {/* AI Image Prompt */}
                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">AI Image Prompt</label>
                                    <textarea
                                        value={imagePrompt}
                                        onChange={(e) => setImagePrompt(e.target.value)}
                                        placeholder="Describe the ideal image — used as placeholder text and for future AI image generation"
                                        className={`${INPUT_CLASS} h-24 resize-none`}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1.5">AI uses this to generate descriptions. Shows as placeholder when no image is uploaded.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div className="flex flex-col overflow-y-auto bg-muted/20">
                        <div className="p-6 space-y-6">
                            {/* Excerpt */}
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Excerpt</label>
                                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary that appears in post cards and social sharing..." className={`${INPUT_CLASS} h-24 resize-none`} />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLASS}>
                                    <option value="">Select category...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Related Provider */}
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Related Provider</label>
                                <input type="text" value={relatedProvider} onChange={(e) => setRelatedProvider(e.target.value)} placeholder="e.g. NordVPN, Hostinger" className={INPUT_CLASS} />
                                <p className="text-[10px] text-muted-foreground mt-1.5">Links to affiliate partner for "Check Deal" button</p>
                            </div>

                            {/* AI Quality Bar */}
                            {post?.is_ai_generated && post?.ai_quality_score && (
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">AI Quality Score</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500 transition-all duration-500"
                                                style={{ width: `${post.ai_quality_score}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-primary tabular-nums">{post.ai_quality_score}</span>
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-center">
                                    <p className="text-lg font-bold tabular-nums">{wordCount}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mt-0.5">Words</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-center">
                                    <p className="text-lg font-bold tabular-nums">{Math.max(1, Math.ceil(wordCount / 200))}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mt-0.5">Min Read</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                    <span className="text-lg">⚠️</span> {error}
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-auto p-6 border-t border-border/50">
                            <Button variant="outline" onClick={onClose} className="w-full rounded-2xl text-sm h-10" disabled={saving}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <PublishSummaryModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                status={publishStatus}
                postUrl={`https://hostingsarena.com/news/${slug}`}
                socialContent={{
                    twitter: socialTw || "",
                    facebook: socialFb || "",
                    linkedin: socialLi || "",
                    hashtags: socialTags ? socialTags.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : undefined
                }}
                errorDetails={publishError}
            />
        </div>
    );
}

function GenerationConfigModal({
    affiliateLinks,
    onGenerate,
    onClose,
    loading
}: {
    affiliateLinks: AffiliateLink[];
    onGenerate: (config: any) => void;
    onClose: () => void;
    loading: boolean;
}) {
    const [category, setCategory] = useState("Hosting Reviews");
    const [customCategory, setCustomCategory] = useState("");
    const [provider, setProvider] = useState("random");
    const [customProvider, setCustomProvider] = useState("");
    const [scenario, setScenario] = useState("random");
    const [customScenario, setCustomScenario] = useState("");
    const [model, setModel] = useState("gpt-4o-mini");
    const [wordCount, setWordCount] = useState("1500");
    const [instructions, setInstructions] = useState("");

    const INPUT_CLASS = "w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200";

    const handleRun = () => {
        onGenerate({
            category: category === "custom" ? customCategory : category,
            provider_name: provider === "custom" ? customProvider : (provider === "random" ? undefined : provider),
            scenario: scenario === "custom" ? customScenario : (scenario === "random" ? undefined : scenario),
            model: model,
            target_word_count: parseInt(wordCount),
            extra_instructions: instructions
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="w-full max-w-lg rounded-3xl border border-[color:var(--glass-border)] bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg">AI Command Center</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLASS}>
                            <option value="Hosting Reviews">Hosting Reviews</option>
                            <option value="VPN Reviews">VPN Reviews</option>
                            <option value="comparisons">Comparisons</option>
                            <option value="guides">Guides</option>
                            <option value="custom">✨ Custom Category</option>
                        </select>
                        {category === "custom" && (
                            <input
                                type="text"
                                placeholder="e.g. Cloud Gaming, DevOps Tools"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                className={`mt-2 ${INPUT_CLASS}`}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Provider */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Provider</label>
                            <select value={provider} onChange={(e) => setProvider(e.target.value)} className={INPUT_CLASS}>
                                <option value="random">🎲 Random Affiliate</option>
                                {affiliateLinks.map(a => (
                                    <option key={a.id} value={a.provider_name}>{a.provider_name}</option>
                                ))}
                                <option value="custom">✍️ Custom Name</option>
                            </select>
                            {provider === "custom" && (
                                <input
                                    type="text"
                                    placeholder="e.g. AWS, Vultr"
                                    value={customProvider}
                                    onChange={(e) => setCustomProvider(e.target.value)}
                                    className={`mt-2 ${INPUT_CLASS}`}
                                />
                            )}
                        </div>

                        {/* Scenario */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Target Persona</label>
                            <select value={scenario} onChange={(e) => setScenario(e.target.value)} className={INPUT_CLASS}>
                                <option value="random">🎲 Random Persona</option>
                                <option value="High-Traffic E-commerce Business">🛍️ E-commerce</option>
                                <option value="Privacy-First Journalist">🕵️ Privacy Journalist</option>
                                <option value="Budget-Conscious Startup">💸 Budget Startup</option>
                                <option value="Full-Stack Developer">👨‍💻 Developer</option>
                                <option value="custom">✨ Custom Persona</option>
                            </select>
                            {scenario === "custom" && (
                                <input
                                    type="text"
                                    placeholder="e.g. Minecraft Server Admin"
                                    value={customScenario}
                                    onChange={(e) => setCustomScenario(e.target.value)}
                                    className={`mt-2 ${INPUT_CLASS}`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Model & Length */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">AI Model</label>
                            <select value={model} onChange={(e) => setModel(e.target.value)} className={INPUT_CLASS}>
                                <option value="gpt-4o-mini">⚡ GPT-4o Mini (Fast & Cheap)</option>
                                <option value="gpt-4o">🧠 GPT-4o (High Quality)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Article Length</label>
                            <select value={wordCount} onChange={(e) => setWordCount(e.target.value)} className={INPUT_CLASS}>
                                <option value="800">Short (~800 words)</option>
                                <option value="1500">Standard (~1500 words)</option>
                                <option value="2500">Deep Dive (~2500+ words)</option>
                            </select>
                        </div>
                    </div>

                    {/* Extra Instructions */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Extra Instructions (Optional)</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="e.g. 'Focus heavily on the lack of backups' or 'Write in a very sarcastic tone'"
                            className={`${INPUT_CLASS} h-24 resize-none`}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-border/50 bg-muted/20 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
                    <Button
                        onClick={handleRun}
                        disabled={loading}
                        className="rounded-xl bg-gradient-to-r from-primary to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate Post
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function PostEditor({ onNavigateToAffiliates }: { onNavigateToAffiliates?: () => void }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [editingPost, setEditingPost] = useState<Post | null | "new">(null);
    const [generating, setGenerating] = useState(false);
    const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Generation Progress State
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState("");
    const [showProgressOverlay, setShowProgressOverlay] = useState(false);
    const [showGenModal, setShowGenModal] = useState(false);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '12' });
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
            if (search) params.set('search', search);

            const res = await fetch(`/api/admin/posts?${params}`);
            const data = await res.json();
            setPosts(data.posts || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error("Failed to fetch posts:", e);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    const fetchAffiliateLinks = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/affiliates?status=active');
            const data = await res.json();
            setAffiliateLinks(
                (data.affiliates || [])
                    .filter((a: AffiliateLink) => a.status === 'active')
                    .map((a: any) => ({
                        id: a.id,
                        provider_name: a.provider_name,
                        affiliate_link: a.affiliate_link,
                        status: a.status,
                    }))
            );
        } catch (e) {
            console.error("Failed to fetch affiliates:", e);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);
    useEffect(() => { fetchAffiliateLinks(); }, [fetchAffiliateLinks]);

    const handleSavePost = async (data: Partial<Post>) => {
        const method = data.id ? "PATCH" : "POST";
        const res = await fetch("/api/admin/posts", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to save");
        // We no longer close the modal here to allow the user to see the publish summary or continue editing
        fetchPosts();
        return result;
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this post permanently?")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            fetchPosts();
        } catch (e) {
            console.error("Delete error:", e);
        } finally {
            setDeletingId(null);
        }
    };

    const handleGenerate = async (config: any) => {
        setShowGenModal(false);
        setGenerating(true);
        setGenerationProgress(0);
        setShowProgressOverlay(true);

        const totalToGenerate = 1;
        let successCount = 0;

        for (let i = 0; i < totalToGenerate; i++) {
            setGenerationStatus(`Initializing AI Agent (${config.model || 'gpt-4o-mini'})...`);

            try {
                const response = await fetch("/api/admin/posts/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        count: 1,
                        provider_name: config.provider_name,
                        scenario: config.scenario,
                        custom_category: config.category,
                        model: config.model,
                        target_word_count: config.target_word_count,
                        extra_instructions: config.extra_instructions
                    }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "Connection failed");
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No reader available");

                const decoder = new TextDecoder();
                let partialBuffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    partialBuffer += chunk;

                    const lines = partialBuffer.split("\n\n");
                    partialBuffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.error) throw new Error(data.error);

                                if (data.status) {
                                    setGenerationStatus(data.status);
                                }

                                const currentPostProgress = (data.progress || 0) / 100;
                                const globalProgress = Math.round(((i + currentPostProgress) / totalToGenerate) * 100);
                                setGenerationProgress(globalProgress);

                            } catch (e) {
                                console.error("Error parsing progress chunk", e);
                            }
                        }
                    }
                }
                successCount++;
            } catch (e: any) {
                console.error(`Post ${i + 1} failed:`, e);
                setGenerationStatus(`Error: ${e.message}`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        setShowProgressOverlay(false);
        setGenerating(false);
        fetchPosts();

        if (successCount < totalToGenerate) {
            // Optional: alert(`Completed ${successCount} of ${totalToGenerate} posts.`);
        }
    };

    const totalPages = Math.ceil(total / 12);

    return (
        <div className="space-y-6">
            {/* Warning Banner for No Affiliates */}
            {affiliateLinks.length === 0 && !loading && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-amber-500">AI Generation Locked</h3>
                            <p className="text-xs text-muted-foreground">You need at least one active affiliate partner to generate content.</p>
                        </div>
                    </div>
                    {onNavigateToAffiliates && (
                        <Button
                            size="sm"
                            onClick={onNavigateToAffiliates}
                            className="whitespace-nowrap bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20"
                        >
                            Configure Affiliates
                        </Button>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search posts..."
                            className="pl-9 pr-4 py-2 w-64 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">📝 Draft</option>
                        <option value="published">✅ Published</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                    <Button
                        size="sm"
                        onClick={() => setShowGenModal(true)}
                        disabled={generating || affiliateLinks.length === 0}
                        title={affiliateLinks.length === 0 ? "Add affiliates to enable generation" : "Open AI Command Center"}
                        className={`rounded-xl shadow-lg gap-1 transition-all ${affiliateLinks.length === 0
                            ? "bg-muted text-muted-foreground shadow-none cursor-not-allowed"
                            : "bg-gradient-to-r from-primary to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-primary/25"
                            }`}
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Post
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setEditingPost("new")}
                        disabled={affiliateLinks.length === 0}
                        title={affiliateLinks.length === 0 ? "Add affiliates to enable creation" : "New Post"}
                        className={`rounded-xl shadow-lg gap-1 transition-all ${affiliateLinks.length === 0
                            ? "bg-muted text-muted-foreground shadow-none cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25"
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        New Post
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex gap-3 text-xs">
                <span className="bg-muted/50 px-3 py-1.5 rounded-lg text-muted-foreground">{total} total posts</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                    {posts.filter(p => p.status === "published").length} published on this page
                </span>
                <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/10">
                    {affiliateLinks.length} active affiliates
                </span>
            </div>

            {/* Post Grid */}
            {loading ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading posts...
                </div>
            ) : posts.length === 0 ? (
                <GlassCard className="p-16 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-lg font-semibold mb-2">No posts yet</p>
                    <p className="text-sm text-muted-foreground mb-6">Generate AI articles or create one manually.</p>
                    <Button
                        onClick={() => setShowGenModal(true)}
                        disabled={generating || affiliateLinks.length === 0}
                        className={`rounded-xl gap-1 transition-all ${affiliateLinks.length === 0
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-gradient-to-r from-primary to-sky-600"
                            }`}
                    >
                        <Sparkles className="w-4 h-4" /> Generate Post
                    </Button>
                </GlassCard>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {posts.map(post => (
                            <GlassCard key={post.id} className="flex flex-col hover:scale-[1.01] transition-transform">
                                {/* Image Placeholder */}
                                <div className="bg-gray-500/10 h-36 rounded-t-xl flex items-center justify-center p-4 relative overflow-hidden border-b border-border/50">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-500/10 to-transparent" />
                                    <div className="text-center relative z-10">
                                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-muted-foreground/30" />
                                        <p className="text-[10px] text-muted-foreground/40 line-clamp-2">
                                            {post.image_prompt || "No image description"}
                                        </p>
                                    </div>
                                    <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${post.status === "published"
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                        : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                                        }`}>
                                        {post.status === "published" ? "Published" : "Draft"}
                                    </span>
                                    {post.is_ai_generated && (
                                        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
                                            🤖 AI
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        {post.category && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary flex items-center gap-1">
                                                <Tag className="w-2.5 h-2.5" /> {post.category}
                                            </span>
                                        )}
                                        {post.related_provider_name && (
                                            <span className="text-[10px] text-muted-foreground">{post.related_provider_name}</span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-sm mb-2 line-clamp-2 leading-tight">{post.title}</h3>
                                    {post.excerpt && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date'}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingPost(post)}
                                                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                disabled={deletingId === post.id}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400 disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deletingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-xl"
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-xl"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Progress Overlay */}
            {showProgressOverlay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <GlassCard className="w-full max-w-md p-8 shadow-2xl border-primary/20 bg-card/80">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                <div className="relative p-4 rounded-full bg-primary/10 border border-primary/20">
                                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight">AI Newsroom Working</h3>
                                <p className="text-sm text-muted-foreground min-h-[40px] px-4">
                                    {generationStatus}
                                </p>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    <span className="animate-pulse">Generating Mega-Guides</span>
                                    <span>{generationProgress}%</span>
                                </div>
                                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary via-sky-500 to-blue-600 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${generationProgress}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground/40 italic">
                                    This takes ~3 minutes per post for deep research.
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Generation Config Modal */}
            {showGenModal && (
                <GenerationConfigModal
                    affiliateLinks={affiliateLinks}
                    onGenerate={handleGenerate}
                    onClose={() => setShowGenModal(false)}
                    loading={generating}
                />
            )}

            {/* Editor Modal */}
            {editingPost !== null && (
                <PostEditorModal
                    post={editingPost === "new" ? null : editingPost}
                    affiliateLinks={affiliateLinks}
                    onSave={handleSavePost}
                    onClose={() => setEditingPost(null)}
                />
            )}
        </div>
    );
}
