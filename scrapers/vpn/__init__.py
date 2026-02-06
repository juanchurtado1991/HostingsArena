"""VPN package - all scrapers"""
from .nordvpn import NordVPNScraper
from .expressvpn import ExpressVPNScraper
from .surfshark import SurfsharkScraper
from .cyberghost import CyberGhostScraper
from .protonvpn import ProtonVPNScraper
from .pia import PIAScraper
from .ipvanish import IPVanishScraper
from .hotspot_shield import HotspotShieldScraper
from .tunnelbear import TunnelBearScraper
from .windscribe import WindscribeScraper
from .mullvad import MullvadVPNScraper
from .vyprvpn import VyprVPNScraper
from .atlasvpn import AtlasVPNScraper
from .purevpn import PureVPNScraper
from .strongvpn import StrongVPNScraper
from .hide_me import HidemeScraper
from .privatevpn import PrivateVPNScraper
from .ivacy import IvacyVPNScraper

from .zenmate import ZenmateScraper
from .norton_vpn import NortonVPNScraper
from .mcafee_vpn import McAfeeVPNScraper
from .astrill import AstrillVPNScraper
from .perfect_privacy import PerfectPrivacyScraper
from .airvpn import AirVPNScraper

__all__ = [
    'NordVPNScraper', 'ExpressVPNScraper', 'SurfsharkScraper',
    'CyberGhostScraper', 'ProtonVPNScraper', 'PIAScraper',
    'IPVanishScraper', 'HotspotShieldScraper', 'TunnelBearScraper',
    'WindscribeScraper', 'MullvadVPNScraper', 'VyprVPNScraper',
    'AtlasVPNScraper', 'PureVPNScraper', 'StrongVPNScraper',
    'HidemeScraper', 'PrivateVPNScraper', 'IvacyVPNScraper',
    'ZenmateScraper', 'NortonVPNScraper',
    'McAfeeVPNScraper', 'AstrillVPNScraper', 'PerfectPrivacyScraper',
    'AirVPNScraper'
]
