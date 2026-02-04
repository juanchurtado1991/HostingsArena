"""DigitalOcean API client"""
from ..base_api_client import BaseAPIClient
from ...models import HostingProvider
from datetime import datetime
from typing import List
import logging

logger = logging.getLogger(__name__)

class DigitalOceanClient(BaseAPIClient):
    BASE_URL = "https://api.digitalocean.com/v2"
    
    def _setup_auth_headers(self):
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })
    
    def get_plans(self) -> List[HostingProvider]:
        """Get plans from DigitalOcean"""
        plans = []
        data = self.make_request(f"{self.BASE_URL}/sizes")
        
        if not data or 'sizes' not in data:
            logger.warning("DigitalOcean API returned no data")
            return plans
        
        for size in data.get('sizes', []):
            if not size.get('available'):
                continue
            
            try:
                plan = HostingProvider(
                    provider_name='DigitalOcean',
                    provider_type='cloud',
                    plan_name=size.get('slug', 'unknown'),
                    pricing_monthly=size.get('price_monthly', 0.0),
                    pricing_yearly=size.get('price_monthly', 0.0) * 12,
                    storage_gb=size.get('disk', 0),
                    bandwidth=f"{size.get('transfer', 0)} TB/month",
                    ram_mb=size.get('memory', 0),
                    cpu_cores=size.get('vcpus', 0),
                    free_domain=False,
                    free_ssl=True,
                    uptime_guarantee=99.99,
                    money_back_days=0,
                    control_panel='DigitalOcean Dashboard',
                    website_url="https://digitalocean.com",
                    last_updated=datetime.now()
                )
                plans.append(plan)
            except Exception as e:
                logger.warning(f"Error processing size: {e}")
        
        return plans
