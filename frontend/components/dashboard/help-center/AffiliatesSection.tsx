"use client";

import React from "react";
import { Handshake, Info, ArrowRight, CheckCircle, Clock, MousePointerClick } from "lucide-react";
import { AccordionSection, Step, Tip, Badge } from "./HelpCenterCommon";

interface AffiliatesSectionProps {
    isEs: boolean;
}

export function AffiliatesSection({ isEs }: AffiliatesSectionProps) {
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
}
