import sys
import os
import glob
import importlib
import inspect
import time
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
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠️  Warning: SUPABASE_URL or SUPABASE_KEY not found in .env")
    # We continue, but sync will fail

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"⚠️  Failed to init Supabase client: {e}")
    supabase = None

from scrapers.hosting.base_scraper import BaseHostingScraper
from scrapers.vpn.base_scraper import BaseVPNScraper
from scrapers.models import HostingProvider, VPNProvider

def discover_scrapers(directory):
    """Dynamically find scraper classes in a directory"""
    scrapers = []
    search_path = PROJECT_ROOT / directory
    
    # Walk through files
    for filepath in search_path.rglob("*.py"):
        if filepath.name == "__init__.py" or "base_scraper" in filepath.name:
            continue
            
        module_name = f"scrapers.{directory.replace('/', '.')}.{filepath.stem}"
        try:
            # Import module dynamically (e.g. scrapers.hosting.scrapers.bluehost)
            # We need to handle the relative path conversion better
            # If directory is 'scrapers/hosting/scrapers', module is scrapers.hosting.scrapers.bluehost
            
            rel_path = filepath.relative_to(PROJECT_ROOT)
            module_import = str(rel_path).replace(os.sep, ".").replace(".py", "")
            
            module = importlib.import_module(module_import)
            
            # Find classes that verify: is subclass of Base and is NOT Base itself
            for name, obj in inspect.getmembers(module, inspect.isclass):
                if (issubclass(obj, (BaseHostingScraper, BaseVPNScraper)) 
                    and obj is not BaseHostingScraper 
                    and obj is not BaseVPNScraper
                    and "AdaptiveBaseScraper" not in name):

                    scrapers.append(obj)
        except Exception as e:
            print(f"⚠️  Skipping {filepath.name}: {e}")
            pass
            
    return scrapers

def log_scraper_status(provider_name, provider_type, status, duration, error=None, items=0):
    if not supabase: return
    try:
        data = {
            "provider_name": provider_name,
            "provider_type": provider_type,
            "status": status,
            "duration_seconds": round(duration, 2),
            "error_message": str(error) if error else None,
            "items_synced": items,
            "last_run": "now()"
        }
        supabase.table("scraper_status").upsert(data, on_conflict="provider_name").execute()
    except Exception as e:
        print(f"⚠️  Failed to log status for {provider_name}: {e}")

def run_scraper(scraper_class):
    start_time = time.time()
    scraper_name = scraper_class.__name__
    # Try to guess provider name from class name if instantiation fails
    provider_name = scraper_name.replace("Scraper", "")
    
    try:
        scraper = scraper_class()
        provider_name = scraper.provider_name
        provider_type = getattr(scraper, 'provider_type', 'vpn') # Default to VPN if not set
        
        # print(f"🚀 Running {scraper.provider_name}...")
        data = scraper.run()
        duration = time.time() - start_time
        
        if not data:
            print(f"⚠️  {scraper.provider_name}: No Data Returned")
            log_scraper_status(provider_name, provider_type, "warning", duration, "No Data Returned")
            return None

        # Handle list (Hosting) or single object (VPN)
        items_to_sync = data if isinstance(data, list) else [data]
        
        for item in items_to_sync:
            if not item: continue
            
            # Determine Table
            table_name = "hosting_providers" if isinstance(item, HostingProvider) else "vpn_providers"
            
            # Upsert to Supabase
            if supabase:
                # model_dump(mode='json') handles datetime serialization to ISO strings
                payload = item.model_dump(mode='json') 
                
                result = supabase.table(table_name).upsert(payload, on_conflict="provider_name").execute()
                # print(f"   Saved {item.provider_name} to DB")
            
        print(f"✅ {scraper.provider_name}: Synced {len(items_to_sync)} items")
        log_scraper_status(provider_name, provider_type, "success", duration, items=len(items_to_sync))
        return data

    except Exception as e:
        duration = time.time() - start_time
        print(f"❌ {scraper_name}: Failed ({e})")
        # Try to determine type from module path if possible, else default to unknown
        p_type = 'hosting' if 'hosting' in str(scraper_class) else 'vpn'
        log_scraper_status(provider_name, p_type, "error", duration, str(e))
        return None

def main():
    print("Starting Daily Update Pipeline...")
    
    # Discover Scrapers
    hosting_scrapers = discover_scrapers("scrapers/hosting/scrapers")
    vpn_scrapers = discover_scrapers("scrapers/vpn") # Direct in vpn folder
    
    all_scrapers = hosting_scrapers + vpn_scrapers
    print(f"ℹ️  Found {len(all_scrapers)} active scrapers.")
    
    # Run them (Sequential for safety, ThreadPool possible)
    success_count = 0
    for scraper_class in all_scrapers:
        result = run_scraper(scraper_class)
        if result: success_count += 1
            
    print(f"✅ Pipeline Finished. {success_count}/{len(all_scrapers)} verified and synced.")

if __name__ == "__main__":
    main()
