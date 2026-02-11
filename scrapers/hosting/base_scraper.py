"""Base scraper class for hosting providers"""
import requests
from bs4 import BeautifulSoup
from abc import ABC, abstractmethod
from typing import List
from ..models import HostingProvider
from ..utils import RateLimiter
from ..config import USER_AGENT, REQUEST_TIMEOUT, MAX_RETRIES
import logging
from scrapers.adaptive_base import AdaptiveBaseScraper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseHostingScraper(AdaptiveBaseScraper):
    """Base class for hosting provider scrapers"""
    
    def __init__(self, provider_name: str = "Unknown"):
        super().__init__(provider_name, provider_type='hosting')
        self.rate_limiter = RateLimiter(requests_per_second=0.5)
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
    def scrape_plans(self) -> List[HostingProvider]:
        """Scrape all plans - must be implemented"""
        pass
        
    def run(self):
        """Standard execution for Adaptive Framework"""
        try:
            return self.scrape_plans()
        except Exception as e:
            logger.error(f"Scraper failed: {e}")
            return []
    
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
            
            # 🚀 PHASE 9: INJECT VERIFIED DEEP DIVE SPECS
            specs = self.get_verified_field('specs', {})
            if specs and plans:
                logger.info(f"💉 Injecting {len(specs)} Verified Specs into {len(plans)} plans for {self.provider_name}")
                for plan in plans:
                    for key, value in specs.items():
                        # Only overwrite if value is valid and field exists
                        if hasattr(plan, key) and value:
                            # Verify if the field is empty or unknown in the plan before overwriting? 
                            # Actually, Verified Data > Unknown Scraped Data.
                            # But if Scraper found something specific, maybe keep it?
                            # Decision: Verified Data is "Truth Source" for these static fields.
                            setattr(plan, key, value)
            
            logger.info(f"✅ Scraped {len(plans)} plans from {self.__class__.__name__}")
            return plans
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return []
