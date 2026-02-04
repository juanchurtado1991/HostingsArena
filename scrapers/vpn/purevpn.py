"""PureVPN scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class PureVPNScraper(BaseVPNScraper):
    BASE_URL = "https://purevpn.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'PureVPN',
            'pricing_monthly': 10.95,
            'pricing_yearly': 2.14,
            'pricing_2year': 1.88,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 6500,
            'country_count': 78,
            'simultaneous_connections': 10,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
