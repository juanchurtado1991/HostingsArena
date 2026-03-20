"use client";

import React, { useState, useEffect, useCallback, useRef, FormEvent, ChangeEvent } from "react";
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
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
import { formatCurrency, cn } from "@/lib/utils";
import { getCategoryColorClasses } from "@/lib/news-utils";
import { Button } from "@/components/ui/button";
import { PublishSummaryModal } from "./PublishSummaryModal";
import {
    Search, Plus, Loader2, Edit3, Trash2,
    Sparkles,
    FileText, CheckCircle, Clock, Tag, X,
    ChevronDown, ExternalLink, ImageIcon, Type, Undo2, Redo2, AlertTriangle, Share2,
    Globe
} from "lucide-react";
import { PostEditorSEO } from "./post-editor/PostEditorSEO";
import { PostEditorSocial } from "./post-editor/PostEditorSocial";
import { PostEditorMedia } from "./post-editor/PostEditorMedia";
import { PostEditorHeader } from "./post-editor/PostEditorHeader";
import { PostEditorContent } from "./post-editor/PostEditorContent";
import { GenerationConfigModal } from "./post-editor/GenerationConfigModal";


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
    title_es?: string | null;
    content_es?: string | null;
    excerpt_es?: string | null;
    seo_title_es?: string | null;
    seo_description_es?: string | null;
    social_tw_text_es?: string | null;
    social_fb_text_es?: string | null;
    social_li_text_es?: string | null;
    social_hashtags_es?: string[] | null;
    target_keywords_es?: string[] | null;
}

interface AffiliateLink {
    id: string;
    provider_name: string;
    affiliate_link: string;
    status: string;
}

const ResizableImage = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const imgRef = useRef<HTMLImageElement>(null);
    const [resizing, setResizing] = useState(false);

    const { align = 'center', width = '100%' } = node.attrs;

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setResizing(true);

        const startX = e.clientX;
        const startWidth = imgRef.current?.width || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentX = moveEvent.clientX;
            const diffX = currentX - startX;
            const newWidth = Math.max(50, startWidth + diffX);
            updateAttributes({ width: `${newWidth}px` });
        };

        const onMouseUp = () => {
            setResizing(false);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const containerStyle: React.CSSProperties = {
        width: width,
        float: align === 'left' ? 'left' : align === 'right' ? 'right' : 'none',
        margin: align === 'left' ? '0 1rem 0.5rem 0' : align === 'right' ? '0 0 0.5rem 1rem' : '1.5rem auto',
        display: align === 'center' ? 'block' : 'inline-block',
        clear: align === 'center' ? 'both' : 'none',
    };

    return (
        <NodeViewWrapper style={containerStyle} className="relative leading-none transition-all group">
            <img
                ref={imgRef}
                src={node.attrs.src}
                alt={node.attrs.alt}
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    cursor: resizing ? 'nwse-resize' : 'default',
                }}
                className={`rounded-lg transition-shadow ${selected ? 'ring-2 ring-primary shadow-xl' : 'shadow-sm'}`}
            />
            {selected && (
                <div
                    onMouseDown={onMouseDown}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full cursor-nwse-resize border-2 border-white shadow-lg z-10 hover:scale-125 transition-transform"
                    title="Drag to resize"
                />
            )}
        </NodeViewWrapper>
    );
};

const FontSize = Extension.create({
    name: 'fontSize',
    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run()
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run()
            },
        }
    },
})


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
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const lastSavedSnapshotRef = useRef<string>("");
    const editLangRef = useRef<'en' | 'es'>(post ? 'en' : 'en'); 
    const isSwappingLangRef = useRef(false); 
    const [scheduledDate, setScheduledDate] = useState<string>("");

    useEffect(() => {
        if (post?.published_at) {
            const d = new Date(post.published_at);
            const svTime = new Date(d.getTime() - 6 * 60 * 60 * 1000);
            setScheduledDate(svTime.toISOString().slice(0, 16));
        } else {
            const d = new Date();
            const svTime = new Date(d.getTime() - 6 * 60 * 60 * 1000);
            setScheduledDate(svTime.toISOString().slice(0, 16));
        }
    }, [post]);

    const getUtcPublishDate = () => {
        if (!scheduledDate) return new Date().toISOString();
        const dateObj = new Date(`${scheduledDate}:00-06:00`);
        return dateObj.toISOString();
    };

    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<"content" | "seo" | "social" | "image">("content");
    const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || "");
    const [socialTw, setSocialTw] = useState(post?.social_tw_text || "");
    const [socialFb, setSocialFb] = useState(post?.social_fb_text || "");
    const [socialLi, setSocialLi] = useState(post?.social_li_text || "");
    const [socialTags, setSocialTags] = useState(post?.social_hashtags?.join(" ") || "");
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [tick, setTick] = useState(0); 
    const [editLang, setEditLang] = useState<'en' | 'es'>('en');
    const [isTranslating, setIsTranslating] = useState(false);
    const [contentEn, setContentEn] = useState(post?.content || "");
    const [titleEs, setTitleEs] = useState(post?.title_es || "");
    const [contentEs, setContentEs] = useState(post?.content_es || "");
    const [excerptEs, setExcerptEs] = useState(post?.excerpt_es || "");
    const [seoTitleEs, setSeoTitleEs] = useState(post?.seo_title_es || "");
    const [seoDescEs, setSeoDescEs] = useState(post?.seo_description_es || "");
    const [socialTwEs, setSocialTwEs] = useState(post?.social_tw_text_es || "");
    const [socialFbEs, setSocialFbEs] = useState(post?.social_fb_text_es || "");
    const [socialLiEs, setSocialLiEs] = useState(post?.social_li_text_es || "");
    const [socialTagsEs, setSocialTagsEs] = useState(post?.social_hashtags_es?.join(" ") || "");
    const [keywordsEs, setKeywordsEs] = useState(post?.target_keywords_es?.join(", ") || "");

    const handleLangSwitch = (targetLang: 'en' | 'es') => {
        if (targetLang === editLang || isSwappingLangRef.current) return;

        isSwappingLangRef.current = true;
        editLangRef.current = targetLang;
        
        if (editor) {
            const currentHTML = editor.getHTML();
            if (editLang === 'en') {
                setContentEn(currentHTML);
            } else {
                setContentEs(currentHTML);
            }

            const nextHTML = targetLang === 'en' ? contentEn : contentEs;
            if (editor.getHTML() !== nextHTML) {
                editor.commands.setContent(nextHTML);
            }
        }

        setEditLang(targetLang);
        setTimeout(() => {
            isSwappingLangRef.current = false;
        }, 100);
    };

    const handleTranslate = async (manual = true) => {
        if (isTranslating) return null;
        try {
            setIsTranslating(true);
            setError(null);
            const currentHTML = editor?.getHTML() || "";
            let enContent = contentEn;
            if (editLang === 'en') enContent = currentHTML;

            const res = await fetch('/api/admin/posts/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: enContent,
                    excerpt,
                    seo_title: seoTitle,
                    seo_description: seoDesc,
                    social_tw_text: socialTw,
                    social_fb_text: socialFb,
                    social_li_text: socialLi,
                    social_hashtags: socialTags ? socialTags.split(" ") : [],
                    from: 'en',
                    to: 'es'
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Translation failed');

            const { translated } = data;
            setTitleEs(translated.title);
            setContentEs(translated.content);
            setExcerptEs(translated.excerpt);
            setSeoTitleEs(translated.seo_title);
            setSeoDescEs(translated.seo_description);

            setSocialTwEs(translated.social_tw_text || "");
            setSocialFbEs(translated.social_fb_text || "");
            setSocialLiEs(translated.social_li_text || "");
            if (translated.social_hashtags) {
                setSocialTagsEs(Array.isArray(translated.social_hashtags) ? translated.social_hashtags.join(" ") : translated.social_hashtags);
            }
            if (translated.target_keywords) {
                setKeywordsEs(Array.isArray(translated.target_keywords) ? translated.target_keywords.join(", ") : translated.target_keywords);
            }

            if (editLang === 'es') {
                editor?.commands.setContent(translated.content);
            }
            return translated;
        } catch (err: any) {
            console.error("Translation error:", err);
            setError(err.message);
            return null;
        } finally {
            setIsTranslating(false);
        }
    };

    const handleGenerateSocial = async () => {
        if (isTranslating) return;
        try {
            setIsTranslating(true); 
            setError(null);

            const contentToSend = editLang === 'en'
                ? (editor?.getHTML() || contentEn)
                : (contentEs || editor?.getHTML() || "");

            const titleToSend = editLang === 'en' ? title : titleEs;

            const res = await fetch('/api/admin/posts/generate-social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: contentToSend,
                    title: titleToSend,
                    language: editLang,
                    platform: 'all'
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Generation failed');

            const { generated } = data;

            if (editLang === 'en') {
                setSocialTw(generated.twitter || "");
                setSocialFb(generated.facebook || "");
                setSocialLi(generated.linkedin || "");
                if (generated.hashtags) {
                    setSocialTags(Array.isArray(generated.hashtags) ? generated.hashtags.join(" ") : generated.hashtags);
                }
            } else {
                setSocialTwEs(generated.twitter || "");
                setSocialFbEs(generated.facebook || "");
                setSocialLiEs(generated.linkedin || "");
                if (generated.hashtags) {
                    setSocialTagsEs(Array.isArray(generated.hashtags) ? generated.hashtags.join(" ") : generated.hashtags);
                }
            }

        } catch (err: any) {
            console.error("Social generation error:", err);
            setError(err.message);
        } finally {
            setIsTranslating(false);
        }
    };

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishStatus, setPublishStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [publishError, setPublishError] = useState<string | undefined>(undefined);
    const [indexingStatus, setIndexingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [shouldIndexGoogle, setShouldIndexGoogle] = useState(true); 

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
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        'data-provider': { default: null },
                        'data-affiliate': { default: null },
                    }
                }
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        width: {
                            default: '100%',
                            parseHTML: element => element.getAttribute('width'),
                            renderHTML: attributes => {
                                if (!attributes.width) return {};
                                return {
                                    width: attributes.width,
                                };
                            },
                        },
                        align: {
                            default: 'center',
                            parseHTML: element => element.getAttribute('data-align') || 'center',
                            renderHTML: attributes => ({
                                'data-align': attributes.align,
                                style: `
                                    width: ${attributes.width || '100%'};
                                    float: ${attributes.align === 'left' ? 'left' : attributes.align === 'right' ? 'right' : 'none'};
                                    margin: ${attributes.align === 'left' ? '0 1rem 0.5rem 0' : attributes.align === 'right' ? '0 0 0.5rem 1rem' : '1.5rem auto'};
                                    display: ${attributes.align === 'center' ? 'block' : 'inline-block'};
                                    clear: ${attributes.align === 'center' ? 'both' : 'none'};
                                `,
                            }),
                        },
                        style: { default: null },
                    }
                },
                addNodeView() {
                    return ReactNodeViewRenderer(ResizableImage)
                },
            }),
            FontSize,
            Placeholder.configure({
                placeholder: "Start writing your article here... Use the toolbar above to format text, add headings, or insert affiliate links.",
            }),
        ],
        content: post?.content || "",
        onUpdate: ({ editor }) => {
            if (isSwappingLangRef.current) return;
            
            const html = editor.getHTML();
            if (editLangRef.current === 'en') {
                setContentEn(html);
            } else {
                setContentEs(html);
            }
            setTick(t => t + 1);
        },
        editorProps: {
            attributes: {
                class: "tiptap focus:outline-none min-h-[500px] px-8 py-6",
            },
        },
    }, []);

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
            setTitleEs(post.title_es || "");
            setExcerptEs(post.excerpt_es || "");
            setSeoTitleEs(post.seo_title_es || "");
            setSeoDescEs(post.seo_description_es || "");
            setSocialTwEs(post.social_tw_text_es || "");
            setSocialFbEs(post.social_fb_text_es || "");
            setSocialLiEs(post.social_li_text_es || "");
            setSocialTagsEs(post.social_hashtags_es?.join(" ") || "");
            setKeywordsEs(post.target_keywords_es?.join(", ") || "");

            const initialSnapshot = JSON.stringify({
                title: post.title,
                content: post.content,
                content_es: post.content_es,
                title_es: post.title_es,
                slug: post.slug,
                excerpt: post.excerpt,
                category: post.category,
                seo_title: post.seo_title,
                seo_description: post.seo_description,
                keywords: post.target_keywords?.join(","),
            });
            lastSavedSnapshotRef.current = initialSnapshot;
        }
    }, [post]); 

    useEffect(() => {
        if (post && editor) {
            const contentToSet = editLang === 'en' ? (contentEn || post.content) : (contentEs || post.content_es);
            if (contentToSet && editor.getText().trim() === "" && editor.getHTML() === "<p></p>") {
                editor.commands.setContent(contentToSet);
            }
        }
    }, [editor, post]); 

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
            .insertContent({
                type: 'text',
                text: link.provider_name,
                marks: [
                    {
                        type: 'link',
                        attrs: {
                            href: link.affiliate_link,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                            class: 'affiliate-link text-primary font-semibold',
                            'data-provider': link.provider_name,
                            'data-affiliate': 'true',
                        },
                    },
                ],
            })
            .insertContent(" ") 
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

    const performAutoSave = useCallback(async () => {
        if (!post?.id || !title.trim() || isAutoSaving) return;
        
        const currentHTML = editor?.getHTML() || "";
        const finalContentEn = editLang === 'en' ? currentHTML : contentEn;
        const finalContentEs = editLang === 'es' ? currentHTML : contentEs;

        const currentSnapshot = JSON.stringify({
            title,
            content: finalContentEn,
            content_es: finalContentEs,
            title_es: titleEs,
            slug,
            excerpt,
            category,
            seo_title: seoTitle,
            seo_description: seoDesc,
            keywords: keywords?.split(",").map(k => k.trim()).join(","),
        });

        if (currentSnapshot === lastSavedSnapshotRef.current) {
            return;
        }

        setIsAutoSaving(true);
        try {
            await onSave({
                id: post.id,
                title,
                slug,
                content: finalContentEn,
                excerpt,
                category: category || null,
                status: status || 'draft',
                published_at: post.published_at || null,
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
                title_es: titleEs || null,
                content_es: finalContentEs || null,
                excerpt_es: excerptEs || null,
                seo_title_es: seoTitleEs || null,
                seo_description_es: seoDescEs || null,
                social_tw_text_es: socialTwEs || null,
                social_fb_text_es: socialFbEs || null,
                social_li_text_es: socialLiEs || null,
                social_hashtags_es: socialTagsEs ? socialTagsEs.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : null,
                target_keywords_es: keywordsEs ? keywordsEs.split(",").map(k => k.trim()).filter(Boolean) : null,
            });
            
            lastSavedSnapshotRef.current = currentSnapshot;
            setLastSavedAt(new Date());
        } catch (err) {
            console.error("Auto-save failed:", err);
        } finally {
            setIsAutoSaving(false);
        }
    }, [
        post?.id, post?.published_at, title, slug, contentEn, contentEs, editLang, editor,
        excerpt, category, status, seoTitle, seoDesc, keywords, 
        relatedProvider, imagePrompt, coverImageUrl, 
        socialTw, socialFb, socialLi, socialTags,
        titleEs, excerptEs, seoTitleEs, seoDescEs, 
        socialTwEs, socialFbEs, socialLiEs, socialTagsEs, keywordsEs,
        onSave, isAutoSaving
    ]);

    useEffect(() => {
        if (!post?.id) return;

        const timer = setTimeout(() => {
            performAutoSave();
        }, 1000);

        return () => clearTimeout(timer);
    }, [
        title, slug, contentEn, contentEs, excerpt, category, 
        seoTitle, seoDesc, keywords, relatedProvider, 
        imagePrompt, coverImageUrl, socialTw, socialFb, 
        socialLi, socialTags, titleEs, excerptEs, 
        seoTitleEs, seoDescEs, socialTwEs, socialFbEs, 
        socialLiEs, socialTagsEs, keywordsEs,
        performAutoSave, post?.id
    ]);

    const handleSave = async (publish = false) => {
        if (!title.trim() && editLang === 'en') {
            setError("English Title is required");
            return;
        }
        if (!titleEs.trim() && editLang === 'es') {
            setError("Spanish Title is required");
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
            const currentHTML = editor?.getHTML() || "";
            const finalContentEn = editLang === 'en' ? currentHTML : contentEn;
            let finalContentEs = editLang === 'es' ? currentHTML : contentEs;
            let finalTitleEs = titleEs;
            let finalExcerptEs = excerptEs;
            let finalSeoTitleEs = seoTitleEs;
            let finalSeoDescEs = seoDescEs;
            let finalSocialTwEs = socialTwEs;
            let finalSocialFbEs = socialFbEs;
            let finalSocialLiEs = socialLiEs;
            let finalSocialTagsEs = socialTagsEs;
            let finalKeywordsEs = keywordsEs;

            if (!titleEs.trim() && !finalContentEs.trim() && editLang === 'en') {
                console.log("ES copy missing, auto-translating...");
                const translated = await handleTranslate(false);
                if (translated) {
                    finalTitleEs = translated.title;
                    finalContentEs = translated.content;
                    finalExcerptEs = translated.excerpt;
                    finalSeoTitleEs = translated.seo_title;
                    finalSeoDescEs = translated.seo_description;
                    finalSocialTwEs = translated.social_tw_text;
                    finalSocialFbEs = translated.social_fb_text;
                    finalSocialLiEs = translated.social_li_text;
                    finalSocialTagsEs = Array.isArray(translated.social_hashtags) ? translated.social_hashtags.join(" ") : (translated.social_hashtags || "");
                    finalKeywordsEs = Array.isArray(translated.target_keywords) ? translated.target_keywords.join(", ") : (translated.target_keywords || "");
                    setKeywordsEs(finalKeywordsEs);
                }
            }

            const savedPost = await onSave({
                id: post?.id,
                title,
                slug,
                content: finalContentEn,
                excerpt,
                category: category || null,
                status: publish ? 'published' : (status || 'draft'),
                published_at: publish ? getUtcPublishDate() : (post?.published_at || null),
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
                title_es: finalTitleEs || null,
                content_es: finalContentEs || null,
                excerpt_es: finalExcerptEs || null,
                seo_title_es: finalSeoTitleEs || null,
                seo_description_es: finalSeoDescEs || null,
                social_tw_text_es: finalSocialTwEs || null,
                social_fb_text_es: finalSocialFbEs || null,
                social_li_text_es: finalSocialLiEs || null,
                social_hashtags_es: finalSocialTagsEs ? finalSocialTagsEs.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : null,
                target_keywords_es: finalKeywordsEs ? finalKeywordsEs.split(",").map(k => k.trim()).filter(Boolean) : null,
            });

            const baseUrl = `https://hostingsarena.com`;
            const enLiveUrl = `${baseUrl}/en/news/${slug}`;
            const esLiveUrl = `${baseUrl}/es/news/${slug}`;

            if (publish) {
                const updatedSocials: Partial<Post> = {};

                const fixSocialLink = (text: string | null, liveUrl: string) => {
                    if (!text) return null;
                    const cleaned = text.replace(/https?:\/\/(www\.)?hostingsarena\.com(\/[a-z]{2})?\/news\/[^\s]+(?=\s|$)/g, '').trim();
                    return `${cleaned}\n\n${liveUrl}`;
                };

                const newTwEn = fixSocialLink(socialTw, enLiveUrl);
                const newFbEn = fixSocialLink(socialFb, enLiveUrl);
                const newLiEn = fixSocialLink(socialLi, enLiveUrl);

                if (newTwEn) { setSocialTw(newTwEn); updatedSocials.social_tw_text = newTwEn; }
                if (newFbEn) { setSocialFb(newFbEn); updatedSocials.social_fb_text = newFbEn; }
                if (newLiEn) { setSocialLi(newLiEn); updatedSocials.social_li_text = newLiEn; }

                const newTwEs = fixSocialLink(socialTwEs, esLiveUrl);
                const newFbEs = fixSocialLink(socialFbEs, esLiveUrl);
                const newLiEs = fixSocialLink(socialLiEs, esLiveUrl);

                if (newTwEs) { setSocialTwEs(newTwEs); updatedSocials.social_tw_text_es = newTwEs; }
                if (newFbEs) { setSocialFbEs(newFbEs); updatedSocials.social_fb_text_es = newFbEs; }
                if (newLiEs) { setSocialLiEs(newLiEs); updatedSocials.social_li_text_es = newLiEs; }

                if (Object.keys(updatedSocials).length > 0) {
                    await onSave({
                        id: post?.id || (savedPost as any)?.post?.id,
                        ...updatedSocials
                    });
                }
            }

            const postId = (savedPost as any)?.post?.id || post?.id;

            if (publish && postId) {
                const isScheduledFuture = new Date(getUtcPublishDate()).getTime() > new Date().getTime();

                if (shouldIndexGoogle && !isScheduledFuture) {
                    setIndexingStatus('loading');
                    try {
                        const idxRes = await fetch("/api/admin/posts/index-google", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ url: `https://hostingsarena.com/news/${slug}` })
                        });

                        const idxData = await idxRes.json();

                        if (idxRes.ok && idxData.success) {
                            setIndexingStatus('success');
                        } else {
                            console.error("Google Indexing failed:", idxData.message || idxData.error);
                            setIndexingStatus('error');
                            setPublishError(idxData.message || idxData.error);
                        }
                    } catch (idxErr) {
                        console.error("Google Indexing trigger failed:", idxErr);
                        setIndexingStatus('error');
                    }
                } else {
                    setIndexingStatus('idle');
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
            <div
                className="absolute inset-3 md:inset-6 rounded-3xl border border-[color:var(--glass-border)] bg-card shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <PostEditorHeader 
                    post={post}
                    status={status}
                    setStatus={setStatus}
                    scheduledDate={scheduledDate}
                    setScheduledDate={setScheduledDate}
                    shouldIndexGoogle={shouldIndexGoogle}
                    setShouldIndexGoogle={setShouldIndexGoogle}
                    saving={saving}
                    handleSave={handleSave}
                    onClose={onClose}
                    wordCount={wordCount}
                    lastSavedAt={lastSavedAt}
                    isAutoSaving={isAutoSaving}
                    editLang={editLang}
                    title={title}
                    titleEs={titleEs}
                />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
                    <div className="flex flex-col overflow-hidden border-r border-border/50">
                        <div className="px-4 md:px-8 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-border/50">
                            <input
                                type="text"
                                value={editLang === 'es' ? titleEs : title}
                                onChange={(e) => editLang === 'es' ? setTitleEs(e.target.value) : setTitle(e.target.value)}
                                placeholder="Your article title..."
                                className="w-full text-xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/20 tracking-tight"
                            />
                            <div className="flex items-center gap-2 mt-2">
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

                        <div className="flex overflow-x-auto scrollbar-hide px-3 md:px-5 border-b border-border/50 bg-muted/20">
                            {sectionTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveSection(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap shrink-0 ${activeSection === tab.key
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeSection === "content" && (
                            <PostEditorContent 
                                editor={editor}
                                editLang={editLang}
                                handleLangSwitch={handleLangSwitch}
                                handleTranslate={handleTranslate}
                                isTranslating={isTranslating}
                                affiliateLinks={affiliateLinks}
                                handleInsertAffiliate={handleInsertAffiliate}
                                handleEditorImageUpload={handleEditorImageUpload}
                            />
                        )}

                        {activeSection === "seo" && (
                            <PostEditorSEO 
                                editLang={editLang}
                                seoTitle={seoTitle}
                                setSeoTitle={setSeoTitle}
                                seoTitleEs={seoTitleEs}
                                setSeoTitleEs={setSeoTitleEs}
                                seoDesc={seoDesc}
                                setSeoDesc={setSeoDesc}
                                seoDescEs={seoDescEs}
                                setSeoDescEs={setSeoDescEs}
                                keywords={keywords}
                                setKeywords={setKeywords}
                                keywordsEs={keywordsEs}
                                setKeywordsEs={setKeywordsEs}
                                title={title}
                                titleEs={titleEs}
                                excerpt={excerpt}
                                excerptEs={excerptEs}
                                slug={slug}
                            />
                        )}

                        {activeSection === "social" && (
                            <PostEditorSocial 
                                editLang={editLang}
                                socialTw={socialTw}
                                setSocialTw={setSocialTw}
                                socialTwEs={socialTwEs}
                                setSocialTwEs={setSocialTwEs}
                                socialFb={socialFb}
                                setSocialFb={setSocialFb}
                                socialFbEs={socialFbEs}
                                setSocialFbEs={setSocialFbEs}
                                socialLi={socialLi}
                                setSocialLi={setSocialLi}
                                socialLiEs={socialLiEs}
                                setSocialLiEs={setSocialLiEs}
                                socialTags={socialTags}
                                setSocialTags={setSocialTags}
                                socialTagsEs={socialTagsEs}
                                setSocialTagsEs={setSocialTagsEs}
                                handleGenerateSocial={handleGenerateSocial}
                                isTranslating={isTranslating}
                                coverImageUrl={coverImageUrl}
                                title={title}
                                titleEs={titleEs}
                                seoTitle={seoTitle}
                                seoTitleEs={seoTitleEs}
                                seoDesc={seoDesc}
                                seoDescEs={seoDescEs}
                                excerpt={excerpt}
                                excerptEs={excerptEs}
                            />
                        )}

                        {activeSection === "image" && (
                            <PostEditorMedia 
                                coverImageUrl={coverImageUrl}
                                setCoverImageUrl={setCoverImageUrl}
                                imagePrompt={imagePrompt}
                                setImagePrompt={setImagePrompt}
                                uploading={uploading}
                                handleFileSelect={handleFileSelect}
                                handleDrop={handleDrop}
                                dragOver={dragOver}
                                setDragOver={setDragOver}
                            />
                        )}
                    </div>

                    <div className="flex flex-col overflow-y-auto bg-muted/20">
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Excerpt {editLang === 'es' ? '(ES)' : '(EN)'}</label>
                                <textarea
                                    value={editLang === 'es' ? excerptEs : excerpt}
                                    onChange={(e) => editLang === 'es' ? setExcerptEs(e.target.value) : setExcerpt(e.target.value)}
                                    placeholder="Short summary that appears in post cards and social sharing..."
                                    className={`${INPUT_CLASS} h-24 resize-none`}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLASS}>
                                    <option value="">Select category...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">Related Provider</label>
                                <input type="text" value={relatedProvider} onChange={(e) => setRelatedProvider(e.target.value)} placeholder="e.g. NordVPN, Hostinger" className={INPUT_CLASS} />
                                <p className="text-[10px] text-muted-foreground mt-1.5">Links to affiliate partner for "Check Deal" button</p>
                            </div>

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
                socialContentEs={{
                    twitter: socialTwEs || "",
                    facebook: socialFbEs || "",
                    linkedin: socialLiEs || "",
                    hashtags: socialTagsEs ? socialTagsEs.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : undefined
                }}
                errorDetails={publishError}
                indexingStatus={indexingStatus}
            />
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
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState("");
    const [showProgressOverlay, setShowProgressOverlay] = useState(false);
    const [showGenModal, setShowGenModal] = useState(false);
    const [summaryPost, setSummaryPost] = useState<Post | null>(null);

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
        fetchPosts();
        return result;
    };

    const handleManualIndex = async (post: Post) => {
        try {
            const urls = [
                `https://hostingsarena.com/en/news/${post.slug}`,
                `https://hostingsarena.com/es/news/${post.slug}`
            ];

            for (const url of urls) {
                await fetch("/api/admin/posts/index-google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                });
            }
            alert("Index requests sent for both languages!");
        } catch (e) {
            console.error("Manual indexing error:", e);
            alert("Failed to send indexing request.");
        }
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
            setGenerationStatus(`Initializing AI Agent (${config.model || 'gemini-2.0-flash'})...`);

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
    };

    const totalPages = Math.ceil(total / 12);

    return (
        <div className="space-y-6">
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

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search posts..."
                            className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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

            <div className="flex gap-3 text-xs">
                <span className="bg-muted/50 px-3 py-1.5 rounded-lg text-muted-foreground">{total} total posts</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                    {posts.filter(p => p.status === "published").length} published on this page
                </span>
                <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/10">
                    {affiliateLinks.length} active affiliates
                </span>
            </div>

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
                                <div className="bg-gray-500/10 h-36 rounded-t-xl flex items-center justify-center relative overflow-hidden border-b border-border/50">
                                    {post.cover_image_url ? (
                                        <img 
                                            src={post.cover_image_url} 
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-500/10 to-transparent p-4" />
                                            <div className="text-center relative z-10 p-4">
                                                <ImageIcon className="w-6 h-6 mx-auto mb-1 text-muted-foreground/30" />
                                                <p className="text-[10px] text-muted-foreground/40 line-clamp-2">
                                                    {post.image_prompt || "No image description"}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md ${
                                        post.status === "published"
                                            ? (new Date(post.published_at || "").getTime() > new Date().getTime()
                                                ? "bg-amber-500/90 text-amber-50 flex gap-1 items-center shadow-lg shadow-black/20" 
                                                : "bg-emerald-500/90 text-emerald-50 shadow-lg shadow-black/20")
                                            : "bg-amber-500/90 text-amber-50 shadow-lg shadow-black/20"
                                    }`}>
                                        {post.status === "published" 
                                            ? (new Date(post.published_at || "").getTime() > new Date().getTime() 
                                                ? <><Clock className="w-3 h-3" /> Programado para {new Date(post.published_at || "").toLocaleDateString('es-SV', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</> 
                                                : "Published") 
                                            : "Draft"}
                                    </span>
                                    {post.is_ai_generated && (
                                        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-black/20 backdrop-blur-md`}>
                                            🤖 AI
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        {post.category && (
                                            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1", getCategoryColorClasses(post.category))}>
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

                                    <div className="mt-auto pt-3 border-t border-border/50 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date'}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setSummaryPost(post)}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                                                    title="Social Content"
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleManualIndex(post)}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-400"
                                                    title="Index Google"
                                                >
                                                    <Globe className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingPost(post)}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                    title="Edit Post"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    disabled={deletingId === post.id}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                                                    title="Delete Post"
                                                >
                                                    {deletingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
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

            {showGenModal && (
                <GenerationConfigModal
                    affiliateLinks={affiliateLinks}
                    onGenerate={handleGenerate}
                    onClose={() => setShowGenModal(false)}
                    loading={generating}
                />
            )}

            {summaryPost && (
                <PublishSummaryModal
                    isOpen={!!summaryPost}
                    onClose={() => setSummaryPost(null)}
                    status="success"
                    postUrl={`https://hostingsarena.com/news/${summaryPost.slug}`}
                    socialContent={{
                        twitter: summaryPost.social_tw_text || "",
                        facebook: summaryPost.social_fb_text || "",
                        linkedin: summaryPost.social_li_text || "",
                        hashtags: summaryPost.social_hashtags || []
                    }}
                    socialContentEs={{
                        twitter: summaryPost.social_tw_text_es || "",
                        facebook: summaryPost.social_fb_text_es || "",
                        linkedin: summaryPost.social_li_text_es || "",
                        hashtags: summaryPost.social_hashtags_es || []
                    }}
                    indexingStatus="idle"
                />
            )}
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
