"""Kinsta Scraper (Adaptive)"""
from ..base_scraper import BaseHostingScraper
from ...models import HostingProvider, StorageType
from datetime import datetime
from typing import List

class KinstaScraper(BaseHostingScraper):
    def __init__(self):
        super().__init__(provider_name="Kinsta")

    def scrape_plans(self) -> List[HostingProvider]:
        verified_plans = self.get_verified_field('plans', [])
        providers = []
        for p in verified_plans:
            storage_str = str(p.get('storage', '0'))
            storage_num = ''.join(filter(str.isdigit, storage_str.split()[0])) or '0'
            providers.append(HostingProvider(
                provider_name="Kinsta",
                provider_type='shared',
                plan_name=p['name'],
                website_url="https://kinsta.com",
                pricing_monthly=p['price'],
                renewal_price=p['renewal'],
                storage_gb=int(storage_num) if storage_num != '0' else 999,
                bandwidth=p.get('bandwidth', 'Unlimited'),
                free_domain=p.get('free_domain', False),
                free_ssl=True,
                last_updated=datetime.now()
            ))
        return providers
