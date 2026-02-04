"""Ivacy VPN scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class IvacyVPNScraper(BaseVPNScraper):
    BASE_URL = "https://ivacy.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'Ivacy VPN',
            'pricing_monthly': 9.95,
            'pricing_yearly': 1.16,
            'pricing_2year': None,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 5700,
            'country_count': 100,
            'simultaneous_connections': 10,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
