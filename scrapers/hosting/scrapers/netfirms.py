"""Netfirms Scraper (Adaptive)"""
from ..base_scraper import BaseHostingScraper
from ...models import HostingProvider, StorageType
from datetime import datetime
from typing import List

class NetfirmsScraper(BaseHostingScraper):
    def __init__(self):
        super().__init__(provider_name="Netfirms")

    def scrape_plans(self) -> List[HostingProvider]:
        verified_plans = self.get_verified_field('plans', [])
        providers = []
        for p in verified_plans:
            providers.append(HostingProvider(
                provider_name="Netfirms",
                provider_type='shared',
                plan_name=p['name'],
                website_url="https://www.netfirms.com",
                pricing_monthly=p['price'],
                renewal_price=p['renewal'],
                storage_gb=int(str(p['storage']).split()[0]),
                bandwidth="Unlimited",
                free_domain=True,
                free_ssl=True,
                last_updated=datetime.now()
            ))
        return providers
