"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    Server, Zap, Handshake, Newspaper, BookOpen,
    Clock, CheckCircle, ShieldCheck,
    Edit3, Share2, Globe, Search, ArrowRight, MousePointerClick,
    Sparkles, Copy, Bell, BarChart3, Activity, GitBranch,
    AlertTriangle, ChevronDown, ChevronRight, Info, LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HelpCenterProps {
    dict: any;
    lang: string;
}

// Accordion section component for clean mobile layout
function AccordionSection({ title, icon: Icon, children, defaultOpen = false }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">{title}</span>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>
            {open && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

function Tip({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15 text-primary text-xs">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{children}</span>
        </div>
    );
}

function Warning({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{children}</span>
        </div>
    );
}

function Step({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
    return (
        <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{n}</div>
            <div>
                <div className="font-semibold text-foreground text-sm">{title}</div>
                {children && <div className="text-muted-foreground text-xs mt-0.5">{children}</div>}
            </div>
        </div>
    );
}

function Badge({ color, label }: { color: string; label: string }) {
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", color)}>
            {label}
        </span>
    );
}

export function HelpCenter({ dict, lang }: HelpCenterProps) {
    const [activeCategory, setActiveCategory] = useState("overview");
    const isEs = lang === 'es';

    const categories = [
        { id: "overview",   label: isEs ? "Vista General"         : "Dashboard Overview",     icon: LayoutDashboard },
        { id: "newsroom",   label: isEs ? "Editor y Noticias"     : "Newsroom & Editor",      icon: Newspaper },
        { id: "affiliates", label: isEs ? "Afiliados"             : "Affiliate Manager",      icon: Handshake },
        { id: "analytics",  label: isEs ? "Analytics"             : "Analytics",              icon: BarChart3 },
        { id: "scrapers",   label: isEs ? "Scrapers (Live)"       : "Live Scraper Health",    icon: Server },
        { id: "tasks",      label: isEs ? "Task Center"           : "Task Center",            icon: Zap },
        { id: "seo",        label: isEs ? "SEO e Indexing"        : "SEO & Indexing",         icon: Globe },
        { id: "reminders",  label: isEs ? "Recordatorios"         : "Slack Reminders",        icon: Bell },
        { id: "workflows",  label: isEs ? "Workflows"             : "Workflows / CI",         icon: GitBranch },
    ];

    const renderContent = () => {
        switch (activeCategory) {

            // ─── OVERVIEW ────────────────────────────────────────────────────────────
            case "overview":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary" />
                                {isEs ? "Vista General del Dashboard" : "Dashboard Overview"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs
                                    ? "Centro de control central de HostingArena. Desde aquí gestionas datos, contenido, afiliados y automatización."
                                    : "HostingArena's mission control. Manage data, content, affiliates, and automation all in one place."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: Activity, color: "text-emerald-400", title: isEs ? "Fila Ejecutiva" : "Executive Row", desc: isEs ? "Clicks 30 días, ingresos estimados, tasa de éxito de scrapers e ítems monitoreados." : "30-day clicks, estimated revenue, scraper success rate, and monitored items." },
                                { icon: Server, color: "text-blue-400", title: isEs ? "Salud Técnica" : "Technical Health", desc: isEs ? "Scrapers online, fallando, desactualizados e ítems sincronizados en tiempo real." : "Scrapers online, failing, stale, and total items synced in real time." },
                                { icon: BarChart3, color: "text-purple-400", title: "Analytics", desc: isEs ? "Tráfico en tiempo real, por páginas, posts, referrers, países y affiliate clicks." : "Real-time traffic by pages, posts, referrers, countries, and affiliate clicks." },
                                { icon: Server, color: "text-orange-400", title: isEs ? "Live Scraper Table" : "Live Scraper Table", desc: isEs ? "Estado detallado de cada scraper: status, ítems, duración, última ejecución y errores." : "Detailed status per scraper: status, items, duration, last run, and errors." },
                            ].map((item) => (
                                <div key={item.title} className="p-3 rounded-xl bg-white/5 border border-white/[0.07] flex gap-3">
                                    <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${item.color}`} />
                                    <div>
                                        <div className="font-bold text-xs mb-0.5 text-foreground">{item.title}</div>
                                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Tip>{isEs ? "Todos los datos del Overview son en tiempo real. Refresca el tab para ver los últimos valores." : "All Overview data is real-time. Refresh the tab to see the latest values."}</Tip>
                    </div>
                );

            // ─── NEWSROOM ─────────────────────────────────────────────────────────────
            case "newsroom":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <Newspaper className="w-5 h-5 text-primary" />
                                {isEs ? "Editor de Noticias AI" : "AI Newsroom Editor"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Crea, edita y publica artículos con asistencia de GPT-4o." : "Create, edit, and publish articles with GPT-4o assistance."}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Crear un Post Nuevo" : "Creating a New Post"} icon={Edit3} defaultOpen>
                                <div className="space-y-3">
                                    <Step n={1} title={isEs ? "Configura el Panel AI" : "Configure the AI Panel"}>
                                        {isEs
                                            ? "Selecciona Modelo (GPT-4o para profundidad, Mini para rapidez), longitud (800-2500 palabras) y tono de marca."
                                            : "Select Model (GPT-4o for depth, Mini for speed), word count (800–2500), and brand tone."}
                                    </Step>
                                    <Step n={2} title={isEs ? "Escribe el Tema / Prompt" : "Write the Topic / Prompt"}>
                                        {isEs ? "Describe el artículo: ej. 'Comparativa Hostinger vs SiteGround 2025 con tablas de precios reales'." : "Describe the article: e.g. 'Hostinger vs SiteGround 2025 comparison with real price tables'."}
                                    </Step>
                                    <Step n={3} title={isEs ? "Genera y Edita" : "Generate & Edit"}>
                                        {isEs ? "Usa el rich editor para ajustar el contenido. Los cambios se guardan automáticamente cada 30 segundos." : "Use the rich editor to refine content. Changes auto-save every 30 seconds."}
                                    </Step>
                                    <Step n={4} title={isEs ? "Agrega SEO y Redes Sociales" : "Add SEO & Social Media"}>
                                        {isEs ? "Completa las pestañas SEO (título, descripción, keywords) y Social (X, Facebook, LinkedIn)." : "Fill in the SEO tab (title, description, keywords) and Social tab (X, Facebook, LinkedIn)."}
                                    </Step>
                                    <Step n={5} title={isEs ? "Publica" : "Publish"}>
                                        {isEs ? "Haz clic en 'Publish & Share'. El sistema solicitará indexación en Google automáticamente y mostrará el Summary Modal." : "Click 'Publish & Share'. The system auto-requests Google indexing and shows the Summary Modal."}
                                    </Step>
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Barra de Herramientas del Editor" : "Editor Toolbar"} icon={Edit3}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                        { label: isEs ? "VS (Versus)" : "VS (Versus)", desc: isEs ? "Inserta links de comparación dinámicos. Ej: 'Bluehost vs SiteGround' → genera página de comparación automáticamente." : "Inserts dynamic comparison links. E.g. 'Bluehost vs SiteGround' → auto-generates a comparison page." },
                                        { label: isEs ? "Afiliado 🤝" : "Affiliate 🤝", desc: isEs ? "Busca e inserta tu link de afiliado activo desde la base de datos de partners." : "Search and insert your active affiliate link from the partners database." },
                                        { label: isEs ? "Imagen AI 🖼" : "AI Image 🖼", desc: isEs ? "Pestaña 'Imagen': genera una portada única con DALL-E basado en el contenido del post." : "'Image' tab: generates a unique cover image with DALL-E based on post content." },
                                        { label: isEs ? "Bilingüe 🌐" : "Bilingual 🌐", desc: isEs ? "La pestaña 'Español' activa la traducción automática del contenido al español." : "The 'Spanish' tab activates automatic content translation to Spanish." },
                                    ].map(item => (
                                        <div key={item.label} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="font-bold text-xs text-foreground mb-1">{item.label}</div>
                                            <div className="text-xs text-muted-foreground">{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Publicación y Distribución" : "Publishing & Distribution"} icon={Share2}>
                                <div className="space-y-3">
                                    <p>{isEs ? "Antes de publicar, revisa la pestaña Social. La AI genera borradores para:" : "Before publishing, review the Social tab. The AI generates drafts for:"}</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 bg-black/40 border border-white/10 rounded-lg text-center text-[10px] font-bold"><Copy className="w-3 h-3 mx-auto mb-1" />X (Twitter)</div>
                                        <div className="p-2 bg-[#1877F2]/15 border border-[#1877F2]/30 rounded-lg text-center text-[10px] font-bold text-[#1877F2]"><Copy className="w-3 h-3 mx-auto mb-1" />Facebook</div>
                                        <div className="p-2 bg-[#0077b5]/15 border border-[#0077b5]/30 rounded-lg text-center text-[10px] font-bold text-[#0077b5]"><Copy className="w-3 h-3 mx-auto mb-1" />LinkedIn</div>
                                    </div>
                                    <Tip>{isEs ? "El Summary Modal muestra botones 'Copy for X / FB / LinkedIn' para pegar directamente en las plataformas." : "The Summary Modal shows 'Copy for X / FB / LinkedIn' buttons to paste directly into platforms."}</Tip>
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Auto-Guardado" : "Auto-Save"} icon={CheckCircle}>
                                <p>{isEs ? "El editor guarda automáticamente cada 30 segundos. Si ves el indicador 'Guardado' en verde, el contenido está a salvo. No cierres el tab si el indicador muestra 'Guardando...'." : "The editor auto-saves every 30 seconds. If you see the green 'Saved' indicator, content is safe. Don't close the tab if it shows 'Saving...'"}</p>
                                <Warning>{isEs ? "Los cambios en SEO/Social también se guardan automáticamente, pero requieren al menos 3 segundos de inactividad." : "SEO/Social changes also auto-save but require at least 3 seconds of inactivity."}</Warning>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Programar Publicación" : "Schedule Publishing"} icon={Clock}>
                                <p>{isEs ? "Usa el campo 'Fecha de Publicación' para programar un post para el futuro. El post quedará en estado 'Scheduled' y se mostrará en el sitio automáticamente cuando llegue la fecha y hora configuradas (zona horaria UTC)." : "Use the 'Publish Date' field to schedule a post for the future. The post stays in 'Scheduled' state and automatically goes live when the configured date and time arrives (UTC timezone)."}</p>
                                <Tip>{isEs ? "Los posts programados aparecen con badge azul en la lista de posts del dashboard." : "Scheduled posts appear with a blue badge in the dashboard post list."}</Tip>
                            </AccordionSection>
                        </div>
                    </div>
                );

            // ─── AFFILIATES ───────────────────────────────────────────────────────────
            case "affiliates":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <Handshake className="w-5 h-5 text-primary" />
                                {isEs ? "Gestor de Afiliados" : "Affiliate Manager"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Gestiona todos tus links de afiliado, credenciales y recordatorios de pago." : "Manage all your affiliate links, credentials, and payment reminders."}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Cómo Funciona el Sistema" : "How the System Works"} icon={Info} defaultOpen>
                                <p>{isEs
                                    ? "Cada registro de afiliado contiene: link trackeado, red (ShareASale, Impact, etc.), comisión, días de cookie y credenciales de panel. Al agregar un link para 'Hostinger', este link se aplica automáticamente a TODOS los botones 'Ver Oferta' de Hostinger en el sitio público."
                                    : "Each affiliate record has: tracked link, network (ShareASale, Impact, etc.), commission rate, cookie days, and panel credentials. Adding a link for 'Hostinger' automatically applies it to ALL 'View Deal' buttons for Hostinger across the public site."}</p>
                                <Tip>{isEs ? "El sistema usa 'provider_name' como clave de matching. La capitalización debe coincidir exactamente." : "The system uses 'provider_name' as the matching key. Capitalization must match exactly."}</Tip>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Cómo Conseguir un Link de Afiliado" : "How to Get an Affiliate Link"} icon={ArrowRight}>
                                <div className="space-y-3">
                                    {[
                                        { n: 1, title: isEs ? "Busca el Programa" : "Find the Program", desc: isEs ? "Ve al sitio del proveedor → footer → busca 'Affiliates' o 'Partners'. O busca en Google: '[provider] affiliate program'." : "Go to provider's site → footer → look for 'Affiliates' or 'Partners'. Or search: '[provider] affiliate program'." },
                                        { n: 2, title: isEs ? "Redes de Afiliados" : "Affiliate Networks", desc: isEs ? "Muchos programas corren en ShareASale, CJ Affiliate, Impact, o Awin. Busca el nombre del proveedor en estas plataformas." : "Many programs run on ShareASale, CJ Affiliate, Impact, or Awin. Search provider name on these platforms." },
                                        { n: 3, title: isEs ? "Aplica y Espera Aprobación" : "Apply & Wait for Approval", desc: isEs ? "Registra tu sitio como plataforma de comparación/review. Aprobación: 1-3 días hábiles." : "Register your site as a comparison/review platform. Approval: 1–3 business days." },
                                        { n: 4, title: isEs ? "Genera tu Link" : "Generate Your Link", desc: isEs ? "En el panel de la red → 'Links' o 'Creatives' → crea un tracking URL." : "In the network dashboard → 'Links' or 'Creatives' → generate a tracking URL." },
                                        { n: 5, title: isEs ? "Agrégalo Aquí" : "Add It Here", desc: isEs ? "Haz clic en 'Add Partner', pega el link, y configura la comisión y días de cookie." : "Click 'Add Partner', paste the link, and configure commission and cookie duration." },
                                    ].map(s => <Step key={s.n} n={s.n} title={s.title}>{s.desc}</Step>)}
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Estados de los Afiliados" : "Affiliate Status States"} icon={CheckCircle}>
                                <div className="space-y-2">
                                    {[
                                        { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Active", desc: isEs ? "Link activo. Se usa en todos los botones automáticamente." : "Link is active. Used in all buttons automatically." },
                                        { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Paused", desc: isEs ? "Link pausado manualmente. No genera clicks. Útil para links expirados temporalmente." : "Manually paused. No clicks generated. Useful for temporarily expired links." },
                                        { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Processing", desc: isEs ? "Aplicación enviada. Esperando aprobación de la red." : "Application submitted. Waiting for network approval." },
                                        { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Expired", desc: isEs ? "Link expirado. Task Center generará una alerta crítica." : "Link expired. Task Center will generate a critical alert." },
                                        { badge: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Rejected", desc: isEs ? "Solicitud rechazada por la red de afiliados." : "Application rejected by the affiliate network." },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-start gap-3">
                                            <Badge color={s.badge} label={s.label} />
                                            <span className="text-xs text-muted-foreground">{s.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Recordatorios y Pagos" : "Reminders & Payments"} icon={Clock}>
                                <p>{isEs
                                    ? "Al editar un afiliado, puedes configurar: Método de Pago (Paypal, Wire, Payoneer), Mínimo de Payout, y un Recordatorio con fecha y nota. Los recordatorios en azul son futuros; en naranja son vencidos."
                                    : "When editing an affiliate, you can set: Payment Method (Paypal, Wire, Payoneer), Minimum Payout, and a Reminder with date and note. Blue reminders are future; orange are overdue."}</p>
                                <Tip>{isEs ? "Usa la sección de 'Slack Reminders' para recibir notificaciones automáticas en el canal de tu equipo." : "Use the 'Slack Reminders' section to receive automatic notifications in your team channel."}</Tip>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Tester de Links" : "Link Tester"} icon={MousePointerClick}>
                                <p>{isEs
                                    ? "El 'Affiliate Link Tester' (arriba del Gestor) te permite verificar si el link de cualquier proveedor está siendo correctamente servido. Ingresa el nombre del proveedor y te muestra el URL final que verá el usuario."
                                    : "The 'Affiliate Link Tester' (above the Manager) lets you verify if a provider's link is being served correctly. Enter the provider name and it shows the final URL the user will see."}</p>
                            </AccordionSection>
                        </div>
                    </div>
                );

            // ─── ANALYTICS ────────────────────────────────────────────────────────────
            case "analytics":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Analytics
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Tráfico en tiempo real, affiliate click tracking y análisis de audiencia." : "Real-time traffic, affiliate click tracking, and audience analysis."}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Vistas Disponibles" : "Available Views"} icon={BarChart3} defaultOpen>
                                <div className="space-y-2">
                                    {[
                                        { icon: "👥", label: isEs ? "Activity Feed" : "Activity Feed", desc: isEs ? "Muestra visitas en tiempo real con IP anonimizada, país, dispositivo y fuente (referrer). Ayuda a detectar bots vs usuarios reales." : "Shows real-time visits with anonymized IP, country, device, and source (referrer). Helps detect bots vs real users." },
                                        { icon: "🖱", label: isEs ? "Affiliate Clicks" : "Affiliate Clicks", desc: isEs ? "Track de cada click en botones 'Ver Oferta'. Muestra clicks por proveedor y tendencia diaria." : "Tracks every click on 'View Deal' buttons. Shows clicks per provider and daily trend." },
                                        { icon: "📄", label: isEs ? "Top Posts" : "Top Posts", desc: isEs ? "Los posts más vistos del período seleccionado." : "The most viewed posts in the selected period." },
                                        { icon: "🌍", label: isEs ? "Countries" : "Countries", desc: isEs ? "Distribución geográfica de visitantes." : "Geographic distribution of visitors." },
                                    ].map(v => (
                                        <div key={v.label} className="flex gap-2 text-sm">
                                            <span className="shrink-0">{v.icon}</span>
                                            <div>
                                                <span className="font-semibold text-foreground">{v.label}: </span>
                                                <span className="text-muted-foreground text-xs">{v.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>

                            <AccordionSection title="CTR Global" icon={MousePointerClick}>
                                <p>{isEs
                                    ? "El CTR Global (en el header de Analytics) es la tasa de clicks de afiliado sobre visitas totales del mes. Un CTR de 2-5% es saludable. Por encima del 5% indica alta intención de compra en tu audiencia."
                                    : "Global CTR (in Analytics header) is the affiliate click rate over total monthly visits. 2–5% CTR is healthy. Above 5% indicates high purchase intent in your audience."}</p>
                                <Tip>{isEs ? "Un CTR bajo con muchas visitas puede indicar que los botones CTAs no están bien posicionados o que el contenido no está convirtiendo." : "Low CTR with high traffic may indicate CTAs are not well-positioned or content isn't converting."}</Tip>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Filtros de Tiempo" : "Time Filters"} icon={Clock}>
                                <p>{isEs ? "Usa el selector de fechas (Today / Last 7 Days / Last 30 Days / All Time / Custom) para enfocar el análisis. 'Custom' permite fechas específicas para comparar periodos." : "Use the date selector (Today / Last 7 Days / Last 30 Days / All Time / Custom) to focus analysis. 'Custom' allows specific date ranges for period comparisons."}</p>
                            </AccordionSection>
                        </div>
                    </div>
                );

            // ─── SCRAPERS ─────────────────────────────────────────────────────────────
            case "scrapers":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <Server className="w-5 h-5 text-primary" />
                                {isEs ? "Live Scraper Health" : "Live Scraper Health"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Estado en tiempo real de todos los scrapers de Python que alimentan la base de datos." : "Real-time status of all Python scrapers that feed the database."}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Estados de los Scrapers" : "Scraper Status Codes"} icon={Activity} defaultOpen>
                                <div className="space-y-3">
                                    {[
                                        { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Online", desc: isEs ? "Funcionando correctamente. Datos frescos y sincronizados con Supabase." : "Working correctly. Data is fresh and synced with Supabase." },
                                        { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Warning", desc: isEs ? "Problemas menores (ej. un campo no encontrado). Datos mayormente precisos." : "Minor issues (e.g., one field not found). Data mostly accurate." },
                                        { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Error", desc: isEs ? "Fallo crítico. El proveedor puede haber cambiado su sitio. Requiere intervención técnica." : "Critical failure. The provider may have redesigned their site. Needs developer intervention." },
                                        { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Stale", desc: isEs ? "El scraper no ha corrido en más de 3 días. Puede estar pausado o con cron fallado." : "Scraper hasn't run in 3+ days. May be paused or cron job failed." },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-start gap-3">
                                            <Badge color={s.badge} label={s.label} />
                                            <span className="text-xs text-muted-foreground">{s.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Flujo de Datos" : "Data Flow"} icon={ArrowRight}>
                                <div className="flex flex-col gap-2">
                                    {[
                                        isEs ? "🐍 Scrapers Python corren vía GitHub Actions (diario automático)" : "🐍 Python scrapers run via GitHub Actions (daily automatic)",
                                        isEs ? "📦 Datos guardados en Supabase (tabla hosting_plans / vpn_providers)" : "📦 Data saved to Supabase (hosting_plans / vpn_providers tables)",
                                        isEs ? "⚡ Next.js revalida via ISR cada 5 minutos para servir datos frescos" : "⚡ Next.js revalidates via ISR every 5 minutes to serve fresh data",
                                        isEs ? "👤 Usuario ve precios reales sin recargar manualmente" : "👤 User sees real prices without manual refresh",
                                    ].map((step, i) => (
                                        <div key={i} className="text-xs flex gap-2 p-2 bg-white/5 rounded-lg">{step}</div>
                                    ))}
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Cómo Filtrar y Reportar" : "Filtering & Reporting"} icon={Search}>
                                <p>{isEs
                                    ? "Usa los filtros (All / Online / Failing / Stale) para enfocar la vista. El botón 'Copy Report' copia un resumen de texto de todos los scrapers al portapapeles para compartir con el equipo técnico."
                                    : "Use filters (All / Online / Failing / Stale) to focus the view. 'Copy Report' copies a text summary of all scrapers to clipboard to share with the technical team."}</p>
                                <Warning>{isEs ? "Los scrapers en 'Error' afectan directamente la calidad de los datos mostrados a los usuarios. Prioriza su reparación." : "Scrapers in 'Error' directly affect data quality shown to users. Prioritize fixing them."}</Warning>
                            </AccordionSection>
                        </div>
                    </div>
                );

            // ─── TASKS ────────────────────────────────────────────────────────────────
            case "tasks":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                {isEs ? "Task Center" : "Task Center"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Motor de auditoría automática. Genera tareas de mantenimiento para mantener el sitio óptimo." : "Automatic audit engine. Generates maintenance tasks to keep the site optimal."}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Tipos de Tareas" : "Task Types"} icon={Zap} defaultOpen>
                                <div className="space-y-2">
                                    {[
                                        { emoji: "🔥", label: isEs ? "Critical – Links Faltantes" : "Critical – Missing Links", desc: isEs ? "Un proveedor no tiene link de afiliado. Cada visita a ese proveedor es ingreso perdido." : "A provider has no affiliate link. Every visit to that provider is lost revenue." },
                                        { emoji: "⚠️", label: isEs ? "High – Scraper con Error" : "High – Scraper Error", desc: isEs ? "Un scraper falló. Los datos pueden estar desactualizados o incorrectos." : "A scraper failed. Data may be outdated or incorrect." },
                                        { emoji: "📝", label: isEs ? "Normal – Scraper Stale" : "Normal – Stale Scraper", desc: isEs ? "El scraper no ha corrido en 3+ días. Puede necesitar revisión del cron job." : "Scraper hasn't run in 3+ days. May need cron job review." },
                                    ].map(t => (
                                        <div key={t.label} className="p-3 bg-white/5 rounded-lg">
                                            <div className="font-bold text-xs mb-0.5 text-foreground">{t.emoji} {t.label}</div>
                                            <div className="text-xs text-muted-foreground">{t.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Cómo Resolver Tareas" : "How to Resolve Tasks"} icon={CheckCircle}>
                                <div className="space-y-2">
                                    <p>{isEs ? "Haz clic en 'Resolve' en la tarea:" : "Click 'Resolve' on the task:"}</p>
                                    <Step n={1} title={isEs ? "Affiliate Audit" : "Affiliate Audit"}>{isEs ? "Abre el modal para agregar el link de afiliado faltante directamente desde la tarea." : "Opens modal to add the missing affiliate link directly from the task."}</Step>
                                    <Step n={2} title={isEs ? "Scraper Fix" : "Scraper Fix"}>{isEs ? "Marca la tarea como resuelta después de reparar el scraper manualmente." : "Mark task as resolved after manually fixing the scraper."}</Step>
                                    <Step n={3} title="Clear All">{isEs ? "Usa 'Clear All' para borrar todas las tareas después de mantenimiento masivo." : "Use 'Clear All' to delete all tasks after bulk maintenance."}</Step>
                                </div>
                                <Tip>{isEs ? "El motor de deduplicación agrupa planes por proveedor. Si tienes 5 planes de Hostinger, solo generará 1 tarea." : "The deduplication engine groups plans by provider. If Hostinger has 5 plans, only 1 task is created."}</Tip>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Escaneo Manual" : "Manual Scan"} icon={Search}>
                                <p>{isEs ? "Usa el botón 'Scan' para ejecutar una auditoría manual inmediata. El motor revisa todos los proveedores en busca de links faltantes, scrapers con errores y datos desactualizados, y genera las tareas correspondientes." : "Use the 'Scan' button to run an immediate manual audit. The engine checks all providers for missing links, failing scrapers, and stale data, and generates the corresponding tasks."}</p>
                            </AccordionSection>
                        </div>
                    </div>
                );

            // ─── SEO ─────────────────────────────────────────────────────────────────
            case "seo":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                {isEs ? "SEO & Google Indexing" : "SEO & Google Indexing"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Fuerza a Google a rastrear tus páginas nuevas de comparación e indexarlas en minutos, no días." : "Force Google to crawl your new comparison pages and index them in minutes, not days."}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Cómo Indexar Páginas" : "How to Index Pages"} icon={Globe} defaultOpen>
                                <div className="space-y-2">
                                    <Step n={1} title={isEs ? "Refresh URLs" : "Refresh URLs"}>{isEs ? "Pulsa 'Refresh URLs' para cargar todas las URLs del Sitemap." : "Click 'Refresh URLs' to load all URLs from the Sitemap."}</Step>
                                    <Step n={2} title={isEs ? "Index All" : "Index All"}>{isEs ? "Confirma y pulsa 'Index All'. El sistema pinga la Google Indexing API para cada URL." : "Confirm and click 'Index All'. The system pings the Google Indexing API for each URL."}</Step>
                                    <Step n={3} title={isEs ? "Revisa el Log" : "Review the Log"}>{isEs ? "El log muestra ✓ para éxito y ✗ para error. Los errores generalmente indican que la URL ya está indexada." : "The log shows ✓ for success and ✗ for error. Errors usually mean the URL is already indexed."}</Step>
                                </div>
                                <Tip>{isEs ? "Usa esto siempre que agregues un proveedor nuevo o publiques un batch grande de comparaciones." : "Use this whenever you add a new provider or publish a large batch of comparisons."}</Tip>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Cuotas de API" : "API Quotas"} icon={ShieldCheck}>
                                <p>{isEs ? "Google permite 200 requests diarios de indexing con la cuenta de servicio configurada. El dashboard muestra el uso restante. Una vez al día es más que suficiente para el volumen de HostingArena." : "Google allows 200 daily indexing requests with the configured service account. The dashboard shows remaining quota. Once per day is more than enough for HostingArena's volume."}</p>
                                <Warning>{isEs ? "No ejecutes 'Index All' múltiples veces al día. Agota la cuota sin beneficio adicional (Google ya procesa el ping de la primera vez)." : "Don't run 'Index All' multiple times per day. It wastes quota with no additional benefit (Google already processes the first ping)."}</Warning>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "SEO en el Editor de Posts" : "SEO in Post Editor"} icon={Search}>
                                <div className="space-y-2">
                                    {[
                                        { label: "SEO Title", max: "60", desc: isEs ? "El texto azul en Google. El link clickeable en los resultados." : "The blue text in Google. The clickable link in search results." },
                                        { label: "Meta Description", max: "160", desc: isEs ? "El resumen bajo el link. Debe ser atractivo para mejorar el CTR." : "The summary under the link. Must be catchy to improve CTR." },
                                        { label: "Target Keywords", max: "—", desc: isEs ? "Frases separadas por coma que los usuarios buscan. Ej: 'cheap hosting, wordpress hosting'." : "Comma-separated phrases users search for. E.g.: 'cheap hosting, wordpress hosting'." },
                                    ].map(f => (
                                        <div key={f.label} className="p-3 bg-white/5 rounded-lg">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-bold text-xs text-foreground">{f.label}</span>
                                                {f.max !== "—" && <span className="text-[10px] text-muted-foreground">max {f.max} chars</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{f.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>
                        </div>
                    </div>
                );

            // ─── REMINDERS ───────────────────────────────────────────────────────────
            case "reminders":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                {isEs ? "Recordatorios de Slack" : "Slack Reminders"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Programa alertas automáticas para tu canal de Slack con métricas dinámicas en tiempo real." : "Schedule automated alerts to your Slack channel with real-time dynamic metrics."}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Crear un Recordatorio" : "Creating a Reminder"} icon={Bell} defaultOpen>
                                <div className="space-y-2">
                                    <Step n={1} title={isEs ? "Escribe el Mensaje" : "Write the Message"}>{isEs ? "Usa texto libre con placeholders dinámicos para incluir métricas automáticas." : "Use free text with dynamic placeholders to include automatic metrics."}</Step>
                                    <Step n={2} title={isEs ? "Configura Fecha y Hora" : "Set Date & Time"}>{isEs ? "La hora se ingresa en zona horaria de El Salvador (UTC-6). El sistema la convierte automáticamente a UTC para el envío correcto." : "Time is entered in El Salvador timezone (UTC-6). The system auto-converts to UTC for correct delivery."}</Step>
                                    <Step n={3} title={isEs ? "¿Recurrente?" : "Recurring?"}>{isEs ? "Activa 'Repetir mensaje' y selecciona Diario / Semanal / Mensual para automatización continua." : "Enable 'Repeat message' and select Daily / Weekly / Monthly for continuous automation."}</Step>
                                    <Step n={4} title={isEs ? "Enviar a Slack" : "Send to Slack"}>{isEs ? "Haz clic en 'Programar en Slack'. El cron de GitHub Actions lo procesará a la hora configurada." : "Click 'Schedule to Slack'. The GitHub Actions cron will process it at the configured time."}</Step>
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Métricas Dinámicas (Placeholders)" : "Dynamic Metrics (Placeholders)"} icon={BarChart3}>
                                <p>{isEs ? "Inserta estas variables en tu mensaje para que se reemplacen automáticamente con datos reales al momento del envío:" : "Insert these variables in your message to have them auto-replaced with real data at send time:"}</p>
                                <div className="grid grid-cols-1 gap-1.5 mt-2">
                                    {[
                                        ["{today_views}", isEs ? "Visitas de hoy" : "Today's page views"],
                                        ["{total_views}", isEs ? "Visitas totales históricas" : "All-time total page views"],
                                        ["{today_clicks}", isEs ? "Clicks de afiliado hoy" : "Today's affiliate clicks"],
                                        ["{total_clicks}", isEs ? "Clicks totales históricos" : "All-time total affiliate clicks"],
                                        ["{today_top_country}", isEs ? "País con más visitas hoy" : "Today's top country by visits"],
                                    ].map(([ph, label]) => (
                                        <div key={ph} className="flex items-center gap-2 text-xs">
                                            <code className="text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded shrink-0">{ph}</code>
                                            <span className="text-muted-foreground">{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <Tip>{isEs ? "Ejemplo de mensaje: 'Reporte diario 📊 Hoy: {today_views} visitas y {today_clicks} clicks. País #1: {today_top_country}'" : "Example: 'Daily report 📊 Today: {today_views} visits and {today_clicks} clicks. Top country: {today_top_country}'"}</Tip>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Cómo Funciona Internamente" : "How it Works Internally"} icon={GitBranch}>
                                <div className="space-y-1 text-xs">
                                    {[
                                        isEs ? "1. El recordatorio se guarda en Supabase (tabla slack_reminders)" : "1. Reminder saved to Supabase (slack_reminders table)",
                                        isEs ? "2. GitHub Actions ejecuta el cron cada hora automáticamente" : "2. GitHub Actions runs the cron hourly automatically",
                                        isEs ? "3. El dispatcher busca recordatorios cuya hora llegó (comparando UTC)" : "3. The dispatcher finds reminders whose time has arrived (comparing UTC)",
                                        isEs ? "4. Reemplaza los placeholders con datos reales de la DB" : "4. Replaces placeholders with real data from the DB",
                                        isEs ? "5. Envía el mensaje al canal de Slack vía webhook" : "5. Sends the message to the Slack channel via webhook",
                                        isEs ? "6. Marca el recordatorio como 'sent' (o crea el siguiente si es recurrente)" : "6. Marks reminder as 'sent' (or creates next occurrence if recurring)",
                                    ].map((step, i) => (
                                        <div key={i} className="p-2 bg-white/5 rounded-lg">{step}</div>
                                    ))}
                                </div>
                            </AccordionSection>
                        </div>
                    </div>
                );

            // ─── WORKFLOWS ───────────────────────────────────────────────────────────
            case "workflows":
                return (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-primary" />
                                {isEs ? "Workflows / CI Pipelines" : "Workflows / CI Pipelines"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {isEs ? "Monitorea y dispara los GitHub Actions que mantienen los datos frescos." : "Monitor and trigger the GitHub Actions that keep data fresh."}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <AccordionSection title={isEs ? "Flujos Automáticos" : "Automatic Workflows"} icon={GitBranch} defaultOpen>
                                <div className="space-y-2">
                                    {[
                                        { label: "daily_update.yml", freq: isEs ? "Diario (3am UTC)" : "Daily (3am UTC)", desc: isEs ? "Corre todos los scrapers en paralelo. Sincroniza datos con Supabase. Registra status en scraper_status table." : "Runs all scrapers in parallel. Syncs data to Supabase. Logs status to scraper_status table." },
                                        { label: "reminders_cron.yml", freq: isEs ? "Cada hora" : "Every hour", desc: isEs ? "Revisa recordatorios de Slack pendientes y los despacha si la hora llegó." : "Checks pending Slack reminders and dispatches them if their time has arrived." },
                                    ].map(w => (
                                        <div key={w.label} className="p-3 bg-white/5 rounded-lg">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <code className="text-primary font-mono text-xs font-bold">{w.label}</code>
                                                <span className="text-[10px] text-muted-foreground">{w.freq}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{w.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Ejecución Manual" : "Manual Execution"} icon={ArrowRight}>
                                <p>{isEs
                                    ? "Usa el botón 'Run Manual Update' para disparar el workflow de scrapers inmediatamente sin esperar al cron diario. Útil cuando agregas un proveedor nuevo y quieres datos frescos de inmediato."
                                    : "Use 'Run Manual Update' to trigger the scraper workflow immediately without waiting for the daily cron. Useful when you add a new provider and want fresh data right away."}</p>
                                <Tip>{isEs ? "El run puede tardar 5-15 minutos dependiendo de la cantidad de scrapers. Revisa el log en GitHub Actions para ver el progreso." : "The run may take 5–15 minutes depending on the number of scrapers. Check the GitHub Actions log to see progress."}</Tip>
                            </AccordionSection>

                            <AccordionSection title={isEs ? "Entender el Log de Runs" : "Understanding the Run Log"} icon={Activity}>
                                <div className="space-y-2">
                                    {[
                                        { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Success", desc: isEs ? "El workflow completó sin errores. Todos los scrapers corren y datos sincronizados." : "Workflow completed without errors. All scrapers ran and data is synced." },
                                        { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Failed", desc: isEs ? "Algo falló. Haz clic en 'View Logs' para ver el error exacto en GitHub Actions." : "Something failed. Click 'View Logs' to see the exact error in GitHub Actions." },
                                        { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "In Progress", desc: isEs ? "El workflow está corriendo actualmente. Espera 5-15 minutos." : "Workflow is currently running. Wait 5–15 minutes." },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-start gap-3">
                                            <Badge color={s.badge} label={s.label} />
                                            <span className="text-xs text-muted-foreground">{s.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionSection>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <GlassCard className="overflow-hidden p-0 border-white/10 shadow-2xl">
            {/* Mobile: horizontal scrollable nav tabs */}
            <div className="md:hidden border-b border-white/10 bg-white/5">
                <div className="flex overflow-x-auto scrollbar-hide px-3 py-2 gap-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                activeCategory === cat.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:bg-white/10"
                            )}
                        >
                            <cat.icon className="w-3.5 h-3.5" />
                            <span className="whitespace-nowrap">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] overflow-hidden">
                {/* Desktop: sidebar */}
                <div className="hidden md:flex flex-col w-56 xl:w-64 border-r border-white/10 bg-white/[0.02] shrink-0">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-bold flex items-center gap-2 text-foreground">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Help Center
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">v3.0 — Feb 2026</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                                    activeCategory === cat.id
                                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <cat.icon className="w-4 h-4 shrink-0 opacity-70" />
                                <span className="truncate">{cat.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-2xl mx-auto pb-16 animate-in fade-in slide-in-from-right-4 duration-300" key={activeCategory}>
                        {renderContent()}

                        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
                            <span>HostingArena Dashboard v3.0 · Feb 2026</span>
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
