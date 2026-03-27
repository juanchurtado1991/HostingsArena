import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { AgentState } from "./state";
import { callGemini } from "./engine";

/**
 * NODO DE SETUP: Consultoría inicial y configuración de parámetros.
 * El Agente utiliza herramientas de RSS y configuración técnica.
 */
export async function setupNode(state: typeof AgentState.State) {
  // PRE-FETCH de noticias para proactividad total (Zero-Turn)
  let headlines: string[] = [];
  let latestNewsStr = "";
  try {
    const res = await fetch("http://localhost:3000/api/admin/video/headlines").then(r => r.json());
    if (res.headlines?.length > 0) {
      headlines = res.headlines.slice(0, 5).map((h: any) => h.title);
      latestNewsStr = headlines.map((t, i) => `${i+1}. **${t}**`).join("\n");
    }
  } catch (e) { console.warn("Pre-fetch news failed:", e); }

  const sys = `Eres el Operador de Setup de HostingArena Video Studio. 
  TU OBJETIVO: Configurar el proyecto y ASESORAR al Productor.
  
  NOTICIAS ACTUALES (Úsalas en tu saludo):
  ${latestNewsStr || "Consultando fuentes..."}
  
  FLUJO OBLIGATORIO:
  1. EN TU PRIMERA RESPUESTA (Saludo), muestra las noticias de arriba y pide los datos.
  2. DEBES preguntar y obtener: TÍTULO, IDIOMA (es/en), FORMATO (9:16 o 16:9) y DURACIÓN (minutos).
  3. NO pases a la siguiente fase hasta tener estos 4 datos.
  4. Cuando los tengas, usa 'setup_project' para guardar la configuración.
  
  REGLA DE ORO: Sé directo. "¡Hola! Soy el Director. Aquí tienes las noticias de hoy: [Lista]. ¿Cómo configuramos el video?"`;
  
  const res = await callGemini(sys, state.messages);
  const aiMsg = new AIMessage({ content: res.content, tool_calls: (res.tool_calls || []) as any, response_metadata: res.response_metadata });
  const toolMessages = (res.tool_calls || []).map(tc => new ToolMessage({
    tool_call_id: tc.id,
    name: tc.name,
    content: tc.name === 'get_news_feed' ? "Feeds de noticias consultados." : "Configuración de proyecto guardada."
  }));

  // CAPTURAR DATOS DE CONFIGURACIÓN Y NOTICIAS PARA EL ESTADO GLOBAL
  const setupCall = (res.tool_calls || []).find(tc => tc.name === 'setup_project');
  const args = setupCall?.args as any;
  const setupData = setupCall ? {
    title: args.title,
    duration: args.duration,
    language: args.language || args.lang,
    format: args.format,
    currentUIPhase: 'creative' as any
  } : { currentUIPhase: 'setup' as any };

  return { 
    messages: [aiMsg, ...toolMessages],
    newsHeadlines: headlines, // PERSISTIR LAS NOTICIAS PARA EL SIGUIENTE NODO
    ...setupData
  };
}

/**
 * NODO CREATIVO: Generación del storyboard (Escenas, Locución, Música).
 * USA LAS NOTICIAS DEL ESTADO PARA GARANTIZAR FIDELIDAD.
 */
export async function creativeNode(state: typeof AgentState.State) {
  const targetDuration = state.duration || 1;
  const wordCount = Math.round(targetDuration * 150);
  const sceneCount = Math.max(6, Math.round(targetDuration * 3));
  const newsContext = state.newsHeadlines && state.newsHeadlines.length > 0 
    ? state.newsHeadlines.map((t, i) => `- ${t}`).join("\n")
    : "Noticias de tecnología general de HostingArena";

  const sys = `Eres el Operador Creativo de HostingArena. 
  PROYECTO: "${state.title || 'Resumen de Noticias'}"
  DURACIÓN: ${targetDuration} minutos (~${wordCount} palabras).
  NOTICIAS OBLIGATORIAS (Basa el guion EXCLUSIVAMENTE en esto):
  ${newsContext}
  
  REGLAS CRÍTICAS:
  1. EL GUION DEBE SER PROFUNDO. Para cada noticia en la lista, dedica al menos 1-2 escenas detalladas con narrativas extensas.
  2. NO inventes noticias genéricas. Cíñete a la lista proporcionada.
  3. CADA ESCENA DEBE tener un 'mainHeadline' (Titular principal) y 'subHeadline' (Resumen o dato clave) atractivos que se mostrarán sobre el video.
  4. INVOCA 'generate_scenes_and_audio' con al menos ${sceneCount} escenas.
  5. Recuerda la regla de "un clip de video cada 5 segundos": la narrativa debe ser fluida y continua para justificar los cambios visuales.`;
  
  const res = await callGemini(sys, state.messages, true);
  
  // DETECCIÓN DE AVANCE A EDITOR (Por Tool o por Aprobación Implícita)
  const lastUserMsg = state.messages[state.messages.length - 1]?.content?.toString().toLowerCase() || "";
  const isApprovalText = ["ok", "procede", "adelante", "aprobado", "listo", "llevame al editor", "llévame al editor"].some(kw => lastUserMsg.includes(kw));
  const isAdvancing = isApprovalText || (res.tool_calls || []).some(tc => tc.name === 'advance_to_editor');
  
  const aiMsg = new AIMessage({ 
    content: res.content + (isAdvancing ? "\n\n🚀 **Sincronizando con el Editor NLE...**" : "\n\nHe generado las escenas. Si estás de acuerdo, dime 'Procede' o 'Ok' para entrar al editor y realizar ajustes finales."), 
    tool_calls: (res.tool_calls || []) as any,
    response_metadata: res.response_metadata
  });
  const toolMessages = (res.tool_calls || []).map(tc => new ToolMessage({
    tool_call_id: tc.id,
    name: tc.name,
    content: tc.name === 'advance_to_editor' ? "Avanzando al editor..." : "Escenas generadas."
  }));

  // EXTRAER EL GUION PARA ACTIVAR EL ENRIQUECIMIENTO DE ASSETS EN LA UI
  const creativeCall = (res.tool_calls || []).find(tc => tc.name === 'generate_scenes_and_audio');
  const creativeArgs = creativeCall?.args as any;
  const scriptContent = creativeCall ? JSON.stringify({ scenes: creativeArgs.scenes }) : "";

  return { 
    messages: [aiMsg, ...toolMessages],
    script: scriptContent,
    currentUIPhase: isAdvancing ? 'editor' : 'creative'
  };
}

/**
 * NODO EDITOR: Ajustes finos sobre el timeline.
 */
export async function editorNode(state: typeof AgentState.State) {
  const sys = `Eres el Operador de Edición de HostingArena. 
  ESTADO: El video ha sido ensamblado y está en el Editor NLE.
  TU OBJETIVO: Asistir al Productor con cambios finales en la línea de tiempo.
  
  COMANDOS DISPONIBLES:
  - Usa 'modify_timeline' para: Cambiar clips, ajustar volumen de audio, o editar textos de los titulares.
  - El usuario puede pedir cambios específicos por escena.
  
  FLUJO:
  1. CONFIRMA que estás en el Editor y que estás listo para ajustar el proyecto.
  2. Si el usuario dice "listo" o "exportar", despídete brevemente.
  
  REGLA DE ORO: No generes nuevas escenas de cero a menos que te lo pidan. Sé un asistente de edición preciso.`;
  
  const res = await callGemini(sys, state.messages);
  const aiMsg = new AIMessage({ content: res.content, tool_calls: (res.tool_calls || []) as any, response_metadata: res.response_metadata });
  
  const toolMessages = (res.tool_calls || []).map(tc => new ToolMessage({
    tool_call_id: tc.id,
    name: tc.name,
    content: "Cambios en la línea de tiempo aplicados con éxito."
  }));

  return { 
    messages: [aiMsg, ...toolMessages],
    currentUIPhase: 'editor' // FORZAR SINCRONIZACIÓN DE LA UI AL EDITOR
  };
}
