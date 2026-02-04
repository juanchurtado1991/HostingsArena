"""ScalaHosting scraper"""
from ..base_scraper import BaseHostingScraper
from ...models import HostingProvider
from datetime import datetime
from typing import List

class ScalaHostingScraper(BaseHostingScraper):
    BASE_URL = "https://scalahosting.com"
    
    def scrape_plans(self) -> List[HostingProvider]:
        return [HostingProvider(
            provider_name='ScalaHosting',
            provider_type='shared',
            plan_name='Basic',
            pricing_monthly=3.95,
            storage_gb=10,
            bandwidth='unlimited',
            free_domain=True,
            free_ssl=True,
            uptime_guarantee=99.9,
            money_back_days=30,
            control_panel='cPanel',
            website_url=self.BASE_URL,
            last_updated=datetime.now()
        )]
