"""Configuration settings for scrapers and API clients"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Keys - Hosting Providers
DIGITALOCEAN_API_KEY = os.getenv('DIGITALOCEAN_API_KEY', '')
VULTR_API_KEY = os.getenv('VULTR_API_KEY', '')
LINODE_API_KEY = os.getenv('LINODE_API_KEY', '')
CLOUDWAYS_API_KEY = os.getenv('CLOUDWAYS_API_KEY', '')
CLOUDWAYS_EMAIL = os.getenv('CLOUDWAYS_EMAIL', '')
KINSTA_API_KEY = os.getenv('KINSTA_API_KEY', '')
GODADDY_API_KEY = os.getenv('GODADDY_API_KEY', '')
GODADDY_API_SECRET = os.getenv('GODADDY_API_SECRET', '')

# Scraping Settings
RATE_LIMIT_DELAY = int(os.getenv('RATE_LIMIT_DELAY', '2'))
USER_AGENT = os.getenv(
    'USER_AGENT',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
)

# Database
DATABASE_PATH = os.getenv('DATABASE_PATH', 'data/providers.db')

# Output
OUTPUT_JSON_PATH = 'data/providers_data.json'
OUTPUT_CSV_PATH = 'data/providers_data.csv'

# Timeout settings
REQUEST_TIMEOUT = 30  # seconds
MAX_RETRIES = 3
