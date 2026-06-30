import cloudscraper
from bs4 import BeautifulSoup

scraper = cloudscraper.create_scraper()
url = "https://jiji.ng/mobile-phones"

response = scraper.get(url, timeout=10)
soup = BeautifulSoup(response.content, "html.parser")

product_items = soup.select("div.b-adverts-gallery-listing__item")
print(f"Found {len(product_items)} products\n")

for i, item in enumerate(product_items[:3]):
    print(f"PRODUCT {i+1}:")
    print("="*60)
    
    # Get name from img alt
    img = item.select_one("img")
    name = img.get("alt") if img else "Unknown"
    
    # Get price
    price_div = item.select_one("div[class*='price']")
    price_text = price_div.get_text(strip=True) if price_div else "0"
    
    # Get URL
    link = item.select_one("a.b-list-advert-base")
    product_url = link.get("href") if link else ""
    if product_url and not product_url.startswith("http"):
        product_url = f"https://jiji.ng{product_url}"
    
    print(f"Name: {name}")
    print(f"Price: {price_text}")
    print(f"URL: {product_url}\n")