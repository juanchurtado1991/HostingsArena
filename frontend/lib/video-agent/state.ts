import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

/**
 * --- ZOD TOOLS DEFINITIONS ---
 * Estas herramientas permiten al Agente ejecutar acciones precisas en la UI.
 */
export const GetNewsFeedTool = z.object({});

export const SetupProjectTool = z.object({
  title: z.string().describe("Título atractivo para el video de noticias"),
  language: z.enum(["es", "en"]).describe("Idioma del contenido (es/en)"),
  format: z.enum(["9:16", "16:9"]).describe("Formato de video vertical o horizontal"),
});

export const GenerateScenesAndAudioTool = z.object({
  scenes: z.array(z.object({
    speech: z.string().describe("Texto de locución para la escena"),
    visual: z.string().describe("Descripción visual del clip"),
    pexelsQuery: z.string().describe("Query de búsqueda para Pexels"),
  })),
  audioPreset: z.object({
    voiceId: z.string().describe("ID de voz de ElevenLabs"),
    musicStyle: z.string().describe("Estilo de música de fondo"),
  }),
});

export const ModifyTimelineTool = z.object({
  action: z.enum(["trim", "swap", "mute", "reorder"]).describe("Tipo de edición NLE"),
  targetIndex: z.number().describe("Índice de la escena a modificar"),
  params: z.any().optional().describe("Parámetros adicionales de la herramienta"),
});

// --- Agent State ---
export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (l, r) => [...l, ...r], // Simplificado para Operador de Comandos
    default: () => [],
  }),
  
  // Fases de UI Sincronizadas
  currentUIPhase: Annotation<'setup' | 'creative' | 'editor' | 'export'>({ 
    reducer: (_, u) => u ?? 'setup', 
    default: () => 'setup' 
  }),

  // Metadatos de Proyecto Persistidos
  title:             Annotation<string>({ reducer: (_, u) => u ?? "", default: () => "" }),
  duration:          Annotation<number>({ reducer: (_, u) => u ?? 1, default: () => 1 }),
  language:          Annotation<string>({ reducer: (_, u) => u ?? "es", default: () => "es" }),
  format:            Annotation<string>({ reducer: (_, u) => u ?? "16:9", default: () => "16:9" }),
  
  topic:             Annotation<string>({ reducer: (_, u) => u ?? "", default: () => "" }),
  projectId:         Annotation<string>(),
  script:            Annotation<string>({ reducer: (_, u) => u ?? "", default: () => "" }),
  isApproved:        Annotation<boolean>({ reducer: (_, u) => u ?? false, default: () => false }),
  newsHeadlines:     Annotation<string[]>({ reducer: (_, u) => u ?? [], default: () => [] }),
});
