# shiksha_groq.py
from firecrawl import FirecrawlApp
from groq import Groq
import json
import os


from dotenv import load_dotenv
load_dotenv()

# Load keys from environment variables
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

firecrawl = FirecrawlApp(api_key=FIRECRAWL_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

def fetch_shiksha_data_firecrawl(query, limit=15):
    try:
        # Step 1: Search for college
        search_url = f"https://www.shiksha.com/search?q={query.replace(' ', '+')}"
        print(f"[SHIKSHA] Scraping search URL: {search_url}")
        
        search_result = firecrawl.scrape(
            search_url,
            formats=['markdown'],
            only_main_content=True
        )

        if not search_result or not hasattr(search_result, 'markdown'):
            print("[SHIKSHA] Failed to scrape search page")
            return []

        # Step 2: Find college page URL
        markdown = search_result.markdown
        print(f"[SHIKSHA] Search markdown length: {len(markdown)} chars")
        
        college_url = None
        for line in markdown.split('\n'):
            if 'shiksha.com/college/' in line.lower():
                # Extract URL more flexibly
                if 'https://' in line:
                    start = line.find('https://www.shiksha.com/college/')
                    if start != -1:
                        end = line.find(' ', start)
                        if end == -1:
                            end = line.find(')', start)
                        if end == -1:
                            end = len(line)
                        college_url = line[start:end].strip()
                        break

        if not college_url:
            print("[SHIKSHA] No college URL found, trying direct construction")
            college_url = f"https://www.shiksha.com/college/{query.replace(' ', '-').lower()}"

        print(f"[SHIKSHA] Found/Constructed college URL: {college_url}")

        # Step 3: Scrape college page
        print("[SHIKSHA] Scraping college page...")
        college_result = firecrawl.scrape(
            college_url,
            formats=['markdown'],
            only_main_content=True
        )

        if not college_result or not hasattr(college_result, 'markdown'):
            print("[SHIKSHA] Failed to scrape college page")
            return []

        college_md = college_result.markdown
        print(f"[SHIKSHA] College markdown length: {len(college_md)} chars")

        # Step 4: Try to find reviews page
        reviews_url = None
        for line in college_md.split('\n'):
            if 'reviews' in line.lower() and 'shiksha.com' in line.lower():
                if 'https://' in line:
                    start = line.find('https://')
                    end = line.find(' ', start)
                    if end == -1:
                        end = line.find(')', start)
                    if end == -1:
                        end = len(line)
                    reviews_url = line[start:end].strip()
                    break

        if not reviews_url:
            reviews_url = college_url.rstrip('/') + '/reviews'

        print(f"[SHIKSHA] Reviews URL: {reviews_url}")

        # Step 5: Scrape reviews page with scroll
        print("[SHIKSHA] Scraping reviews page...")
        reviews_result = firecrawl.scrape(
            reviews_url,
            formats=['markdown'],
            only_main_content=True,
            actions=[
                {"type": "wait", "milliseconds": 2000},
                {"type": "scroll", "direction": "down"},
                {"type": "wait", "milliseconds": 2000}
            ]
        )

        if not reviews_result or not hasattr(reviews_result, 'markdown'):
            print("[SHIKSHA] Failed to scrape reviews page")
            return []

        raw_content = reviews_result.markdown[:20000]
        print(f"[SHIKSHA] Reviews markdown length: {len(raw_content)} chars")
        print(f"[SHIKSHA] First 500 chars of content: {raw_content[:500]}")

        # Step 6: Groq to extract real reviews & sentiment
        print("[SHIKSHA] Sending to Groq for extraction...")
        prompt = f"""
You are an expert at extracting real student reviews from Shiksha.com pages.

From the following page content (Shiksha reviews or college page), extract ONLY actual student comments.

Ignore:
- footer, legal text, navigation, ads, copyright notices
- site prompts like "register login compare colleges"
- any non-review text

Extract:
1. Overall sentiment percentages: positive %, neutral %, negative % (estimate from tone)
2. Up to {limit} real student review quotes (exact text, short)
3. Key themes with count (placements, faculty, infrastructure, hostel, campus life, value for money, crowd, academics)

Output ONLY valid JSON, no extra text:
{{
  "pos_pct": number,
  "neg_pct": number,
  "neu_pct": number,
  "comments": ["comment1", "comment2", ...],
  "themes": {{"placements": count, "faculty": count, ...}}
}}

Page content:
{raw_content}
"""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1200,
            response_format={"type": "json_object"}
        )

        groq_response = response.choices[0].message.content
        print(f"[SHIKSHA] Groq response: {groq_response[:500]}")

        try:
            extracted = json.loads(groq_response)
            comments = extracted.get("comments", [])
            print(f"[SHIKSHA] Extracted {len(comments)} comments")
            # Return list of comments instead of dictionary for clean_texts compatibility
            if not comments:
                print("[SHIKSHA] No comments extracted, returning empty list")
                return []
            return comments
        except json.JSONDecodeError as e:
            print(f"[SHIKSHA] JSON parsing error: {e}")
            print(f"[SHIKSHA] Raw response: {groq_response}")
            return []

    except Exception as e:
        # Return empty list on error instead of dict, so clean_texts won't crash
        import traceback
        print(f"[SHIKSHA] ERROR: {e}")
        traceback.print_exc()
        return []

# Add this at the very end of shiksha_groq.py

if __name__ == "__main__":
    result = fetch_shiksha_data_firecrawl("BPIT College")
    print(json.dumps(result, indent=2))
