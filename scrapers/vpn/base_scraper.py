"""Base scraper class for VPN providers"""
import requests
from bs4 import BeautifulSoup
from abc import ABC, abstractmethod
from typing import Optional
from ..models import VPNProvider
from ..utils import RateLimiter
from ..config import USER_AGENT, REQUEST_TIMEOUT, MAX_RETRIES
import logging
from scrapers.adaptive_base import AdaptiveBaseScraper

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseVPNScraper(AdaptiveBaseScraper):
    """Base class for VPN provider scrapers"""
    
    def __init__(self, provider_name: str = "Unknown"):
        super().__init__(provider_name, provider_type='vpn')
        self.rate_limiter = RateLimiter(requests_per_second=0.5)  # 1 request per 2 seconds
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        self.timeout = REQUEST_TIMEOUT
        self.max_retries = MAX_RETRIES
    
    @abstractmethod
    def scrape_pricing(self) -> dict:
        """
        Scrape pricing information
        
        Returns:
            Dictionary with pricing fields
        """
        pass
    
    @abstractmethod
    def scrape_features(self) -> dict:
        """
        Scrape features and specifications
        
        Returns:
            Dictionary with feature fields
        """
        pass
    
    def run(self):
        """Standard execution for Adaptive Framework"""
        try:
            pricing = self.scrape_pricing()
            features = self.scrape_features()
            
            # Meritge dicts
            data = {**pricing, **features}
            
            return VPNProvider(**data)
        except Exception as e:
            logger.error(f"Scraper failed: {e}")
            return None
    
    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Fetch and parse a web page with rate limiting and retry logic
        
        Args:
            url: The URL to scrape
            
        Returns:
            BeautifulSoup object or None if failed
        """
        return super().fetch_page(url)
    
    def scrape(self) -> Optional[VPNProvider]:
        """
        Main scraping method - combines pricing and features
        
        Returns:
            VPNProvider object or None if scraping failed
        """
        try:
            logger.info(f"Starting scrape for {self.__class__.__name__}")
            pricing = self.scrape_pricing()
            features = self.scrape_features()
            
            if not pricing or not features:
                logger.error(f"Failed to scrape {self.__class__.__name__}")
                return None
            
            data = {**pricing, **features}
            provider = VPNProvider(**data)
            logger.info(f"✅ Successfully scraped {provider.provider_name}")
            return provider
            
        except Exception as e:
            logger.error(f"❌ Error scraping {self.__class__.__name__}: {e}")
            return None
