from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv

from analysis import run_analysis, get_reddit, get_careers360, get_shiksha, get_collegedunia, get_youtube

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── MongoDB Setup ─────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI")
mongo_available = False

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    client.server_info()  # test connection
    db = client["bpit_pulse"]
    reviews_col = db["reviews"]
    mongo_available = True
    print("✅ MongoDB connected")
except Exception as e:
    print(f"⚠️  MongoDB not available, falling back to CSV only: {e}")


def save_to_mongo(platform, records):
    """Save records to MongoDB, replacing old ones for that platform."""
    if not mongo_available or not records:
        return
    try:
        reviews_col.delete_many({"source": platform.lower()})
        for r in records:
            r["scraped_at"] = datetime.utcnow().isoformat()
        reviews_col.insert_many(records)
        # ── Remove _id added by MongoDB so records stay JSON serializable ──
        for r in records:
            r.pop("_id", None)
        print(f"✅ Saved {len(records)} records to MongoDB for {platform}")
    except Exception as e:
        print(f"⚠️  MongoDB save failed for {platform}: {e}")


def get_from_mongo(platform=None):
    """Fetch records from MongoDB."""
    if not mongo_available:
        return None
    try:
        query = {"source": platform.lower()} if platform else {}
        return list(reviews_col.find(query, {"_id": 0, "scraped_at": 0}))
    except Exception as e:
        print(f"⚠️  MongoDB fetch failed: {e}")
        return None
# ── 24hr freshness check ──────────────────────────────────────
def is_data_fresh(platform=None):
    """Returns True if data exists and is less than 24 hours old."""
    try:
        query = {"source": platform.lower()} if platform else {}
        record = reviews_col.find_one(query, sort=[("scraped_at", -1)])
        if not record:
            return False
        scraped_at = record.get("scraped_at")
        if not scraped_at:
            return False
        scraped_time = datetime.fromisoformat(str(scraped_at))
        age_hours = (datetime.utcnow() - scraped_time).total_seconds() / 3600
        print(f"[{platform or 'ALL'}] Data age: {age_hours:.1f} hours")
        return age_hours < 24
    except Exception as e:
        print(f"⚠️ Freshness check failed: {e}")
        return False

# ── Platform map (unchanged) ──────────────────────────────────
PLATFORM_MAP = {
    'reddit':       get_reddit,
    'shiksha':      get_shiksha,
    'careers360':   get_careers360,
    'collegedunia': get_collegedunia,
    'youtube':      get_youtube,
}


# ── All sentiment data ────────────────────────────────────────
@app.route('/api/sentiment', methods=['GET'])
def get_sentiment():
    # Try MongoDB first (fast)
    mongo_data = get_from_mongo()
    if mongo_data is not None and len(mongo_data) > 0:
        return jsonify(mongo_data)

    # Fallback to CSV
    csv_path = 'results/all_sentiment.csv'
    if not os.path.exists(csv_path):
        run_analysis()
    df = pd.read_csv(csv_path)
    return jsonify(df.to_dict(orient='records'))


# ── Get data for single platform ──────────────────────────────
@app.route('/api/sentiment/<platform>', methods=['GET'])
def get_platform_sentiment(platform):
    # Try MongoDB first (fast)
    mongo_data = get_from_mongo(platform)
    if mongo_data is not None and len(mongo_data) > 0:
        return jsonify(mongo_data)

    # Fallback to CSV
    csv_path = 'results/all_sentiment.csv'
    if not os.path.exists(csv_path):
        return jsonify([])
    df = pd.read_csv(csv_path)
    filtered = df[df['source'].str.lower() == platform.lower()]
    return jsonify(filtered.to_dict(orient='records'))

# ── Re-run ALL platforms ──────────────────────────────────────
# ── Re-run ALL platforms ──────────────────────────────────────
@app.route('/api/run', methods=['GET'])
def run_all():
    if mongo_available and is_data_fresh():
        print("✅ Data is fresh (< 24hrs) — returning from MongoDB")
        existing = list(reviews_col.find({}, {"_id": 0}))
        return jsonify(existing)

    print("🔄 Data stale or missing — running full scrape...")
    run_analysis()

    csv_path = 'results/all_sentiment.csv'
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        for platform in PLATFORM_MAP.keys():
            platform_records = df[df['source'].str.lower() == platform.lower()].to_dict(orient='records')
            save_to_mongo(platform, platform_records)

    return jsonify({"status": "All platforms analysed"})


# ── Re-run SINGLE platform ────────────────────────────────────
# ── Re-run SINGLE platform ────────────────────────────────────
@app.route('/api/run/<platform>', methods=['GET'])
def run_platform(platform):
    fn = PLATFORM_MAP.get(platform.lower())
    if not fn:
        return jsonify({"error": f"Unknown platform: {platform}"}), 400

    if mongo_available and is_data_fresh(platform):
        print(f"✅ [{platform}] Data is fresh (< 24hrs) — returning from MongoDB")
        existing = get_from_mongo(platform)
        return jsonify(existing)

    print(f"🔄 [{platform}] Data stale or missing — scraping now...")
    csv_path = 'results/all_sentiment.csv'

    try:
        new_results = fn()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if os.path.exists(csv_path):
        df_existing = pd.read_csv(csv_path)
        df_existing = df_existing[df_existing['source'].str.lower() != platform.lower()]
    else:
        df_existing = pd.DataFrame()

    if new_results:
        df_new = pd.DataFrame(new_results)
        df_combined = pd.concat([df_existing, df_new], ignore_index=True)
        os.makedirs("results", exist_ok=True)
        df_combined.to_csv(csv_path, index=False)
        save_to_mongo(platform, new_results.copy())

    return jsonify(new_results)


# ── Force refresh (ignores 24hr limit) ───────────────────────
@app.route('/api/refresh/<platform>', methods=['GET'])
def refresh_platform(platform):
    fn = PLATFORM_MAP.get(platform.lower())
    if not fn:
        return jsonify({"error": f"Unknown platform: {platform}"}), 400

    print(f"🔄 [{platform}] Force refresh requested...")
    try:
        new_results = fn()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if new_results:
        save_to_mongo(platform, new_results.copy())

    return jsonify(new_results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)