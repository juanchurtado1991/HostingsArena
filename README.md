# HostingArena - Data Collection System

Sistema de recolección de datos para proveedores de VPN y Hosting mediante APIs y web scraping.

## 🚀 Quick Start

### 1. Activar entorno virtual

```bash
cd /Users/juan/Documents/HostingArena
source venv/bin/activate
```

### 2. Configurar API Keys

Copia el archivo de ejemplo y agrega tus API keys:

```bash
cp .env.example .env
# Edita .env y agrega tus API keys
```

### 3. Ejecutar recolección de datos

```bash
python3 scripts/collect_data.py
```

Los datos se guardarán en `data/providers_data.json`

## 📁 Estructura del Proyecto

```
├── scrapers/
│   ├── models.py              # Modelos de datos (Pydantic)
│   ├── config.py              # Configuración y API keys
│   ├── utils/                 #  Utilidades
│   │   ├── rate_limiter.py   # Rate limiting
│   │   └── helpers.py        # Funciones helper
│   ├── vpn/                   # Scrapers de VPN
│   │   ├── base_scraper.py   # Clase base
│   │   └── nordvpn.py        # Ejemplo: NordVPN
│   └── hosting/               # Clientes API y scrapers de hosting
│       ├── base_api_client.py
│       └── api/
│           └── digitalocean.py  # Ejemplo: DigitalOcean
├── scripts/
│   └── collect_data.py        # Script principal
├── data/
│   └── providers_data.json    # Datos recolectados
└── requirements.txt           # Dependencias

```

## 🔧 Implementados

### ✅ Infraestructura Base
- Modelos de datos (Pydantic)
- Sistema de configuración
- Rate limiter
- Helper functions
- Logging system

### ✅ Ejemplos
- **VPN:** NordVPN scraper
- **Hosting:** DigitalOcean API client

## 📝 Próximos Pasos

### implementar los 19 providers restantes:

**VPNs (9 más):**
- ExpressVPN, Surfshark, CyberGhost, ProtonVPN
- PIA, IPVanish, Hotspot Shield, TunnelBear, Windscribe

**Hosting APIs (5 más):**
- Vultr, Linode, Cloudways, Kinsta, GoDaddy

**Hosting Scrapers (4):**
- Bluehost, HostGator, SiteGround, A2 Hosting

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
pytest tests/ -v
```

## 📊 Output Format

El archivo `data/providers_data.json` tendrá este formato:

```json
{
  "collection_timestamp": "2026-02-03 21:30:00",
  "vpn_providers": [
    {
      "provider_name": "NordVPN",
      "pricing_monthly": 12.99,
      "pricing_yearly": 4.99,
      "server_count": 6300,
      ...
    }
  ],
  "hosting_providers": [
    {
      "provider_name": "DigitalOcean",
      "plan_name": "basic-droplet",
      "pricing_monthly": 6.00,
      ...
    }
  ],
  "summary": {
    "total_vpn_providers": 10,
    "total_hosting_providers": 10
  }
}
```

## ⚙️ API Keys Necesarios

Para los 6 hosting providers con API:

1. **DigitalOcean**: https://cloud.digitalocean.com/account/api/tokens
2. **Vultr**: https://my.vultr.com/settings/#settingsapi
3. **Linode**: https://cloud.linode.com/profile/tokens
4. **Cloudways**: https://platform.cloudways.com/api
5. **Kinsta**: https://kinsta.com/docs/kinsta-api/#generating-an-api-key
6. **GoDaddy**: https://developer.godaddy.com/keys

La mayoría ofrecen tier gratuito.

## 🛡️ Best Practices

- **Rate Limiting**: 1 request cada 2 segundos para scraping
- **Retry Logic**: 3 intentos automáticos en caso de error
- **Logging**: Todos los eventos se registran
- **Error Handling**: Manejo robusto de errores
- **Data Validation**: Validación con Pydantic

## 📄 License

MIT
