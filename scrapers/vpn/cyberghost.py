"""CyberGhost scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class CyberGhostScraper(BaseVPNScraper):
    BASE_URL = "https://cyberghostvpn.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'CyberGhost',
            'pricing_monthly': 12.99,
            'pricing_yearly': 2.19,
            'pricing_2year': None,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 11690,
            'country_count': 100,
            'simultaneous_connections': 7,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
