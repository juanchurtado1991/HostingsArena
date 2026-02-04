"""Helper utilities for scrapers"""
import re
from typing import Optional
from bs4 import BeautifulSoup, Tag


def extract_price(text: str) -> Optional[float]:
    """
    Extract price from text string
    
    Args:
        text: Text containing price (e.g., "$12.99/mo", "€9.99", "19.99")
    
    Returns:
        Price as float, or None if not found
    """
    if not text:
        return None
    
    # Remove common currency symbols and clean text
    clean_text = text.replace(',', '').strip()
    
    # Match price patterns like $12.99, 12.99, €9.99
    match = re.search(r'[\$€£]?\s*(\d+\.?\d*)', clean_text)
    
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    
    return None


def extract_number(text: str) -> Optional[int]:
    """
    Extract first number from text
    
    Args:
        text: Text containing number (e.g., "5400+ servers", "60 countries")
    
    Returns:
        Number as int, or None if not found
    """
    if not text:
        return None
    
    # Remove common separators
    clean_text = text.replace(',', '').strip()
    
    # Match numbers
    match = re.search(r'(\d+)', clean_text)
    
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return None
    
    return None


def clean_text(text: str) -> str:
    """
    Clean and normalize text
    
    Args:
        text: Raw text
    
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Remove extra whitespace
    cleaned = ' '.join(text.split())
    
    # Remove special characters
    cleaned = cleaned.strip()
    
    return cleaned


def get_text_or_default(element: Optional[Tag], selector: str, default: str = "") -> str:
    """
    Safely extract text from BeautifulSoup element
    
    Args:
        element: BeautifulSoup element
        selector: CSS selector
        default: Default value if not found
    
    Returns:
        Extracted text or default
    """
    if element is None:
        return default
    
    found = element.select_one(selector)
    if found:
        return clean_text(found.get_text())
    
    return default
