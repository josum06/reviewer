from transformers import pipeline

# 3-class model: positive, negative, neutral - fine-tuned for Hinglish
sentiment = pipeline(
    "text-classification",
    model="pascalrai/hinglish-twitter-roberta-base-sentiment"
)

def analyze_sentiment(text):
    result = sentiment(text)[0]
    return result['label'].lower(), result['score'], text

tests = [
    "BPIT bahut achha college hai placement bhi achi hai",
    "Bekar college hai yaar kuch nahi milta",
    "Great faculty very helpful professors",
    "Hostel facilities bilkul gandi hai",
    "Theek thaak hai nothing special",
    "Worst management ever avoid this college",
    "Professors padhaate nahi sirf attendance lete hain",
    "College mein bahut politics hai",
    "Principal students ki nahi sunta",
    "Average college hai kuch achha kuch bura",
]

for text in tests:
    label, score, processed = analyze_sentiment(text)
    print(f"Text       : {text}")
    print(f"Result     : {label} ({score:.2f})")
    print()