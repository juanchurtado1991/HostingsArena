"""VPN Unlimited scraper implementation"""
from .base_scraper import BaseVPNScraper
from datetime import datetime

class VPNUnlimitedScraper(BaseVPNScraper):
    BASE_URL = "https://vpnunlimited.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'VPN Unlimited',
            'pricing_monthly': 9.99,
            'pricing_yearly': 5.0,
            'pricing_2year': 2.78,
            'website_url': self.BASE_URL,
            'last_updated': datetime.now()
        }
    
    def scrape_features(self) -> dict:
        return {
            'server_count': 500,
            'country_count': 80,
            'simultaneous_connections': 10,
            'protocols': ['OpenVPN', 'IKEv2', 'WireGuard'],
            'has_kill_switch': True,
            'logging_policy': 'No logs',
            'streaming_support': True,
            'torrenting_allowed': True,
            'money_back_days': 30
        }
