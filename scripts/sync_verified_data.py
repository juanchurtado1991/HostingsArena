"""
Sync verified_data.json to Supabase — CLEAN START
Wipes old placeholder data and inserts fresh verified data.
Usage: python scripts/sync_verified_data.py [--wipe]
"""
import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Add project root
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "frontend" / ".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment")
    sys.exit(1)

from supabase import create_client, Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

DATA_FILE = PROJECT_ROOT / "data" / "verified_data.json"


def load_verified_data():
    """Load the clean verified_data.json"""
    with open(DATA_FILE, 'r') as f:
        return json.load(f)


def wipe_tables():
    """Delete ALL rows from hosting_providers and vpn_providers"""
    print("🗑️  Wiping hosting_providers...")
    try:
        # Delete all rows by matching any id
        supabase.table("hosting_providers").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("   ✅ hosting_providers cleared")
    except Exception as e:
        print(f"   ⚠️  Error clearing hosting: {e}")

    print("🗑️  Wiping vpn_providers...")
    try:
        supabase.table("vpn_providers").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("   ✅ vpn_providers cleared")
    except Exception as e:
        print(f"   ⚠️  Error clearing vpn: {e}")


def sync_hosting(data):
    """Sync hosting providers to Supabase"""
    hosting = data.get("hosting", [])
    print(f"\n📦 Syncing {len(hosting)} hosting providers...")

    success = 0
    for provider in hosting:
        for plan in provider.get("plans", []):
            # Parse storage_gb from string like "100 GB NVMe"
            storage_str = str(plan.get("storage", "0"))
            storage_gb = None
            if "Unlimited" in storage_str:
                storage_gb = 999  # Represent unlimited as high number for sorting
            else:
                try:
                    storage_gb = int(storage_str.split()[0])
                except (ValueError, IndexError):
                    storage_gb = 0

            payload = {
                "provider_name": provider["name"],
                "plan_name": plan["name"],
                "provider_type": "Shared",
                "website_url": provider["url"],
                "pricing_monthly": plan.get("price"),
                "renewal_price": plan.get("renewal"),
                "storage_gb": storage_gb,
                "bandwidth": plan.get("bandwidth", "Unmetered"),
                "performance_grade": None,
                "support_score": None,
                "features": {
                    "free_ssl": provider.get("free_ssl", False),
                    "free_domain": plan.get("free_domain", False),
                    "websites": plan.get("websites"),
                    "billing_period": plan.get("billing_period"),
                    "inode_limit": plan.get("inode_limit"),
                    "ram_limit": plan.get("ram_limit"),
                    "money_back": provider.get("money_back"),
                    "storage_type": plan.get("storage", "")
                },
                "raw_data": {
                    "source": "verified_data.json",
                    "extracted_at": datetime.now().isoformat()
                },
                "last_updated": datetime.now().isoformat()
            }

            try:
                supabase.table("hosting_providers").upsert(
                    payload,
                    on_conflict="provider_name,plan_name"
                ).execute()
                success += 1
                print(f"   ✅ {provider['name']} - {plan['name']}: ${plan['price']}/mo (renews ${plan['renewal']}/mo)")
            except Exception as e:
                print(f"   ❌ {provider['name']} - {plan['name']}: {e}")

    print(f"\n📊 Hosting: {success} plans synced successfully")
    return success


def sync_vpn(data):
    """Sync VPN providers to Supabase"""
    vpns = data.get("vpn", [])
    print(f"\n🔐 Syncing {len(vpns)} VPN providers...")

    success = 0
    for provider in vpns:
        name = provider.get("provider_name", provider.get("name", "Unknown"))
        monthly_price = provider.get("monthly_price")
        yearly_price = provider.get("yearly_price")

        # Parse money_back_guarantee to days
        mbg = str(provider.get("money_back_guarantee", "30 Days"))
        money_back_days = 30
        if "None" in mbg:
            money_back_days = 0
        else:
            try:
                money_back_days = int(''.join(filter(str.isdigit, mbg)) or '30')
            except ValueError:
                money_back_days = 30

        payload = {
            "provider_name": name,
            "website_url": f"https://www.{name.lower().replace(' ', '').replace('.', '')}.com",
            "pricing_monthly": monthly_price,
            "pricing_yearly": yearly_price,
            "money_back_days": money_back_days,
            "avg_speed_mbps": None,
            "server_count": provider.get("servers"),
            "features": {
                "jurisdiction": provider.get("jurisdiction"),
                "simultaneous_devices": provider.get("simultaneous_connections"),
                "country_count": provider.get("countries"),
                "has_kill_switch": provider.get("has_kill_switch", True),
                "supports_streaming": provider.get("supports_streaming", True),
                "supports_torrenting": provider.get("supports_torrenting", True),
                "no_logs_policy": provider.get("no_logs_policy", True),
                "two_year_price": provider.get("two_year_price"),
            },
            "raw_data": {
                "source": "verified_data.json",
                "extracted_at": datetime.now().isoformat()
            },
            "last_updated": datetime.now().isoformat()
        }

        try:
            supabase.table("vpn_providers").upsert(
                payload,
                on_conflict="provider_name"
            ).execute()
            success += 1
            print(f"   ✅ {name}: ${monthly_price}/mo | {provider.get('servers', '?')} servers | {provider.get('jurisdiction', '?')}")
        except Exception as e:
            print(f"   ❌ {name}: {e}")

    print(f"\n📊 VPN: {success} providers synced successfully")
    return success


def main():
    should_wipe = "--wipe" in sys.argv

    print("=" * 60)
    print("🚀 HostingArena Data Sync — Verified Data Pipeline")
    print("=" * 60)

    data = load_verified_data()
    hosting_count = len(data.get("hosting", []))
    vpn_count = len(data.get("vpn", []))
    print(f"📄 Loaded {hosting_count} hosting + {vpn_count} VPN providers from verified_data.json")

    if should_wipe:
        print("\n⚠️  WIPE MODE: Deleting ALL existing data first...")
        wipe_tables()

    hosting_synced = sync_hosting(data)
    vpn_synced = sync_vpn(data)

    print("\n" + "=" * 60)
    print(f"✅ DONE! Synced {hosting_synced} hosting plans + {vpn_synced} VPN providers")
    print("=" * 60)


if __name__ == "__main__":
    main()
