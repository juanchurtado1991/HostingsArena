import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { videoAgentGraph } from "@/lib/video-agent/graph";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/video/agent
export async function POST(req: Request) {
  const { action, input: clientInput, threadId: clientThreadId, stateUpdate } = await req.json();
  
  // Garantizar que siempre haya un threadId para LangGraph (Checkpointer lo requiere)
  const threadId = clientThreadId || crypto.randomUUID();
  const config = { configurable: { thread_id: threadId } };

  console.log(`[Agent API] Action: ${action}, Thread: ${threadId}, Input: ${clientInput?.substring(0, 50)}...`);

  const stream = new ReadableStream({
    async start(controller) {
      const encode = (data: any) => {
        const str = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(str));
      };

      // Emitir el threadId inmediatamente para que el cliente lo guarde
      encode({ type: "thread", threadId });

      try {
        // En LangGraph, si hay entrada se añade al estado; si es null, el grafo intenta continuar (resume)
        let input: any = clientInput ? { messages: [new HumanMessage(clientInput)] } : null;

        if (action === "resume" && stateUpdate) {
            console.log(`[Agent API] Updating state for thread: ${threadId}`);
            await videoAgentGraph.updateState(config, stateUpdate);
        }

        console.log(`[Agent API] Starting event stream for thread: ${threadId}`);
        const eventStream = videoAgentGraph.streamEvents(input, { ...config, version: "v2" });

        for await (const event of eventStream) {
          // 1. Streaming de Tokens del LLM
          if (event.event === "on_chat_model_stream") {
            const content = event.data.chunk.content;
            if (content) encode({ type: "chunk", content });
          } 
          // 2. Feedback de HERRAMIENTAS (Skills)
          else if (event.event === "on_tool_start") {
            const toolName = event.name;
            let message = "⚙️ Ejecutando acción...";
            if (toolName === "setup_project") message = "⚙️ Configurando proyecto...";
            if (toolName === "generate_scenes_and_audio") message = "🎬 Generando escenas y narrativa...";
            if (toolName === "modify_timeline") message = "✂️ Modificando timeline...";
            if (toolName === "get_news_feed") message = "📰 Consultando feeds de noticias...";
            
            console.log(`[Agent API] Tool Start: ${toolName}`);
            encode({ type: "status", message });
          }
          // 3. Captura de FASE y RESULTADOS
          else if (event.event === "on_chain_end") {
            // EVITAR DUPLICACIÓN: Solo enviar de nodos del grafo, no del grafo padre
            const isNode = !!event.metadata?.langgraph_node;
            if (!isNode) continue;

            const output = event.data.output;
            
            // Garantizar que si el mensaje tiene contenido y no se streameó, se envía ahora
            // ESCANEAR TODOS LOS MENSAJES generados por el nodo para no perder tool_calls acompañados de texto
            if (output && output.messages && Array.isArray(output.messages)) {
              for (const m of output.messages) {
                const isAI = m._getType?.() === 'ai' || (m as any).role === 'assistant';
                
                // Si encontramos llamadas a herramientas, las enviamos inmediatamente
                if (isAI && (m as any).tool_calls?.length > 0) {
                  console.log(`[Agent API] Found ${ (m as any).tool_calls.length } tool calls from node ${event.metadata?.langgraph_node}`);
                  encode({ type: "tool_calls", calls: (m as any).tool_calls });
                }
              }
            }

            if (output && output.currentUIPhase) {
              encode({ type: "phase_sync", phase: output.currentUIPhase });
            }
            // Emitir guion si se generó en la herramienta
            if (output && output.script) {
              encode({ type: "script_complete", script: output.script });
            }
          }
        }

        // Determinar si estamos pausados o terminamos
        console.log(`[Agent API] Checking final state for thread: ${threadId}`);
        const state = await videoAgentGraph.getState(config);
        const isInterrupt = state.next && state.next.length > 0;
        
        // Obtener el último mensaje del asistente para el evento 'done'
        const lastValues = state.values;
        const lastMsgs = (lastValues?.messages || []) as any[];
        const assistantMsgs = lastMsgs.filter(m => m._getType?.() === 'ai' || m.role === 'assistant');
        const lastMsg = assistantMsgs[assistantMsgs.length - 1];
        let lastMsgText = "";
        
        if (lastMsg) {
          if (typeof lastMsg.content === 'string') lastMsgText = lastMsg.content;
          else if (Array.isArray(lastMsg.content)) {
            lastMsgText = lastMsg.content.map((p: any) => p.text || "").join("");
          }
        }

        if (isInterrupt) {
          console.log(`[Agent API] HITL Required for thread: ${threadId}`);
          // Forzar sincronización de fase incluso en interrupción
          if (state.values?.currentUIPhase) {
            encode({ type: "phase_sync", phase: state.values.currentUIPhase });
          }
          encode({ type: "hitl", message: "Acción completada. ¿Listo para la siguiente fase?" });
        } else {
          console.log(`[Agent API] Turn Complete for thread: ${threadId}`);
          const isSetup = state.values?.currentUIPhase === 'setup';
          const msg = isSetup ? "El Director espera tus instrucciones para configurar el proyecto." : "Producción finalizada con éxito.";
          encode({ type: "complete", message: msg });
        }

        // SIEMPRE enviar DONE para que el frontend limpie el estado
        encode({ type: "done", fullText: lastMsgText });

        // Enviar la FASE actual del proyecto si ha cambiado (Redundancia final)
        if (state.values?.currentUIPhase) {
          encode({ type: "phase", phase: state.values.currentUIPhase, isFinal: true });
        }

      } catch (err: any) {
        console.error(`[Agent API Error] ${threadId}:`, err);
        encode({ type: "error", message: err.message || "Error en el Agente" });
      } finally {
        encode({ type: "status", message: null });
        console.log(`[Agent API] Closing stream for thread: ${threadId}`);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { 
        "Content-Type": "text/event-stream", 
        "Cache-Control": "no-cache, no-transform", 
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }
  });
}

// GET: Historial simplificado
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  if (!threadId) return NextResponse.json({ error: "Missing threadId" }, { status: 400 });

  const config = { configurable: { thread_id: threadId } };
  const history: any[] = [];
  try {
    for await (const state of videoAgentGraph.getStateHistory(config)) {
        history.push({
          checkpoint_id: state.config?.configurable?.checkpoint_id,
          phase:         state.values?.currentUIPhase,
          timestamp:     state.createdAt,
        });
      }
  } catch (e) {
      console.error("History fetch error:", e);
  }
  return NextResponse.json({ history });
}
