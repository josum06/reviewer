import praw
from prawcore.exceptions import ResponseException

def fetch_reddit_praw(query: str, max_posts: int = 100) -> list[dict]:
    """Fetches Reddit data using the official API wrapper and returns URLs + Text."""
    results = []
    
    try:
        # 1. Authenticate with your approved developer keys
        # Replace these with your actual credentials once approved!
        reddit = praw.Reddit(
            client_id="YOUR_CLIENT_ID",
            client_secret="YOUR_CLIENT_SECRET",
            user_agent="CollegeSentimentBot/0.1"
        )

        print(f"[REDDIT PRAW] Searching for: {query}")
        
        # 2. Search (PRAW handles pagination automatically)
        search_results = reddit.subreddit("all").search(f"{query} college review", limit=max_posts)
        
        # 3. Extract the text AND the URL
        for post in search_results:
            full_text = f"{post.title} {post.selftext}".strip()
            
            # Construct the absolute URL using the post's permalink
            source_url = f"https://www.reddit.com{post.permalink}"
            
            if full_text:
                results.append({
                    "source_url": source_url,
                    "text": full_text
                })
                
        print(f"✅ Successfully extracted {len(results)} Reddit posts via PRAW!")
                
    except ResponseException as e:
        print(f"❌ Authentication Error: Check your Client ID and Secret. Details: {e}")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        
    return results

# --- Test It (Will only work after you put in your API keys) ---
if __name__ == "__main__":
    reddit_data = fetch_reddit_praw("Bhagwan Parshuram Institute of Technology", max_posts=5)
    
    for item in reddit_data:
        print(f"\nLink: {item['source_url']}")
        print(f"Text Preview: {item['text'][:150]}...")