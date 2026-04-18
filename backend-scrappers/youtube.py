from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") 

def fetch_youtube_data(query: str, max_videos: int = 8, max_comments: int = 25) -> list[dict]:
    """Fetches YouTube comments and pairs them with the source video URL."""
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    # We will store a list of dictionaries here
    results = []

    try:
        print(f"[YOUTUBE] Searching for videos: {query}")
        search_response = youtube.search().list(
            q=f"{query} college review",
            part='id,snippet',
            maxResults=max_videos,
            type='video'
        ).execute()

        video_ids = [item['id']['videoId'] for item in search_response.get('items', []) if 'videoId' in item['id']]

        for vid in video_ids:
            # Construct the actual clickable URL using the vid!
            video_url = f"https://www.youtube.com/watch?v={vid}"
            
            comments_fetched = 0
            next_page_token = None
            
            # Temporary list to hold comments for JUST this video
            video_comments = []
            
            print(f"[YOUTUBE] Extracting comments from: {video_url}")
            
            while comments_fetched < max_comments:
                try:
                    request_limit = min(100, max_comments - comments_fetched) 
                    
                    comments_resp = youtube.commentThreads().list(
                        part='snippet',
                        videoId=vid,
                        maxResults=request_limit,
                        textFormat='plainText',
                        pageToken=next_page_token
                    ).execute()

                    for item in comments_resp.get('items', []):
                        comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
                        
                        # Filter out blank or tiny comments
                        if comment and len(comment.strip()) > 10:
                            video_comments.append(comment.strip())
                            
                        comments_fetched += 1

                    next_page_token = comments_resp.get('nextPageToken')
                    if not next_page_token:
                        break 

                except HttpError as e:
                    if e.resp.status == 403:
                        print(f"⚠️ Comments are disabled for video {vid}. Skipping...")
                    else:
                        print(f"❌ API Error for video {vid}: {e}")
                    break 
            
            # If we found comments, append the URL and the comments to our results list
            if video_comments:
                results.append({
                    "source_url": video_url,
                    "comments": video_comments
                })
                    
    except Exception as e:
        print(f"❌ A general YouTube error occurred: {e}")

    return results

# --- Test it ---
if __name__ == "__main__":
    yt_data = fetch_youtube_data("Bhagwan Parshuram Institute of Technology", max_videos=4 ,max_comments=10)
    
   