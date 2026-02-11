import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

# Load Env Vars
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "frontend" / ".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print(f"Error: Missing Service Key. url={bool(SUPABASE_URL)}, key={bool(SERVICE_KEY)}")
    sys.exit(1)

print(f"--- CHECKING WITH SERVICE ROLE KEY ---")
admin_client: Client = create_client(SUPABASE_URL, SERVICE_KEY)
try:
    res = admin_client.table("scraper_status").select("*", count="exact").execute()
    count = len(res.data)
    print(f"✅ Service Role found {count} rows.")
    if count > 0:
        print(f"Sample: {res.data[0]['provider_name']} - {res.data[0]['status']}")
except Exception as e:
    print(f"❌ Service Role failed: {e}")


print(f"\n--- CHECKING WITH ANON KEY (Frontend simulation) ---")
if ANON_KEY:
    anon_client: Client = create_client(SUPABASE_URL, ANON_KEY)
    try:
        res = anon_client.table("scraper_status").select("*", count="exact").execute()
        count = len(res.data)
        print(f"ℹ️ Anon Key found {count} rows.")
        if count == 0:
            print("⚠️  Anon key sees EMPTY table. RLS likely blocking access.")
    except Exception as e:
        print(f"❌ Anon Key failed: {e}")
else:
    print("Skipping Anon check (no key found)")
