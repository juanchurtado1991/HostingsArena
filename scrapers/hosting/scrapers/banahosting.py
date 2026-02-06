"""BanaHosting scraper"""
from scrapers.hosting.base_scraper import BaseHostingScraper
from scrapers.models import HostingProvider, StorageType, WebServer
from datetime import datetime
from typing import List

class BanaHostingScraper(BaseHostingScraper):
    BASE_URL = "https://www.banahosting.com"
    
    def scrape_plans(self) -> List[HostingProvider]:
        providers = []
        
        # Plan 1: Starter
        p1 = HostingProvider(
            provider_name='BanaHosting',
            provider_type='shared',
            plan_name='Bana Starter',
            pricing_monthly=4.95,
            renewal_price=4.95,
            storage_gb=50,
            storage_type=StorageType.SSD,
            bandwidth='Unmetered',
            website_url=self.BASE_URL,
            free_ssl=True,
            backup_included=True,
            uptime_guarantee=99.9,
            money_back_days=30
        )
        providers.append(p1)

        # Plan 2: Professional
        p2 = HostingProvider(
            provider_name='BanaHosting',
            provider_type='shared',
            plan_name='Bana Professional',
            pricing_monthly=6.95,
            renewal_price=6.95,
            storage_gb=100,
            storage_type=StorageType.SSD,
            bandwidth='Unmetered',
            website_url=self.BASE_URL,
            free_ssl=True,
            backup_included=True,
            uptime_guarantee=99.9,
            money_back_days=30
        )
        providers.append(p2)

        # Plan 3: Corporate
        p3 = HostingProvider(
            provider_name='BanaHosting',
            provider_type='shared',
            plan_name='Bana Corporate',
            pricing_monthly=9.95,
            renewal_price=9.95,
            storage_gb=150,
            storage_type=StorageType.SSD,
            bandwidth='Unmetered',
            website_url=self.BASE_URL,
            free_ssl=True,
            backup_included=True,
            uptime_guarantee=99.9,
            money_back_days=30
        )
        providers.append(p3)

        return providers
