from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["bpit_pulse"]

reviews_col = db["reviews"]
users_col = db["users"]

def save_reviews(platform, reviews: list):
    reviews_col.delete_many({"platform": platform})
    if reviews:
        for r in reviews:
            r["platform"] = platform
            r["scraped_at"] = datetime.utcnow().isoformat()
        reviews_col.insert_many(reviews)

def get_reviews(platform=None):
    query = {"platform": platform} if platform else {}
    return list(reviews_col.find(query, {"_id": 0}))