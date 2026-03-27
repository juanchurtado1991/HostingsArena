import { SchemaType } from "@google/generative-ai";

export const directorTools: any = [
  {
    functionDeclarations: [
      {
        name: "get_news_feed",
        description: "Obtiene titulares RSS de HostingArena",
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
      },
      {
        name: "setup_project",
        description: "Configura título, idioma, formato y duración del proyecto",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: "Título atractivo" },
            language: { type: SchemaType.STRING, enum: ["es", "en"], description: "Idioma" },
            format: { type: SchemaType.STRING, enum: ["9:16", "16:9"], description: "Formato" },
            duration: { type: SchemaType.NUMBER, description: "Duración en minutos" }
          },
          required: ["title", "language", "format", "duration"]
        }
      },
      {
        name: "generate_scenes_and_audio",
        description: "Genera el guion, voz y música",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            scenes: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  speech: { type: SchemaType.STRING, description: "Narrativa de locución detallada" },
                  visual: { type: SchemaType.STRING, description: "Descripción visual para búsqueda de medios" },
                  pexelsQuery: { type: SchemaType.STRING, description: "Query optimizada para Pexels" },
                  mainHeadline: { type: SchemaType.STRING, description: "Titular principal de la escena (Overlay)" },
                  subHeadline: { type: SchemaType.STRING, description: "Subtítulo complementary (Overlay)" }
                }
              }
            }
          }
        }
      },
      {
        name: "modify_timeline",
        description: "Edita el timeline (trim, swap, reorder)",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            action: { type: SchemaType.STRING, enum: ["trim", "swap", "mute", "reorder"] },
            targetIndex: { type: SchemaType.NUMBER }
          },
          required: ["action", "targetIndex"]
        }
      },
      {
        name: "advance_to_editor",
        description: "Avanza el proyecto a la fase de edición final tras la aprobación de escenas.",
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
      }
    ]
  }
];
