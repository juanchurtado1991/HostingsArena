import sys
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))
print(f"Debug: PROJECT_ROOT={PROJECT_ROOT}")
print(f"Debug: .env path={PROJECT_ROOT / '.env'}")
print(f"Debug: .env exists={ (PROJECT_ROOT / '.env').exists() }")

# Load Env Vars

# Load Env Vars
env_path = PROJECT_ROOT / ".env"
load_dotenv(env_path)

# Debug: Check if file is readable
try:
    with open(env_path, "r") as f:
        content = f.read()
        print(f"Debug: .env chars: {len(content)}")
        
        # MANUAL FALLBACK
        for line in content.splitlines():
            if "SUPABASE" in line:
                print(f"Debug line: {line[:15]}...") # Print start of line to check key format
            
            if line.strip().startswith("SUPABASE_URL"):
                 parts = line.split("=")
                 if len(parts) > 1:
                     val = parts[1].split(" #")[0].strip().strip("'").strip('"')
                     os.environ["SUPABASE_URL"] = val
            if line.strip().startswith("SUPABASE_SERVICE_ROLE_KEY"):
                 parts = line.split("=")
                 if len(parts) > 1:
                     val = parts[1].split(" #")[0].strip().strip("'").strip('"')
                     print("Debug: Found SUPABASE_SERVICE_ROLE_KEY")
                     os.environ["SUPABASE_KEY"] = val # Use this as key
            if line.strip().startswith("SUPABASE_ANON_KEY"):
                 parts = line.split("=")
                 if len(parts) > 1:
                     val = parts[1].split(" #")[0].strip().strip("'").strip('"')
                     if "SUPABASE_KEY" not in os.environ:
                         print("Debug: Found SUPABASE_ANON_KEY")
                         os.environ["SUPABASE_KEY"] = val

        if "SUPABASE_URL" in content:
            print("Debug: SUPABASE_URL key present in file")
        else:
            print("Debug: SUPABASE_URL key NOT present in file")

except Exception as e:
    print(f"Debug: Failed to read .env: {e}")

# Try loading again (just in case)
# load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Reuse discovery logic roughly or just hardcode the goal:
# We want to keep only the 50 providers we know are valid.
# But better: Use the discovery from run_pipeline.py to be dynamic.

from scripts.run_pipeline import discover_scrapers

def cleanup():
    print("🧹 Starting Scraper Status Cleanup...")
    
    # 1. Get Active Scraper Names
    hosting_scrapers = discover_scrapers("scrapers/hosting/scrapers")
    vpn_scrapers = discover_scrapers("scrapers/vpn")
    all_scrapers = hosting_scrapers + vpn_scrapers
    
    active_names = []
    for cls in all_scrapers:
        try:
            # Instantiate to get provider_name
            instance = cls()
            active_names.append(instance.provider_name)
        except:
            # Fallback to class name convention
            name = cls.__name__.replace("Scraper", "")
            active_names.append(name)
            
    print(f"ℹ️  Found {len(active_names)} active scrapers in code.")
    
    # 2. Fetch all rows in scraper_status
    res = supabase.table("scraper_status").select("provider_name").execute()
    db_rows = res.data
    
    if not db_rows:
        print("✅ table is empty.")
        return

    # 3. Identify Stale rows
    stale_names = []
    for row in db_rows:
        name = row['provider_name']
        if name not in active_names:
            stale_names.append(name)
            
    if not stale_names:
        print("✅ No stale scrapers found in DB.")
        return
        
    print(f"⚠️  Found {len(stale_names)} stale scrapers in DB (not in code):")
    for name in stale_names:
        print(f"   - {name}")
        
    # 4. Delete them
    # confirm = input("Delete these rows? (y/n): ")
    # if confirm != 'y': return
    
    print("🗑️  Deleting...")
    for name in stale_names:
        supabase.table("scraper_status").delete().eq("provider_name", name).execute()
        print(f"   Deleted {name}")
        
    print("✅ Cleanup Complete.")

if __name__ == "__main__":
    cleanup()
