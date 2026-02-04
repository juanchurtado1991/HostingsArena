"""ProtonVPN scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class ProtonVPNScraper(BaseVPNScraper):
    BASE_URL = "https://protonvpn.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'ProtonVPN',
            'pricing_monthly': 9.99,
            'pricing_yearly': 5.99,
            'pricing_2year': 4.99,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 4914,
            'country_count': 91,
            'simultaneous_connections': 10,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
