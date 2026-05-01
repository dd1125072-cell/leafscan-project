import cv2
import albumentations as A
import os

img_dir = "dataset/images"
lbl_dir = "dataset/labels"

# Load labels
def load_labels(path):
    bboxes = []
    class_labels = []
    with open(path, 'r') as f:
        for line in f.readlines():
            data = line.strip().split()
            class_labels.append(int(data[0]))
            bboxes.append(list(map(float, data[1:])))
    return bboxes, class_labels

# Save labels
def save_labels(path, bboxes, class_labels):
    with open(path, "w") as f:
        for cls, box in zip(class_labels, bboxes):
            f.write(f"{cls} {box[0]} {box[1]} {box[2]} {box[3]}\n")

# Augmentations
augmentations = {
    "rot90": A.Rotate(limit=(90, 90), p=1),
    "rot180": A.Rotate(limit=(180, 180), p=1),
    "rot270": A.Rotate(limit=(270, 270), p=1),
    "flip": A.HorizontalFlip(p=1),
    "bright": A.RandomBrightnessContrast(p=1),
    "noise": A.GaussNoise(p=1),
    "blur": A.Blur(blur_limit=3, p=1)
}

# Process all images
for file in os.listdir(img_dir):

    if not file.lower().endswith(".jpg"):
        continue

    img_path = os.path.join(img_dir, file)
    lbl_path = os.path.join(lbl_dir, file.replace(".jpg", ".txt"))

    if not os.path.exists(lbl_path):
        continue

    image = cv2.imread(img_path)
    bboxes, class_labels = load_labels(lbl_path)

    for name, aug in augmentations.items():

        transform = A.Compose(
            [aug],
            bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels'])
        )

        augmented = transform(image=image, bboxes=bboxes, class_labels=class_labels)

        aug_img = augmented["image"]
        aug_boxes = augmented["bboxes"]
        aug_labels = augmented["class_labels"]

        # New filenames
        base_name = file.replace(".jpg", "")
        new_img_name = f"{base_name}_{name}.jpg"
        new_lbl_name = f"{base_name}_{name}.txt"

        # Save
        cv2.imwrite(os.path.join(img_dir, new_img_name), aug_img)
        save_labels(os.path.join(lbl_dir, new_lbl_name), aug_boxes, aug_labels)

print(" Augmentation completed for ALL images")