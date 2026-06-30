from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

url = "https://jiji.ng/mobile-phones"
print(f"Loading {url}...")
driver.get(url)

# Wait for page to load
time.sleep(5)

# Print page source to see structure
html = driver.page_source
print("\n=== PAGE HTML (first 3000 chars) ===")
print(html[:3000])

# Try to find different product containers
print("\n=== SEARCHING FOR PRODUCTS ===")

selectors = [
    "div[class*='listing']",
    "div[class*='product']",
    "article",
    "div[data-qa]",
]

for selector in selectors:
    elements = driver.find_elements(By.CSS_SELECTOR, selector)
    print(f"✓ Found {len(elements)} elements with: {selector}")

driver.quit()