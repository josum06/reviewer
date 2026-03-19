from tavily import TavilyClient
from dotenv import load_dotenv
import os
import re

load_dotenv()

TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')

def get_review_urls_tavily(query: str, site: str, max_results: int = 2) -> list[str]:
    tavily = TavilyClient(api_key=TAVILY_API_KEY)
    response = tavily.search(
        query=f"{query} college reviews",
        include_domains=[site],
        search_depth="basic",
        max_results=max_results
    )

    valid_urls = []
    for result in response.get('results', []):
        url = result.get('url', '')

        if site == "shiksha.com":
            # Extract only base college slug — strip /course-* and everything after
            match = re.match(r'(https?://(?:www\.)?shiksha\.com/college/[^/]+)', url)
            if match:
                base = match.group(1)
            else:
                base = url.split('/admission')[0]\
                          .split('/courses')[0]\
                          .split('/fees')[0]\
                          .split('/placements')[0]\
                          .split('/scholarships')[0]\
                          .split('/faculty')[0]\
                          .split('/course-')[0]\
                          .split('/reviews')[0]
            review_url = base.rstrip('/') + "/reviews"

        elif site == "careers360.com":
            # Extract only base college slug
            match = re.match(r'(https?://(?:www\.)?careers360\.com/colleges/[^/]+)', url)
            if match:
                base = match.group(1)
            else:
                base = url.split('/placement')[0]\
                          .split('/admission')[0]\
                          .split('/courses')[0]\
                          .split('/fees')[0]\
                          .split('/btech')[0]\
                          .split('/mtech')[0]\
                          .split('/reviews')[0]
            base = base.replace("engineering.careers360.com", "www.careers360.com")
            review_url = base.rstrip('/') + "/reviews"

        elif site == "collegedunia.com":
            match = re.match(r'(https?://(?:www\.)?collegedunia\.com/college/[^/]+)', url)
            if match:
                base = match.group(1)
            else:
                base = url.split('/reviews')[0]
            review_url = base.rstrip('/') + "/reviews"

        else:
            review_url = url

        print(f"  [URL] {site} → {review_url}")

        if review_url not in valid_urls:
            valid_urls.append(review_url)

    return valid_urls


# --- Test ---
if __name__ == "__main__":
    print("Testing Careers360:")
    urls = get_review_urls_tavily("BPIT", "careers360.com", max_results=2)
    for u in urls:
        print(f"  {u}")

    print("\nTesting Shiksha:")
    urls = get_review_urls_tavily("BPIT", "shiksha.com", max_results=2)
    for u in urls:
        print(f"  {u}")