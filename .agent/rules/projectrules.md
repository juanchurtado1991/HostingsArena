---
trigger: always_on
---

Review
📜 HostingArena - Reglas y Contexto del Proyecto
Este documento define la filosofía de desarrollo, reglas técnicas y enfoque de negocio para HostingArena, basado en la Guía Técnica, Plan de Negocio y Resumen Ejecutivo.

Misión: Construir el "GSMArena del Cloud Hosting" — la plataforma de comparación más automatizada, precisa y actualizada del mercado.

🚀 1. Reglas de Oro (Prime Directives)
La belleza de un UI esta en la simetria, ten esto en cuenta para cualquier disenio
Automatización Primero: No construir features que requieran mantenimiento manual constante. Si se puede scrapear o generar con IA, hazlo.
Regla: "Datos frescos diarios, cero intervención humana."
Infraestructura $0: Mantener la arquitectura Serverless (Vercel, GitHub Actions, Supabase Free Tier). Evitar costos fijos de servidores.
No Romper la Producción:
Todo cambio debe ser probado localmente (npm run build).
No hacer git push directo sin revisión (salvo emergencias críticas aprobadas).
Respetar la integridad de los datos (no placeholders, datos reales de Supabase).
🛠 2. Estándares Técnicos (De 1-guia-tecnica)
Stack: Next.js 14+ (App Router), TypeScript, Tailwind/Vanilla CSS, Supabase (DB), Python (Scrapers).
Data Flow:
Scrapers (Python) -> Supabase (DB) -> Next.js (Frontend via Proxy) -> Usuario.
Estética: Diseño Premium, "Apple-like", Glassmorphism. No diseños genéricos.
Performance: El sitio debe ser ultra-rápido (SSG/ISR). El SEO es la vida del proyecto.

💼 3. Enfoque de Negocio (De 2-plan-negocio)
Cada línea de código debe servir a uno de estos objetivos:

Afiliados (50% Ingresos): Maximizar clicks en botones "Ver Oferta" o "Ir al Sitio".
SEO (Trafico): Estructura semántica perfecta, carga rápida, contenido fresco.
Confianza: Datos precisos. Si el usuario no confía en el precio, no hace click.
🧠 4. Flujo de Trabajo Eficiente
Para mantener el desarrollo fluido y eficaz:

Contexto Presente: Antes de codificar, revisar:
¿Afecta esto a los scrapers?
¿Rompe el responsive design?
¿Es compatible con el despliegue en Vercel?
¿Este codigo es eficiente, escalable y reutilizable?
¿Existe algun componente, o clase en el proyecto que pueda reutilizar?
¿Estoy agregando codigo innecesario?
¿Estoy siguiendo las mejores practicas en el codigo?

Commits Atómicos: Un problema, un commit. Mensajes claros (feat:, fix:, chore:).
Validación Continua: Verificar /api/health-check y logs de producción tras cada deploy.

🚫 5. Anti-Patrones (Lo que NO haremos)
❌ Hardcodear datos: Los precios y nombres vienen de la DB, nunca del código.
❌ Complejidad innecesaria: No microservicios complejos ni Kubernetes. Keep it simple (KISS).
❌ Ignorar errores: Si un scraper falla, el dashboard debe avisar. No fallar en silencio.
Este documento es la fuente de verdad para mantener el alineamiento entre Ingeniería y Negocio.