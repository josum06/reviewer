# collegedunia_groq.py
from firecrawl import FirecrawlApp
from groq import Groq
import json
import os
import re
import sys
import time

from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


firecrawl = FirecrawlApp(api_key=FIRECRAWL_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Known CollegeDunia reviews URLs (university/college id-based) when search doesn't find them
KNOWN_REVIEWS_URLS = {
    "delhi-university": "https://www.collegedunia.com/university/25473-delhi-university-du-new-delhi/reviews",
    "du": "https://www.collegedunia.com/university/25473-delhi-university-du-new-delhi/reviews",
    # BPIT Delhi - Bhagwan Parshuram Institute of Technology
    "bpit": "https://www.collegedunia.com/college/13032-bhagwan-parshuram-institute-of-technology-bpit-new-delhi/reviews",
    "bpit-delhi": "https://www.collegedunia.com/college/13032-bhagwan-parshuram-institute-of-technology-bpit-new-delhi/reviews",
}


def _log(msg):
    """Print and flush so output is visible even when errors occur."""
    print(msg)
    sys.stdout.flush()

def _scrape_safe(url, use_actions=False, only_main_content=True):
    """Call Firecrawl scrape with clear error handling. Returns (result_with.markdown, error_msg)."""
    try:
        opts = dict(formats=['markdown'], only_main_content=only_main_content)
        if use_actions:
            opts["actions"] = [
                {"type": "wait", "milliseconds": 2000},
                {"type": "scroll", "direction": "down"},
                {"type": "wait", "milliseconds": 2000},
            ]
        result = firecrawl.scrape(url, **opts)
        # SDK may return object or dict; normalize to object with .markdown
        md = None
        if hasattr(result, 'markdown'):
            md = result.markdown
        elif isinstance(result, dict):
            if result.get('success') is False or result.get('error'):
                return (None, result.get('error') or result.get('code', 'Unknown error'))
            md = result.get('markdown')
        if md:
            out = type('ScrapeResult', (), {'markdown': md})()
            return (out, None)
        return (None, "No markdown in response")
    except Exception as e:
        return (None, str(e))


def fetch_collegedunia_data_firecrawl(query, limit=15):
    try:
        # Step 1: Try to fetch college directly with constructed URL
        college_name = query.replace(' ', '-').lower()
        college_url = f"https://www.collegedunia.com/colleges/{college_name}"

        _log(f"[COLLEGEDUNIA] Trying direct URL: {college_url}")

        college_result, scrape_err = _scrape_safe(college_url)
        if scrape_err:
            _log(f"[COLLEGEDUNIA] Direct scrape error: {scrape_err}")

        if not college_result or not getattr(college_result, 'markdown', None) or len(college_result.markdown) < 100:
            _log("[COLLEGEDUNIA] Direct URL failed, trying search...")
            search_url = f"https://www.collegedunia.com/search?type=colleges&q={query.replace(' ', '+')}"
            _log(f"[COLLEGEDUNIA] Trying search URL: {search_url}")

            search_result, search_err = _scrape_safe(search_url)
            if search_err:
                _log(f"[COLLEGEDUNIA] Search scrape error: {search_err}")
            if not search_result or not getattr(search_result, 'markdown', None):
                _log("[COLLEGEDUNIA] Search also failed")
                return []

            markdown = search_result.markdown
            _log(f"[COLLEGEDUNIA] Search markdown length: {len(markdown)} chars")

            # Prefer /university/ID-slug or /college/ID-slug (has real reviews); fallback to /colleges/slug
            college_url = None
            for match in re.finditer(r'https?://(?:www\.)?collegedunia\.com/(university|college)/(\d+-[a-z0-9-]+)', markdown, re.I):
                college_url = match.group(0).rstrip('.,;)\'"')
                break
            if not college_url:
                for match in re.finditer(r'/(university|college)/(\d+-[a-z0-9-]+)', markdown, re.I):
                    college_url = 'https://www.collegedunia.com' + match.group(0)
                    break
            if not college_url:
                for line in markdown.split('\n'):
                    if '/colleges/' in line.lower() and 'collegedunia.com' in line.lower():
                        if 'https://' in line:
                            start = line.find('https://')
                            if start != -1:
                                end = line.find(' ', start)
                                if end == -1:
                                    end = line.find(')', start)
                                if end == -1:
                                    end = len(line)
                                college_url = line[start:end].strip()
                                break
                    if college_url:
                        break

            if not college_url:
                _log("[COLLEGEDUNIA] No college URL found in search")
                return []

            _log(f"[COLLEGEDUNIA] Found college URL from search: {college_url}")
            # Must scrape the found college URL to get college page content
            college_result, college_err = _scrape_safe(college_url)
            if college_err:
                _log(f"[COLLEGEDUNIA] College page scrape error: {college_err}")
            if not college_result or not getattr(college_result, 'markdown', None):
                _log("[COLLEGEDUNIA] Failed to scrape college page from search result")
                return []
        else:
            _log(f"[COLLEGEDUNIA] Using direct URL: {college_url}")

        college_md = college_result.markdown
        _log(f"[COLLEGEDUNIA] College markdown length: {len(college_md)} chars")

        # Step 3: Find reviews URL — CollegeDunia uses /university/{id}-{slug}/reviews or /college/{id}-{slug}/reviews for actual reviews
        reviews_url = None
        # From current page: look for links to id-based reviews (e.g. /university/25473-delhi-university-du-new-delhi/reviews)
        for match in re.finditer(r'https?://(?:www\.)?collegedunia\.com/(university|college)/\d+-[^/\s\)"\']+/reviews[^\s\)"\']*', college_md, re.I):
            reviews_url = match.group(0).rstrip('.,;')
            break
        if not reviews_url:
            for line in college_md.split('\n'):
                if 'reviews' in line.lower() and 'collegedunia.com' in line.lower() and ('/university/' in line or '/college/' in line):
                    if 'https://' in line:
                        start = line.find('https://')
                        if start != -1:
                            end = line.find(' ', start)
                            if end == -1:
                                end = line.find(')', start)
                            if end == -1:
                                end = line.find('"', start)
                            if end == -1:
                                end = len(line)
                            reviews_url = line[start:end].strip().rstrip('.,;')
                            break
        # If we're on /colleges/... (no id), search to get /university/ or /college/ URL with id — that's where real reviews live
        if not reviews_url and '/colleges/' in college_url and '/college/' not in college_url and '/university/' not in college_url:
            _log("[COLLEGEDUNIA] No id-based reviews link on page; searching for university/college page...")
            search_url = f"https://www.collegedunia.com/search?type=colleges&q={query.replace(' ', '+')}"
            search_result, _ = _scrape_safe(search_url)
            if search_result and getattr(search_result, 'markdown', None):
                search_md = search_result.markdown
                # Find full URL: collegedunia.com/university/ID-slug or /college/ID-slug
                for match in re.finditer(r'https?://(?:www\.)?collegedunia\.com/(university|college)/(\d+-[a-z0-9-]+)', search_md, re.I):
                    base_url = match.group(0).rstrip('.,;)\'"')
                    reviews_url = base_url + '/reviews'
                    _log(f"[COLLEGEDUNIA] Using reviews URL from search: {reviews_url}")
                    break
                # Or relative path in markdown: /university/25473-delhi-university-du-new-delhi
                if not reviews_url:
                    for match in re.finditer(r'/(university|college)/(\d+-[a-z0-9-]+)(?:/reviews)?', search_md, re.I):
                        path = match.group(0).split('/reviews')[0]
                        reviews_url = 'https://www.collegedunia.com' + path + '/reviews'
                        _log(f"[COLLEGEDUNIA] Using reviews URL from path: {reviews_url}")
                        break
        if not reviews_url and college_name in KNOWN_REVIEWS_URLS:
            reviews_url = KNOWN_REVIEWS_URLS[college_name]
            _log(f"[COLLEGEDUNIA] Using known reviews URL: {reviews_url}")
        if not reviews_url:
            # Try query shorthand (e.g. "du" for Delhi University)
            q_lower = query.lower().strip()
            if q_lower in KNOWN_REVIEWS_URLS:
                reviews_url = KNOWN_REVIEWS_URLS[q_lower]
                _log(f"[COLLEGEDUNIA] Using known reviews URL for query: {reviews_url}")
        if not reviews_url:
            reviews_url = college_url.rstrip('/') + '/reviews'

        _log(f"[COLLEGEDUNIA] Reviews URL: {reviews_url}")

        # Step 5: Scrape reviews page — use full page (only_main_content=False) so review blocks aren't stripped
        _log("[COLLEGEDUNIA] Scraping reviews page (full content)...")
        reviews_result, reviews_err = _scrape_safe(reviews_url, use_actions=False, only_main_content=False)
        if not reviews_result and reviews_err:
            _log(f"[COLLEGEDUNIA] Reviews scrape error: {reviews_err}")
        if not reviews_result:
            _log("[COLLEGEDUNIA] Retrying reviews with main content only...")
            reviews_result, _ = _scrape_safe(reviews_url, use_actions=False, only_main_content=True)
        if not reviews_result:
            _log("[COLLEGEDUNIA] Retrying with wait/scroll...")
            reviews_result, _ = _scrape_safe(reviews_url, use_actions=True, only_main_content=False)
        if not reviews_result or not getattr(reviews_result, 'markdown', None):
            _log("[COLLEGEDUNIA] No reviews page content; will use college page only for extraction.")

        # Step 6: Combine college page + reviews page so we have all text (reviews may be on main page or /reviews)
        raw_reviews = (reviews_result.markdown or "") if reviews_result else ""
        # Avoid duplicate content: if reviews page returned same as college page, use college only
        if raw_reviews.strip() and raw_reviews.strip() != college_md.strip():
            combined = f"=== COLLEGE PAGE ===\n{college_md}\n\n=== REVIEWS PAGE ===\n{raw_reviews}"
        else:
            combined = college_md
        # Keep under ~25k chars to reduce Groq token usage; prioritize reviews section if we have it
        raw_content = combined[:25000]
        _log(f"[COLLEGEDUNIA] Content for extraction: {len(raw_content)} chars")

        # Step 7: Groq extraction — look for any student opinions, review snippets, ratings, "students say", etc.
        _log("[COLLEGEDUNIA] Sending to Groq...")
        prompt = f"""
You are an expert at extracting real student reviews and opinions from CollegeDunia.com.

From the following page content (college overview and/or reviews section), extract EVERY actual student comment or review you can find.

INCLUDE:
- Any quoted student text (e.g. in "Student Reviews", "What students say", "Reviews", testimonials)
- Short opinion snippets (e.g. "Good placements", "Campus is nice", "Faculty is average")
- Rating-related comments
- Any sentence that clearly expresses a student's experience or opinion about the college

IGNORE:
- Navigation, "Login", "Register", "Compare colleges", footer, copyright
- Generic descriptions not attributed to students
- Headings and labels that are not actual review text

Extract up to {limit} distinct student review/comment strings. Keep each as a short quote or phrase. If you find no student reviews, return empty array.

Output ONLY valid JSON, no other text:
{{
  "comments": ["comment1", "comment2", ...]
}}

Page content:
{raw_content}
"""

        def extract_with_gemini(prompt_text):
            if not GEMINI_API_KEY:
                return None
            try:
                import google.generativeai as genai
                genai.configure(api_key=GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(
                    prompt_text,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.1,
                        max_output_tokens=1200,
                    ),
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                _log(f"[COLLEGEDUNIA] Gemini API error: {e}")
            return None

        def extract_with_groq(prompt_text, retry_on_429=True):
            if not groq_client:
                return None
            try:
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt_text}],
                    temperature=0.1,
                    max_tokens=1200,
                    response_format={"type": "json_object"}
                )
                return response.choices[0].message.content or ""
            except Exception as groq_err:
                err_str = str(groq_err).lower()
                is_429 = "429" in err_str or "rate_limit" in err_str
                if is_429:
                    _log("[COLLEGEDUNIA] Groq rate limit (429). Trying Gemini if GEMINI_API_KEY is set...")
                    if GEMINI_API_KEY:
                        out = extract_with_gemini(prompt_text)
                        if out:
                            return out
                    if not GEMINI_API_KEY:
                        _log("[COLLEGEDUNIA] Set GEMINI_API_KEY (free at https://aistudio.google.com/apikey) to avoid Groq 429.")
                    if retry_on_429:
                        time.sleep(5)
                        return extract_with_groq(prompt_text, retry_on_429=False)
                _log(f"[COLLEGEDUNIA] Groq API error: {groq_err}")
                return None

        def run_extraction(prompt_text):
            # Prefer Gemini (free tier, no card) when GEMINI_API_KEY is set
            if GEMINI_API_KEY:
                _log("[COLLEGEDUNIA] Using Gemini for extraction...")
                out = extract_with_gemini(prompt_text)
                if out:
                    return out
                _log("[COLLEGEDUNIA] Gemini failed, trying Groq...")
            if groq_client:
                out = extract_with_groq(prompt_text)
                if out:
                    return out
            if not GEMINI_API_KEY and not groq_client:
                _log("[COLLEGEDUNIA] Set GEMINI_API_KEY (free at https://aistudio.google.com/apikey) or GROQ_API_KEY")
            return None

        groq_response = run_extraction(prompt)
        if not groq_response:
            return []

        _log(f"[COLLEGEDUNIA] Extraction response: {groq_response[:500]}")

        try:
            text = groq_response.strip()
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\s*", "", text)
                text = re.sub(r"\s*```$", "", text)
            extracted = json.loads(text)
            comments = extracted.get("comments", [])
            comments = [c for c in comments if c and isinstance(c, str) and len(c.strip()) > 5]
            _log(f"[COLLEGEDUNIA] Extracted {len(comments)} comments")
            if comments:
                return comments
            # Fallback: try looser extraction for any opinion-like sentences
            _log("[COLLEGEDUNIA] No comments found; trying looser extraction...")
            fallback_prompt = f"""From this CollegeDunia page text, extract any short phrases or sentences that express an opinion, experience, or review about the college (e.g. "good faculty", "placements are decent", "campus is small"). Include anything that sounds like a student or user opinion. Return JSON: {{ "comments": ["phrase1", "phrase2", ...] }}. If none, return {{ "comments": [] }}.

Text:
{raw_content[:15000]}
"""
            fallback_response = run_extraction(fallback_prompt)
            if fallback_response:
                try:
                    fb_text = fallback_response.strip()
                    if fb_text.startswith("```"):
                        fb_text = re.sub(r"^```(?:json)?\s*", "", fb_text)
                        fb_text = re.sub(r"\s*```$", "", fb_text)
                    fallback_data = json.loads(fb_text)
                    comments = fallback_data.get("comments", [])
                    comments = [c for c in comments if c and isinstance(c, str) and len(c.strip()) > 3]
                    if comments:
                        _log(f"[COLLEGEDUNIA] Fallback extracted {len(comments)} comments")
                        return comments
                except json.JSONDecodeError:
                    pass
            _log("[COLLEGEDUNIA] No comments extracted")
            return []
        except json.JSONDecodeError as e:
            _log(f"[COLLEGEDUNIA] JSON parsing error: {e}")
            return []

    except Exception as e:
        import traceback
        _log(f"[COLLEGEDUNIA] ERROR: {e}")
        traceback.print_exc()
        sys.stdout.flush()
        return []


if __name__ == "__main__":
    _log("Starting CollegeDunia scraper (Delhi University)...")
    result = fetch_collegedunia_data_firecrawl("Delhi University")
    _log("Result:")
    print(json.dumps(result, indent=2))
    sys.stdout.flush()
