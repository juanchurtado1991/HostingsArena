import { useState } from 'react';
import { useStudioStore } from '@/store/useStudioStore';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    displayText?: string;
}

export type AgentStatus = 'idle' | 'thinking' | 'waiting_approval' | 'processing';

export function useVideoAgent() {
    // Usar estado del store global para mensajes y logs
    const { 
        agentMessages, 
        setAgentMessages,
        addAgentLog,
        agentStatus,
        setAgentStatus,
        threadId,
        setThreadId,
        setCurrentUIPhase,
        syncWithAgentSnapshot,
        agentLogs // Añadir para feedback visual
    } = useStudioStore();

    const [statusMessage, setStatusMessage] = useState<string>('');
    const [streamedText, setStreamedText] = useState<string>('');
    const [script, setScript] = useState<string | null>(null);

    const callAgentApi = async (input: string = "", action: 'start' | 'resume' = 'start', isSilent: boolean = false) => {
        const safeInput = typeof input === 'string' ? input.trim() : "";
        setAgentStatus('thinking');
        setStreamedText('');
        setStatusMessage(''); // LIMPIAR EL MENSAJE DE ESTADO AL INICIO DE CADA TURNO
        setScript(null);
        
        // Agregar mensaje del usuario al historial global (solo si no es silencioso)
        if (safeInput && !isSilent) {
            setAgentMessages(prev => [...prev, { role: 'user', content: safeInput }]);
        }

        try {
            const response = await fetch('/api/admin/video/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    input: safeInput, 
                    threadId: action === 'resume' ? threadId : undefined,
                    action 
                }),
            });

            if (!response.ok) throw new Error('Failed to connect to agent');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = JSON.parse(line.slice(6));

                    switch (data.type) {
                        case 'status':
                            setStatusMessage(data.message);
                            break;
                        case 'chunk':
                            setStreamedText(prev => prev + data.content);
                            break;
                        case 'thread':
                            setThreadId(data.threadId);
                            break;
                        case 'phase_sync':
                            // Sincronizar fase con el store global
                            useStudioStore.getState().setCurrentUIPhase(data.phase);
                            addAgentLog(`Navegando a la fase: ${data.phase}`);
                            break;
                        case 'tool_calls':
                            // EJECUCIÓN DE COMANDOS EN LA UI
                            const store = useStudioStore.getState();
                            data.calls.forEach((call: any) => {
                                if (call.name === 'setup_project') {
                                    if (call.args.title) store.setTitle(call.args.title);
                                    if (call.args.format) store.setFormat(call.args.format);
                                    if (call.args.lang) store.setScriptLang(call.args.lang);
                                    addAgentLog(`⚙️ Proyecto configurado: ${call.args.title}`);
                                }
                                if (call.name === 'generate_scenes_and_audio') {
                                    if (call.args.scenes) {
                                        store.syncWithAgentSnapshot({ scenes: call.args.scenes });
                                        addAgentLog("🎬 Escenas y narrativa generadas.");
                                    }
                                }
                                if (call.name === 'modify_timeline') {
                                    addAgentLog("✂️ Timeline modificado según tus instrucciones.");
                                }
                            });
                            break;
                        case 'script_complete':
                            setScript(data.script);
                            // Sincronizar automáticamente con el editor NLE
                            try {
                                const parsed = JSON.parse(data.script);
                                syncWithAgentSnapshot({ 
                                    scenes: parsed.scenes,
                                    title: parsed.title || "Nuevo Proyecto"
                                });
                                addAgentLog("Guion sincronizado con el Editor NLE.");
                            } catch (e) {
                                console.error("Failed to parse script:", e);
                            }
                            break;
                        case 'hitl':
                            addAgentLog("⏸️ El Director espera tu aprobación.");
                            setAgentStatus('idle'); // Permitir input de nuevo
                            break;
                        case 'complete':
                            addAgentLog("✅ Proceso de producción finalizado.");
                            setAgentStatus('idle');
                            break;
                        case 'done':
                            // Guardar el mensaje final del AI en el historial global
                            // Si falló el envío de fullText, usamos lo que acumulamos en el stream (Fallback robusto)
                            const finalContent = (data.fullText || streamedText || "").trim();
                            
                            if (finalContent) {
                                setAgentMessages(prev => {
                                    // Evitar duplicar si el último mensaje ya es el mismo
                                    const last = prev[prev.length - 1];
                                    if (last?.role === 'assistant' && last.content === finalContent) return prev;
                                    
                                    return [...prev, { 
                                        role: 'assistant', 
                                        content: finalContent,
                                        displayText: finalContent 
                                    }];
                                });
                            }
                            setAgentStatus('idle');
                            setStreamedText('');
                            break;
                        case 'phase':
                            // SI el servidor nos notifica un cambio de fase, actualizamos la UI
                            console.log(`[VideoAgent] 🚀 COMMAND: Switch to phase -> ${data.phase}`);
                            const phaseStore = useStudioStore.getState();
                            phaseStore.setCurrentUIPhase(data.phase);
                            
                            // Logging visual para el usuario
                            if (data.isFinal) {
                                addAgentLog(`✅ Sincronización Final: Fase ${data.phase}`);
                            }
                            break;
                        case 'error':
                            console.error("Agent Error:", data.message);
                            setAgentStatus('idle');
                            break;
                    }
                }
            }
        } catch (error) {
            console.error('Agent Error:', error);
            setAgentStatus('idle');
        }
    };

    const startAgent = (input: string, isSilent: boolean = false) => callAgentApi(input, 'start', isSilent);
    const resumeAgent = (input: string) => callAgentApi(input, 'resume');

    const approveScript = async () => {
        await resumeAgent("Aprobado. Procede a sincronizar.");
    };

    const rejectScript = async (feedback: string) => {
        await resumeAgent(`No aprobado. Ajustes: ${feedback}`);
    };

    return {
        messages: agentMessages,
        status: agentStatus,
        statusMessage,
        streamedText,
        threadId, // Exportar para que la UI lo reconozca
        script,
        agentLogs, // Exportar para feedback visual de actividad técnica
        startAgent,
        resumeAgent,
        approveScript,
        rejectScript
    };
}
