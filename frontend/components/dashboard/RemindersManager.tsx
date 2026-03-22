"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Plus, Send } from "lucide-react";
import { useReminders } from "./reminders/useReminders";
import { ReminderCard } from "./reminders/ReminderCard";

export function RemindersManager() {
    const {
        reminders,
        loading,
        submitting,
        message, setMessage,
        mention, setMention,
        date, setDate,
        time, setTime,
        isRecurring, setIsRecurring,
        pattern, setPattern,
        handleSchedule,
        handleDelete
    } = useReminders();

    const INPUT_CLASS = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6">
                <GlassCard className="p-6 md:w-1/3 border-white/[0.05]">
                    <div className="p-3 w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 flex items-center justify-center">
                        <Bell className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight mb-2">Recordatorios de Equipo</h2>
                    <p className="text-sm text-muted-foreground">
                        Programa alertas automáticas para tu canal de Slack. Se enviarán usando la hora de **El Salvador**.
                    </p>
                </GlassCard>

                <GlassCard className="p-6 flex-1 border-white/[0.05]">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        Nuevo Recordatorio
                    </h3>
                    <form onSubmit={handleSchedule} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Mensaje</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ej: Reporte diario: {today_views} visitas y {today_clicks} clicks."
                                className={`${INPUT_CLASS} min-h-[100px] resize-y`}
                                required
                            />
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Métricas Dinámicas (Placeholders)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                    {[
                                        ['{today_views}', 'Visitas hoy'],
                                        ['{total_views}', 'Visitas totales'],
                                        ['{today_clicks}', 'Clicks hoy'],
                                        ['{total_clicks}', 'Clicks totales'],
                                        ['{today_top_country}', 'País #1 hoy'],
                                    ].map(([placeholder, label]) => (
                                        <div key={placeholder} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="text-primary font-bold font-mono shrink-0">{placeholder}</span>
                                            <span className="truncate opacity-70">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Mencionar a (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={mention}
                                    onChange={(e) => setMention(e.target.value)}
                                    placeholder="ej: juan"
                                    className={INPUT_CLASS}
                                />
                                <p className="text-[10px] text-muted-foreground">Sin el símbolo @</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="space-y-2 flex-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">¿Es Recurrente?</label>
                                    <div className="flex items-center gap-2 h-[46px]">
                                        <input 
                                            type="checkbox" 
                                            checked={isRecurring}
                                            onChange={(e) => setIsRecurring(e.target.checked)}
                                            className="w-5 h-5 accent-primary"
                                        />
                                        <span className="text-sm">Repetir mensaje</span>
                                    </div>
                                </div>
                                
                                {isRecurring && (
                                    <div className="space-y-2 flex-1 animate-in slide-in-from-left-2 duration-200">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Frecuencia</label>
                                        <select 
                                            value={pattern}
                                            onChange={(e) => setPattern(e.target.value)}
                                            className={INPUT_CLASS}
                                        >
                                            <option value="daily">Diario</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="monthly">Mensual</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Fecha de Inicio</label>
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={INPUT_CLASS}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Hora (El Salvador)</label>
                                <input 
                                    type="time" 
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className={INPUT_CLASS}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button type="submit" disabled={submitting} className="rounded-xl flex items-center gap-2">
                                {submitting ? <span className="animate-spin text-lg">⚙</span> : <Send className="w-4 h-4" />}
                                {submitting ? "Agendando..." : "Programar en Slack"}
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>

            <GlassCard className="p-6 border-white/[0.05]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recordatorios Programados y Enviados
                </h3>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Cargando recordatorios...</div>
                ) : reminders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10">
                        No hay recordatorios aún. ¡Crea uno arriba!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reminders.map(reminder => (
                            <ReminderCard 
                                key={reminder.id} 
                                reminder={reminder} 
                                onDelete={handleDelete} 
                            />
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}