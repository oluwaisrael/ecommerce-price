#!/usr/bin/env python3
"""Debug script to find correct CSS selectors for Konga product data."""

import cloudscraper
from bs4 import BeautifulSoup

# Initializing the scraper to bypass Cloudflare
scraper = cloudscraper.create_scraper()

# Test URL for mobile phones on Konga
url = "https://www.konga.com.ng/mobile-phones/"

print(f"Fetching {url}...")
response = scraper.get(url, timeout=10)
print(f"Status: {response.status_code}\n")

if response.status_code == 200:
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all product containers
    products = soup.find_all('article', {'class': 'prd'})
    print(f"Found {len(products)} product containers\n")
    
    if products:
        # Inspect first 3 products
        for i, product in enumerate(products[:3]):
            print(f"\n{'='*60}")
            print(f"PRODUCT {i+1}")
            print(f"{'='*60}")
            
            # Try common selectors for product name
            selectors_to_try = {
                'h2': product.find('h2'),
                '.s1y0cqty': product.find(class_='s1y0cqty'),
                'h3': product.find('h3'),
                '[data-qa="product-name"]': product.find(attrs={'data-qa': 'product-name'}),
                '.productCardName': product.find(class_='productCardName'),
                '.prd_name': product.find(class_='prd_name'),
            }
            
            print("\nProduct Name Selectors:")
            for selector_name, element in selectors_to_try.items():
                if element:
                    text = element.get_text(strip=True)[:60]
                    print(f"  ✓ {selector_name}: '{text}'")
                else:
                    print(f"  ✗ {selector_name}: NOT FOUND")
            
            # Try common selectors for price
            price_selectors = {
                '.prc': product.find(class_='prc'),
                '.s1jhh0ss': product.find(class_='s1jhh0ss'),
                '[data-qa="product-price"]': product.find(attrs={'data-qa': 'product-price'}),
            }
            
            print("\nProduct Price Selectors:")
            for selector_name, element in price_selectors.items():
                if element:
                    text = element.get_text(strip=True)[:60]
                    print(f"  ✓ {selector_name}: '{text}'")
                else:
                    print(f"  ✗ {selector_name}: NOT FOUND")
            
            # Print full product HTML
            print(f"\nFull HTML:")
            print(product.prettify()[:1500])

else:
    print(f"Failed to fetch. Status: {response.status_code}")