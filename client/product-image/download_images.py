try:
    import pandas as pd
    from bing_image_downloader import downloader
    import os
except ImportError as e:
    print(f"Error: {e}")
    print("Please install the required libraries by running:")
    print("pip install pandas bing-image-downloader")
    exit(1)

# current file directory
current_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(current_dir, "product.csv")

# products.csv read karo
try:
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip() # Remove spaces from headers
    df.dropna(inplace=True) # Check for empty rows
except FileNotFoundError:
    print(f"Error: Could not find {csv_path}")
    exit(1)

# main folder
BASE_DIR = os.path.join(current_dir, "Grocery_Images")
os.makedirs(BASE_DIR, exist_ok=True)

# ek-ek product mate image download
for _, row in df.iterrows():
    category = row["category"]
    keyword = row["keyword"]

    category_folder = os.path.join(BASE_DIR, category)
    os.makedirs(category_folder, exist_ok=True)

    print("Downloading:", keyword)

    try:
        downloader.download(
            keyword,
            limit=1,              # 1 image per product
            output_dir=category_folder,
            adult_filter_off=True,
            force_replace=False,
            timeout=60,
            verbose=False
        )
    except Exception as e:
        print(f"Failed to download {keyword}: {e}")

print("All images downloaded successfully")
