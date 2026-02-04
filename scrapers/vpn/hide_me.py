"""Hide.me scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class HidemeScraper(BaseVPNScraper):
    BASE_URL = "https://hide.me"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'Hide.me',
            'pricing_monthly': 12.95,
            'pricing_yearly': 4.99,
            'pricing_2year': None,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 2100,
            'country_count': 77,
            'simultaneous_connections': 10,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
