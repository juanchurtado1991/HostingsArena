"""AirVPN scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class AirVPNScraper(BaseVPNScraper):
    BASE_URL = "https://airvpn.org"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'AirVPN',
            'pricing_monthly': 9.0,
            'pricing_yearly': 4.5,
            'pricing_2year': None,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 260,
            'country_count': 23,
            'simultaneous_connections': 5,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
