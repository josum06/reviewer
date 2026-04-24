from shiksha import fetch_shiksha_data

data = fetch_shiksha_data("BPIT", max_results=1, max_reviews=520, cycles=12)

reviews = data[0]['reviews']
print(f"\nTotal extracted: {len(reviews)}")
print("="*60)

for i, review in enumerate(reviews[:10], 1):
    print(f"\n{i}. {review}")
    print("-"*60)