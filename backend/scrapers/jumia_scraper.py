import cloudscraper
from bs4 import BeautifulSoup
from typing import List, Dict
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JumiaScraper:
    def __init__(self):
        self.base_url = "https://www.jumia.com.ng"
        self.scraper = cloudscraper.create_scraper()
        
    def scrape_category(self, category: str = "mobile-phones", item_count: int = 5) -> List[Dict]:
        """Scrape products from Jumia"""
        # Use the working URL
        url = f"{self.base_url}/{category}/"
        
        try:
            print(f"🔍 Fetching: {url}")
            response = self.scraper.get(url, timeout=10)
            print(f"✅ Status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Failed: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Find product containers
            products_html = soup.find_all("article", class_="prd", limit=item_count)
            
            print(f"📊 Found {len(products_html)} products")
            
            if not products_html:
                logger.warning(f"No products found. Debug: printing first 2000 chars of HTML")
                print(response.text[:2000])
                return []
            
            products = []
            for product in products_html:
                try:
                    name_tag = product.find("h2", class_="prd-name")
                    name = name_tag.text.strip() if name_tag else "Unknown"
                    
                    price_tag = product.find("div", class_="prc")
                    price_text = price_tag.text.strip() if price_tag else "0"
                    price = price_text.replace("₦", "").replace(",", "").strip()
                    
                    link_tag = product.find("a", class_="core")
                    product_url = link_tag.get("href", "") if link_tag else ""
                    if product_url and not product_url.startswith("http"):
                        product_url = f"{self.base_url}{product_url}"
                    
                    seller_tag = product.find("span", class_="seller")
                    seller = seller_tag.text.strip() if seller_tag else "Jumia"
                    
                    product_data = {
                        "name": name,
                        "price": float(price) if price else 0.0,
                        "url": product_url,
                        "seller": seller,
                        "site": "Jumia",
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
    scraper = JumiaScraper()
    products = scraper.scrape_category("mobile-phones", item_count=5)
    
    print(f"\n✅ Scraped {len(products)} products:\n")
    for p in products:
        print(f"  • {p['name']}")
        print(f"    Price: ₦{p['price']}")
        print(f"    URL: {p['url']}\n")

if __name__ == "__main__":
    main()