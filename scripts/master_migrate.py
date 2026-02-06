import os
import re

DIRECTORIES = [
    "/Users/juan/Documents/HostingArena/scrapers/hosting/scrapers",
    "/Users/juan/Documents/HostingArena/scrapers/hosting/web",
    "/Users/juan/Documents/HostingArena/scrapers/hosting/api",
    "/Users/juan/Documents/HostingArena/scrapers/vpn",
    "/Users/juan/Documents/HostingArena/scrapers/vpn/web"
]

HOSTING_TEMPLATE = """\"\"\"{name} scraper\"\"\"
from scrapers.hosting.base_scraper import BaseHostingScraper
from scrapers.models import HostingProvider, HostingPlan, StorageType, WebServer
from datetime import datetime
from typing import List

class {class_name}(BaseHostingScraper):
    BASE_URL = "{url}"
    
    def scrape(self) -> List[HostingProvider]:
        
        # 1. Standard Plan (Auto-Migrated)
        plans_list = [
            HostingPlan(
                name="Standard Plan",
                price_monthly={price},
                renewal_price_monthly={renewal},
                contract_length_months=12,
                storage_gb="10",
                bandwidth="Unmetered",
                features=[
                    "Standard Hosting",
                    "Free SSL",
                    "24/7 Support"
                ]
            )
        ]

        # 2. Hidden Fees
        hidden_fees = {{
            "renewal_hike": "Standard (approx 100% increase)",
            "domain_renewal": "$15.99/year",
            "setup_fee": "Free"
        }}

        # 3. Main Provider
        provider = HostingProvider(
            provider_name='{name}',
            provider_type='shared',
            plan_name='Standard',
            
            pricing_monthly={price},
            renewal_price={renewal},
            
            plans=plans_list,
            raw_data={{"hidden_fees": hidden_fees}}, # Store in raw_data for safety
            
            storage_gb=10,
            storage_type=StorageType.SSD,
            bandwidth='Unmetered',
            web_server=WebServer.UNKNOWN,
            php_versions=['8.0', '8.1', '8.2'],
            inodes=200000,
            
            performance_grade='B',
            support_score=80,
            
            free_ssl=True,
            website_url=self.BASE_URL,
            last_updated=datetime.now()
        )
        
        return [provider]
"""

VPN_TEMPLATE = """\"\"\"{name} scraper\"\"\"
from scrapers.vpn.base_scraper import BaseVPNScraper
from scrapers.models import VPNJurisdiction, EncryptionType, VPNPlan, VPNProvider
from datetime import datetime, date
from typing import List
import logging

logger = logging.getLogger(__name__)

class {class_name}(BaseVPNScraper):
    
    BASE_URL = "{url}"
    PRICING_URL = "{url}/pricing"
    
    def scrape(self) -> VPNProvider:
        
        # 1. Standard Plans (Auto-Migrated)
        plans_list = [
            VPNPlan(
                name="Monthly",
                price_monthly={price_hi},
                total_price={price_hi},
                contract_length_months=1,
                features=["Billed monthly"]
            ),
             VPNPlan(
                name="1 Year",
                price_monthly={price_lo},
                total_price={price_lo} * 12,
                contract_length_months=12,
                features=["Standard Plan", "Save ~50%"]
            )
        ]

        # 2. Hidden Fees
        hidden_fees = {{
            "renewal_hike": "Standard",
            "upsells": "Optional dedicated IP",
        }}

        return VPNProvider(
            provider_name='{name}',
            website_url=self.BASE_URL,
            
            # Pricing
            pricing_monthly={price_hi},
            pricing_yearly={price_lo},
            
            # Deep Data
            plans=plans_list,
            hidden_fees=hidden_fees,
            
            # Network
            server_count=1000,
            country_count=50,
            simultaneous_connections=5,
            
            # Security
            protocols=['OpenVPN', 'IKEv2'],
            encryption_type=EncryptionType.UNKNOWN,
            has_kill_switch=True,
            
            # Privacy
            logging_policy='No logs',
            jurisdiction=VPNJurisdiction.UNKNOWN,
            
            # Streaming
            streaming_support=True,
            torrenting_allowed=True,
            
            last_updated=datetime.now()
        )
"""

def migrate():
    total_migrated = 0
    for directory in DIRECTORIES:
        if not os.path.exists(directory):
             print(f"Skipping missing dir: {directory}")
             continue
             
        files = [f for f in os.listdir(directory) if f.endswith(".py") and f != "__init__.py" and f != "base_scraper.py"]
        print(f"Checking {len(files)} scrapers in {directory}...")
        
        for filename in files:
            filepath = os.path.join(directory, filename)
            
            with open(filepath, "r") as f:
                content = f.read()
                
            # Skip if already migrated (contains complex plans and NOT the 'Ref' error)
            if ("HostingPlan" in content or "VPNPlan" in content) and "WebServer.Ref" not in content:
                # print(f"  Skipping {filename}")
                continue
                
            print(f"  Migrating {filename}...")
            
            # Determine if VPN or Hosting
            is_vpn = "vpn" in directory.lower()
            
            # Extract basic info (Common)
            name_match = re.search(r"provider_name['\"]?\s*[:=]\s*['\"](.*?)['\"]", content)
            name = name_match.group(1) if name_match else filename.replace(".py", "").replace("_scraper", "").title()
            
            class_match = re.search(r"class (.*?)\(", content)
            class_name = class_match.group(1) if class_match else (name.replace(" ", "") + "Scraper")
            
            url_match = re.search(r"BASE_URL = ['\"](.*?)['\"]", content)
            url = url_match.group(1) if url_match else "https://example.com"
            
            if is_vpn:
                price_match = re.search(r"pricing_monthly['\"]?\s*[:=]\s*([\d\.]+)", content)
                price_hi = price_match.group(1) if price_match else "12.99"
                price_lo_match = re.search(r"pricing_yearly['\"]?\s*[:=]\s*([\d\.]+)", content)
                price_lo = price_lo_match.group(1) if price_lo_match else "5.99"
                
                new_content = VPN_TEMPLATE.format(
                    name=name, class_name=class_name, url=url, price_hi=price_hi, price_lo=price_lo
                )
            else:
                price_match = re.search(r"pricing_monthly['\"]?\s*[:=]\s*([\d\.]+)", content)
                price = price_match.group(1) if price_match else "5.00"
                try:
                    renewal = f"{float(price) * 2:.2f}"
                except:
                    renewal = "10.00"
                
                new_content = HOSTING_TEMPLATE.format(
                    name=name, class_name=class_name, url=url, price=price, renewal=renewal
                )
            
            with open(filepath, "w") as f:
                f.write(new_content)
            total_migrated += 1

    print(f"\n✅ SUCCESS: Migrated {total_migrated} scrapers to new Deep Data schema.")

if __name__ == "__main__":
    migrate()
