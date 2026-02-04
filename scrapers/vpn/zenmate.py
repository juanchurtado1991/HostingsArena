"""Zenmate scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class ZenmateScraper(BaseVPNScraper):
    BASE_URL = "https://zenmate.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'Zenmate',
            'pricing_monthly': 10.99,
            'pricing_yearly': 2.05,
            'pricing_2year': None,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 4900,
            'country_count': 81,
            'simultaneous_connections': 999,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
