from pydantic import BaseModel, Field
from typing import List
from firecrawl import FirecrawlApp
import os
import re
from dotenv import load_dotenv

load_dotenv()

FIRECRAWL_API_KEY = os.getenv('FIRECRAWL_API_KEY')
app = FirecrawlApp(api_key=FIRECRAWL_API_KEY)

class ReviewsData(BaseModel):
    reviews: List[str] = Field(
        description="Extract ONLY the full original student review texts including Likes and Dislikes sections. Never include ratings, dates, reviewer names, buttons, ads or navigation text."
    )

# ── Junk line detector ────────────────────────────────────────
def is_junk(line: str) -> bool:
    line = line.strip()

    if len(line) < 30:
        return True

    # Markdown images
    if '![' in line:
        return True

    # Markdown links
    if re.search(r'\[.*?\]\(https?://', line):
        return True

    # Lines with URLs
    if 'http://' in line or 'https://' in line:
        return True

    if line.startswith('!'):
        return True

    # UI/nav junk
    junk_keywords = [
        'cookie', 'privacy policy', 'terms of use', 'login', 'sign in',
        'sign up', 'register', 'subscribe', 'advertisement', 'follow us',
        'share this', 'read more', 'load more', 'show more', 'view all',
        'go to homepage', 'error image', 'navbar', 'footer',
        'copyright', 'all rights reserved', 'menu', 'navigation',
        'apply now', 'brochure', 'download', 'popular colleges',
        'top colleges', 'colleges by location', 'write a review',
        'add review', 'sort by', 'filter by', 'read full review',
        'see more reviews', 'back to top', 'helpful', 'report',
        'verified review', 'batch of', 'asked question',
        'compare colleges', 'get free', 'check ranking',
        'view fees', 'admission', 'scholarships', 'cutoff',
        'college predictor', 'exam', 'answer', 'question',
    ]
    lower = line.lower()
    if any(kw in lower for kw in junk_keywords):
        return True

    # Mostly non-alphabetic
    alpha_ratio = sum(c.isalpha() or c == ' ' for c in line) / len(line)
    if alpha_ratio < 0.5:
        return True

    # File extensions
    if re.search(r'\.(svg|png|jpg|gif|jpeg|webp|ico|css|js)', line.lower()):
        return True

    # Very short standalone words/numbers
    words = line.split()
    if len(words) < 4:
        return True

    return False


def scrape_reviews_firecrawl(url: str, max_reviews: int = 100, cycles: int = 8) -> List[str]:
    """
    Scrapes reviews from Shiksha, Collegedunia & Careers360.
    Uses aggressive scrolling to get reviews from bottom of page too.
    Extracts both Likes and Dislikes from Collegedunia.
    """
    try:
        # ── Build scroll actions ──────────────────────────────
        actions = []
        actual_cycles = min(cycles, 12)  # allow up to 12 cycles

        for i in range(actual_cycles):
            actions.append({"type": "scroll", "direction": "down"})
            actions.append({"type": "wait", "milliseconds": 2500})

        # Extra scroll at end to make sure we reach bottom
        actions.append({"type": "scroll", "direction": "down"})
        actions.append({"type": "wait", "milliseconds": 3000})

        # ── Try Method 1: structured extract ──────────────────
        try:
            result = app.scrape(
                url=url,
                formats=["extract"],
                extract={
                    "schema": ReviewsData.model_json_schema(),
                    "prompt": """Extract ALL student review texts from this page.
                    Include content from:
                    - Likes / Positive sections
                    - Dislikes / Negative sections  
                    - General review paragraphs
                    - Any student comment or feedback
                    
                    DO NOT include: ratings, stars, dates, reviewer names,
                    navigation links, buttons, ads, or any non-review content.
                    
                    Each review item should be a complete sentence or paragraph
                    of at least 30 characters."""
                },
                actions=actions,
                timeout=240000,
                only_main_content=False
            )
        except Exception as e1:
            print(f"  [Method 1 failed: {str(e1)[:80]}] Trying markdown...")
            result = app.scrape(
                url=url,
                formats=["markdown"],
                actions=actions,
                timeout=240000,
                only_main_content=False
            )

        # ── Parse result ──────────────────────────────────────
        reviews_list = []

        # Handle structured extract
        if hasattr(result, 'extract') and result.extract:
            extracted = result.extract
            if isinstance(extracted, dict):
                reviews_list = extracted.get("reviews", [])
            elif hasattr(extracted, 'reviews'):
                reviews_list = extracted.reviews

        elif isinstance(result, dict):
            extracted = (
                result.get("extract") or
                result.get("data", {}).get("extract") or
                result.get("json") or
                result.get("data", {}).get("json") or {}
            )
            if isinstance(extracted, dict):
                reviews_list = extracted.get("reviews", [])

        # ── Markdown fallback ─────────────────────────────────
        if not reviews_list:
            markdown = ""
            if hasattr(result, 'markdown') and result.markdown:
                markdown = result.markdown
            elif isinstance(result, dict):
                markdown = result.get("markdown", "") or result.get("data", {}).get("markdown", "")

            if markdown:
                # Split by newlines and also by bullet points
                lines = re.split(r'\n|(?<=\.)\s+(?=[A-Z])', markdown)
                reviews_list = []

                for line in lines:
                    # Clean markdown formatting
                    cleaned = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', line)  # remove bold/italic
                    cleaned = re.sub(r'#{1,6}\s*', '', cleaned)              # remove headers
                    cleaned = cleaned.strip('•-*#>|`• ').strip()

                    if not is_junk(cleaned):
                        reviews_list.append(cleaned)

        # ── Final clean & deduplicate ─────────────────────────
        clean_reviews = []
        seen = set()

        for r in reviews_list:
            if not isinstance(r, str):
                r = str(r)
            cleaned = r.strip()

            # Remove markdown bold formatting
            cleaned = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', cleaned)
            cleaned = cleaned.strip()

            if not is_junk(cleaned) and cleaned not in seen:
                seen.add(cleaned)
                clean_reviews.append(cleaned)

        if clean_reviews:
            print(f"✅ Extracted {len(clean_reviews)} reviews from {url}")
        else:
            print(f"⚠️  No reviews extracted from {url}")

        return clean_reviews[:max_reviews]

    except Exception as e:
        print(f"❌ Firecrawl error on {url}: {str(e)[:180]}")
        return []