"""Test suite for all scrapers"""
import pytest
from scrapers.vpn.nordvpn import NordVPNScraper
from scrapers.vpn.expressvpn import ExpressVPNScraper
from scrapers.hosting.scrapers.bluehost import BluehostScraper
from scrapers.hosting.api.digitalocean import DigitalOceanClient


class TestVPNScrapers:
    """Test VPN scrapers"""
    
    def test_nordvpn_scraper(self):
        scraper = NordVPNScraper()
        result = scraper.scrape()
        assert result is not None
        assert result.provider_name == 'NordVPN'
        assert result.pricing_monthly > 0
        assert result.server_count > 0
    
    def test_expressvpn_scraper(self):
        scraper = ExpressVPNScraper()
        result = scraper.scrape()
        assert result is not None
        assert result.provider_name == 'ExpressVPN'
        assert result.pricing_monthly > 0


class TestHostingScrapers:
    """Test hosting scrapers"""
    
    def test_bluehost_scraper(self):
        scraper = BluehostScraper()
        plans = scraper.scrape()
        assert len(plans) > 0
        assert plans[0].provider_name == 'Bluehost'
        assert plans[0].pricing_monthly > 0


class TestHostingAPIs:
    """Test hosting API clients"""
    
    def test_digitalocean_api_structure(self):
        """Test DO API client structure (no real API call)"""
        client = DigitalOceanClient('test_key')
        assert client.BASE_URL == "https://api.digitalocean.com/v2"


def test_collection_script_imports():
    """Test that all imports in collect_data.py work"""
    import scripts.collect_data as collector
    assert hasattr(collector, 'collect_vpn_data')
    assert hasattr(collector, 'collect_hosting_data')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
