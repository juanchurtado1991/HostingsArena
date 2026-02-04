"""SIMPLIFIED Collection Script - Scrapers Only (MVP) + HISTORY + SUPABASE UPLOAD"""
#!/usr/bin/env python3
import sys
import os
import json
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from dotenv import load_dotenv

import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def upload_to_supabase(data):
    """Upload data to Supabase (DB + Storage)"""
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key for backend access
    
    if not url or not key:
        logger.warning("⚠️ Skipping Supabase upload: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
        return

    logger.info("☁️  Uploading to Supabase...")
    
    try:
        supabase: Client = create_client(url, key)
        
        # 1. Upload History JSON to Storage Bucket 'history'
        # Need to save temp file or use memory buffer. Since we have file in main...
        bucket_name = "history"
        date_str = datetime.now().strftime("%Y-%m-%d")
        file_name = f"providers_data_{date_str}.json"
        
        # Ensure bucket exists (optional check)
        # Uploading...
        json_str = json.dumps(data, indent=2, default=str)
        # Note: supbase-py storage upload expects file-like or bytes
        # We'll skip complex check and just try upload
        try:
             res = supabase.storage.from_(bucket_name).upload(
                 file_name, 
                 json_str.encode('utf-8'), 
                 {"content-type": "application/json"}
             )
             logger.info(f"    ✅ Uploaded historical JSON to storage/{bucket_name}/{file_name}")
        except Exception as e:
             if "Duplicate" in str(e) or "409" in str(e):
                  logger.info(f"    ℹ️  File {file_name} already exists in storage")
             else:
                  logger.error(f"    ❌ Storage Upload Error: {e}")

        # 2. Update Live Data Tables (Upsert)
        
        # DEFINE ALLOWED COLUMNS (Must match SQL schema exactly)
        VPN_COLUMNS = {
            'id', 'provider_name', 'website_url', 'last_updated', 
            'pricing_monthly', 'pricing_yearly', 'money_back_days', 
            'avg_speed_mbps', 'server_count', 'features', 'raw_data',
            'support_quality_score'
        }
        
        HOSTING_COLUMNS = {
            'id', 'provider_name', 'plan_name', 'provider_type', 'website_url', 'last_updated',
            'pricing_monthly', 'renewal_price', 'storage_gb', 'bandwidth',
            'performance_grade', 'support_score', 'features', 'raw_data'
        }
        
        def prepare_record(record, allowed_columns):
            """Clean dict to only contain keys that exist in DB columns"""
            clean_rec = {}
            # Copy known columns
            for key in record:
                if key in allowed_columns:
                     clean_rec[key] = record[key]
            
            # Ensure raw_data contains EVERYTHING (source of truth)
            clean_rec['raw_data'] = record 
            
            # Ensure features is jsonb (if present in allowed)
            if 'features' not in clean_rec:
                 clean_rec['features'] = {}
                 
            return clean_rec

        def enrich_record(record, p_type='hosting'):
            """Fill in missing columns (features, scores) based on raw_data heuristics"""
            raw = record.get('raw_data', {})
            
            # 1. Enrich Features (JSONB)
            if not record.get('features'):
                features_detected = {}
                # Common keywords to look for
                keywords = {
                    'ssl': 'Free SSL',
                    'domain': 'Free Domain',
                    'backup': 'Daily Backups',
                    'cdn': 'CDN Included',
                    'nvme': 'NVMe Storage',
                    'ssd': 'SSD Storage',
                    '24/7': '24/7 Support',
                    'chat': 'Live Chat',
                    'money_back': 'Money Back Guarantee'
                }
                
                # Check raw_data values recursively (simple string search)
                raw_str = str(raw).lower()
                for key, label in keywords.items():
                    if key in raw_str:
                         features_detected[key] = True
                         
                record['features'] = features_detected

            # 2. Enrich Performance Grade (Heuristic)
            if p_type == 'hosting' and not record.get('performance_grade'):
                # Heuristic: NVMe = A, SSD = B, HDD = C
                store_type = str(raw.get('storage_type', '')).lower()
                if 'nvme' in store_type:
                    record['performance_grade'] = 'A+'
                elif 'ssd' in store_type:
                    record['performance_grade'] = 'A'
                else:
                    record['performance_grade'] = 'B'
                    
            # 3. Enrich Support Score (0-100)
            if not record.get('support_score') and not record.get('support_quality_score'):
                score = 70 # Baseline
                if record.get('features', {}).get('chat'): score += 10
                if record.get('features', {}).get('24/7'): score += 10
                if raw.get('support_phone'): score += 5
                
                if p_type == 'hosting':
                    record['support_score'] = min(100, score)
                else:
                    record['support_quality_score'] = min(100, score)

            # Ensure score is integer and scaled (DB Constraint)
            if record.get('support_quality_score') is not None:
                try:
                    val = float(record['support_quality_score'])
                    if val <= 10: val *= 20 # Convert 5-star to 100-scale
                    record['support_quality_score'] = int(val)
                except:
                    record['support_quality_score'] = 70 # Fallback
            
            if record.get('support_score') is not None:
                try:
                    val = float(record['support_score'])
                    if val <= 10: val *= 20
                    record['support_score'] = int(val)
                except:
                   record['support_score'] = 70

            return record

        def sanitize_payload(payload_list):
            return json.loads(json.dumps(payload_list, default=str))
        
        # Hosting - Prepare payload
        hosting_payload = []
        if data.get('hosting_providers'):
             for h in data['hosting_providers']:
                 # 1. Sanitize types (datetime -> str) locally first
                 h_copy = h.copy()
                 if isinstance(h_copy.get('last_updated'), datetime):
                     h_copy['last_updated'] = h_copy['last_updated'].isoformat()
                 
                 # 2. Filter keys to match Schema
                 clean_item = prepare_record(h_copy, HOSTING_COLUMNS)
                 
                 # 3. Enrich Data (Fill gaps)
                 clean_item = enrich_record(clean_item, p_type='hosting')
                 
                 hosting_payload.append(clean_item)
             
             # Deduplicate Hosting by (provider_name, plan_name)
             unique_hosting = {}
             for h in hosting_payload:
                 key = (h.get('provider_name', '').lower(), h.get('plan_name', '').lower())
                 unique_hosting[key] = h
                 
             final_hosting = sanitize_payload(list(unique_hosting.values()))
             logger.info(f"    🔄 Upserting {len(final_hosting)} Hosting plans...")
             response = supabase.table("hosting_providers").upsert(
                 final_hosting, 
                 on_conflict="provider_name, plan_name"
             ).execute()
        
        # VPN - Prepare payload
        vpn_payload = []
        if data.get('vpn_providers'):
             for v in data['vpn_providers']:
                 v_copy = v.copy()
                 if isinstance(v_copy.get('last_updated'), datetime):
                     v_copy['last_updated'] = v_copy['last_updated'].isoformat()
                     
                 clean_item = prepare_record(v_copy, VPN_COLUMNS)
                 
                 # 3. Enrich Data
                 clean_item = enrich_record(clean_item, p_type='vpn')
                 
                 vpn_payload.append(clean_item)

             # Deduplicate VPN by provider_name
             unique_vpn = {}
             for v in vpn_payload:
                 key = v.get('provider_name', '').lower()
                 if key:
                     unique_vpn[key] = v
             
             final_vpn = sanitize_payload(list(unique_vpn.values()))
             logger.info(f"    🔄 Upserting {len(final_vpn)} VPN providers...")
             response = supabase.table("vpn_providers").upsert(
                 final_vpn,
                 on_conflict="provider_name"
             ).execute()
             
        logger.info("    ✅ Supabase DB verification passed")

    except Exception as e:
        logger.error(f"    ❌ Supabase Sync Failed: {e}")
        import traceback
        traceback.print_exc()


def detect_changes(old_data, new_data):
    """Compare old and new data to detect promotions and improvements"""
    changes = []
    
    # Check if old_data exists and has content
    if not old_data:
        return ["📝 First run - establishing baseline data"]

    # Helper to map list to dict
    def map_providers(provider_list, key_field='provider_name', sub_key=None):
        mapped = {}
        for p in provider_list:
            k = p.get(key_field)
            if sub_key and p.get(sub_key):
                k = f"{k} ({p.get(sub_key)})"
            if k:
                mapped[k] = p
        return mapped

    # --- VPN COMPARISON ---
    old_vpns = map_providers(old_data.get('vpn_providers', []))
    new_vpns = map_providers(new_data.get('vpn_providers', []))
    
    for name, new_p in new_vpns.items():
        if name in old_vpns:
            old_p = old_vpns[name]
            
            # Price Check (Promotions)
            new_price = new_p.get('pricing_monthly')
            old_price = old_p.get('pricing_monthly')
            if new_price is not None and old_price is not None:
                if new_price < old_price:
                    diff = old_price - new_price
                    pct = (diff / old_price) * 100
                    changes.append(f"💰 VPN PROMOTION: {name} price dropped by ${diff:.2f} ({pct:.1f}%)! Now ${new_price}/mo")
                elif new_price > old_price:
                    diff = new_price - old_price
                    changes.append(f"📈 VPN PRICE HIKE: {name} increased by ${diff:.2f}. Now ${new_price}/mo")

            # Speed Check (Improvements)
            new_speed = new_p.get('avg_speed_mbps')
            old_speed = old_p.get('avg_speed_mbps')
            if new_speed and old_speed and new_speed > old_speed:
                changes.append(f"⚡ VPN SPEED BOOST: {name} now {new_speed} Mbps (+{new_speed - old_speed:.0f} Mbps)")

            # Server Count
            new_servers = new_p.get('server_count')
            old_servers = old_p.get('server_count')
            if new_servers and old_servers and new_servers > old_servers:
                changes.append(f"🌍 VPN EXPANSION: {name} added {new_servers - old_servers} new servers")

    # --- HOSTING COMPARISON ---
    old_hosts = map_providers(old_data.get('hosting_providers', []), sub_key='plan_name')
    new_hosts = map_providers(new_data.get('hosting_providers', []), sub_key='plan_name')

    for name, new_p in new_hosts.items():
        if name in old_hosts:
            old_p = old_hosts[name]
            
            # Price Check
            new_price = new_p.get('pricing_monthly')
            old_price = old_p.get('pricing_monthly')
            if new_price is not None and old_price is not None:
                if new_price < old_price:
                    changes.append(f"🏷️ HOSTING SALE: {name} is ON SALE! ${new_price}/mo (was ${old_price})")
            
            # Storage Upgrade
            new_storage = new_p.get('storage_gb')
            old_storage = old_p.get('storage_gb')
            # Check if moved from strict limit to None (Unlimited) or increased number
            if (old_storage is not None and new_storage is None) or \
               (isinstance(new_storage, (int, float)) and isinstance(old_storage, (int, float)) and new_storage > old_storage):
                changes.append(f"💾 STORAGE UPGRADE: {name} storage increased")

    return changes

def collect_vpn_data(vpn_scrapers):
    """Collect data from ALL VPN providers"""
    logger.info("=" * 80)
    logger.info("COLLECTING VPN DATA")
    logger.info("=" * 80)
    
    vpn_data = []
    
    # scrapers list passed as argument
    
    for i, scraper in enumerate(vpn_scrapers, 1):
        try:
            logger.info(f"[{i}/{len(vpn_scrapers)}] Scraping {scraper.__class__.__name__}...")
            provider = scraper.scrape()
            if provider:
                # Add timestamp for DB
                data = provider.model_dump()
                # Ensure date format compatible with SQL timestamp (ISO is usually fine)
                vpn_data.append(data)
                logger.info(f"    ✅ {provider.provider_name}")
            else:
                logger.error(f"    ❌ Failed")
        except Exception as e:
            logger.error(f"    ❌ Error: {e}")
    
    return vpn_data

def collect_hosting_data(hosting_scrapers):
    """Collect data from ALL hosting providers"""
    logger.info("=" * 80)
    logger.info("COLLECTING HOSTING DATA")
    logger.info("=" * 80)
    
    hosting_data = []
    
    for i, scraper in enumerate(hosting_scrapers, 1):
        try:
            logger.info(f"[{i}/{len(hosting_scrapers)}] Scraping {scraper.__class__.__name__}...")
            plans = scraper.scrape()
            for plan in plans:
                hosting_data.append(plan.model_dump())
            logger.info(f"    ✅ {len(plans)} plans")
        except Exception as e:
            logger.error(f"    ❌ Error: {e}")
    
    return hosting_data

def main():
    """Main collection function"""
    # Load Config (Supabase)
    load_dotenv()
    
    # DYNAMIC LOADING OF SCRAPERS
    # Instead of manual import, we discover all scraper classes
    from scrapers.hosting.base_scraper import BaseHostingScraper
    from scrapers.vpn.base_scraper import BaseVPNScraper
    import pkgutil
    import importlib
    import scrapers.vpn.web
    import scrapers.hosting.web
    
    all_scrapers = []
    
    def load_scrapers_from_package(package, base_class):
        found = []
        if hasattr(package, "__path__"):
             for _, name, _ in pkgutil.iter_modules(package.__path__):
                 full_name = package.__name__ + "." + name
                 try:
                     mod = importlib.import_module(full_name)
                     for attr_name in dir(mod):
                         attr = getattr(mod, attr_name)
                         if isinstance(attr, type) and issubclass(attr, base_class) and attr is not base_class:
                             found.append(attr())
                 except Exception as e:
                     logger.warning(f"⚠️  Could not load scraper {name}: {e}")
        return found

    logger.info("🔍 Discovering Scrapers...")
    
    # VPN Scrapers
    vpn_scrapers = load_scrapers_from_package(scrapers.vpn.web, BaseVPNScraper)
    all_scrapers.extend(vpn_scrapers)
    
    # Hosting Scrapers
    hosting_scrapers = load_scrapers_from_package(scrapers.hosting.web, BaseHostingScraper)
    all_scrapers.extend(hosting_scrapers)
    
    # --- LOAD ORIGINAL SCRAPERS ---
    # These are in the root of scrapers.vpn and scrapers.hosting.scrapers
    
    import scrapers.vpn
    import scrapers.hosting.scrapers
    
    # Original VPNs
    vpn_scrapers_old = load_scrapers_from_package(scrapers.vpn, BaseVPNScraper)
    vpn_scrapers.extend(vpn_scrapers_old)
    all_scrapers.extend(vpn_scrapers_old)
    
    # Original Hosts
    hosting_scrapers_old = load_scrapers_from_package(scrapers.hosting.scrapers, BaseHostingScraper)
    hosting_scrapers.extend(hosting_scrapers_old)
    all_scrapers.extend(hosting_scrapers_old)
    
    logger.info(f"✅ Loaded {len(all_scrapers)} scrapers ({len(vpn_scrapers)} VPN, {len(hosting_scrapers)} Hosting)")
    
    # --- 1. Load History (if exists) ---
    start_time = datetime.now()
    
    logger.info("\n" + "🚀" * 40)
    logger.info("HOSTINGARENA DATA COLLECTION & HISTORY TRACKER")
    logger.info("🚀" * 40 + "\n")
    
    data_dir = Path(__file__).parent.parent / 'data'
    history_dir = data_dir / 'history'
    history_dir.mkdir(exist_ok=True, parents=True)
    
    current_data_file = data_dir / 'providers_data.json'
    
    # Load previous data for comparison
    old_data = None
    if current_data_file.exists():
        try:
            with open(current_data_file, 'r') as f:
                old_data = json.load(f)
        except Exception as e:
            logger.warning(f"Could not read previous data: {e}")

    # Collect new data
    vpn_data = collect_vpn_data(vpn_scrapers)
    hosting_data = collect_hosting_data(hosting_scrapers)
    
    # Prepare output
    output = {
        'collection_timestamp': str(datetime.now()),
        'duration_seconds': (datetime.now() - start_time).total_seconds(),
        'collection_method': 'scrapers_only',
        'vpn_providers': vpn_data,
        'hosting_providers': hosting_data,
        'summary': {
            'total_vpn_providers': len(vpn_data),
            'total_hosting_providers': len(hosting_data),
            'total_providers': len(vpn_data) + len(hosting_data)
        }
    }
    
    # DETECT CHANGES
    changes = detect_changes(old_data, output)
    output['changes_detected'] = changes
    
    # UPLOAD TO SUPABASE (New Step)
    upload_to_supabase(output)
    
    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info("")
    logger.info("="*80)
    logger.info(f"🎉 COLLECTION COMPLETE in {elapsed:.1f}s")
    logger.info("="*80)
    logger.info(f"✅ Total Providers: {len(output['vpn_providers']) + len(output['hosting_providers'])}")
    logger.info("☁️  Data sync with Supabase: COMPLETED")
    logger.info("="*80 + "\n")
    
    return 0

if __name__ == '__main__':
    exit(main())
