from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

options = webdriver.ChromeOptions()
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
# Spoof user agent to look like real browser
options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

try:
    url = "https://jiji.ng/mobile-phones"
    print(f"🔍 Fetching: {url}")
    driver.get(url)
    
    time.sleep(5)
    
    # Print full page title
    print(f"Page title: {driver.title}")
    
    # Check page source for "listing"
    page_source = driver.page_source
    listing_count = page_source.count('class="listing"')
    print(f"Occurrences of 'class=\"listing\"' in page: {listing_count}")
    
    # Try to find ANY product container
    print("\nSearching for product containers...")
    for selector in ["div.listing", "div[class='listing']", "article", "div.product", "div[data-qa]"]:
        elements = driver.find_elements(By.CSS_SELECTOR, selector)
        print(f"  {selector:30} → {len(elements)} found")

finally:
    driver.quit()