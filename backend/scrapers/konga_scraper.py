import cloudscraper
from bs4 import BeautifulSoup
from typing import List, Dict
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KongaScraper:
    def __init__(self):
        self.base_url = "https://www.konga.com"
        self.scraper = cloudscraper.create_scraper()
        
    def scrape_category(self, category: str = "mobile-phones", item_count: int = 5) -> List[Dict]:
        """Scrape products from Konga"""
        url = f"{self.base_url}/category/{category}"
        
        try:
            print(f" Fetching: {url}")
            response = self.scraper.get(url, timeout=10)
            print(f" Status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Failed: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, "html.parser")
            products_html = soup.find_all("div", class_="product-item", limit=item_count)
            
            print(f"Found {len(products_html)} products")
            
            if not products_html:
                logger.warning("No products found")
                return []
            
            products = []
            for product in products_html:
                try:
                    # Extract product info
                    link_tag = product.find("a")
                    if not link_tag:
                        continue
                    
                    name = link_tag.get_text(strip=True) or "Unknown"
                    product_url = link_tag.get("href", "")
                    if product_url and not product_url.startswith("http"):
                        product_url = f"{self.base_url}{product_url}"
                    
                    price_tag = product.find("span", class_="price")
                    price_text = price_tag.text.strip() if price_tag else "0"
                    price = price_text.replace("₦", "").replace(",", "").strip()
                    
                    product_data = {
                        "name": name,
                        "price": float(price) if price else 0.0,
                        "url": product_url,
                        "seller": "Konga",
                        "site": "Konga",
                        "category": category,
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    products.append(product_data)
                    logger.info(f"✓ {name} - ₦{price}")
                    
                except Exception as e:
                    logger.warning(f"Error parsing product: {e}")
                    continue
            
            return products
                    
        except Exception as e:
            logger.error(f"Error: {e}")
            return []

def main():
    scraper = KongaScraper()
    products = scraper.scrape_category("mobile-phones", item_count=5)
    
    print(f"\n Scraped {len(products)} products:\n")
    for p in products:
        print(f"  • {p['name']}")
        print(f"    Price: ₦{p['price']}")
        print(f"    URL: {p['url']}\n")

if __name__ == "__main__":
    main()