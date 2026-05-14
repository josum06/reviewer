import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from transformers import pipeline
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import torch
import os

from reddit import fetch_reddit_data_json
from careers360 import fetch_careers360_data
from shiksha import fetch_shiksha_data
from collegedunia import fetch_collegedunia_data
from youtube import fetch_youtube_data

# ── LOAD MODEL ────────────────────────────────────────────────
_sentiment_pipeline = None

def get_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        print("[MODEL] Loading XLM-RoBERTa...")
        _sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
            device=0 if torch.cuda.is_available() else -1,
            truncation=True,
            max_length=512
        )
        print("[MODEL] ✅ Ready")
    return _sentiment_pipeline


LABEL_MAP = {
    "positive": "POSITIVE",
    "negative": "NEGATIVE",
    "neutral":  "NEUTRAL"
}

# ── SENTIMENT FUNCTION ────────────────────────────────────────
def analyse(text: str):
    text = str(text).strip()
    if not text:
        return "NEUTRAL", 0.0
    try:
        result = get_pipeline()(text[:512])[0]
        label = LABEL_MAP.get(result['label'].lower(), "NEUTRAL")
        if label == "POSITIVE":
            signed_score = round(result['score'], 4)
        elif label == "NEGATIVE":
            signed_score = round(-result['score'], 4)
        else:
            signed_score = 0.0
        return label, signed_score
    except Exception as e:
        print(f"[ANALYSE] Error: {e}")
        return "NEUTRAL", 0.0


# ── TRANSCRIPT SUMMARIZER ─────────────────────────────────────
def summarize_transcript(text: str) -> str:
    """
    Summarize transcript using LSA (Latent Semantic Analysis).
    Picks 5 most statistically important sentences.
    Works for English, Hindi, Hinglish — no keywords needed.
    """
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary_sentences = summarizer(parser.document, sentences_count=5)
        summary = ' '.join(str(s) for s in summary_sentences)
        print(f"[SUMMARY] ✅ {len(text)} chars → {len(summary)} chars")
        return summary if summary else text[:512]
    except Exception as e:
        print(f"[SUMMARY] ⚠️ Failed: {e} — using truncated text")
        return text[:512]


# ── REDDIT ────────────────────────────────────────────────────
def get_reddit():
    print("\n[Reddit] Fetching...")
    raw = fetch_reddit_data_json(max_posts=200)
    results = []
    for item in raw:
        label, score = analyse(item['text'])
        results.append({
            "source":    "Reddit",
            "link":      item.get('source_url', ''),
            "text":      item['text'],
            "sentiment": label,
            "score":     round(score, 4)
        })
    print(f"[Reddit] {len(results)} posts fetched")
    return results


# ── CAREERS360 ────────────────────────────────────────────────
def get_careers360():
    print("\n[Careers360] Fetching...")
    raw = fetch_careers360_data("BPIT", max_results=1, max_reviews=200, cycles=12)
    results = []
    for item in raw:
        url = item.get('source_url', '')
        for review in item.get('reviews', []):
            if not review.strip():
                continue
            label, score = analyse(review)
            results.append({
                "source":    "Careers360",
                "link":      url,
                "text":      review.strip(),
                "sentiment": label,
                "score":     round(score, 4)
            })
    print(f"[Careers360] {len(results)} reviews fetched")
    return results


# ── SHIKSHA ───────────────────────────────────────────────────
def get_shiksha():
    print("\n[Shiksha] Fetching...")
    raw = fetch_shiksha_data("BPIT", max_results=1, max_reviews=520, cycles=12)
    results = []
    for item in raw:
        url = item.get('source_url', '')
        for review in item.get('reviews', []):
            if not review.strip():
                continue
            label, score = analyse(review)
            results.append({
                "source":    "Shiksha",
                "link":      url,
                "text":      review.strip(),
                "sentiment": label,
                "score":     round(score, 4)
            })
    print(f"[Shiksha] {len(results)} reviews fetched")
    return results


# ── COLLEGEDUNIA ──────────────────────────────────────────────
def get_collegedunia():
    print("\n[Collegedunia] Fetching...")
    raw = fetch_collegedunia_data("BPIT", max_results=1, max_reviews=200, cycles=12)
    results = []
    for item in raw:
        url = item.get('source_url', '')
        for review in item.get('reviews', []):
            if not review.strip():
                continue
            label, score = analyse(review)
            results.append({
                "source":    "Collegedunia",
                "link":      url,
                "text":      review.strip(),
                "sentiment": label,
                "score":     round(score, 4)
            })
    print(f"[Collegedunia] {len(results)} reviews fetched")
    return results


# ── YOUTUBE ───────────────────────────────────────────────────
YOUTUBE_SPAM = [
    'http', 'https', 'wa.me', 'whatsapp', 'click here',
    'jumpstart', 'subscribe', 't.me', 'telegram', 'instagram.com',
    'youtube.com', 'bit.ly', 'youtu.be', 'join now', 'contact us',
    'call now', 'dm me', 'follow me', 'check out', 'link in bio'
]

def get_youtube():
    print("\n[YouTube] Fetching...")
    raw = fetch_youtube_data(
        "Bhagwan Parshuram Institute of Technology",
        max_videos=8,
        max_comments=25
    )
    results = []
    seen = set()
    for item in raw:
        url = item.get('source_url', '')

        # ── Comments ──────────────────────────────────────
        for comment in item.get('comments', []):
            comment = comment.strip()
            if not comment or len(comment) < 15:
                continue
            lower = comment.lower()
            if any(spam in lower for spam in YOUTUBE_SPAM):
                continue
            if comment in seen:
                continue
            seen.add(comment)
            label, score = analyse(comment)
            results.append({
                "source":    "YouTube",
                "link":      url,
                "text":      comment,
                "sentiment": label,
                "score":     round(score, 4)
            })

        # ── Transcript ────────────────────────────────────
        transcript = item.get('transcript', '')
        if transcript and len(transcript.strip()) > 100:
            print(f"[YouTube] 📝 Summarizing transcript ({len(transcript)} chars)...")
            summary = summarize_transcript(transcript)
            label, score = analyse(summary)
            results.append({
                "source":    "YouTube",
                "link":      url,
                "text":      f"[TRANSCRIPT SUMMARY] {summary}",
                "sentiment": label,
                "score":     round(score, 4)
            })

    print(f"[YouTube] {len(results)} total (comments + transcript summary)")
    return results


# ── MAIN RUN FUNCTION ─────────────────────────────────────────
def run_analysis():
    all_results = []

    try:
        all_results += get_reddit()
    except Exception as e:
        print(f"[Reddit] Error: {e}")

    try:
        all_results += get_careers360()
    except Exception as e:
        print(f"[Careers360] Error: {e}")

    try:
        all_results += get_shiksha()
    except Exception as e:
        print(f"[Shiksha] Error: {e}")

    try:
        all_results += get_collegedunia()
    except Exception as e:
        print(f"[Collegedunia] Error: {e}")

    try:
        all_results += get_youtube()
    except Exception as e:
        print(f"[YouTube] Error: {e}")

    if not all_results:
        print("No data collected from any platform.")
        return pd.DataFrame()

    df = pd.DataFrame(all_results)

    positive_df = df[df['sentiment'] == 'POSITIVE']
    negative_df = df[df['sentiment'] == 'NEGATIVE']
    neutral_df  = df[df['sentiment'] == 'NEUTRAL']

    # Save CSVs
    os.makedirs("results", exist_ok=True)
    df.to_csv("results/all_sentiment.csv", index=False)
    positive_df.to_csv("results/all_positive.csv", index=False)
    negative_df.to_csv("results/all_negative.csv", index=False)

    # Summary
    print("\n" + "="*60)
    print("           SENTIMENT SUMMARY")
    print("="*60)
    print(f"Total    : {len(df)}")
    print(f"Positive : {len(positive_df)}")
    print(f"Negative : {len(negative_df)}")
    print(f"Neutral  : {len(neutral_df)}")
    print("\n--- Source-wise Breakdown ---")
    for source in df['source'].unique():
        src = df[df['source'] == source]
        pos = len(src[src['sentiment'] == 'POSITIVE'])
        neg = len(src[src['sentiment'] == 'NEGATIVE'])
        neu = len(src[src['sentiment'] == 'NEUTRAL'])
        print(f"{source:15} → Positive: {pos} | Negative: {neg} | Neutral: {neu}")

    # Charts
    labels = ['Positive', 'Negative', 'Neutral']
    sizes  = [len(positive_df), len(negative_df), len(neutral_df)]
    colors = ['#16a34a', '#dc2626', '#d97706']

    plt.figure(figsize=(6, 6))
    plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140)
    plt.title('Overall Sentiment Distribution - BPIT')
    plt.savefig("results/pie_chart.png")
    plt.close()

    plt.figure(figsize=(7, 5))
    plt.bar(labels, sizes, color=colors)
    plt.title('Overall Sentiment Count - BPIT')
    plt.ylabel('Number of Reviews')
    plt.savefig("results/bar_chart.png")
    plt.close()

    source_groups = df.groupby(['source', 'sentiment']).size().unstack(fill_value=0)
    source_groups.plot(kind='bar', color=['#dc2626', '#16a34a', '#d97706'], figsize=(10, 5))
    plt.title('Source-wise Sentiment Breakdown - BPIT')
    plt.ylabel('Number of Reviews')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig("results/sourcewise_bar_chart.png")
    plt.close()

    print("\nAll CSVs and charts saved in results/ folder")
    return df


if __name__ == '__main__':
    df = run_analysis()

    if not df.empty:
        positive_df = df[df['sentiment'] == 'POSITIVE']
        negative_df = df[df['sentiment'] == 'NEGATIVE']

        top5_pos = positive_df.nlargest(5, 'score')
        top5_neg = negative_df.nsmallest(5, 'score')

        print("\n" + "="*60)
        print("          TOP 5 POSITIVE COMMENTS")
        print("="*60)
        for i, row in enumerate(top5_pos.itertuples(), 1):
            print(f"\n{i}. [{row.source}] {row.text[:150]}")
            print(f"   Score: {row.score}")

        print("\n" + "="*60)
        print("       TOP 5 BRUTAL NEGATIVE COMMENTS")
        print("="*60)
        for i, row in enumerate(top5_neg.itertuples(), 1):
            print(f"\n{i}. [{row.source}] {row.text[:150]}")
            print(f"   Score: {row.score}")