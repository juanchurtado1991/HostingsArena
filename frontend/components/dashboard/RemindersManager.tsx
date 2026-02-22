"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Calendar, Clock, Plus, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Reminder {
    id: string;
    message: string;
    mention_user: string | null;
    scheduled_at: string;
    status: 'pending' | 'sent' | 'failed';
    is_recurring: boolean;
    recurrence_pattern: 'daily' | 'weekly' | 'monthly' | null;
    created_at: string;
}

export function RemindersManager() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [message, setMessage] = useState("");
    const [mention, setMention] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [pattern, setPattern] = useState("daily");

    // Robust way to get El Salvador time strings
    const getSVTimeString = (date: Date = new Date()) => {
        return new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
            timeZone: 'America/El_Salvador',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    useEffect(() => {
        // format: "2026-02-20, 17:15"
        const svNowStr = getSVTimeString();
        const [dPart, tPart] = svNowStr.split(', ');
        
        setDate(dPart);
        setTime(tPart);

        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await fetch('/api/admin/slack/reminders');
            const data = await res.json();
            if (data.reminders) {
                setReminders(data.reminders);
            }
        } catch (error) {
            console.error("Error fetching reminders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // components from inputs
            const [y, m, d] = date.split('-').map(Number);
            const [h, min] = time.split(':').map(Number);
            
            // Construct UTC Date by manually offsetting UTC-6
            // We create a Date object in UTC and then adjust it to represent the correct point in time
            const utcDate = new Date(Date.UTC(y, m - 1, d, h, min));
            
            // El Salvador is UTC-6, so to get the UTC timestamp, we add 6 hours
            utcDate.setHours(utcDate.getHours() + 6);

            const res = await fetch('/api/admin/slack/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    mention_user: mention ? `@${mention.replace('@', '')}` : null,
                    scheduled_at: utcDate.toISOString(),
                    is_recurring: isRecurring,
                    recurrence_pattern: isRecurring ? pattern : null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al agendar');
            }

            // Reset form
            setMessage("");
            setMention("");
            fetchReminders();
            alert("¡Recordatorio agendado con éxito!");

        } catch (error: any) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este recordatorio?")) return;
        
        try {
            const res = await fetch(`/api/admin/slack/reminders?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Error al eliminar");
            
            setReminders(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert("Error al eliminar recordatorio");
        }
    };

    const INPUT_CLASS = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Info */}
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

                {/* Form */}
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

            {/* List */}
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
                        {reminders.map(reminder => {
                            const dateObj = new Date(reminder.scheduled_at);
                            const isPast = !reminder.is_recurring && (reminder.status === 'sent' || reminder.status === 'failed');
                            
                            return (
                                <div key={reminder.id} className={`flex items-start md:items-center justify-between p-4 rounded-xl border transition-all ${isPast ? 'bg-white/[0.02] border-white/5 opacity-70' : 'bg-white/5 border-white/10 hover:border-primary/30'}`}>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                reminder.is_recurring ? 'bg-blue-500/20 text-blue-400' :
                                                reminder.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 
                                                reminder.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 
                                                'bg-red-500/20 text-red-500'
                                            }`}>
                                                {reminder.is_recurring ? `RECURRENTE: ${reminder.recurrence_pattern}` : reminder.status}
                                            </span>
                                            {reminder.mention_user && (
                                                <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full block truncate hidden md:block">
                                                    Menciona a: {reminder.mention_user}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium line-clamp-2 md:line-clamp-1 break-words">{reminder.message}</p>
                                    </div>

                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {format(dateObj, "MMM d, yyyy", { locale: es })}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {format(dateObj, "h:mm a")}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleDelete(reminder.id)}
                                            className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Eliminar Recordatorio"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
