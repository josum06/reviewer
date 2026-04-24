from get_url import get_review_urls_tavily
from get_reviews import scrape_reviews_firecrawl
import time
import random

def fetch_careers360_data(query: str, max_results: int = 1, max_reviews: int = 200, cycles: int = 12) -> list:
    # 1. Get the URLs
    urls = get_review_urls_tavily(query, "careers360.com", max_results=max_results)

    output = []

    for url in urls:
        print(f"  Scraping: {url}")
        reviews = scrape_reviews_firecrawl(url=url, max_reviews=max_reviews, cycles=cycles)

        output.append({
            "source_url": url,
            "reviews": reviews
        })

        time.sleep(random.uniform(4, 8))

    return output


# ── Test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    data = fetch_careers360_data("BPIT", max_results=1, max_reviews=200, cycles=12)

    if data:
        reviews = data[0]['reviews']
        print(f"\nTotal extracted: {len(reviews)}")
        print("=" * 60)
        for i, review in enumerate(reviews[:10], 1):
            print(f"\n{i}. {review}")
            print("-" * 60)