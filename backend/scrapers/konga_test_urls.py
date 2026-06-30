import cloudscraper

scraper = cloudscraper.create_scraper()

# Testing out different URL patterns
urls = [
    "https://www.konga.com.ng/phones/",
    "https://www.konga.com.ng/mobile-phones/",
    "https://www.konga.com.ng/category/phones/",
    "https://www.konga.com.ng/search/?q=phones",
    "https://www.konga.com.ng/",  #if cloudscraper works, this should return the homepage
]

for url in urls:
    try:
        print(f"\n Testing: {url}")
        response = scraper.get(url, timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"  Works!")
    except Exception as e:
        print(f"Error: {e}")