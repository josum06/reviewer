import requests
import time

def fetch_post_comments(permalink: str, headers: dict, max_comments: int = 100) -> list[str]:
    """
    Fetch all top-level comments + nested replies from a Reddit post.
    Recursively extracts replies up to any depth.
    """
    comments = []

    def extract_comments(children):
        for child in children:
            if child.get('kind') == 't1':  # t1 = comment
                data = child.get('data', {})
                body = data.get('body', '').strip()

                # Skip deleted/removed/too short
                if body and len(body) > 15 and body not in ('[deleted]', '[removed]'):
                    comments.append(body)

                # ── Recurse into replies ──────────────────────
                replies = data.get('replies', '')
                if replies and isinstance(replies, dict):
                    reply_children = replies.get('data', {}).get('children', [])
                    extract_comments(reply_children)

            elif child.get('kind') == 'more':
                # "load more comments" token — fetch them too
                more_ids = child.get('data', {}).get('children', [])
                if more_ids:
                    fetch_more_comments(permalink, more_ids[:20], headers, comments)

    def fetch_more_comments(permalink: str, ids: list, headers: dict, comments: list):
        """Fetch 'load more' comment batches."""
        try:
            # Extract post ID from permalink: /r/sub/comments/POST_ID/title/
            parts = permalink.strip('/').split('/')
            post_id = parts[3] if len(parts) >= 4 else None
            if not post_id:
                return

            ids_str = ','.join(ids[:20])
            url = f"https://www.reddit.com/api/morechildren.json?link_id=t3_{post_id}&children={ids_str}&api_type=json"
            resp = requests.get(url, headers=headers, timeout=12)

            if resp.status_code == 429:
                time.sleep(10)
                return
            if resp.status_code != 200:
                return

            data = resp.json()
            things = data.get('jquery', [])

            # Parse the weird morechildren response format
            more_data = data.get('json', {}).get('data', {}).get('things', [])
            for thing in more_data:
                if thing.get('kind') == 't1':
                    body = thing.get('data', {}).get('body', '').strip()
                    if body and len(body) > 15 and body not in ('[deleted]', '[removed]'):
                        comments.append(body)

        except Exception as e:
            print(f"   [REDDIT] More comments error: {e}")

    try:
        url = f"https://www.reddit.com{permalink}.json?limit={max_comments}&sort=top"
        resp = requests.get(url, headers=headers, timeout=12)

        if resp.status_code == 429:
            print("   ⚠️ Rate limited on comments. Sleeping 10s...")
            time.sleep(10)
            return comments

        if resp.status_code != 200:
            print(f"   ❌ Comments fetch failed: {resp.status_code}")
            return comments

        data = resp.json()

        # data[0] = post, data[1] = comments
        if len(data) < 2:
            return comments

        comment_children = data[1]['data']['children']
        extract_comments(comment_children)

        print(f"   💬 {len(comments)} comments + replies extracted")

    except Exception as e:
        print(f"   [REDDIT] Comment fetch error: {e}")

    return comments


def fetch_reddit_data_json(max_posts: int = 100) -> list[dict]:
    """Fetches Reddit posts + all comments strictly about BPIT."""
    results = []
    headers = {'User-Agent': 'CollegeSentimentBot/0.1'}

    search_targets = [
        "https://www.reddit.com/r/IPUniversity/search.json?q=BPIT&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/r/IPUniversity/search.json?q=Bhagwan+Parshuram&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/r/Btechtards/search.json?q=BPIT&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/r/delhi/search.json?q=BPIT+college&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/search.json?q=BPIT+Rohini&sort=relevance&limit=25",
        "https://www.reddit.com/search.json?q=Bhagwan+Parshuram+Institute+of+Technology&sort=relevance&limit=25",
    ]

    REQUIRED_KEYWORDS = [
        'bpit',
        'bhagwan parshuram institute of technology',
        'bhagwan parshuram',
        'parshuram institute'
    ]

    seen_urls = set()
    seen_texts = set()  # deduplicate comments across posts

    for base_url in search_targets:
        if len(results) >= max_posts:
            break

        after_token = None
        print(f"\n[REDDIT] Searching: {base_url}")

        while len(results) < max_posts:
            url = base_url + (f"&after={after_token}" if after_token else "")

            try:
                resp = requests.get(url, headers=headers, timeout=12)

                if resp.status_code == 429:
                    print("⚠️ Rate limited. Sleeping 10s...")
                    time.sleep(10)
                    continue

                if resp.status_code != 200:
                    print(f"❌ Failed with status: {resp.status_code}")
                    break

                data = resp.json()
                children = data.get('data', {}).get('children', [])

                if not children:
                    break

                for child in children:
                    post = child['data']
                    permalink  = post.get('permalink', '')
                    source_url = f"https://www.reddit.com{permalink}" if permalink else ""

                    if source_url in seen_urls:
                        continue
                    seen_urls.add(source_url)

                    title    = post.get('title', '')
                    selftext = post.get('selftext', '')
                    full_text = f"{title} {selftext}".strip()
                    combined  = full_text.lower()

                    # ── Strict BPIT keyword filter ────────────
                    if not any(kw in combined for kw in REQUIRED_KEYWORDS):
                        print(f"  ⏭️  Skipped: {title[:60]}")
                        continue

                    print(f"  ✅ Matched: {title[:80]}")

                    # ── Add the post itself ───────────────────
                    if full_text not in seen_texts:
                        seen_texts.add(full_text)
                        results.append({
                            "source":     "Reddit",
                            "source_url": source_url,
                            "text":       full_text
                        })

                    # ── Fetch all comments + replies ──────────
                    comments = fetch_post_comments(permalink, headers, max_comments=100)
                    added = 0
                    for comment in comments:
                        if comment not in seen_texts:
                            seen_texts.add(comment)
                            results.append({
                                "source":     "Reddit",
                                "source_url": source_url,
                                "text":       comment
                            })
                            added += 1

                    print(f"     📥 +{added} unique comments added (total so far: {len(results)})")
                    time.sleep(2)  # polite delay between posts

                after_token = data.get('data', {}).get('after')
                if not after_token:
                    break

                time.sleep(2)

            except Exception as e:
                print(f"❌ Error: {e}")
                break

    print(f"\n✅ Total BPIT entries (posts + comments): {len(results)}")
    return results


if __name__ == "__main__":
    reddit_data = fetch_reddit_data_json(max_posts=500)

    print(f"\n{'='*60}")
    print("SAMPLE OUTPUT")
    print(f"{'='*60}")
    for i, item in enumerate(reddit_data[:5], 1):
        print(f"\n{i}. {item['text'][:200]}")
        print(f"   🔗 {item['source_url']}")