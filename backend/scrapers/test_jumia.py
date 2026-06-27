import aiohttp
import asyncio
from bs4 import BeautifulSoup

async def test_jumia():
    url = "https://www.jumia.com.ng/cp-phones/"
    
    print(f"🔍 Testing URL: {url}\n")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                print(f"✅ Status Code: {resp.status}")
                html = await resp.text()
                
                # Print first 2000 characters of HTML
                print(f"📄 HTML (first 2000 chars):\n{html[:2000]}\n")
                
                # Try to find ANY article tags
                soup = BeautifulSoup(html, "html.parser")
                articles = soup.find_all("article")
                print(f"📊 Found {len(articles)} article tags\n")
                
                # Try different selectors
                divs = soup.find_all("div", class_="prd")
                print(f"📊 Found {len(divs)} divs with class 'prd'\n")
                
                # List all class names we see
                all_tags = soup.find_all("div", limit=5)
                print("First 5 divs and their classes:")
                for tag in all_tags:
                    print(f"  {tag.get('class')}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(test_jumia())