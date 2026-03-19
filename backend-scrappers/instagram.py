import os
from typing import List
from dotenv import load_dotenv
from apify_client import ApifyClient

load_dotenv()
APIFY_API_TOKEN = os.getenv('APIFY_API_TOKEN')
client = ApifyClient(APIFY_API_TOKEN)

def fetch_instagram_data(query: str, resultsLimit: int = 15, searchLimit: int = 2, comment_for_each_post_max: int = 200):
    results = []
    
    try:
        print(f"[STAGE 1] Searching for: {query}")
        post_input_1 = {
            "search": f"{query} college review",
            "resultsType": "posts",
            "resultsLimit": resultsLimit,
            "searchLimit": searchLimit
        }
        post_run_1 = client.actor("apify/instagram-scraper").call(run_input=post_input_1)
        
        # Safely extract URLs
        urls = []
        for search_item in client.dataset(post_run_1['defaultDatasetId']).iterate_items():
            if 'url' in search_item:
                urls.append(search_item['url'])
        
        print(f"[STAGE 2] Found {len(urls)} hashtag/profile URLs to scrape.")
        
        for url in urls:
            post_input_2 = {
                "directUrls": [url],
                "resultsType": "posts",
                "resultsLimit": resultsLimit,
            }
            post_run_2 = client.actor("apify/instagram-scraper").call(run_input=post_input_2)

            # NOTE: Renamed variable to `post_item`
            for post_item in client.dataset(post_run_2["defaultDatasetId"]).iterate_items():
                
                post_url = post_item.get('url')
                comments_count = post_item.get('commentsCount', 0)

                if post_url and comments_count > 0:
                    print(f'[STAGE 3] Extracting {comments_count} comments for url: {post_url}')

                    comment_input = {
                        "directUrls": [post_url],
                        "resultsLimit": comment_for_each_post_max 
                    }
                    comment_run = client.actor("apify/instagram-comment-scraper").call(run_input=comment_input)

                    comments = []
                    
                    # NOTE: Renamed variable to `comment_item`
                    for comment_item in client.dataset(comment_run["defaultDatasetId"]).iterate_items():
                        text = comment_item.get('text', '').strip()
                        if text:
                            comments.append(text)
                            
                    results.append({
                        'source_url': post_url,
                        'comments': comments
                    })
                    
    except Exception as e:
        print(f"❌ A critical error occurred: {e}")
        
    return results

# --- Test ---
if __name__ == "__main__":
    data = fetch_instagram_data("BPIT", resultsLimit=5, searchLimit=1, comment_for_each_post_max=20)
    print(f"\nFinal Extracted Posts with Comments: {len(data)}")