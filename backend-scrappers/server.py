# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS

from youtube import fetch_youtube_data
from reddit import fetch_reddit_data

# Groq + Firecrawl versions
from shiksha_groq import fetch_shiksha_data_firecrawl
from collegedunia_groq import fetch_collegedunia_data_firecrawl
from careers360_groq import fetch_careers360_data_firecrawl

# Analysis functions
from analysis import clean_texts, analyze_source

app = Flask(__name__)
CORS(app)

fetch_functions = {
    "youtube": fetch_youtube_data,
    "reddit": fetch_reddit_data,
    "shiksha": fetch_shiksha_data_firecrawl,
    "collegedunia": fetch_collegedunia_data_firecrawl,
    "careers360": fetch_careers360_data_firecrawl,
}

@app.route('/api/<platform>', methods=['GET'])
def analyze_platform(platform):
    query = request.args.get('query', '').strip()

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    if platform not in fetch_functions:
        return jsonify({"error": "Invalid platform"}), 400

    print(f"[SERVER] Request for {platform} | Query: {query}")

    try:
        print(f"[SERVER] Calling fetch function: {fetch_functions[platform].__name__}")
        raw_texts = fetch_functions[platform](query)
        print(f"[SERVER] Raw texts received: {len(raw_texts)} items")

        cleaned = clean_texts(raw_texts)
        print(f"[SERVER] Cleaned texts: {len(cleaned)} items")

        result = analyze_source(cleaned, platform)
        print(f"[SERVER] Analysis complete for {platform}")

        return jsonify(result)

    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"[SERVER ERROR] {platform} failed: {error_msg}")
        traceback.print_exc()
        return jsonify({
            "error": error_msg,
            "platform": platform,
            "query": query
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
