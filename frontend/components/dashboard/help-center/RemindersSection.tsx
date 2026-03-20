"use client";

import React from "react";
import { Bell, BarChart3, GitBranch } from "lucide-react";
import { AccordionSection, Step, Tip } from "./HelpCenterCommon";

interface RemindersSectionProps {
    isEs: boolean;
}

export function RemindersSection({ isEs }: RemindersSectionProps) {
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
}
