"""Atlas VPN scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class AtlasVPNScraper(BaseVPNScraper):
    BASE_URL = "https://atlasvpn.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'Atlas VPN',
            'pricing_monthly': 10.99,
            'pricing_yearly': 1.99,
            'pricing_2year': 1.39,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 750,
            'country_count': 49,
            'simultaneous_connections': 999,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
