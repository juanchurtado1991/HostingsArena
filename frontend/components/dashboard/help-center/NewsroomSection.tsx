"use client";

import React from "react";
import { Newspaper, Edit3, Share2, Copy, CheckCircle, Clock } from "lucide-react";
import { AccordionSection, Step, Tip, Warning, Badge } from "./HelpCenterCommon";

interface NewsroomSectionProps {
    isEs: boolean;
}

export function NewsroomSection({ isEs }: NewsroomSectionProps) {
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
}
