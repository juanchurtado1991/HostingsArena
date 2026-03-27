import { GoogleGenerativeAI } from "@google/generative-ai";
import { directorTools } from "./tools";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS_TO_TRY = ["gemini-1.5-flash-002", "gemini-1.5-flash", "gemini-flash-latest"];

/**
 * Motor de Comunicación con Gemini (Modo Stateless)
 * Mantiene la coherencia entre HumanMessage, AIMessage y ToolMessage (Función Role)
 */
export async function callGemini(systemPrompt: string, messages: any[], forceTool: boolean = false) {
  let lastError: Error | null = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        tools: directorTools,
        // SI forceTool es true, obligamos a Gemini a usar una herramienta técnica
        toolConfig: forceTool ? { 
          functionCallingConfig: { mode: "ANY" as any } 
        } : undefined,
        generationConfig: { temperature: 0.1, candidateCount: 1 }
      });

      // Mapeo exhaustivo de roles para LangGraph -> Gemini Native
      const contents = messages.map(m => {
        const type = (m as any).role || (m._getType?.() === 'human' ? 'user' : 'model');
        
        if (type === 'tool' || (m as any).role === 'tool') {
          return {
            role: 'function',
            parts: [{ functionResponse: { name: (m as any).name, response: { content: m.content } } }]
          };
        }

        const parts: any[] = [];
        
        // 1. SOPORTE PARA COGNITION (Thoughts): Gemini exige que el pensamiento preceda a la acción en el historial
        const meta = (m as any).additional_kwargs || (m as any).response_metadata || {};
        const thought = meta.thought || (m as any).response_metadata?.thought || "";
        if (thought.length > 0) parts.push({ thought });

        // 2. TEXTO: Mensaje del asistente o usuario
        const textContent = (m.content || "").toString();
        if (textContent.length > 0) parts.push({ text: textContent });

        // 3. ACCIÓN: Llamadas a herramientas (Estructura EXACTA de Gemini v1beta)
        if ((m as any).tool_calls?.length > 0) {
          (m as any).tool_calls.forEach((tc: any, idx: number) => {
            // DOCUMENTACIÓN OFICIAL: El campo es 'thoughtSignature' (CamelCase)
            // Se debe incluir en el MISMO objeto que el functionCall
            const thoughtSignature = 
              tc.metadata?.thoughtSignature || // Prioridad CamelCase
              tc.metadata?.thought_signature || // Fallback SnakeCase de LangChain
              tc.response_metadata?.thoughtSignature || 
              (m as any).response_metadata?.thoughtSignature ||
              (m as any).additional_kwargs?.tool_calls?.[idx]?.thought_signature;

            parts.push({ 
              functionCall: { 
                name: tc.name, 
                args: tc.args
              },
              ...(thoughtSignature ? { thoughtSignature } : {}) // HERMANO de functionCall
            });
          });
        }
        
        return { role: type === 'user' ? 'user' : 'model', parts };
      });

      const result = await model.generateContent({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] } as any
      });

      const response = result.response;
      const firstCandidate = response.candidates?.[0]?.content;
      
      // CAPTURA DE PENSAMIENTO (COGNITION): Gemini exige preservarlos para la historia
      const thoughtPart = firstCandidate?.parts?.find(p => (p as any).thought);
      const thought = (thoughtPart as any)?.thought || "";

      // CAPTURA DE LLAMADAS + FIRMAS (ESTRUCTURA OFICIAL)
      const toolCalls = firstCandidate?.parts
        ?.filter(p => p.functionCall)
        .map(p => ({
          name: p.functionCall?.name,
          args: p.functionCall?.args,
          id: Math.random().toString(36).substring(7),
          metadata: { 
            // Guardar con el nombre oficial para la historia
            thoughtSignature: (p as any)?.thoughtSignature 
          }
        })) || [];

      let content = "";
      try { content = response.text(); } catch (e) {}

      // SAFETY: Si hay herramientas pero no texto, intentamos generar un feedback dinámico
      if (!content && toolCalls.length > 0) {
        const firstTool = toolCalls[0].name;
        if (firstTool === 'get_news_feed') content = "¡Hola! Estoy obteniendo las últimas noticias de HostingArena para ti...";
        else if (firstTool === 'setup_project') content = "Perfecto, he guardado la configuración de tu proyecto.";
        else if (firstTool === 'generate_scenes_and_audio') content = "Excelente. Estoy generando el guion, las voces y las escenas para tu video...";
        else content = "Entendido, estoy procesando tu solicitud...";
      }

      // RETORNAR METADATOS PARA QUE EL NODO LOS GUARDE EN EL AIMessage
      return { 
        content, 
        tool_calls: toolCalls, 
        response_metadata: { thought } 
      };

    } catch (e: any) {
      console.warn(`[Director Engine] Error with ${modelName}:`, e.message);
      lastError = e;
      if (e.message?.includes("404") || e.message?.includes("429")) continue;
      throw e;
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}
