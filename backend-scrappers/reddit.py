# reddit.py
import requests

def fetch_reddit_data(query, limit=35):
    texts = []
    url = f"https://www.reddit.com/search.json?q={query.replace(' ', '+')}+college+review&limit={limit}&sort=relevance"
    headers = {'User-Agent': 'CollegeSentimentBot/0.1'}

    try:
        resp = requests.get(url, headers=headers, timeout=12)
        if resp.status_code == 200:
            data = resp.json()
            for child in data.get('data', {}).get('children', []):
                post = child['data']
                full_text = post.get('title', '') + " " + post.get('selftext', '')
                if full_text.strip():
                    texts.append(full_text)
    except Exception as e:
        print(f"Reddit error: {e}")

    return texts