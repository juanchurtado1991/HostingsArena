import { StateGraph } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { AgentState } from "./state";
import { setupNode, creativeNode, editorNode } from "./nodes";

// 1. Inicializar el checkpointer para persistencia
const checkpointer = SqliteSaver.fromConnString("./video_agent.db");

// 2. Construir el grafo basado en Fases de UI
const builder = new StateGraph(AgentState);

// 3. Añadir Nodos
builder.addNode("setupNode" as any,    setupNode as any);
builder.addNode("creativeNode" as any, creativeNode as any);
builder.addNode("editorNode" as any,   editorNode as any);

// 4. Definir el Flujo (Edges)
builder.addEdge("__start__", "setupNode" as any);

// De Setup a Creative (SOLO si el proyecto está configurado)
builder.addConditionalEdges("setupNode" as any, (state: typeof AgentState.State) => {
  // Si el nodo de setup ya marcó que la fase debe ser 'creative', avanzamos
  // Esto ocurre cuando se invoca la herramienta 'setup_project'
  if (state.currentUIPhase === 'creative') return "creativeNode" as any;
  
  // De lo contrario, nos quedamos en setup (HITL implícito por falta de bordes salientes automáticos)
  return "__end__"; 
});

// De Creative a Editor (Se detendrá por interruptAfter)
builder.addEdge("creativeNode" as any, "editorNode" as any);

// Bucle condicional para el Editor NLE
builder.addConditionalEdges("editorNode" as any, (state: typeof AgentState.State) => {
  const lastMsg = state.messages[state.messages.length - 1];
  const content = lastMsg?.content?.toString().toLowerCase() || "";
  
  // Si el usuario confirma que está listo para exportar
  if (content.includes("exportar") || content.includes("listo") || content.includes("terminar") || content.includes("exporta")) {
    console.log("[Graph] Export detected, ending turn.");
    return "__end__";
  }
  
  // De lo contrario, nos quedamos en el nodo de edición para soportar cambios continuos
  console.log("[Graph] Staying in Editor for further changes.");
  return "editorNode" as any;
});

// 5. Compilar con HITL (Solo interrumpimos tras la generación de escenas para validación)
export const videoAgentGraph = builder.compile({
  checkpointer,
  interruptAfter: ["creativeNode"] as any, 
});
