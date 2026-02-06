import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ Msising credentials")
    exit(1)

supabase = create_client(url, key)

try:
    response = supabase.table("scraper_status").select("*", count="exact").execute()
    count = len(response.data)
    print(f"rows_count={count}")
    if count > 0:
        print("✅ Data sample:", response.data[0])
    else:
        print("⚠️ Table is empty")
except Exception as e:
    print(f"❌ Error: {e}")
