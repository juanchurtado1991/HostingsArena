"use client";

import React, { useState } from "react";
import { Type, Search, Share2, ImageIcon } from "lucide-react";
import { PublishSummaryModal } from "../PublishSummaryModal";
import { PostEditorSEO } from "./PostEditorSEO";
import { PostEditorSocial } from "./PostEditorSocial";
import { PostEditorMedia } from "./PostEditorMedia";
import { PostEditorHeader } from "./PostEditorHeader";
import { PostEditorContent } from "./PostEditorContent";
import { PostSidebar } from "./PostSidebar";
import { Post, AffiliateLink } from "./types";
import { usePostEditor } from "./hooks/usePostEditor";

interface PostEditorModalProps {
    post: Post | null;
    affiliateLinks: AffiliateLink[];
    onSave: (data: Partial<Post>) => Promise<any>;
    onClose: () => void;
}

export function PostEditorModal({
    post,
    affiliateLinks,
    onSave,
    onClose,
}: PostEditorModalProps) {
    const {
        title, setTitle, slug, setSlug, excerpt, setExcerpt, category, setCategory,
        seoTitle, setSeoTitle, seoDesc, setSeoDesc, keywords, setKeywords,
        imagePrompt, setImagePrompt, status, setStatus, relatedProvider, setRelatedProvider,
        saving, lastSavedAt, isAutoSaving, error, activeSection, setActiveSection,
        coverImageUrl, setCoverImageUrl, socialTw, setSocialTw, socialFb, setSocialFb, socialLi, setSocialLi, socialTags, setSocialTags,
        uploading, editLang, isTranslating,
        titleEs, setTitleEs, excerptEs, setExcerptEs,
        seoTitleEs, setSeoTitleEs, seoDescEs, setSeoDescEs, socialTwEs, setSocialTwEs, socialFbEs, setSocialFbEs, socialLiEs, setSocialLiEs, socialTagsEs, setSocialTagsEs, keywordsEs, setKeywordsEs,
        editor, scheduledDate, setScheduledDate,
        handleLangSwitch, handleTranslate, handleGenerateSocial, handleSave,
        dragOver, setDragOver,
    } = usePostEditor(post, onSave);

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishStatus, setPublishStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [publishError, setPublishError] = useState<string | undefined>(undefined);
    const [indexingStatus, setIndexingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [shouldIndexGoogle, setShouldIndexGoogle] = useState(true);

    const handlePublish = async (publish?: boolean) => {
        if (!publish) {
            await handleSave(false);
            return;
        }

        setShowPublishModal(true);
        setPublishStatus('loading');
        setPublishError(undefined);
        setIndexingStatus('idle');

        try {
            await handleSave(true);
            const isScheduledFuture = new Date(scheduledDate).getTime() > new Date().getTime();
            
            if (shouldIndexGoogle && !isScheduledFuture) {
                setIndexingStatus('loading');
                try {
                    const idxRes = await fetch("/api/admin/posts/index-google", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: `https://hostingsarena.com/news/${slug}` })
                    });
                    const idxData = await idxRes.json();
                    if (idxRes.ok && idxData.success) setIndexingStatus('success');
                    else {
                        setIndexingStatus('error');
                        setPublishError(idxData.message || idxData.error);
                    }
                } catch (idxErr) {
                    setIndexingStatus('error');
                }
            }
            setPublishStatus('success');
        } catch (err: any) {
            setPublishStatus('error');
            setPublishError(err.message);
        }
    };

    const handleInsertAffiliate = (link: AffiliateLink) => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'text',
            text: link.provider_name,
            marks: [{
                type: 'link',
                attrs: {
                    href: link.affiliate_link,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'affiliate-link text-primary font-semibold',
                    'data-provider': link.provider_name,
                    'data-affiliate': 'true',
                },
            }],
        }).insertContent(" ").run();
    };

    const handleEditorImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/posts/upload-image", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/posts/upload-image", { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok) setCoverImageUrl(data.url);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/posts/upload-image", { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok) setCoverImageUrl(data.url);
        }
    };

    const wordCount = editor?.getText()?.split(/\s+/).filter(Boolean).length || 0;
    const categories = ["Security", "Performance", "Privacy", "Pricing", "Technology", "Hosting Market", "VPN News", "Industry", "Guide", "Comparison"];
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
                    handleSave={handlePublish}
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
                                className="w-full text-xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/20 tracking-tight text-foreground"
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

                    <PostSidebar 
                        editLang={editLang}
                        excerpt={excerpt}
                        setExcerpt={setExcerpt}
                        excerptEs={excerptEs}
                        setExcerptEs={setExcerptEs}
                        category={category}
                        setCategory={setCategory}
                        categories={categories}
                        relatedProvider={relatedProvider}
                        setRelatedProvider={setRelatedProvider}
                        wordCount={wordCount}
                        error={error}
                        onClose={onClose}
                        saving={saving}
                        post={post}
                    />
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
