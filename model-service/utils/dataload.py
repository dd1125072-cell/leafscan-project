import os
import cv2
import torch
import numpy as np
from torch.utils.data import dataset

class yolods(dataset):
    def __init__(self, image_dir, label_dir, img_size=640):
        self.image_dir = image_dir
        self.label_dir = label_dir
        self.img_size = img_size
        self.images = os.listdir(image_dir)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, index):
        img_path = os.path.join(self.image_dir, self.images[index])
        label_path = os.path.join(
            self.label_dir,
            self.images[index].replace(".jpg", ".txt").replace(".png", ".txt")
        )

        # Load image
        image = cv2.imread(img_path)
        image = cv2.resize(image, (self.img_size, self.img_size))
        image = image / 255.0
        image = np.transpose(image, (2, 0, 1))  #HWC -> CHW (height , width, channel)

        # Load labels (txt files for each images)
        boxes = []
        if os.path.exists(label_path):
            with open(label_path, "r") as f:
                for line in f.readlines():
                    cls, x, y, w, h = map(float, line.strip().split())
                    boxes.append([cls, x, y, w, h])

        boxes = torch.tensor(boxes)

        return torch.tensor(image, dtype=torch.float32), boxes


def collate_fn(batch):
    images = []
    targets = []

    for i, (img, boxes) in enumerate(batch):
        images.append(img)
        for box in boxes:
            targets.append([i] + box.tolist())  # add batch index

    images = torch.stack(images)
    targets = torch.tensor(targets)

    return images, targets