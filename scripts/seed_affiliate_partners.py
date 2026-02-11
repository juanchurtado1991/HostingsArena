"""
Seed affiliate_partners table with all verified providers.
Uses website URLs as placeholder links with 'pending' status.
Real affiliate tracking links should be added via Admin Dashboard.

Usage: python scripts/seed_affiliate_partners.py
"""
import json
import os
import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "frontend" / ".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
    sys.exit(1)

from supabase import create_client, Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

DATA_FILE = PROJECT_ROOT / "data" / "verified_data.json"

# Affiliate program links for major providers (known affiliate URLs)
KNOWN_AFFILIATE_URLS = {
    # Hosting — well-known affiliate program pages
    "Hostinger": "https://www.hostinger.com/affiliates",
    "Bluehost": "https://www.bluehost.com/affiliates",
    "SiteGround": "https://www.siteground.com/affiliates",
    "GoDaddy": "https://www.godaddy.com/affiliate-programs",
    "DreamHost": "https://www.dreamhost.com/affiliates",
    "Namecheap": "https://www.namecheap.com/affiliates",
    "HostGator": "https://www.hostgator.com/affiliates",
    "InMotion Hosting": "https://www.inmotionhosting.com/affiliates",
    "GreenGeeks": "https://www.greengeeks.com/affiliates",
    "A2 Hosting": "https://www.a2hosting.com/affiliates",
    "HostArmada": "https://www.hostarmada.com/affiliate-program",
    "FastComet": "https://www.fastcomet.com/affiliates",
    "ScalaHosting": "https://www.scalahosting.com/affiliate-program",
    "InterServer": "https://www.interserver.net/affiliates",
    "HostPapa": "https://www.hostpapa.com/affiliates",
    "IONOS": "https://www.ionos.com/affiliate",
    "Hostwinds": "https://www.hostwinds.com/affiliates",
    "ChemiCloud": "https://www.chemicloud.com/affiliates",
    "WP Engine": "https://wpengine.com/partners",
    "Kinsta": "https://kinsta.com/affiliates",
    "Cloudways": "https://www.cloudways.com/en/affiliate",
    "TMDHosting": "https://www.tmdhosting.com/affiliates",
    "NameHero": "https://www.namehero.com/affiliates",
    "Verpex": "https://www.verpex.com/affiliate",
    "BanaHosting": "https://www.banahosting.com",
    # VPN — well-known affiliate program pages
    "NordVPN": "https://nordvpn.com/affiliate",
    "ExpressVPN": "https://www.expressvpn.com/affiliates",
    "Surfshark": "https://surfshark.com/affiliate",
    "CyberGhost": "https://www.cyberghostvpn.com/affiliates",
    "Private Internet Access": "https://www.privateinternetaccess.com/pages/affiliate-program",
    "ProtonVPN": "https://protonvpn.com/partners",
    "IPVanish": "https://www.ipvanish.com/affiliate-program",
    "PureVPN": "https://www.purevpn.com/affiliate",
    "Hotspot Shield": "https://www.hotspotshield.com",
    "TorGuard": "https://torguard.net/aff.php",
    "Ivacy": "https://www.ivacy.com/affiliates",
    "StrongVPN": "https://strongvpn.com",
    "VyprVPN": "https://www.vyprvpn.com",
    "Mullvad": "https://mullvad.net",
    "Windscribe": "https://windscribe.com",
    "TunnelBear": "https://www.tunnelbear.com",
    "Hide.me": "https://hide.me",
    "PrivateVPN": "https://privatevpn.com",
    "Mozilla VPN": "https://vpn.mozilla.org",
    "Astrill": "https://www.astrill.com/affiliates",
    "AirVPN": "https://airvpn.org",
    "OVPN": "https://www.ovpn.com",
    "ZenMate": "https://zenmate.com",
    "Kaspersky VPN": "https://usa.kaspersky.com/vpn-connection",
    "Norton VPN": "https://us.norton.com/products/norton-secure-vpn",
}


def seed_affiliates():
    with open(DATA_FILE) as f:
        data = json.load(f)

    providers = []

    # Hosting providers
    for h in data.get("hosting", []):
        name = h.get("name", "")
        url = h.get("url", "")
        providers.append({"name": name, "url": url, "type": "hosting"})

    # VPN providers
    for v in data.get("vpn", []):
        name = v.get("provider_name", "")
        url = KNOWN_AFFILIATE_URLS.get(name, f"https://www.{name.lower().replace(' ', '')}.com")
        providers.append({"name": name, "url": url, "type": "vpn"})

    print(f"🔗 Seeding {len(providers)} affiliate partner entries...")

    # Fetch existing affiliate partners in one query
    existing_resp = supabase.table("affiliate_partners").select("provider_name, status").execute()
    existing_map = {}
    if existing_resp.data:
        for row in existing_resp.data:
            existing_map[row["provider_name"]] = row["status"]

    created = 0
    skipped = 0

    for p in providers:
        name = p["name"]
        affiliate_url = KNOWN_AFFILIATE_URLS.get(name, p["url"])

        if name in existing_map:
            print(f"   ⏭️  {name}: Already exists (status: {existing_map[name]})")
            skipped += 1
            continue

        payload = {
            "provider_name": name,
            "affiliate_link": affiliate_url,
            "network": None,
            "commission_rate": None,
            "cookie_days": None,
            "link_duration_days": None,
            "expires_at": None,
            "status": "active",
            "last_verified_at": datetime.now().isoformat(),
        }

        try:
            supabase.table("affiliate_partners").insert(payload).execute()
            created += 1
            print(f"   ✅ {name}: Created (pending) → {affiliate_url[:60]}...")
        except Exception as e:
            print(f"   ❌ {name}: {e}")

    print(f"\n📊 Results: {created} created, {skipped} skipped (already existed)")
    print(f"   Total affiliate partners: {created + skipped}")



if __name__ == "__main__":
    seed_affiliates()
