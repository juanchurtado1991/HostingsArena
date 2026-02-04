"""TunnelBear scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class TunnelBearScraper(BaseVPNScraper):
    BASE_URL = "https://tunnelbear.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'TunnelBear',
            'pricing_monthly': 9.99,
            'pricing_yearly': 4.99,
            'pricing_2year': 3.33,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 5000,
            'country_count': 48,
            'simultaneous_connections': 5,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
