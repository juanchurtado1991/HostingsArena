"""Namecheap API client"""
from ..base_api_client import BaseAPIClient
from ...models import HostingProvider
from datetime import datetime
from typing import List
import logging

logger = logging.getLogger(__name__)

class NamecheapClient(BaseAPIClient):
    BASE_URL = "https://api.namecheap.com"
    
    def _setup_auth_headers(self):
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })
    
    def get_plans(self) -> List[HostingProvider]:
        """Get plans from Namecheap"""
        logger.warning("Namecheap API client placeholder - not fully implemented")
        return []
