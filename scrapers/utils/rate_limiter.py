"""Rate limiter utility for respectful web scraping"""
import time
from threading import Lock


class RateLimiter:
    """Simple rate limiter to ensure we don't overwhelm servers"""
    
    def __init__(self, requests_per_second: float = 0.5):
        """
        Initialize rate limiter
        
        Args:
            requests_per_second: Number of requests allowed per second (default: 0.5 = 1 request per 2 seconds)
        """
        self.delay = 1.0 / requests_per_second
        self.last_request_time = 0
        self.lock = Lock()
    
    def wait(self):
        """Wait if necessary to respect rate limit"""
        with self.lock:
            current_time = time.time()
            time_since_last_request = current_time - self.last_request_time
            
            if time_since_last_request < self.delay:
                sleep_time = self.delay - time_since_last_request
                time.sleep(sleep_time)
            
            self.last_request_time = time.time()
