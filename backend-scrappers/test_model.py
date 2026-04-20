from transformers import pipeline
import re

# Load the multilingual sentiment model (analyzes full sentence)
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="tabularisai/multilingual-sentiment-analysis",
    tokenizer="tabularisai/multilingual-sentiment-analysis"
)

def get_sentiment_label(text):
    text = str(text).strip()
    if not text:
        return 'neutral', 0.0

    try:
        result = sentiment_pipeline(text[:512])[0]
        label = result['label'].lower()      # e.g., "5 stars", "1 star", etc.
        score = result['score']

        # Map 5-class output to positive/negative/neutral
        if any(x in label for x in ['5', '4', 'positive', 'very positive']):
            final_label = 'positive'
            confidence = score
        elif any(x in label for x in ['1', '2', 'negative', 'very negative']):
            final_label = 'negative'
            confidence = -score
        else:
            final_label = 'neutral'
            confidence = 0.0

        return final_label, round(confidence, 4)

    except Exception:
        return 'neutral', 0.0


# ========================== YOUR TEST CASES ==========================
tests = [
    # English Positive
    ("Great faculty very helpful professors", "positive"),
    ("Amazing placement record best college in delhi", "positive"),
    ("Excellent infrastructure and labs very well equipped", "positive"),
    ("Best college for CSE in IP University highly recommend", "positive"),
    ("Faculty is very supportive and always available", "positive"),
    ("Wonderful campus life and amazing fests", "positive"),
    # English Negative
    ("Worst management ever avoid this college", "negative"),
    ("Terrible hostel facilities food is inedible", "negative"),
    ("Pathetic placement no companies visit this college", "negative"),
    ("Very poor infrastructure outdated labs", "negative"),
    ("Management does not care about students at all", "negative"),
    ("Complete waste of money and time avoid bpit", "negative"),
    # Hinglish Positive
    ("BPIT bahut achha college hai placement bhi achi hai", "positive"),
    ("Yahan ke professors bahut helpful hain padhai achi hai", "positive"),
    ("Zabardast college hai ekdum badhiya experience mila", "positive"),
    ("Faculty bahut supportive hai hamesha help karti hai", "positive"),
    ("BPIT mein placement record bahut achi hai companies aati", "positive"),
    ("College ka environment bahut accha hai sab helpful hain", "positive"),
    # Hinglish Negative
    ("Bekar college hai yaar kuch nahi milta", "negative"),
    ("Hostel facilities bilkul gandi hai khana bhi kharab", "negative"),
    ("Professors padhaate nahi sirf attendance lete hain", "negative"),
    ("College mein bahut politics hai management bekar hai", "negative"),
    ("Principal students ki nahi sunta bakwas management", "negative"),
    ("Placement bilkul nahi hai companies aati hi nahi", "negative"),
    ("Bahut bura college hai fees zyada kaam kuch nahi", "negative"),
    ("Faltu college hai yaar time aur paisa dono waste", "negative"),
    # Neutral
    ("Theek thaak hai nothing special", "neutral"),
    ("Average college hai kuch achha kuch bura", "neutral"),
    ("College is okay not great not bad either", "neutral"),
    ("BPIT is decent for some branches not for others", "neutral"),
    ("Kuch cheezein achi hain kuch improve ho sakti hain", "neutral"),
    ("It is an average college with average facilities", "neutral"),
    # Mixed
    ("BPIT CSE placement achi hai lekin infrastructure bekar", "neutral"),
    ("Faculty good hai but fees bahut zyada hai", "neutral"),
    ("Good college for studies but hostel is not good", "neutral"),
    ("BPIT has good teachers but management is very poor", "neutral"),
    # Hindi
    ("यह कॉलेज बहुत अच्छा है यहाँ पढ़ाई बहुत अच्छी होती है", "positive"),
    ("बेकार कॉलेज है कुछ नहीं मिलता यहाँ", "negative"),
    ("ठीक ठाक कॉलेज है कुछ खास नहीं", "neutral"),
]

# ========================== RUN THE TEST ==========================
categories = (
    ['English Positive']*6 + ['English Negative']*6 +
    ['Hinglish Positive']*6 + ['Hinglish Negative']*8 +
    ['Neutral']*6 + ['Mixed']*4 + ['Hindi']*3
)

by_category = {
    'English Positive': {'correct': 0, 'total': 6},
    'English Negative': {'correct': 0, 'total': 6},
    'Hinglish Positive': {'correct': 0, 'total': 6},
    'Hinglish Negative': {'correct': 0, 'total': 8},
    'Neutral': {'correct': 0, 'total': 6},
    'Mixed': {'correct': 0, 'total': 4},
    'Hindi': {'correct': 0, 'total': 3},
}

print("="*82)
print(f"{'Text':<52} {'Expected':<10} {'Got':<10} {'Conf':<6} {'✓'}")
print("="*82)

correct = 0
wrong = []

for i, (text, expected) in enumerate(tests):
    label, score = get_sentiment_label(text)
    is_correct = label == expected
    
    if is_correct:
        correct += 1
        by_category[categories[i]]['correct'] += 1
    else:
        wrong.append((text, expected, label, score))
    
    tick = '✅' if is_correct else '❌'
    print(f"{text[:51]:<52} {expected:<10} {label:<10} {abs(score):.2f}   {tick}")

total = len(tests)
print("="*82)
print(f"\n📊 OVERALL ACCURACY: {correct}/{total} ({correct/total*100:.1f}%)")

print("\n📂 Category-wise Accuracy:")
for cat, data in by_category.items():
    pct = (data['correct'] / data['total']) * 100
    bar = '█' * int(pct//10) + '░' * (10 - int(pct//10))
    print(f"  {cat:<20} {bar} {data['correct']}/{data['total']} ({pct:.0f}%)")

if wrong:
    print(f"\n❌ Wrong Predictions ({len(wrong)}):")
    for t, exp, got, sc in wrong:
        print(f"  • {t[:75]}")
        print(f"    Expected: {exp}  →  Got: {got} ({abs(sc):.2f})\n")

accuracy = correct / total * 100
print("\n🎯 VERDICT:")
if accuracy >= 82:
    print(f"  ✅ Very Good Performance ({accuracy:.1f}%) for a pure model on mixed data")
elif accuracy >= 72:
    print(f"  ✅ Decent ({accuracy:.1f}%) — Good starting point")
else:
    print(f"  ⚠️  Moderate ({accuracy:.1f}%) — Hinglish remains challenging for off-the-shelf models")

print("\nNote: This version uses only the multilingual model on the full sentence (no word lists or VADER).")