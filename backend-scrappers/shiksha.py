from get_url import get_review_urls_tavily
from get_reviews import scrape_reviews_firecrawl
import time
import random

def fetch_shiksha_data(query: str, max_results: int = 1, max_reviews: int = 520, cycles: int = 12) -> list:
    urls = get_review_urls_tavily(query, "shiksha.com", max_results=max_results)
    output = []
    for url in urls:
        reviews = scrape_reviews_firecrawl(url=url, max_reviews=max_reviews, cycles=cycles)
        output.append({
            "source_url": url,
            "reviews": reviews
        })
        time.sleep(random.uniform(4, 8))
    return output
# --- Test it ---
if __name__ == "__main__":
    data = fetch_shiksha_data("BPIT", max_results=2, max_reviews=5, cycles=1)
   