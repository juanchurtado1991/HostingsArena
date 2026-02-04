"""Base API client class for hosting providers"""
import requests
from abc import ABC, abstractmethod
from typing import List, Optional
from ..models import HostingProvider
from ..config import REQUEST_TIMEOUT, MAX_RETRIES
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseAPIClient(ABC):
    """Base class for hosting provider API clients"""
    
    def __init__(self, api_key: str, api_secret: Optional[str] = None):
        """
        Initialize API client
        
        Args:
            api_key: API key for authentication
            api_secret: Optional API secret for authentication
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.session = requests.Session()
        self.timeout = REQUEST_TIMEOUT
        self.max_retries = MAX_RETRIES
        self._setup_auth_headers()
    
    @abstractmethod
    def _setup_auth_headers(self):
        """Set up authentication headers (provider-specific)"""
        pass
    
    @abstractmethod
    def get_plans(self) -> List[HostingProvider]:
        """
        Get all hosting plans from API
        
        Returns:
            List of HostingProvider objects
        """
        pass
    
    def make_request(self, url: str, method: str = 'GET', **kwargs) -> Optional[dict]:
        """
        Make HTTP request to API with retry logic
        
        Args:
            url: API endpoint URL
            method: HTTP method (GET, POST, etc.)
            **kwargs: Additional arguments for requests
        
        Returns:
            JSON response as dict or None if failed
        """
        for attempt in range(self.max_retries):
            try:
                logger.info(f"{method} {url} (attempt {attempt + 1}/{self.max_retries})")
                response = self.session.request(
                    method=method,
                    url=url,
                    timeout=self.timeout,
                    **kwargs
                )
                response.raise_for_status()
                return response.json()
                
            except requests.RequestException as e:
                logger.warning(f"API request error: {e}")
                if attempt == self.max_retries - 1:
                    logger.error(f"Failed after {self.max_retries} attempts")
                    return None
        
        return None
    
    def collect_data(self) -> List[HostingProvider]:
        """
        Main collection method
        
        Returns:
            List of HostingProvider objects
        """
        try:
            logger.info(f"Starting API collection for {self.__class__.__name__}")
            plans = self.get_plans()
            logger.info(f"✅ Successfully collected {len(plans)} plans from {self.__class__.__name__}")
            return plans
            
        except Exception as e:
            logger.error(f"❌ Error collecting from {self.__class__.__name__}: {e}")
            return []
