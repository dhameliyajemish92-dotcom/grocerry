import os
import shutil

BASE_DIR = "Grocery_Images"

for category in os.listdir(BASE_DIR):
    category_path = os.path.join(BASE_DIR, category)
    if not os.path.isdir(category_path):
        continue

    count = 1
    for folder in os.listdir(category_path):
        folder_path = os.path.join(category_path, folder)
        if not os.path.isdir(folder_path):
            continue

        for file in os.listdir(folder_path):
            if file.lower().endswith((".jpg", ".png", ".jpeg")):
                new_name = f"{folder.replace(' ', '_')}_{count:03}.jpg"
                dest_path = os.path.join(category_path, new_name)

                # avoid overwrite
                if os.path.exists(dest_path):
                    count += 1
                    continue

                shutil.move(
                    os.path.join(folder_path, file),
                    dest_path
                )
                count += 1
