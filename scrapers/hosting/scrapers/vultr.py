"""Vultr scraper (MVP - simple version)"""
from ..base_scraper import BaseHostingScraper
from ...models import HostingProvider, StorageType, WebServer
from datetime import datetime
from typing import List

class VultrScraper(BaseHostingScraper):
    BASE_URL = "https://vultr.com"
    
    def scrape_plans(self) -> List[HostingProvider]:
        """Simple scraper with basic data (will enhance later)"""
        return [HostingProvider(
            provider_name='Vultr',
            provider_type='cloud',
            plan_name='Basic',
            website_url=self.BASE_URL,
            pricing_monthly=6.0,
            storage_gb=25 if 'cloud' == 'cloud' else 10,
            storage_type=StorageType.SSD,
            bandwidth='unlimited',
            web_server=WebServer.NGINX if 'cloud' == 'cloud' else WebServer.APACHE,
            php_versions=['8.0', '8.1', '8.2'],
            databases_allowed=None,
            database_types=['MySQL'],
            free_ssl=True,
            backup_included=True,
            backup_frequency='daily',
            control_panel='Custom' if 'cloud' == 'cloud' else 'cPanel',
            uptime_guarantee=99.9,
            support_channels=['24/7 Live Chat', 'Email'],
            money_back_days=30,
            last_updated=datetime.now()
        )]
