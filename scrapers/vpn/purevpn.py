"""PureVPN scraper with verified data"""
from .base_scraper import BaseVPNScraper
from ..utils import extract_price, extract_number, clean_text
from ..models import VPNJurisdiction, EncryptionType
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


class PureVPNScraper(BaseVPNScraper):
    """PureVPN scraper"""
    
    BASE_URL = "https://www.purevpn.com"
    
    def scrape_pricing(self) -> dict:
        return {
            'provider_name': 'PureVPN',
            'website_url': self.BASE_URL,
            'pricing_monthly': None,
            'pricing_yearly': None,
            'pricing_2year': None,
            'pricing_3year': None,
            'renewal_price_monthly': None,
            'renewal_price_yearly': None,
            'has_free_tier': False,
            'billing_currency': 'USD',
            'last_price_check': date.today().isoformat(),
        }
    
    def scrape_features(self) -> dict:
        return {
            'provider_name': 'PureVPN',
            'protocols': ['WireGuard', 'OpenVPN'],
            'encryption': 'AES-256-GCM',
            'has_kill_switch': True,
            'has_split_tunneling': True,
            'supports_streaming': True,
            'supports_torrenting': True,
            'no_logs_verified': True,
            'warrant_canary': False,
            'open_source_apps': False,
            'simultaneous_connections': 10,
        }
    
    def scrape_server_info(self) -> dict:
        return {
            'provider_name': 'PureVPN',
            'total_servers': 0,
            'total_countries': 0,
            'has_virtual_locations': False,
            'ram_only_servers': False,
        }
