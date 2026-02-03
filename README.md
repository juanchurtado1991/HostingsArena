# HostingArena

Comparador automatizado de precios de Hosting y VPN con actualización diaria.

## 🚀 Proyecto

Sitio web que compara precios de 50+ proveedores de hosting y VPN, actualizando datos automáticamente cada 24 horas mediante scrapers.

## 👥 Equipo

- **Juan Carlos** - Desarrollo (Backend, Frontend, Scrapers, Infraestructura)
- **Daniela** - Operaciones (Marketing, Contenido, SEO, Backlinks)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Vercel KV (Redis)
- **Scrapers**: Python (requests, BeautifulSoup, Playwright)
- **Automation**: GitHub Actions (cron diario)
- **Hosting**: Vercel
- **AI Content**: Anthropic Claude 3.5 Sonnet
- **Analytics**: Google Analytics, Google Search Console

## 📁 Estructura del Proyecto

```
HostingArena/
├── frontend/              # Next.js app
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── lib/              # Utilities
├── scrapers/             # Python scrapers
│   ├── hosting/         # Hosting scrapers
│   │   ├── api/        # API-based scrapers
│   │   └── web/        # Web scrapers
│   ├── vpn/            # VPN scrapers
│   └── utils/          # Shared utilities
├── data/                 # Scraped data (JSON)
│   ├── hosting/
│   └── vpn/
├── scripts/             # Content generation scripts
│   ├── analyze_trends.py
│   ├── generate_drafts.py
│   └── validate_posts.py
└── .github/
    └── workflows/       # GitHub Actions
```

## 🎯 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- GitHub CLI (opcional)

### Setup

```bash
# Clonar repo
git clone https://github.com/TU_USUARIO/HostingArena.git
cd HostingArena

# Frontend
cd frontend
npm install
npm run dev

# Scrapers
cd ../scrapers
pip install -r requirements.txt
python hosting/api/digitalocean.py
```

## 📊 Status

**Week:** 0 (Pre-launch)  
**Posts:** 0  
**Providers:** 0  
**Traffic:** 0 visitors/week

## 📝 Documentation

Ver carpeta `business-plan/` (privada, no commiteada) para:
- Guía técnica completa
- Plan de negocio
- Sprints y tickets
- Documentación de entrega

## 🔐 Environment Variables

Crear `.env.local` con:

```bash
# APIs
DIGITALOCEAN_API_KEY=
VULTR_API_KEY=
ANTHROPIC_API_KEY=

# Admin
ADMIN_PASSWORD_HASH=
SESSION_SECRET=

# Analytics
NEXT_PUBLIC_GA_ID=
```

## 🚀 Deploy

```bash
# Vercel
vercel

# O conectar repo en dashboard de Vercel
```

## 📈 Roadmap

- [x] Week 0.5: Legal & Compliance
- [ ] Week 1: Setup & Infraestructura
- [ ] Week 2: Scrapers API-Based
- [ ] Week 3: Frontend Básico
- [ ] Week 4: Admin Dashboard
- [ ] Week 5-6: AI Content Pipeline
- [ ] Week 7-8: Content Sprint (30 posts)
- [ ] Week 9-10: Scaling (70 posts)
- [ ] Week 11-12: Launch (100 posts)

## 📄 License

MIT

## 🤝 Contributing

Este es un proyecto privado por ahora. Contributing cerrado.

---

**Started:** Febrero 2026  
**Launch Target:** Mayo 2026  
**Revenue Goal:** $2,500/mes en 12 meses
