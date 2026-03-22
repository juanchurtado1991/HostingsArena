"use client";

import { useState, useEffect, useCallback } from "react";
import { Reminder } from "./types";

export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [mention, setMention] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [pattern, setPattern] = useState("daily");

    const getSVTimeString = (date: Date = new Date()) => {
        return new Intl.DateTimeFormat('en-CA', { 
            timeZone: 'America/El_Salvador',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    const fetchReminders = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        const svNowStr = getSVTimeString();
        const [dPart, tPart] = svNowStr.split(', ');
        
        setDate(dPart);
        setTime(tPart);

        fetchReminders();
    }, [fetchReminders]);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const [y, m, d] = date.split('-').map(Number);
            const [h, min] = time.split(':').map(Number);
            
            const utcDate = new Date(Date.UTC(y, m - 1, d, h, min));
            utcDate.setHours(utcDate.getHours() + 6);

            const res = await fetch('/api/admin/slack/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    mention_user: mention ? `@${mention.replace('@', '')}` : null,
                    scheduled_at: utcDate.toISOString(),
                    is_recurring: isRecurring,
                    recurrence_pattern: isRecurring ? pattern as any : null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al agendar');
            }

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

    return {
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
    };
}
