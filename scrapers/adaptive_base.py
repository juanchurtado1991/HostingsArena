"""
Adaptive Base Scraper Logic
---------------------------
Core resilience layer for HostingArena scrapers.
Handles:
1. Anti-bot evasion (User-Agents, Delays)
2. Hybrid Data Loading (Live Scrape > Verified JSON > Cache)
3. Standardized Error Handling
"""
import logging
import random
import time
import json
from abc import ABC, abstractmethod
from typing import Optional, List, Any, Dict
from pathlib import Path
import requests
from bs4 import BeautifulSoup

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')

class AdaptiveBaseScraper(ABC):
    """
    Base class for all Deep Data scrapers.
    Prioritizes Live Scraping but intelligently falls back to Verification Registry
    to ensure 100% Real Data (no placeholders).
    """
    
    # Common headers to rotate
    USER_AGENTS = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    ]

    def __init__(self, provider_name: str, provider_type: str = 'hosting'):
        self.provider_name = provider_name
        self.provider_type = provider_type  # 'hosting' or 'vpn'
        self.logger = logging.getLogger(f"Scraper.{provider_name}")
        self.session = requests.Session()
        
        # Load verified data registry
        self.verified_data = self._load_verified_data()

    def _get_random_header(self) -> Dict[str, str]:
        return {
            "User-Agent": random.choice(self.USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

    def _load_verified_data(self) -> Dict[str, Any]:
        """Loads the 'Truth Source' JSON to use as fallback or enrichment"""
        try:
            # Assuming data is in /Users/juan/Documents/HostingArena/data/verified_data.json
            path = Path(__file__).parent.parent / "data" / "verified_data.json"
            if path.exists():
                with open(path, 'r') as f:
                    all_data = json.load(f)
                    
                # Find our specific provider in the list
                category = self.provider_type  # 'hosting' or 'vpn'
                if category in all_data:
                    for p in all_data[category]:
                        if p.get('name', '').lower() == self.provider_name.lower():
                            return p
            return {}
        except Exception as e:
            self.logger.warning(f"Failed to load verified data registry: {e}")
            return {}

    def fetch_page(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """Adaptive fetch with exponential backoff"""
        for i in range(retries):
            try:
                headers = self._get_random_header()
                # Random delay to look human
                time.sleep(random.uniform(1.0, 3.0))
                
                response = self.session.get(url, headers=headers, timeout=15)
                response.raise_for_status()
                
                return BeautifulSoup(response.text, 'html.parser')
                
            except requests.exceptions.HTTPError as e:
                if e.response.status_code in [403, 429]:
                    self.logger.warning(f"Anti-bot triggered (Attempt {i+1}/{retries}). Retrying...")
                    time.sleep(2 ** i)  # 1s, 2s, 4s...
                else:
                    self.logger.error(f"HTTP Error: {e}")
                    break
            except Exception as e:
                self.logger.error(f"Network Error: {e}")
                
        return None

    def _smart_extract_price(self, soup: BeautifulSoup) -> float:
        """
        FALLBACK: Smart Heuristic to find the lowest price on page.
        Looks for '$X.XX' patterns near keywords like 'mo', 'month', 'starting'.
        """
        import re
        text = soup.get_text()
        # Regex for $X.XX or $XX
        price_pattern = re.compile(r'\$\s?(\d+\.?\d{0,2})')
        matches = price_pattern.findall(text)
        
        valid_prices = []
        for m in matches:
            try:
                val = float(m)
                # Filter unreasonable hosting prices (e.g. $0.01 or $5000)
                if 0.5 < val < 100: 
                    valid_prices.append(val)
            except:
                pass
                
        if valid_prices:
            # Usually the "Starting at" price is the lowest valid one
            return min(valid_prices)
        return 0.0

    def get_live_data(self, url: str) -> dict:
        """
        attempts to scrape LIVE data using:
        1. Dedicated Selectors (if available in selector_registry)
        2. Smart Heuristics (if no selector)
        """
        try:
            from .selector_registry import get_selectors
            selectors = get_selectors(self.provider_name)
            
            soup = self.fetch_page(url)
            if not soup:
                return {}

            live_price = 0.0
            
            # METHOD 1: Dedicated Selectors (Top 40)
            if selectors and 'price_css' in selectors:
                element = soup.select_one(selectors['price_css'])
                if element:
                    # Clean string: "$ 2.95 /mo" -> 2.95
                    raw = element.get_text().strip()
                    import re
                    found = re.search(r'(\d+\.?\d{0,2})', raw)
                    if found:
                        live_price = float(found.group(1))
                        self.logger.info(f"🎯 Dedicated Scrape Success: {self.provider_name} -> ${live_price}")
            
            # METHOD 2: Smart Heuristics (The REST)
            if live_price == 0.0:
                live_price = self._smart_extract_price(soup)
                if live_price > 0:
                    self.logger.info(f"🧠 Smart Scrape Success: {self.provider_name} -> ${live_price}")

            return {'price': live_price} if live_price > 0 else {}

        except Exception as e:
            self.logger.error(f"Live scrape failed: {e}")
            return {}

    def get_verified_field(self, field: str, default: Any = None) -> Any:
        """
        HYBRID SYSTEM:
        1. Try to get LIVE data for this field.
        2. If fails, fall back to Verified Registry data.
        """
        verified = self.verified_data.get(self.provider_type, [])
        provider_data = next((p for p in verified if p['name'] == self.provider_name), None)
        
        registry_value = default
        url = ""
        
        if provider_data:
            url = provider_data.get('url', '')
            if field == 'plans':
                registry_value = provider_data.get('plans', default)
            elif field in provider_data:
                registry_value = provider_data[field]
                
        # 🚀 LIVE UPDATE INJECTION
        # Only inject if we are looking for pricing (inside plans) or main price
        if field == 'plans' and url:
            live = self.get_live_data(url)
            if live.get('price') and isinstance(registry_value, list) and len(registry_value) > 0:
                # Update the Basic plan price with the LIVE price
                registry_value[0]['price'] = live['price']
                registry_value[0]['last_checked'] = "Live just now"
                
        return registry_value
        
    @abstractmethod
    def run(self):
        """Main execution method to be implemented by child classes"""
        pass
