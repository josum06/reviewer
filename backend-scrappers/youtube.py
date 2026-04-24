from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv

load_dotenv()

# ── Try to import transcript library ─────────────────────────
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    TRANSCRIPT_AVAILABLE = True
except ImportError:
    TRANSCRIPT_AVAILABLE = False
    print("⚠️  youtube-transcript-api not installed. Run: pip install youtube-transcript-api")

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def fetch_transcript(vid: str) -> str | None:
    """Fetch transcript and translate to English using googletrans."""
    if not TRANSCRIPT_AVAILABLE:
        return None
    try:
        from googletrans import Translator
        translator = Translator()

        api = YouTubeTranscriptApi()
        transcript_list = api.list(vid)

        for t in transcript_list:
            try:
                entries = t.fetch()
                raw_text = ' '.join([entry.text for entry in entries])

                if len(raw_text.strip()) < 100:
                    continue

                # Already English — return directly
                if t.language_code.startswith('en'):
                    print(f"[YOUTUBE] ✅ English transcript | chars: {len(raw_text)}")
                    return raw_text.strip()

                # Translate to English
                print(f"[YOUTUBE] Translating {t.language} → English...")
                chunk_size = 4500
                chunks = [raw_text[i:i+chunk_size] for i in range(0, len(raw_text), chunk_size)]
                translated_chunks = []

                for i, chunk in enumerate(chunks):
                    try:
                        result = translator.translate(chunk, dest='en')
                        if result and result.text:
                            translated_chunks.append(result.text)
                            print(f"[YOUTUBE] ✅ Chunk {i+1}/{len(chunks)} translated")
                        else:
                            print(f"[YOUTUBE] ⚠️ Chunk {i+1} empty result — skipping")
                    except Exception as e:
                        print(f"[YOUTUBE] ⚠️ Chunk {i+1} failed: {e}")
                        continue

                if translated_chunks:
                    translated_text = ' '.join(translated_chunks)
                    print(f"[YOUTUBE] ✅ Translated | chars: {len(translated_text)}")
                    return translated_text.strip()
                else:
                    print(f"[YOUTUBE] ⚠️ Translation failed — returning raw Hindi")
                    return raw_text.strip()  # fallback to Hindi if all chunks fail

            except Exception as e:
                print(f"   [DEBUG] Failed for {t.language_code}: {e}")
                continue

        print(f"⚠️  No transcript found for {vid}")
        return None

    except Exception as e:
        print(f"⚠️  Transcript not available for {vid}: {e}")
        return None
                        
def fetch_all_comments(youtube, vid: str, max_comments: int = 500) -> list[str]:
    """
    Fetch as many comments as possible using pagination.
    Fetches top-level comments + all replies.
    Target: 60-70% of total comments.
    """
    all_comments = []
    next_page_token = None
    page_count = 0

    while len(all_comments) < max_comments:
        try:
            response = youtube.commentThreads().list(
                part='snippet,replies',
                videoId=vid,
                maxResults=100,
                textFormat='plainText',
                order='relevance',
                pageToken=next_page_token
            ).execute()

            page_count += 1
            items = response.get('items', [])
            if not items:
                break

            for item in items:
                # ── Top level comment ─────────────────────────
                top_comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
                if top_comment and len(top_comment.strip()) > 10:
                    all_comments.append(top_comment.strip())

                # ── Reply comments ────────────────────────────
                reply_count = item['snippet']['totalReplyCount']
                if reply_count > 0:
                    replies = item.get('replies', {}).get('comments', [])
                    for reply in replies:
                        reply_text = reply['snippet']['textDisplay']
                        if reply_text and len(reply_text.strip()) > 10:
                            all_comments.append(reply_text.strip())

                    # Fetch remaining replies if more exist
                    if reply_count > len(replies):
                        try:
                            parent_id = item['snippet']['topLevelComment']['id']
                            reply_token = None
                            while True:
                                reply_resp = youtube.comments().list(
                                    part='snippet',
                                    parentId=parent_id,
                                    maxResults=100,
                                    textFormat='plainText',
                                    pageToken=reply_token
                                ).execute()

                                for r in reply_resp.get('items', []):
                                    reply_text = r['snippet']['textDisplay']
                                    if reply_text and len(reply_text.strip()) > 10:
                                        all_comments.append(reply_text.strip())

                                reply_token = reply_resp.get('nextPageToken')
                                if not reply_token:
                                    break

                        except HttpError:
                            pass

                if len(all_comments) >= max_comments:
                    break

            next_page_token = response.get('nextPageToken')
            if not next_page_token:
                break

        except HttpError as e:
            if e.resp.status == 403:
                print(f"⚠️  Comments disabled for video {vid}")
            else:
                print(f"❌ API Error for video {vid}: {e}")
            break

    print(f"[YOUTUBE] 💬 Fetched {len(all_comments)} comments ({page_count} pages)")
    return all_comments


def get_video_comment_count(youtube, vid: str) -> int:
    """Get total comment count for a video to calculate 60-70% target."""
    try:
        response = youtube.videos().list(part='statistics', id=vid).execute()
        items = response.get('items', [])
        if items:
            return int(items[0]['statistics'].get('commentCount', 0))
    except Exception:
        pass
    return 0


def fetch_youtube_data(query: str, max_videos: int = 8, max_comments: int = 500) -> list[dict]:
    """
    Fetches YouTube comments (65% of total) + transcripts for each video.
    """
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    results = []

    try:
        print(f"\n[YOUTUBE] Searching for videos: {query}")
        search_response = youtube.search().list(
            q=f"{query} college review",
            part='id,snippet',
            maxResults=max_videos,
            type='video'
        ).execute()

        video_ids = [
            item['id']['videoId']
            for item in search_response.get('items', [])
            if 'videoId' in item['id']
        ]

        print(f"[YOUTUBE] Found {len(video_ids)} videos\n")

        for vid in video_ids:
            video_url = f"https://www.youtube.com/watch?v={vid}"
            print(f"{'─'*60}")
            print(f"[YOUTUBE] Processing: {video_url}")

            # ── Calculate 65% target ──────────────────────────
            total_comments = get_video_comment_count(youtube, vid)
            if total_comments > 0:
                target = int(total_comments * 0.65)
                target = max(50, min(target, max_comments))
                print(f"[YOUTUBE] Total: {total_comments} | Target (65%): {target}")
            else:
                target = max_comments
                print(f"[YOUTUBE] Using max: {target}")

            # ── Fetch comments ────────────────────────────────
            comments = fetch_all_comments(youtube, vid, max_comments=target)

            # ── Fetch transcript ──────────────────────────────
            print(f"[YOUTUBE] Fetching transcript...")
            transcript = fetch_transcript(vid)

            if comments or transcript:
                results.append({
                    "source_url":       video_url,
                    "comments":         comments,
                    "transcript":       transcript,
                    "total_comments":   total_comments,
                    "fetched_comments": len(comments),
                })

        print(f"\n{'─'*60}")
        print(f"[YOUTUBE] ✅ Done! Processed {len(results)} videos")

    except Exception as e:
        print(f"❌ YouTube error: {e}")

    return results


# ── Test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    yt_data = fetch_youtube_data(
        "Bhagwan Parshuram Institute of Technology",
        max_videos=4,
        max_comments=500
    )

    print(f"\n{'='*60}")
    print("RESULTS SUMMARY")
    print(f"{'='*60}")
    total = 0
    for item in yt_data:
        pct = (item['fetched_comments'] / item['total_comments'] * 100) if item['total_comments'] > 0 else 0
        print(f"\n📹 {item['source_url']}")
        print(f"   💬 Comments: {item['fetched_comments']} / {item['total_comments']} ({pct:.1f}%)")
        print(f"   📝 Transcript: {'✅ Available' if item['transcript'] else '❌ Not available'}")
        if item['transcript']:
            print(f"   Preview (English): {item['transcript'][:300]}...")
        total += item['fetched_comments']
    print(f"\n{'='*60}")
    print(f"Total comments fetched: {total}")