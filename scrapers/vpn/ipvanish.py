"""IPVanish scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class IPVanishScraper(BaseVPNScraper):
    BASE_URL = "https://ipvanish.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'IPVanish',
            'pricing_monthly': 12.99,
            'pricing_yearly': 3.33,
            'pricing_2year': 2.62,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 2400,
            'country_count': 90,
            'simultaneous_connections': 10,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
