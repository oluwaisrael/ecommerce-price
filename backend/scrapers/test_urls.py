import cloudscraper

scraper = cloudscraper.create_scraper()

# Test different URL patterns
urls = [
    "https://www.jumia.com.ng/phones/",
    "https://www.jumia.com.ng/mobile-phones/",
    "https://www.jumia.com.ng/category/phones/",
    "https://www.jumia.com.ng/search/?q=phones",
    "https://www.jumia.com.ng/",  # homepage to test if cloudscraper works
]

for url in urls:
    try:
        print(f"\n🔍 Testing: {url}")
        response = scraper.get(url, timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ WORKS!")
    except Exception as e:
        print(f"   ❌ Error: {e}")