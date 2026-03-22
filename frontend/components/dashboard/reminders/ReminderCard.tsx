"use client";

import React from "react";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Reminder } from "./types";

interface ReminderCardProps {
    reminder: Reminder;
    onDelete: (id: string) => void;
}

export function ReminderCard({ reminder, onDelete }: ReminderCardProps) {
    const dateObj = new Date(reminder.scheduled_at);
    const isPast = !reminder.is_recurring && (reminder.status === 'sent' || reminder.status === 'failed');
    
    return (
        <div className={`flex items-start md:items-center justify-between p-4 rounded-xl border transition-all ${isPast ? 'bg-white/[0.02] border-white/5 opacity-70' : 'bg-white/5 border-white/10 hover:border-primary/30'}`}>
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
                    onClick={() => onDelete(reminder.id)}
                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Eliminar Recordatorio"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
