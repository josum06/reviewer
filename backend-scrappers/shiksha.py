from get_url import get_review_urls_tavily
from get_reviews import scrape_reviews_firecrawl
import time
import random

def fetch_shiksha_data(query: str, max_results: int = 2, max_reviews: int = 15, cycles: int = 1) -> list:
    # 1. Get the URLs
    urls = get_review_urls_tavily(query, "shiksha.com", max_results=max_results)
    
    # Use a list to hold the final data
    output = []
    
    # 2. Loop through and scrape
    for url in urls:
        reviews = scrape_reviews_firecrawl(url=url, max_reviews=max_reviews, cycles=cycles)
        
        # 3. Append a structured dictionary for each URL
        output.append({
            "source_url": url,
            "reviews": reviews
        })
        
        # Be polite to the server
        time.sleep(random.uniform(4, 8))
    
    return output

# --- Test it ---
if __name__ == "__main__":
    data = fetch_shiksha_data("BPIT", max_results=2, max_reviews=5, cycles=1)
    
    # Print out the results to see the structure
    for item in data:
        print(f"\nLink: {item['source_url']}")
        print(f"Total Reviews: {len(item['reviews'])}")
        if item['reviews']:
            print("Reviews:")
            for i, review in enumerate(item['reviews'], 1):
                print(f"  {i}. {review[:200]}..." if len(review) > 200 else f"  {i}. {review}")
        else:
            print("  No reviews extracted")