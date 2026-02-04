"""Base scraper class for hosting providers"""
import requests
from bs4 import BeautifulSoup
from abc import ABC, abstractmethod
from typing import List
from ..models import HostingProvider
from ..utils import RateLimiter
from ..config import USER_AGENT, REQUEST_TIMEOUT, MAX_RETRIES
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseHostingScraper(ABC):
    """Base class for hosting provider scrapers"""
    
    def __init__(self):
        self.rate_limiter = RateLimiter(requests_per_second=0.5)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT
        })
        self.timeout = REQUEST_TIMEOUT
        self.max_retries = MAX_RETRIES
    
    @abstractmethod
    def scrape_plans(self) -> List[HostingProvider]:
        """Scrape all plans - must be implemented"""
        pass
    
    def fetch_page(self, url: str):
        """Fetch page with rate limiting"""
        self.rate_limiter.wait()
        
        for attempt in range(self.max_retries):
            try:
                response = self.session.get(url, timeout=self.timeout)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'html.parser')
            except Exception as e:
                logger.warning(f"Error fetching {url}: {e}")
                if attempt == self.max_retries - 1:
                    return None
        return None
    
    def scrape(self) -> List[HostingProvider]:
        """Main scraping method"""
        try:
            plans = self.scrape_plans()
            logger.info(f"✅ Scraped {len(plans)} plans from {self.__class__.__name__}")
            return plans
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return []
