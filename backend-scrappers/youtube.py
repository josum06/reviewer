# youtube.py
from googleapiclient.discovery import build
from config import YOUTUBE_API_KEY

def fetch_youtube_data(query, max_videos=8, max_comments=25):
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    texts = []

    try:
        search_response = youtube.search().list(
            q=f"{query} college review OR experience OR opinion",
            part='id,snippet',
            maxResults=max_videos,
            type='video'
        ).execute()

        video_ids = [item['id']['videoId'] for item in search_response.get('items', []) if 'videoId' in item['id']]

        for vid in video_ids:
            try:
                comments_resp = youtube.commentThreads().list(
                    part='snippet',
                    videoId=vid,
                    maxResults=max_comments,
                    textFormat='plainText'
                ).execute()

                for item in comments_resp.get('items', []):
                    comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
                    texts.append(comment)
            except:
                pass
    except Exception as e:
        print(f"YouTube error: {e}")

    return texts