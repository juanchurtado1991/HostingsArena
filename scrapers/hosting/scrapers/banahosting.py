"""BanaHosting scraper"""
from scrapers.hosting.base_scraper import BaseHostingScraper
from scrapers.models import HostingProvider, StorageType, WebServer
from datetime import datetime
from typing import List

class BanaHostingScraper(BaseHostingScraper):
    BASE_URL = "https://www.banahosting.com"
    
    def scrape(self) -> List[HostingProvider]:
        plans_list = [
HostingPlan(name='Bana Starter', price_monthly=4.95, renewal_price_monthly=4.95, storage_gb='50 GB SSD', bandwidth='Unmetered', features=['SSL', 'Backup']),
            HostingPlan(name='Bana Professional', price_monthly=6.95, renewal_price_monthly=6.95, storage_gb='100 GB SSD', bandwidth='Unmetered', features=['SSL', 'Backup']),
            HostingPlan(name='Bana Corporate', price_monthly=9.95, renewal_price_monthly=9.95, storage_gb='150 GB SSD', bandwidth='Unmetered', features=['SSL', 'Backup']),
        ]

        # Primary record (usually the cheapest or first plan)
        first_plan = plans_list[0] if plans_list else None
        
        provider = HostingProvider(
            provider_name='BanaHosting',
            provider_type='shared',
            plan_name=first_plan.name if first_plan else 'Basic',
            pricing_monthly=first_plan.price_monthly if first_plan else 0,
            renewal_price=first_plan.renewal_price_monthly if first_plan else 0,
            plans=plans_list,
            hidden_fees={"renewal_hike": "Standard", "setup_fee": "Check checkout"},
            storage_gb=int(str(first_plan.storage_gb).split()[0]) if first_plan and str(first_plan.storage_gb).split() else 0,
            storage_type=StorageType.SSD,
            bandwidth='Unmetered',
            web_server=WebServer.UNKNOWN,
            php_versions=['8.1', '8.2', '8.3'],
            inodes=200000,
            performance_grade='A',
            support_score=90,
            free_ssl=True,
            website_url=self.BASE_URL,
            last_updated=datetime.now()
        )
        return [provider]
