import { StateGraph, Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// 1. Definición del Estado del Agente (AgentState)
export const AgentState = Annotation.Root({
  // Reducer para manejar el historial de mensajes (permite edición por ID para LangGraph)
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  // Identificador de la sesión/proyecto
  projectId: Annotation<string>(),
  
  // Estado general del flujo
  currentPhase: Annotation<number>({
    reducer: (state, update) => update ?? state,
    default: () => 1,
  }),
  
  // Datos del guion generado (Fase 1)
  script: Annotation<string>({
    reducer: (state, update) => update ?? state,
    default: () => "",
  }),
  
  // Estructura de escenas y assets seleccionados (Fase 2)
  scenes: Annotation<any[]>({
    reducer: (state, update) => update ?? state,
    default: () => [],
  }),
  
  // Estado de aprobación HITL (Human-in-the-loop)
  isScriptApproved: Annotation<boolean>({
    reducer: (state, update) => update ?? state,
    default: () => false,
  }),
});

// 2. Definición de Nodos (Lógica de cada paso)

// FASE 1: IDEACIÓN
async function plannerNode(state: typeof AgentState.State) {
  console.log("[Node: planner] Generando estructura de escenas...");
  // Aquí se llamará a Gemini para generar el guion basado en RSS/Input
  return { currentPhase: 1 };
}

// FASE 2: CONFIGURACIÓN CREATIVA
async function researcherNode(state: typeof AgentState.State) {
  console.log("[Node: researcher] Analizando contexto para assets...");
  return state;
}

async function assetSelectorNode(state: typeof AgentState.State) {
  console.log("[Node: asset_selector] Seleccionando Media, Audio y Voice...");
  return state;
}

// FASE 3: EDITOR MAESTRO NLE
async function reflectorNode(state: typeof AgentState.State) {
  console.log("[Node: reflector] Criticando y optimizando el Timeline...");
  // Analizará gaps, sincronización TTS y ajustes de Z-index
  return state;
}

// FASE 4: EXPORTACIÓN
async function finalCheckNode(state: typeof AgentState.State) {
  console.log("[Node: final_check] Verificando integridad para Remotion...");
  // Validación de calidad (Tiempos alineados, Media cargada, Audio ducking)
  return state;
}

// 3. Construcción del Grafo (StateGraph)
export const videoBuilderGraph = new StateGraph(AgentState)
  .addNode("planner", plannerNode)
  .addNode("researcher", researcherNode)
  .addNode("asset_selector", assetSelectorNode)
  .addNode("reflector", reflectorNode)
  .addNode("final_check", finalCheckNode)
  
  // Definición del flujo (Edges)
  .addEdge("__start__", "planner")
  // El flujo se pausará después de planner (HITL) para que el usuario apruebe el guion
  .addEdge("planner", "researcher")
  .addEdge("researcher", "asset_selector")
  .addEdge("asset_selector", "reflector")
  .addEdge("reflector", "final_check")
  .addEdge("final_check", "__end__");

// NOTA: La compilación final con el checkpointer (SqliteSaver/MemorySaver) 
// se hará en el entrypoint del servidor (Route Handler o Server Action)
// para mantener la seguridad de las API Keys y la persistencia real.
