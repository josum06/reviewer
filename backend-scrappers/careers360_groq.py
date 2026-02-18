from firecrawl import FirecrawlApp
from groq import Groq
import json
import os


from dotenv import load_dotenv
load_dotenv()

# Load keys from environment variables
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Optional safety check (good practice)
if not FIRECRAWL_API_KEY or not GROQ_API_KEY:
    raise ValueError("API keys not found. Check your .env file.")

firecrawl = FirecrawlApp(api_key=FIRECRAWL_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

def fetch_careers360_data_firecrawl(query, limit=15):
    try:
        # Step 1: Search
        search_url = f"https://www.careers360.com/search?query={query.replace(' ', '+')}"
        print(f"[CAREERS360] Scraping search URL: {search_url}")
        
        search_result = firecrawl.scrape(
            search_url,
            formats=['markdown'],
            only_main_content=True
        )

        if not search_result or not hasattr(search_result, 'markdown'):
            print("[CAREERS360] Failed to scrape search page")
            return []

        # Step 2: Find college page URL
        markdown = search_result.markdown
        print(f"[CAREERS360] Search markdown length: {len(markdown)} chars")
        
        college_url = None
        for line in markdown.split('\n'):
            if 'careers360.com/colleges/' in line.lower() or 'careers360.com/institute/' in line.lower():
                if 'https://' in line:
                    start = line.find('https://www.careers360.com/')
                    if start != -1:
                        end = line.find(' ', start)
                        if end == -1:
                            end = line.find(')', start)
                        if end == -1:
                            end = len(line)
                        college_url = line[start:end].strip()
                        break

        if not college_url:
            print("[CAREERS360] No college URL found")
            return []

        print(f"[CAREERS360] Found college URL: {college_url}")

        # Step 3: Scrape college page
        print("[CAREERS360] Scraping college page...")
        college_result = firecrawl.scrape(
            college_url,
            formats=['markdown'],
            only_main_content=True
        )

        if not college_result or not hasattr(college_result, 'markdown'):
            print("[CAREERS360] Failed to scrape college page")
            return []

        college_md = college_result.markdown
        print(f"[CAREERS360] College markdown length: {len(college_md)} chars")

        # Step 4: Find reviews section
        reviews_url = None
        for line in college_md.split('\n'):
            if 'reviews' in line.lower() and 'careers360.com' in line.lower():
                if 'https://' in line:
                    start = line.find('https://www.careers360.com/')
                    if start != -1:
                        end = line.find(' ', start)
                        if end == -1:
                            end = line.find(')', start)
                        if end == -1:
                            end = len(line)
                        reviews_url = line[start:end].strip()
                        break

        if not reviews_url:
            reviews_url = college_url.rstrip('/') + '/reviews'

        print(f"[CAREERS360] Reviews URL: {reviews_url}")

        # Step 5: Scrape reviews
        print("[CAREERS360] Scraping reviews page...")
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
            print("[CAREERS360] Failed to scrape reviews page")
            return []

        raw_content = reviews_result.markdown[:20000]
        print(f"[CAREERS360] Reviews markdown length: {len(raw_content)} chars")

        # Step 6: Groq extraction
        print("[CAREERS360] Sending to Groq...")
        prompt = f"""
You are an expert at extracting real student reviews from Careers360.com pages.

From the following page content (Careers360 reviews or college page), extract ONLY actual student comments.

Ignore:
- footer, legal text, navigation, ads, copyright notices
- site prompts like "register login compare colleges"
- any non-review text

Extract up to {limit} real student review quotes (exact text, short).

Output ONLY valid JSON, no extra text:
{{
  "comments": ["comment1", "comment2", ...]
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
        print(f"[CAREERS360] Groq response: {groq_response[:500]}")

        try:
            extracted = json.loads(groq_response)
            comments = extracted.get("comments", [])
            print(f"[CAREERS360] Extracted {len(comments)} comments")
            if not comments:
                print("[CAREERS360] No comments extracted")
                return []
            return comments
        except json.JSONDecodeError as e:
            print(f"[CAREERS360] JSON parsing error: {e}")
            return []

    except Exception as e:
        import traceback
        print(f"[CAREERS360] ERROR: {e}")
        traceback.print_exc()
        return []

if __name__ == "__main__":
    result = fetch_careers360_data_firecrawl("Delhi University")
    print(json.dumps(result, indent=2))
