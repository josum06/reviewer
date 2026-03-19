from get_url import get_review_urls_tavily
from get_reviews import scrape_reviews_firecrawl
import time
import random

def fetch_collegedunia_data(query: str, max_results: int = 3, max_reviews: int = 50, cycles: int = 8) -> list:
    # 1. Get the URLs
    urls = get_review_urls_tavily(query, "collegedunia.com", max_results=max_results)

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


if __name__ == "__main__":
    data = fetch_collegedunia_data("BPIT", max_results=2, max_reviews=50, cycles=8)

    for item in data:
        print(f"\nLink: {item['source_url']}")
        print(f"Total Reviews: {len(item['reviews'])}")
        if item['reviews']:
            for i, review in enumerate(item['reviews'], 1):
                print(f"  {i}. {review[:200]}..." if len(review) > 200 else f"  {i}. {review}")
        else:
            print("  No reviews extracted")