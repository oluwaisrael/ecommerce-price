import cloudscraper
from bs4 import BeautifulSoup

scraper = cloudscraper.create_scraper()
url = "https://jiji.ng/mobile-phones"

response = scraper.get(url, timeout=10)
soup = BeautifulSoup(response.content, "html.parser")

product_items = soup.select("div.b-adverts-gallery-listing__item")

if product_items:
    first = product_items[0]
    link = first.select_one("a.b-list-advert-base")
    
    print("FULL LINK HTML:")
    print("="*80)
    print(str(link)[:3000])