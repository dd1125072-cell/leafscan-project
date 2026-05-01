import os
import random
import shutil

base_path = "dataset"
img_dir = os.path.join(base_path, "images")
lbl_dir = os.path.join(base_path, "labels")

output_path = "train_test_dataset"

splits = ["train", "val", "test"]

# Create folders
for split in splits:
    os.makedirs(f"{output_path}/images/{split}", exist_ok=True)
    os.makedirs(f"{output_path}/labels/{split}", exist_ok=True)

# Get all images
images = [f for f in os.listdir(img_dir) if f.endswith(".jpg")]
random.shuffle(images)

total = len(images)
train_end = int(0.7 * total)
val_end = int(0.9 * total)

split_data = {
    "train": images[:train_end],
    "val": images[train_end:val_end],
    "test": images[val_end:]
}

# Move files
for split, files in split_data.items():
    for file in files:
        img_src = os.path.join(img_dir, file)
        lbl_src = os.path.join(lbl_dir, file.replace(".jpg", ".txt"))

        shutil.copy(img_src, f"{output_path}/images/{split}/{file}")
        shutil.copy(lbl_src, f"{output_path}/labels/{split}/{file.replace('.jpg', '.txt')}")

print("Dataset split completed!")