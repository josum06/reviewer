# analysis.py
import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords', quiet=True)

analyzer = SentimentIntensityAnalyzer()
stop_words = set(stopwords.words('english'))

def clean_texts(raw_texts):
    cleaned = []
    for text in raw_texts:
        if not text.strip():
            continue
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
        words = [w for w in text.lower().split() if w not in stop_words and len(w) > 2]
        cleaned.append(' '.join(words))
    return list(set(cleaned))  # remove duplicates

def analyze_source(texts, source_name):
    if not texts:
        return {
            "source": source_name,
            "sentiment": "No data",
            "pos_pct": 0,
            "neg_pct": 0,
            "neu_pct": 0,
            "summary": "No useful comments or reviews found.",
            "examples_pos": [],
            "examples_neg": [],
            "key_themes": {}
        }

    pos, neg, neu = 0, 0, 0
    pos_examples, neg_examples = [], []
    themes = {
        "placements": 0, "faculty": 0, "infrastructure": 0,
        "campus life": 0, "crowd": 0, "academics": 0,
        "value for money": 0, "hostel": 0
    }

    for text in texts:
        score = analyzer.polarity_scores(text)
        comp = score['compound']
        lower = text.lower()

        if comp > 0.1:
            pos += 1
            if len(pos_examples) < 4:
                pos_examples.append(text[:180] + "..." if len(text) > 180 else text)
        elif comp < -0.1:
            neg += 1
            if len(neg_examples) < 4:
                neg_examples.append(text[:180] + "..." if len(text) > 180 else text)
        else:
            neu += 1

        # Theme detection
        if any(kw in lower for kw in ["placement", "job", "package", "company", "intern"]):
            themes["placements"] += 1
        if any(kw in lower for kw in ["faculty", "teacher", "professor", "staff"]):
            themes["faculty"] += 1
        if any(kw in lower for kw in ["infrastructure", "campus", "building", "lab", "facility"]):
            themes["infrastructure"] += 1
        if any(kw in lower for kw in ["campus life", "crowd", "society", "club", "event"]):
            themes["campus life"] += 1
        if any(kw in lower for kw in ["academic", "study", "course", "exam"]):
            themes["academics"] += 1
        if any(kw in lower for kw in ["fee", "money", "worth", "roi", "expensive"]):
            themes["value for money"] += 1
        if any(kw in lower for kw in ["hostel", "pg", "mess", "food"]):
            themes["hostel"] += 1

    total = pos + neg + neu or 1
    return {
        "source": source_name,
        "sentiment": f"{pos/total*100:.0f}% Positive, {neg/total*100:.0f}% Negative, {neu/total*100:.0f}% Neutral",
        "pos_pct": round(pos/total*100),
        "neg_pct": round(neg/total*100),
        "neu_pct": round(neu/total*100),
        "summary": f"Analyzed {len(texts)} comments/snippets.",
        "examples_pos": pos_examples,
        "examples_neg": neg_examples,
        "key_themes": {k: v for k, v in themes.items() if v > 0}
    }