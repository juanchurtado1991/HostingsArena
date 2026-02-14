"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    Server, Zap, Handshake, Newspaper, ChevronRight, BookOpen,
    Clock, AlertTriangle, CheckCircle, ShieldCheck, Layout,
    Edit3, Share2, Globe, Search, ArrowRight, MousePointerClick,
    Menu, X, Sparkles, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HelpCenterProps {
    dict: any;
    lang: string;
}

export function HelpCenter({ dict, lang }: HelpCenterProps) {
    const [activeCategory, setActiveCategory] = useState("newsroom");
    const isEs = lang === 'es';

    const categories = [
        { id: "newsroom", label: isEs ? "Editor y Noticias" : "Newsroom & Editor", icon: Newspaper },
        { id: "seo", label: isEs ? "SEO y Optimización" : "SEO & Optimization", icon: Search },
        { id: "social", label: isEs ? "Redes Sociales" : "Social & Distribution", icon: Share2 },
        { id: "affiliates", label: isEs ? "Gestor de Afiliados" : "Affiliate Manager", icon: Handshake },
        { id: "scrapers", label: isEs ? "Scrapers y Automatización" : "Scrapers & Automation", icon: Server },
    ];

    const renderContent = () => {
        switch (activeCategory) {
            case "newsroom":
                // Newsroom Content
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
                                <Sparkles className="w-6 h-6 text-primary" />
                                {isEs ? "Editor de Noticias AI" : "AI Newsroom Editor"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isEs
                                    ? "Crea contenido de alta calidad con el poder de GPT-4o."
                                    : "Create high-quality content with the power of GPT-4o."}
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <Section title={isEs ? "1. Configuración de AI" : "1. AI Configuration"} icon={Layout}>
                                <ul className="space-y-3 text-sm text-muted-foreground ml-2 list-disc pl-4">
                                    <li>
                                        <strong className="text-foreground">{isEs ? "Selección de Modelo:" : "Model Selection:"}</strong>
                                        {isEs
                                            ? " Elige `GPT-4o` para análisis profundos o `GPT-4o Mini` para noticias rápidas."
                                            : " Choose `GPT-4o` for deep analysis or `GPT-4o Mini` for fast news updates."}
                                    </li>
                                    <li>
                                        <strong className="text-foreground">{isEs ? "Longitud:" : "Length:"}</strong>
                                        {isEs
                                            ? " Ajusta el slider (800-2500 palabras) según la profundidad requerida."
                                            : " Adjust the slider (800-2500 words) depending on the depth required."}
                                    </li>
                                    <li>
                                        <strong className="text-foreground">{isEs ? "Tono:" : "Tone:"}</strong>
                                        {isEs
                                            ? " 'Profesional', 'Casual', o 'Entusiasta' para definir la voz de marca."
                                            : " Select 'Professional', 'Casual', or 'Enthusiastic' to match brand voice."}
                                    </li>
                                </ul>
                            </Section>

                            <Section title={isEs ? "2. Barra de Herramientas" : "2. The Editor Toolbar"} icon={Edit3}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FeatureCard
                                        icon={<div className="font-black text-xs text-primary">VS</div>}
                                        title={isEs ? "Comparaciones Versus" : "Versus Comparisons"}
                                        desc={isEs
                                            ? "Inserta enlaces dinámicos (ej: 'Bluehost vs SiteGround') que generan páginas de comparación automáticamente."
                                            : "Insert dynamic comparison links (e.g., 'Bluehost vs SiteGround') that auto-generate comparison pages."}
                                    />
                                    <FeatureCard
                                        icon={<Handshake className="w-4 h-4 text-primary" />}
                                        title={isEs ? "Enlaces de Afiliado" : "Affiliate Links"}
                                        desc={isEs
                                            ? "Busca e inserta enlaces trackeados desde tu base de datos de partners activos."
                                            : "Insert tracked affiliate links from your active partners database."}
                                    />
                                </div>
                            </Section>

                            <Section title={isEs ? "3. Generación de Imagen" : "3. Image Generation"} icon={Sparkles}>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {isEs
                                        ? "Ve a la pestaña 'Imagen' para generar una portada única con DALL-E."
                                        : "Go to the 'Image' tab to generate a unique cover with DALL-E."}
                                </p>
                                <InfoBox variant="primary" title="Pro Tip">
                                    {isEs
                                        ? "Edita el prompt generado por la AI para refinar el estilo visual antes de crear la imagen."
                                        : "Edit the AI-generated prompt to refine the visual style before creating the image."}
                                </InfoBox>
                            </Section>
                        </div>
                    </div>
                );

            case "seo":
                // SEO Content
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
                                <Search className="w-6 h-6 text-primary" />
                                {isEs ? "Optimización SEO" : "SEO Optimization"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isEs
                                    ? "Asegura que tu contenido posicione alto en Google."
                                    : "Ensure your content ranks high on Google."}
                            </p>
                        </div>

                        <Section title={isEs ? "Metadatos SEO (Crítico)" : "SEO Metadata (Critical)"} icon={Search}>
                            <div className="space-y-4">
                                <InfoBox variant="default" title={isEs ? "Campos Obligatorios" : "Required Fields"}>
                                    {isEs
                                        ? "Estos campos son obligatorios para la indexación correcta."
                                        : "These fields are mandatory for proper indexing."}
                                </InfoBox>
                                <ul className="space-y-4 text-sm text-muted-foreground list-disc pl-4">
                                    <li>
                                        <div className="mb-1"><strong className="text-foreground">SEO Title:</strong></div>
                                        {isEs ? "El texto azul en Google. Mantenlo bajo 60 caracteres." : "The blue link text in Google results. Keep it under 60 characters."}
                                        <br /><em className="text-xs opacity-70">Ex: "Best Web Hosting 2024: Speed & Price Comparison"</em>
                                    </li>
                                    <li>
                                        <div className="mb-1"><strong className="text-foreground">Meta Description:</strong></div>
                                        {isEs ? "El resumen bajo el link. Mantenlo bajo 160 caracteres. Debe ser atractivo para mejorar el CTR." : "The summary under the link. Keep it under 160 characters. Must be catchy to improve CTR."}
                                    </li>
                                    <li>
                                        <div className="mb-1"><strong className="text-foreground">Target Keywords:</strong></div>
                                        {isEs ? "Frases separadas por coma que los usuarios buscan." : "Comma-separated phrases users might search for."}
                                        <br /><em className="text-xs opacity-70">Ex: "cheap hosting, wordpress hosting, bluehost review"</em>
                                    </li>
                                </ul>
                            </div>
                        </Section>
                    </div>
                );

            case "social":
                // Social Content
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
                                <Share2 className="w-6 h-6 text-primary" />
                                {isEs ? "Redes Sociales y Distribución" : "Social & Distribution"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isEs
                                    ? "Publica al mundo y sigue el rendimiento."
                                    : "Publish to the world and track performance."}
                            </p>
                        </div>

                        <Section title={isEs ? "1. Pre-Publicación (Pestaña Social)" : "1. Pre-Publishing (Social Tab)"} icon={Edit3}>
                            <p className="text-sm text-muted-foreground mb-4">
                                {isEs
                                    ? "Antes de publicar, revisa la pestaña **Social**. La AI genera borradores para X (Twitter), Facebook y LinkedIn automáticamente."
                                    : "Before clicking publish, review the **Social** tab. The AI automatically generates drafts for X (Twitter), Facebook, and LinkedIn."}
                            </p>
                            <InfoBox variant="primary" title="Pro Tip">
                                {isEs
                                    ? "Edita estos borradores para agregar tu toque personal o hashtags específicos antes de generar el post final."
                                    : "Edit these drafts to add your personal touch or specific hashtags before generating the final post."}
                            </InfoBox>
                        </Section>

                        <Section title={isEs ? "2. Proceso de Publicación" : "2. Publishing Process"} icon={Globe}>
                            <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-4">
                                <li>
                                    {isEs
                                        ? "Haz clic en el botón **Publish & Share** (arriba a la derecha)."
                                        : "Click the **Publish & Share** button (top right)."}
                                </li>
                                <li>
                                    {isEs
                                        ? "Espera a que aparezca el **Modal de Resumen** (significa que se guardó)."
                                        : "Wait for the **Summary Modal** to appear (this means the post is saved)."}
                                </li>
                                <li>
                                    {isEs
                                        ? "El sistema solicita automáticamente la **Indexación en Google**."
                                        : "The system automatically requests **Google Indexing**."}
                                </li>
                            </ol>
                        </Section>

                        <Section title={isEs ? "3. Copia Manual" : "3. Manual Distribution"} icon={MousePointerClick}>
                            <p className="text-sm text-muted-foreground mb-4">
                                {isEs
                                    ? "En el Modal de Resumen, verás botones para copiar el contenido generado para cada plataforma."
                                    : "In the Summary Modal, you will see buttons to copy the content for each platform."}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3 bg-black/40 border border-white/10 text-white rounded-lg text-center text-xs flex items-center justify-center gap-2 hover:bg-black/60 transition-colors">
                                    <Copy className="w-3 h-3" /> Copy for X
                                </div>
                                <div className="p-3 bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg text-center text-xs flex items-center justify-center gap-2 hover:bg-[#1877F2]/30 transition-colors">
                                    <Copy className="w-3 h-3" /> Copy for FB
                                </div>
                                <div className="p-3 bg-[#0077b5]/20 border border-[#0077b5]/30 text-[#0077b5] rounded-lg text-center text-xs flex items-center justify-center gap-2 hover:bg-[#0077b5]/30 transition-colors">
                                    <Copy className="w-3 h-3" /> Copy for LinkedIn
                                </div>
                            </div>
                        </Section>
                    </div>
                );

            case "affiliates":
                // Affiliates Content
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
                                <Handshake className="w-6 h-6 text-primary" />
                                {isEs ? "Gestor de Afiliados" : "Affiliate Manager"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isEs
                                    ? "Rastrea pagos, enlaces y recordatorios."
                                    : "Track payments, links, and reminders."}
                            </p>
                        </div>

                        <Section title={isEs ? "Sistema de Recordatorios" : "Reminders System"} icon={Clock}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl">
                                    <h4 className="font-bold text-primary mb-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        {isEs ? "Azul: Pendiente" : "Blue: Pending"}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {isEs ? "Recordatorios futuros. Ej: 'Revisar pago en 5 días'." : "Future reminders. Example: 'Check payment in 5 days'."}
                                    </p>
                                </div>
                                <div className="p-4 border border-amber-500/30 bg-amber-500/10 rounded-xl">
                                    <h4 className="font-bold text-amber-500 mb-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        {isEs ? "Naranja: Vencido" : "Orange: Overdue"}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {isEs ? "Fechas pasadas. Requiere atención inmediata." : "Past dates. Requires immediate attention."}
                                    </p>
                                </div>
                            </div>
                        </Section>

                        <Section title={isEs ? "Configuración de Pagos" : "Payment Configuration"} icon={ShieldCheck}>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500/70 mt-0.5 flex-none" />
                                    <span>
                                        <strong className="text-foreground">Min Payout:</strong> {isEs ? "Define el umbral (ej. $50) y moneda (USD/EUR) para saber cuándo solicitar retiro." : "Set the threshold (e.g., $50) and currency (USD/EUR) to know when to request withdrawal."}
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500/70 mt-0.5 flex-none" />
                                    <span>
                                        <strong className="text-foreground">Payment Methods:</strong> {isEs ? "Selecciona con precisión (Paypal, Wire, Payoneer) para mantener los registros correctos." : "Select accurately (Paypal, Wire, Payoneer) to keep records straight."}
                                    </span>
                                </li>
                            </ul>
                        </Section>
                    </div>
                );

            case "scrapers":
                // Scrapers Content
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
                                <Server className="w-6 h-6 text-primary" />
                                {isEs ? "Scrapers y Automatización" : "Scrapers & Automation"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isEs ? "Entendiendo el motor de datos." : "Understanding the data engine."}
                            </p>
                        </div>
                        <Section title={isEs ? "Códigos de Estado" : "Status Codes"} icon={Server}>
                            <div className="space-y-2">
                                <StatusBadge color="bg-emerald-500" label="Online" desc={isEs ? "Funcionando perfectamente." : "Working perfectly."} />
                                <StatusBadge color="bg-amber-500" label="Warning" desc={isEs ? "Problemas menores, datos mayormente precisos." : "Minor issues, data mostly accurate."} />
                                <StatusBadge color="bg-red-500" label="Error" desc={isEs ? "Fallo crítico. Necesita intervención de desarrollo." : "Critical failure. Needs developer intervention."} />
                            </div>
                        </Section>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <GlassCard className="flex flex-col md:flex-row h-[600px] md:h-[calc(100vh-200px)] overflow-hidden p-0 border-white/10 shadow-2xl">
            {/* Sidebar */}
            <div className={`
                absolute md:static inset-y-0 left-0 z-20 w-64 bg-background/80 md:bg-white/5 backdrop-blur-xl transform transition-transform duration-300 ease-in-out border-r border-white/10
                ${activeCategory ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full flex flex-col p-4">
                    <div className="mb-6 px-2 pt-2">
                        <h3 className="font-bold text-lg tracking-tight flex items-center gap-2 text-foreground">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Help Center
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">v2.1 Documentation</p>
                    </div>
                    <nav className="space-y-1 flex-1 overflow-y-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                                    activeCategory === cat.id
                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <cat.icon className="w-4 h-4 opacity-70" />
                                {cat.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-3xl mx-auto pb-20">
                        {renderContent()}

                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
                            <span>Last updated: Feb 2026</span>
                            <a href="https://github.com/juanchurtado1991/HostingsArena" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                                {isEs ? "Ver Repositorio" : "View Repository"} <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

// Helper Components
function Section({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/20 transition-colors duration-300">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-4 h-4" />
                </div>
                {title}
            </h3>
            {children}
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-all hover:bg-primary/5 cursor-default group">
            <div className="mb-3 p-2 w-fit rounded-md bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">{icon}</div>
            <div className="font-bold text-sm mb-1.5 text-foreground">{title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
        </div>
    );
}

function InfoBox({ variant, title, children }: { variant: 'primary' | 'default', title: string, children: React.ReactNode }) {
    const styles = variant === 'primary'
        ? "bg-primary/5 border-primary/20 text-primary"
        : "bg-white/5 border-white/10 text-muted-foreground";

    const Icon = variant === 'primary' ? Sparkles : AlertTriangle;

    return (
        <div className={cn("p-4 rounded-lg border text-sm flex gap-3", styles)}>
            <Icon className="w-5 h-5 flex-none opacity-80 mt-0.5" />
            <div>
                <div className="font-bold mb-1 opacity-90">{title}</div>
                <div className="opacity-80 leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

function StatusBadge({ color, label, desc }: { color: string, label: string, desc: string }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <div className="relative flex-none">
                <div className={cn("w-3 h-3 rounded-full", color.replace('text-', 'bg-'))} />
                <div className={cn("absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20", color.replace('text-', 'bg-'))} />
            </div>
            <div>
                <span className="text-sm font-bold block mb-0.5 text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
        </div>
    );
}
