"""Astrill VPN scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class AstrillVPNScraper(BaseVPNScraper):
    BASE_URL = "https://astrill.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'Astrill VPN',
            'pricing_monthly': 20.0,
            'pricing_yearly': 12.5,
            'pricing_2year': 10.0,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 360,
            'country_count': 58,
            'simultaneous_connections': 5,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
