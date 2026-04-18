import requests
import time

def fetch_reddit_data_json(max_posts: int = 100) -> list[dict]:
    """Fetches Reddit posts strictly about Bhagwan Parshuram Institute of Technology."""
    results = []
    headers = {'User-Agent': 'CollegeSentimentBot/0.1'}

    # Search using multiple variations of the name + abbreviation
    search_targets = [
        "https://www.reddit.com/r/IPUniversity/search.json?q=BPIT&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/r/IPUniversity/search.json?q=Bhagwan+Parshuram&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/r/Btechtards/search.json?q=BPIT&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/r/delhi/search.json?q=BPIT+college&sort=relevance&limit=25&restrict_sr=1",
        "https://www.reddit.com/search.json?q=BPIT+Rohini&sort=relevance&limit=25",
        "https://www.reddit.com/search.json?q=Bhagwan+Parshuram+Institute+of+Technology&sort=relevance&limit=25",
    ]

    # ✅ STRICT: Only posts containing these keywords are accepted
    REQUIRED_KEYWORDS = [
        'bpit',
        'bhagwan parshuram institute of technology',
        'bhagwan parshuram',
        'parshuram institute'
    ]

    seen_urls = set()

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
                    if len(results) >= max_posts:
                        break

                    post = child['data']
                    permalink = post.get('permalink', '')
                    source_url = f"https://www.reddit.com{permalink}" if permalink else ""

                    if source_url in seen_urls:
                        continue
                    seen_urls.add(source_url)

                    title = post.get('title', '')
                    selftext = post.get('selftext', '')
                    full_text = f"{title} {selftext}".strip()
                    combined = full_text.lower()

                    # ✅ STRICT FILTER: Must contain at least one BPIT keyword
                    if any(keyword in combined for keyword in REQUIRED_KEYWORDS):
                        results.append({
                            "source" : "Reddit",
                            "source_url": source_url,
                            "text": full_text
                        })
                        print(f"  ✅ Matched: {title[:80]}")
                    else:
                        print(f"  ⏭️ Skipped: {title[:60]}")

                after_token = data.get('data', {}).get('after')
                if not after_token:
                    break

                time.sleep(2)

            except Exception as e:
                print(f"❌ Error: {e}")
                break

    print(f"\n✅ Total BPIT posts extracted: {len(results)}")
    return results


if __name__ == "__main__":
    reddit_data = fetch_reddit_data_json(max_posts=20)
