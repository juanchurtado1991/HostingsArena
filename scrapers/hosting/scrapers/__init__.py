"""All hosting scrapers (25 total - MVP scraper-only version)"""
from .bluehost import BluehostScraper
from .hostgator import HostGatorScraper
from .siteground import SiteGroundScraper
from .a2hosting import A2HostingScraper
from .inmotionhosting import InMotionHostingScraper
from .greengeeks import GreenGeeksScraper
from .ipage import iPageScraper
from .hostinger import HostingerScraper
from .interserver import InterServerScraper
from .webhost000 import Webhost000Scraper
from .hostwinds import HostwindsScraper
from .fastcomet import FastCometScraper
from .scalahosting import ScalaHostingScraper
from .chemicloud import ChemiCloudScraper
from .flywheel import FlywheelScraper
from .hostgator_cloud import HostgatorCloudScraper
# Converted from API to scrapers for MVP
from .digitalocean import DigitalOceanScraper
from .vultr import VultrScraper
from .linode import LinodeScraper
from .cloudways import CloudwaysScraper
from .kinsta import KinstaScraper
from .godaddy import GoDaddyScraper
from .dreamhost import DreamHostScraper
from .namecheap import NamecheapScraper
from .liquidweb import LiquidWebScraper

__all__ = [
    'BluehostScraper', 'HostGatorScraper', 'SiteGroundScraper',
    'A2HostingScraper', 'InMotionHostingScraper', 'GreenGeeksScraper',
    'iPageScraper', 'HostingerScraper', 'InterServerScraper',
    'Webhost000Scraper', 'HostwindsScraper', 'FastCometScraper',
    'ScalaHostingScraper', 'ChemiCloudScraper', 'FlywheelScraper',
    'HostgatorCloudScraper',
    'DigitalOceanScraper', 'VultrScraper', 'LinodeScraper',
    'CloudwaysScraper', 'KinstaScraper', 'GoDaddyScraper',
    'DreamHostScraper', 'NamecheapScraper', 'LiquidWebScraper'
]
