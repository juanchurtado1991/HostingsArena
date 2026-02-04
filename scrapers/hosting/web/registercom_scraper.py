from ..base_scraper import BaseHostingScraper
from scrapers.models import HostingProvider

class RegisterComScraper(BaseHostingScraper):
    def __init__(self):
        super().__init__()
        self.name = "RegisterCom"
        self.url = "https://www.register.com/hosting"

    def scrape_plans(self):
        # TODO: Implement specific selectors for RegisterCom
        # Returning placeholder Tier 2 plan for MVP
         return [
             HostingProvider(
                provider_name="RegisterCom",
                plan_name="Shared Starter",
                provider_type="Shared",
                pricing_monthly=3.99,
                renewal_price=9.99,
                storage_gb=50,
                bandwidth="Unlimited",
                website_url="https://www.register.com/hosting",
                features={
                    "ssl": True,
                    "domain": False,
                    "backups": True
                },
                free_ssl=True,
                money_back_days=30,
                raw_data={
                    "notes": "Placeholder data for RegisterCom - pending scraper refinement"
                }
             )
         ]