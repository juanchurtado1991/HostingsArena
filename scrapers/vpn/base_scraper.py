"""Base scraper class for VPN providers"""
import requests
from bs4 import BeautifulSoup
from abc import ABC, abstractmethod
from typing import Optional
from ..models import VPNProvider
from ..utils import RateLimiter
from ..config import USER_AGENT, REQUEST_TIMEOUT, MAX_RETRIES
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseVPNScraper(ABC):
    """Base class for VPN provider scrapers"""
    
    def __init__(self):
        self.rate_limiter = RateLimiter(requests_per_second=0.5)  # 1 request per 2 seconds
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT
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
    
    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Fetch and parse a web page with rate limiting and retry logic
        
        Args:
            url: URL to fetch
        
        Returns:
            BeautifulSoup object or None if failed
        """
        self.rate_limiter.wait()
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Fetching {url} (attempt {attempt + 1}/{self.max_retries})")
                response = self.session.get(url, timeout=self.timeout)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'html.parser')
            except requests.RequestException as e:
                logger.warning(f"Error fetching {url}: {e}")
                if attempt == self.max_retries - 1:
                    logger.error(f"Failed to fetch {url} after {self.max_retries} attempts")
                    return None
        
        return None
    
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
