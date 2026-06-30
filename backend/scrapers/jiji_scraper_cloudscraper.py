import cloudscraper
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JijiScraper:
    def __init__(self):
        self.base_url = "https://jiji.ng"
        self.scraper = cloudscraper.create_scraper()
    
    def scrape_category(self, category: str = "mobile-phones", item_count: int = 5) -> List[Dict]:
        """Scrape Jiji using cloudscraper"""
        url = f"{self.base_url}/{category}"
        
        try:
            print(f"🔍 Fetching: {url}")
            response = self.scraper.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Find product containers - try different selectors
            listings = soup.select("div.listing")[:item_count]
            print(f"✅ Found {len(listings)} products")
            
            if not listings:
                print("⚠️  No .listing found, trying alternate selectors...")
                listings = soup.select("article.listing-item")[:item_count]
                print(f"  Found {len(listings)} with article.listing-item")
            
            products = []
            for listing in listings:
                try:
                    # Extract name
                    name_elem = listing.select_one("a.listing-title, h2, a[href*='/item/']")
                    name = name_elem.text.strip() if name_elem else "Unknown"
                    
                    # Extract price
                    price_elem = listing.select_one("span.price, .listing-price, span[class*='price']")
                    price_text = price_elem.text if price_elem else "0"
                    price = float(price_text.replace("₦", "").replace(",", "").strip().split()[0] or 0)
                    
                    # Extract URL
                    link_elem = listing.select_one("a[href*='/item/']")
                    url = link_elem.get("href") if link_elem else ""
                    if url and not url.startswith("http"):
                        url = f"{self.base_url}{url}"
                    
                    product_data = {
                        "name": name,
                        "price": price,
                        "url": url,
                        "site": "Jiji",
                        "category": category,
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    products.append(product_data)
                    logger.info(f"✓ {name} - ₦{price}")
                    
                except Exception as e:
                    logger.warning(f"Error parsing: {e}")
                    continue
            
            return products
        
        except Exception as e:
            logger.error(f"Error: {e}")
            return []

def main():
    scraper = JijiScraper()
    products = scraper.scrape_category("mobile-phones", item_count=5)
    print(f"\n📊 Scraped {len(products)} products")

if __name__ == "__main__":
    main()