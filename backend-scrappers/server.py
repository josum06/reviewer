from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

from analysis import run_analysis, get_reddit, get_careers360, get_shiksha, get_collegedunia, get_youtube

app = Flask(__name__)
CORS(app)

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
    csv_path = 'results/all_sentiment.csv'
    if not os.path.exists(csv_path):
        run_analysis()
    df = pd.read_csv(csv_path)
    return jsonify(df.to_dict(orient='records'))

# ── Get data for single platform ──────────────────────────────
@app.route('/api/sentiment/<platform>', methods=['GET'])
def get_platform_sentiment(platform):
    csv_path = 'results/all_sentiment.csv'
    if not os.path.exists(csv_path):
        return jsonify([])
    df = pd.read_csv(csv_path)
    filtered = df[df['source'].str.lower() == platform.lower()]
    return jsonify(filtered.to_dict(orient='records'))

# ── Re-run ALL platforms ──────────────────────────────────────
@app.route('/api/run', methods=['GET'])
def run_all():
    run_analysis()
    return jsonify({"status": "All platforms analysed"})

# ── Re-run SINGLE platform ────────────────────────────────────
@app.route('/api/run/<platform>', methods=['GET'])
def run_platform(platform):
    csv_path = 'results/all_sentiment.csv'

    fn = PLATFORM_MAP.get(platform.lower())
    if not fn:
        return jsonify({"error": f"Unknown platform: {platform}"}), 400

    try:
        new_results = fn()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Load existing CSV and replace this platform's data
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

    return jsonify(new_results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)