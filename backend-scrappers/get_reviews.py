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

# ── Junk line detector 
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
        # Site-specific boilerplate
        'written by', 'how likely are you to recommend', 'near by colleges',
        'are you interested in this college', 'choose your course',
        'trending programs', 'trending specializations', 'detailed books',
        'all this at the convenience', 'endeavor to keep you informed',
        'get app, its faster', 'explore reviews at similar',
        'aside from this, several communications',
        'if there are number of vacant seats',
        'view reviews of similar colleges',
        'we endeavor to keep you',
        'be/b.tech', 'bba/bms', 'mbbs - bachelor', 'mba/pgdm',
        'professor, department of',
    ]                          # ← 4 spaces, closing bracket
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
    try:
        # ── Build scroll actions ──────────────────────────────
        actions = []
        actual_cycles = min(cycles, 12)

        for i in range(actual_cycles):
            actions.append({"type": "scroll", "direction": "down"})
            actions.append({"type": "wait", "milliseconds": 2500})

        actions.append({"type": "scroll", "direction": "down"})
        actions.append({"type": "wait", "milliseconds": 3000})

        # ── Scrape as markdown directly ───────────────────────
        result = app.scrape(
            url=url,
            formats=["markdown"],
            actions=actions,
            timeout=240000,
            only_main_content=True
        )

        # ── Parse markdown ────────────────────────────────────
        markdown = ""
        if hasattr(result, 'markdown') and result.markdown:
            markdown = result.markdown
        elif isinstance(result, dict):
            markdown = result.get("markdown", "") or result.get("data", {}).get("markdown", "")

        reviews_list = []
        if markdown:
            lines = re.split(r'\n|(?<=\.)\s+(?=[A-Z])', markdown)
            for line in lines:
                cleaned = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', line)
                cleaned = re.sub(r'#{1,6}\s*', '', cleaned)
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

            # ── Strip HTML tags & entities ────────────────
            cleaned = re.sub(r'<[^>]+>', ' ', cleaned)      # remove <br>, <p> etc
            cleaned = re.sub(r'&amp;', '&', cleaned)
            cleaned = re.sub(r'&lt;', '<', cleaned)
            cleaned = re.sub(r'&gt;', '>', cleaned)
            cleaned = re.sub(r'&nbsp;', ' ', cleaned)
            cleaned = re.sub(r'\s+', ' ', cleaned).strip()  # collapse whitespace
            # ─────────────────────────────────────────────

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