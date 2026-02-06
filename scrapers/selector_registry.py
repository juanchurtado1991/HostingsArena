# 🎯 TOP 40 DEDICATED SELECTORS (Live Scraping Config)
# This file provides specific CSS selectors for the "VIP" providers.
# If a provider is listed here, the Adaptive Scraper will use these exact paths.

SELECTOR_REGISTRY = {
    # === HOSTING ===
    "Bluehost": {
        "price_css": "span.price-large, span[data-testid='price']",
        "plan_name_css": "h3.card-title",
        "renewal_css": "div.term-renewal"
    },
    "SiteGround": {
        "price_css": "span.price",
        "plan_name_css": "h2.entry-title",
        "renewal_css": "span.renewal-price"
    },
    "HostGator": {
        "price_css": ".pricing-card-price",
        "plan_name_css": ".pricing-card-title"
    },
    "DreamHost": {
        "price_css": ".price-month",
        "plan_name_css": ".plan-name"
    },
    "Hostinger": {
        "price_css": ".h-price__amount",
        "plan_name_css": ".h-cart-product__title",
        "features_css": ".h-features-list"
    },
    "A2 Hosting": {
        "price_css": ".price-value",
        "plan_name_css": ".plan-title"
    },
    "InMotion Hosting": {
        "price_css": ".im-price",
        "plan_name_css": "h3.im-heading"
    },
    "GoDaddy": {
        "price_css": ".pricing-main .price",
        "plan_name_css": ".pkg-title"
    },
    "Namecheap": {
        "price_css": ".price .amount",
        "plan_name_css": ".product-header"
    },
    "GreenGeeks": {
        "price_css": ".pricing-price",
        "plan_name_css": ".plan-box h2"
    },
    "Kinsta": {
        "price_css": ".plan-price .amount",
        "plan_name_css": ".plan-name"
    },
    "WP Engine": {
        "price_css": ".price",
        "plan_name_css": ".plan-title"
    },
    "Liquid Web": {
        "price_css": ".price .value",
        "plan_name_css": "h2.title"
    },
    "DigitalOcean": {
        "price_css": "#droplet-pricing .price",
        "plan_name_css": ".pricing-card-title"
    },
    "Cloudways": {
        "price_css": ".plan-price", 
        "plan_name_css": ".plan-name"
    },
    
    # === VPN ===
    "NordVPN": {
        "price_css": ".js-price-value, .Title-module_price__2qKk6",
        "plan_css": ".Title-module_title__3Bw2D"
    },
    "ExpressVPN": {
        "price_css": ".price-amount",
        "plan_css": ".plan-name"
    },
    "Surfshark": {
        "price_css": ".c-plan__price",
        "plan_css": ".c-plan__title"
    },
    "CyberGhost": {
        "price_css": ".price-amount",
        "plan_css": ".plan-title"
    },
    "PIA": {
        "price_css": ".price-amount",
        "plan_css": ".package-title"
    },
    "ProtonVPN": {
        "price_css": ".price-monthly",
        "plan_css": ".plan-header"
    },
    "Windscribe": {
        "price_css": ".pricing-table .price",
        "plan_css": ".plan-header h2"
    },
    "IPVanish": {
        "price_css": ".price-large",
        "plan_css": ".plan-title"
    },
    "PureVPN": {
        "price_css": ".amount",
        "plan_css": ".plan-card-title"
    },
    "Mullvad": {
        "price_css": ".price",
        "plan_css": "h1"
    },
    "Ivacy": {
        "price_css": ".price-amount",
        "plan_css": ".plan-nam"
    },
    "Hide.me": {
        "price_css": ".pricing-rate",
        "plan_css": ".pricing-title"
    },
    "VyprVPN": {
        "price_css": ".price-value",
        "plan_css": ".plan-name"
    },
    "TunnelBear": {
        "price_css": ".cost",
        "plan_css": ".plan-name"
    },
    "StrongVPN": {
        "price_css": ".price-text",
        "plan_css": ".header h2"
    }
}

def get_selectors(provider_name):
    """Returns selectors if dedicated, else None"""
    return SELECTOR_REGISTRY.get(provider_name)
